import { useState, useCallback, useRef } from 'react';
import { supabase, Question, QuizSession } from '../lib/supabase';

// Adaptive difficulty constants
const DIFFICULTY_THRESHOLD_UP = 2;   // correct streak needed to level up
const DIFFICULTY_THRESHOLD_DOWN = -2; // wrong streak needed to level down
const SCORE_POINTS: Record<number, number> = { 1: 10, 2: 20, 3: 30 };

export type AnswerResult = {
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
  pointsEarned: number;
  difficultyChanged: boolean;
  newDifficulty: 1 | 2 | 3;
};

export type QuizState = {
  phase: 'idle' | 'loading' | 'question' | 'result' | 'finished' | 'error';
  session: QuizSession | null;
  currentQuestion: Question | null;
  lastAnswer: AnswerResult | null;
  usedQuestionIds: Set<string>;
  consecutiveScore: number;
  error: string | null;
  questionStartTime: number;
};

export function useQuiz() {
  const [state, setState] = useState<QuizState>({
    phase: 'idle',
    session: null,
    currentQuestion: null,
    lastAnswer: null,
    usedQuestionIds: new Set(),
    consecutiveScore: 0,
    error: null,
    questionStartTime: 0,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const fetchQuestion = useCallback(async (
    difficulty: 1 | 2 | 3,
    usedIds: Set<string>
  ): Promise<Question | null> => {
    const usedArray = Array.from(usedIds);

    let query = supabase
      .from('questions')
      .select('*')
      .eq('difficulty', difficulty);

    if (usedArray.length > 0) {
      query = query.not('id', 'in', `(${usedArray.join(',')})`);
    }

    const { data, error } = await query.limit(10);

    if (error || !data || data.length === 0) {
      // fallback: try any difficulty
      const fallbackQuery = supabase.from('questions').select('*');
      const fallback = usedArray.length > 0
        ? fallbackQuery.not('id', 'in', `(${usedArray.join(',')})`)
        : fallbackQuery;

      const { data: fallbackData } = await fallback.limit(10);
      if (!fallbackData || fallbackData.length === 0) return null;

      const pick = fallbackData[Math.floor(Math.random() * fallbackData.length)];
      return pick as Question;
    }

    const pick = data[Math.floor(Math.random() * data.length)];
    return pick as Question;
  }, []);

  const startQuiz = useCallback(async () => {
    setState(s => ({ ...s, phase: 'loading', error: null }));

    const { data: sessionData, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: null,
        score: 0,
        questions_answered: 0,
        correct_answers: 0,
        current_difficulty: 1,
        difficulty_score: 0,
        completed: false,
      })
      .select()
      .maybeSingle();

    if (sessionError || !sessionData) {
      setState(s => ({ ...s, phase: 'error', error: 'Failed to start quiz session.' }));
      return;
    }

    const usedIds = new Set<string>();
    const question = await fetchQuestion(1, usedIds);

    if (!question) {
      setState(s => ({ ...s, phase: 'error', error: 'No questions available.' }));
      return;
    }

    setState({
      phase: 'question',
      session: sessionData as QuizSession,
      currentQuestion: question,
      lastAnswer: null,
      usedQuestionIds: usedIds,
      consecutiveScore: 0,
      error: null,
      questionStartTime: Date.now(),
    });
  }, [fetchQuestion]);

  const submitAnswer = useCallback(async (selectedOptionId: string) => {
    const current = stateRef.current;
    if (!current.currentQuestion || !current.session || current.phase !== 'question') return;

    const timeTaken = Date.now() - current.questionStartTime;
    const isCorrect = selectedOptionId === current.currentQuestion.correct_option_id;
    const difficulty = current.session.current_difficulty as 1 | 2 | 3;
    const pointsEarned = isCorrect ? SCORE_POINTS[difficulty] : 0;

    // Adaptive difficulty logic
    const newConsecutiveScore = isCorrect
      ? current.consecutiveScore + 1
      : current.consecutiveScore - 1;

    let newDifficulty = difficulty;
    let difficultyChanged = false;

    if (newConsecutiveScore >= DIFFICULTY_THRESHOLD_UP && difficulty < 3) {
      newDifficulty = (difficulty + 1) as 1 | 2 | 3;
      difficultyChanged = true;
    } else if (newConsecutiveScore <= DIFFICULTY_THRESHOLD_DOWN && difficulty > 1) {
      newDifficulty = (difficulty - 1) as 1 | 2 | 3;
      difficultyChanged = true;
    }

    const resetConsecutive = difficultyChanged ? 0 : newConsecutiveScore;

    // Update session in DB
    const newScore = current.session.score + pointsEarned;
    const newQuestionsAnswered = current.session.questions_answered + 1;
    const newCorrectAnswers = current.session.correct_answers + (isCorrect ? 1 : 0);

    const updatedSession: QuizSession = {
      ...current.session,
      score: newScore,
      questions_answered: newQuestionsAnswered,
      correct_answers: newCorrectAnswers,
      current_difficulty: newDifficulty,
      difficulty_score: newConsecutiveScore,
    };

    // Persist answer and session update in parallel
    await Promise.all([
      supabase.from('session_answers').insert({
        session_id: current.session.id,
        question_id: current.currentQuestion.id,
        selected_option_id: selectedOptionId,
        is_correct: isCorrect,
        time_taken_ms: timeTaken,
        difficulty_at_time: difficulty,
      }),
      supabase.from('quiz_sessions').update({
        score: newScore,
        questions_answered: newQuestionsAnswered,
        correct_answers: newCorrectAnswers,
        current_difficulty: newDifficulty,
        difficulty_score: newConsecutiveScore,
      }).eq('id', current.session.id),
    ]);

    const answerResult: AnswerResult = {
      isCorrect,
      correctOptionId: current.currentQuestion.correct_option_id,
      explanation: current.currentQuestion.explanation,
      pointsEarned,
      difficultyChanged,
      newDifficulty,
    };

    const newUsedIds = new Set(current.usedQuestionIds);
    newUsedIds.add(current.currentQuestion.id);

    setState(s => ({
      ...s,
      phase: 'result',
      session: updatedSession,
      lastAnswer: answerResult,
      usedQuestionIds: newUsedIds,
      consecutiveScore: resetConsecutive,
    }));
  }, []);

  const nextQuestion = useCallback(async () => {
    const current = stateRef.current;
    if (!current.session) return;

    if (current.session.questions_answered >= 15) {
      // Finish after 15 questions
      await supabase
        .from('quiz_sessions')
        .update({ completed: true })
        .eq('id', current.session.id);

      setState(s => ({
        ...s,
        phase: 'finished',
        session: s.session ? { ...s.session, completed: true } : null,
      }));
      return;
    }

    setState(s => ({ ...s, phase: 'loading' }));

    const difficulty = current.session.current_difficulty as 1 | 2 | 3;
    const question = await fetchQuestion(difficulty, current.usedQuestionIds);

    if (!question) {
      await supabase
        .from('quiz_sessions')
        .update({ completed: true })
        .eq('id', current.session.id);

      setState(s => ({
        ...s,
        phase: 'finished',
        session: s.session ? { ...s.session, completed: true } : null,
      }));
      return;
    }

    setState(s => ({
      ...s,
      phase: 'question',
      currentQuestion: question,
      lastAnswer: null,
      questionStartTime: Date.now(),
    }));
  }, [fetchQuestion]);

  const resetQuiz = useCallback(() => {
    setState({
      phase: 'idle',
      session: null,
      currentQuestion: null,
      lastAnswer: null,
      usedQuestionIds: new Set(),
      consecutiveScore: 0,
      error: null,
      questionStartTime: 0,
    });
  }, []);

  return { state, startQuiz, submitAnswer, nextQuestion, resetQuiz };
}
