/*
  # Quiz App Schema with Adaptive Difficulty

  ## Overview
  Creates tables for a quiz app with automatic difficulty adaptation based on user performance.

  ## New Tables

  ### `questions`
  - `id` (uuid, PK): Unique question identifier
  - `text` (text): The question text
  - `options` (jsonb): Array of answer options [{id, text}]
  - `correct_option_id` (text): ID of the correct option
  - `category` (text): Question category (e.g., science, history)
  - `difficulty` (int): Difficulty level 1=easy, 2=medium, 3=hard
  - `explanation` (text): Explanation shown after answering
  - `created_at` (timestamptz): Row creation time

  ### `quiz_sessions`
  - `id` (uuid, PK): Unique session identifier
  - `user_id` (uuid): References auth.users (nullable for guest play)
  - `score` (int): Total score earned
  - `questions_answered` (int): Total questions answered
  - `correct_answers` (int): Total correct answers
  - `current_difficulty` (int): Current adaptive difficulty level (1-3)
  - `difficulty_score` (numeric): Internal score used for adaptation
  - `completed` (bool): Whether the session is finished
  - `created_at` / `updated_at` (timestamptz): Timestamps

  ### `session_answers`
  - `id` (uuid, PK): Unique answer record
  - `session_id` (uuid): References quiz_sessions
  - `question_id` (uuid): References questions
  - `selected_option_id` (text): What the user selected
  - `is_correct` (bool): Whether the answer was correct
  - `time_taken_ms` (int): Milliseconds taken to answer
  - `difficulty_at_time` (int): Difficulty level when answered
  - `created_at` (timestamptz): Row creation time

  ## Security
  - RLS enabled on all tables
  - Questions are publicly readable
  - Sessions and answers are scoped to their creator (or open for anonymous via session_id header pattern)

  ## Notes
  - Difficulty adaptation uses a rolling score: +1 correct, -1 wrong, clamped 1-3
  - Seed data includes 30 questions across 3 difficulties and 3 categories
*/

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  options jsonb NOT NULL,
  correct_option_id text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  difficulty int NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  explanation text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions"
  ON questions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Quiz sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  score int NOT NULL DEFAULT 0,
  questions_answered int NOT NULL DEFAULT 0,
  correct_answers int NOT NULL DEFAULT 0,
  current_difficulty int NOT NULL DEFAULT 1 CHECK (current_difficulty BETWEEN 1 AND 3),
  difficulty_score numeric NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert own sessions"
  ON quiz_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can read own sessions"
  ON quiz_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own sessions"
  ON quiz_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert sessions without user_id"
  ON quiz_sessions FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anon can read sessions without user_id"
  ON quiz_sessions FOR SELECT
  TO anon
  USING (user_id IS NULL);

CREATE POLICY "Anon can update sessions without user_id"
  ON quiz_sessions FOR UPDATE
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

-- Session answers table
CREATE TABLE IF NOT EXISTS session_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id text NOT NULL,
  is_correct boolean NOT NULL,
  time_taken_ms int NOT NULL DEFAULT 0,
  difficulty_at_time int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert answers"
  ON session_answers FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (SELECT 1 FROM quiz_sessions WHERE id = session_id AND user_id IS NULL)
  );

CREATE POLICY "Anon can read answers"
  ON session_answers FOR SELECT
  TO anon
  USING (
    EXISTS (SELECT 1 FROM quiz_sessions WHERE id = session_id AND user_id IS NULL)
  );

CREATE POLICY "Authenticated users can insert own answers"
  ON session_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM quiz_sessions WHERE id = session_id AND user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can read own answers"
  ON session_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM quiz_sessions WHERE id = session_id AND user_id = auth.uid())
  );

-- Seed questions: 10 easy, 10 medium, 10 hard across science, history, geography
INSERT INTO questions (text, options, correct_option_id, category, difficulty, explanation) VALUES

-- EASY (difficulty=1)
('What is the chemical symbol for water?',
 '[{"id":"a","text":"H2O"},{"id":"b","text":"CO2"},{"id":"c","text":"O2"},{"id":"d","text":"NaCl"}]',
 'a', 'science', 1, 'Water is composed of two hydrogen atoms and one oxygen atom, giving it the formula H2O.'),

('Which planet is known as the Red Planet?',
 '[{"id":"a","text":"Venus"},{"id":"b","text":"Jupiter"},{"id":"c","text":"Mars"},{"id":"d","text":"Saturn"}]',
 'c', 'science', 1, 'Mars appears red due to iron oxide (rust) on its surface.'),

('Who painted the Mona Lisa?',
 '[{"id":"a","text":"Michelangelo"},{"id":"b","text":"Leonardo da Vinci"},{"id":"c","text":"Raphael"},{"id":"d","text":"Rembrandt"}]',
 'b', 'history', 1, 'Leonardo da Vinci painted the Mona Lisa between 1503 and 1519.'),

