import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Option = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  text: string;
  options: Option[];
  correct_option_id: string;
  category: string;
  difficulty: 1 | 2 | 3;
  explanation: string;
};

export type QuizSession = {
  id: string;
  user_id: string | null;
  score: number;
  questions_answered: number;
  correct_answers: number;
  current_difficulty: 1 | 2 | 3;
  difficulty_score: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type SessionAnswer = {
  id: string;
  session_id: string;
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
  time_taken_ms: number;
  difficulty_at_time: number;
};