('What is the largest ocean on Earth?',
 '[{"id":"a","text":"Atlantic Ocean"},{"id":"b","text":"Indian Ocean"},{"id":"c","text":"Arctic Ocean"},{"id":"d","text":"Pacific Ocean"}]',
 'd', 'geography', 1, 'The Pacific Ocean covers more than 30% of the Earth''s surface.'),

('How many sides does a hexagon have?',
 '[{"id":"a","text":"5"},{"id":"b","text":"6"},{"id":"c","text":"7"},{"id":"d","text":"8"}]',
 'b', 'science', 1, 'A hexagon is a polygon with exactly six sides and six angles.'),

('In which year did World War II end?',
 '[{"id":"a","text":"1943"},{"id":"b","text":"1944"},{"id":"c","text":"1945"},{"id":"d","text":"1946"}]',
 'c', 'history', 1, 'World War II ended in 1945 with the surrender of Germany in May and Japan in September.'),

('What is the capital of France?',
 '[{"id":"a","text":"Berlin"},{"id":"b","text":"Madrid"},{"id":"c","text":"Rome"},{"id":"d","text":"Paris"}]',
 'd', 'geography', 1, 'Paris has been the capital of France since the 10th century.'),

('What gas do plants absorb from the atmosphere?',
 '[{"id":"a","text":"Oxygen"},{"id":"b","text":"Nitrogen"},{"id":"c","text":"Carbon dioxide"},{"id":"d","text":"Hydrogen"}]',
 'c', 'science', 1, 'Plants absorb carbon dioxide (CO2) during photosynthesis to produce glucose and oxygen.'),

('Who was the first President of the United States?',
 '[{"id":"a","text":"John Adams"},{"id":"b","text":"Thomas Jefferson"},{"id":"c","text":"Benjamin Franklin"},{"id":"d","text":"George Washington"}]',
 'd', 'history', 1, 'George Washington served as the first President from 1789 to 1797.'),

('Which continent is the largest by area?',
 '[{"id":"a","text":"Africa"},{"id":"b","text":"Asia"},{"id":"c","text":"North America"},{"id":"d","text":"Europe"}]',
 'b', 'geography', 1, 'Asia covers about 44.6 million km², making it the largest continent.'),

-- MEDIUM (difficulty=2)
('What is the speed of light in a vacuum (approximately)?',
 '[{"id":"a","text":"300,000 km/s"},{"id":"b","text":"150,000 km/s"},{"id":"c","text":"450,000 km/s"},{"id":"d","text":"1,000,000 km/s"}]',
 'a', 'science', 2, 'The speed of light in a vacuum is approximately 299,792 km/s, commonly rounded to 300,000 km/s.'),

('Which element has the atomic number 79?',
 '[{"id":"a","text":"Silver"},{"id":"b","text":"Platinum"},{"id":"c","text":"Gold"},{"id":"d","text":"Copper"}]',
 'c', 'science', 2, 'Gold (Au) has atomic number 79 and is one of the least reactive chemical elements.'),

('The Battle of Hastings took place in which year?',
 '[{"id":"a","text":"1066"},{"id":"b","text":"1086"},{"id":"c","text":"1046"},{"id":"d","text":"1106"}]',
 'a', 'history', 2, 'The Battle of Hastings was fought on 14 October 1066 between William the Conqueror and King Harold II.'),

('Which country has the most natural lakes?',
 '[{"id":"a","text":"Russia"},{"id":"b","text":"United States"},{"id":"c","text":"Brazil"},{"id":"d","text":"Canada"}]',
 'd', 'geography', 2, 'Canada has more lakes than the rest of the world combined, with over 31,000 lakes larger than 3 km².'),

('What is the powerhouse of the cell?',
 '[{"id":"a","text":"Nucleus"},{"id":"b","text":"Mitochondria"},{"id":"c","text":"Ribosome"},{"id":"d","text":"Golgi apparatus"}]',
 'b', 'science', 2, 'Mitochondria generate most of the cell''s ATP through cellular respiration.'),

('In what year was the Magna Carta signed?',
 '[{"id":"a","text":"1215"},{"id":"b","text":"1315"},{"id":"c","text":"1115"},{"id":"d","text":"1415"}]',
 'a', 'history', 2, 'King John of England signed the Magna Carta on June 15, 1215, at Runnymede.'),

('What is the longest river in Africa?',
 '[{"id":"a","text":"Congo River"},{"id":"b","text":"Niger River"},{"id":"c","text":"Nile River"},{"id":"d","text":"Zambezi River"}]',
 'c', 'geography', 2, 'The Nile River stretches approximately 6,650 km, making it the longest river in Africa.'),

('What is the half-life of Carbon-14?',
 '[{"id":"a","text":"~570 years"},{"id":"b","text":"~5,730 years"},{"id":"c","text":"~57,300 years"},{"id":"d","text":"~573,000 years"}]',
 'b', 'science', 2, 'Carbon-14 has a half-life of approximately 5,730 years, which is why it''s useful for dating ancient organic materials.'),

('Who wrote "The Art of War"?',
 '[{"id":"a","text":"Confucius"},{"id":"b","text":"Laozi"},{"id":"c","text":"Sun Tzu"},{"id":"d","text":"Mencius"}]',
 'c', 'history', 2, 'Sun Tzu, a Chinese military strategist, wrote "The Art of War" around the 5th century BC.'),

('Mount Kilimanjaro is located in which country?',
 '[{"id":"a","text":"Kenya"},{"id":"b","text":"Uganda"},{"id":"c","text":"Ethiopia"},{"id":"d","text":"Tanzania"}]',
 'd', 'geography', 2, 'Mount Kilimanjaro, Africa''s highest peak at 5,895 m, is located in Tanzania.'),

-- HARD (difficulty=3)
('What is the Chandrasekhar limit?',
 '[{"id":"a","text":"~1.0 solar masses"},{"id":"b","text":"~1.4 solar masses"},{"id":"c","text":"~2.0 solar masses"},{"id":"d","text":"~3.0 solar masses"}]',
 'b', 'science', 3, 'The Chandrasekhar limit (~1.4 solar masses) is the maximum mass of a stable white dwarf star.'),

('Which Roman Emperor issued the Edict of Milan in 313 AD?',
 '[{"id":"a","text":"Nero"},{"id":"b","text":"Augustus"},{"id":"c","text":"Constantine I"},{"id":"d","text":"Diocletian"}]',
 'c', 'history', 3, 'Constantine I and Licinius jointly issued the Edict of Milan, granting religious tolerance throughout the Roman Empire.'),

('What is the capital of Kazakhstan?',
 '[{"id":"a","text":"Almaty"},{"id":"b","text":"Astana"},{"id":"c","text":"Shymkent"},{"id":"d","text":"Karaganda"}]',
 'b', 'geography', 3, 'Astana (formerly Nur-Sultan) is the capital of Kazakhstan since 1997.'),

('In quantum mechanics, what does the Pauli Exclusion Principle state?',
 '[{"id":"a","text":"No two particles can occupy the same position"},{"id":"b","text":"No two identical fermions can have the same quantum state"},{"id":"c","text":"Energy is quantized in discrete levels"},{"id":"d","text":"Observation affects the observed particle"}]',
 'b', 'science', 3, 'The Pauli Exclusion Principle states that no two identical fermions can simultaneously occupy the same quantum state.'),

('The Treaty of Westphalia (1648) ended which war?',
 '[{"id":"a","text":"The Hundred Years'' War"},{"id":"b","text":"The Thirty Years'' War"},{"id":"c","text":"The Seven Years'' War"},{"id":"d","text":"The War of Spanish Succession"}]',
 'b', 'history', 3, 'The Treaty of Westphalia ended the Thirty Years'' War (1618-1648) and established the modern concept of state sovereignty.'),

('The Dasht-e Kavir desert is located in which country?',
 '[{"id":"a","text":"Saudi Arabia"},{"id":"b","text":"Pakistan"},{"id":"c","text":"Iran"},{"id":"d","text":"Afghanistan"}]',
 'c', 'geography', 3, 'The Dasht-e Kavir (Great Salt Desert) is the largest desert in Iran, located in the north-central part of the country.'),

('What is the name of the process by which RNA is synthesized from a DNA template?',
 '[{"id":"a","text":"Translation"},{"id":"b","text":"Replication"},{"id":"c","text":"Transcription"},{"id":"d","text":"Transduction"}]',
 'c', 'science', 3, 'Transcription is the process where RNA polymerase reads a DNA template to produce a complementary RNA strand.'),

('Which Mongol ruler sacked Baghdad in 1258, ending the Abbasid Caliphate?',
 '[{"id":"a","text":"Genghis Khan"},{"id":"b","text":"Timur"},{"id":"c","text":"Hulagu Khan"},{"id":"d","text":"Batu Khan"}]',
 'c', 'history', 3, 'Hulagu Khan, grandson of Genghis Khan, sacked Baghdad in 1258 and executed Caliph Al-Musta''sim.'),

('What is the approximate population of the Svalbard archipelago?',
 '[{"id":"a","text":"~300"},{"id":"b","text":"~3,000"},{"id":"c","text":"~30,000"},{"id":"d","text":"~300,000"}]',
 'b', 'geography', 3, 'Svalbard has a population of approximately 2,500-3,000 people, mainly in Longyearbyen.'),

('What phenomenon is described by the Doppler effect in the context of light from distant galaxies?',
 '[{"id":"a","text":"Blue shift indicating approach"},{"id":"b","text":"Red shift indicating recession"},{"id":"c","text":"Green shift indicating steady state"},{"id":"d","text":"Yellow shift indicating acceleration"}]',
 'b', 'science', 3, 'The red shift of light from distant galaxies indicates they are moving away from us, which is key evidence for the expanding universe.');
