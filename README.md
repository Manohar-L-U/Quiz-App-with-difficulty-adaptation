# 🎯 Quiz App with Difficulty Adaptation

An interactive quiz application that adjusts question difficulty based on the user's performance, creating a more personalized and engaging learning experience.

## 📌 Overview

Traditional quiz applications usually present questions at a fixed difficulty level, regardless of how well the user is performing.

This project takes a different approach. The quiz monitors the user's answers and uses their performance to determine the difficulty of upcoming questions.

As the user performs well, the quiz can introduce more challenging questions. When the user struggles, the difficulty can be adjusted to provide more manageable questions.

The application is designed to make quizzes more **adaptive, interactive, and personalized**.

## 🎯 Objectives

- Build an interactive web-based quiz application.
- Adapt question difficulty according to user performance.
- Provide a personalized quiz experience.
- Track user answers and quiz progress.
- Store and manage quiz-related data efficiently.
- Create a responsive and user-friendly interface.

## 🧠 Adaptive Difficulty Approach

The core idea of the application is to dynamically adjust the difficulty of questions based on the user's recent performance.

A simplified representation of the workflow is:

```text
                ┌──────────────────┐
                │    Start Quiz    │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │  Display Question│
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │  User Answers    │
                │   the Question   │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Evaluate Answer  │
                └────────┬─────────┘
                         │
                ┌────────┴─────────┐
                ▼                  ▼
           Correct              Incorrect
                │                  │
                ▼                  ▼
       Increase / Maintain   Decrease / Maintain
          Difficulty            Difficulty
                │                  │
                └────────┬─────────┘
                         ▼
                ┌──────────────────┐
                │  Next Question   │
                └────────┬─────────┘
                         │
                         ▼
                   Continue Quiz
```

The exact adjustment can depend on factors such as the user's recent answers, current difficulty, and quiz progression.

## ✨ Key Features

- 🧠 Adaptive question difficulty
- 📝 Interactive quiz interface
- 📊 Performance-based question selection
- 🔄 Dynamic difficulty adjustment
- 🎯 Personalized quiz experience
- 📈 Quiz progress tracking
- 🗃️ Database integration
- 📱 Responsive user interface

## 🛠️ Tech Stack

### Frontend

- React.js
- TypeScript
- Vite

### Styling

- Tailwind CSS
- PostCSS

### Backend & Database

- Supabase
- Supabase Database
- Supabase Migrations

### Development Tools

- ESLint
- Git
- GitHub
- VS Code

## 🏗️ Application Architecture

```text
┌─────────────────────┐
│        User         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ React + TypeScript  │
│     Frontend        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Quiz Engine      │
│                     │
│ • Question Handling │
│ • Answer Evaluation │
│ • Difficulty Logic  │
│ • Progress Tracking │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      Supabase       │
│                     │
│ • Database          │
│ • Data Storage      │
│ • Migrations        │
└─────────────────────┘
```

## 🔄 Quiz Workflow

The application works through the following general process:

```text
User starts the quiz
        ↓
Question is presented
        ↓
User submits an answer
        ↓
Answer is evaluated
        ↓
Performance is analyzed
        ↓
Difficulty is adjusted
        ↓
Next question is selected
        ↓
Quiz continues
        ↓
Final result is displayed
```

This approach allows the quiz to respond to the user's performance rather than treating every participant the same way.

## 📂 Project Structure

```text
Quiz-App-with-difficulty-adaptation/
│
├── .bolt/
│
├── src/
│   └── Application source code
│
├── supabase/
│   └── migrations/
│
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Manohar-L-U/Quiz-App-with-difficulty-adaptation.git
```

### 2. Navigate to the project

```bash
cd Quiz-App-with-difficulty-adaptation
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at the local URL provided by Vite.

## 🔐 Supabase Configuration

If the application requires Supabase configuration, create a `.env` file in the project root and add the required Supabase environment variables.

For example:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Never commit private API keys, passwords, or other sensitive credentials to GitHub.

## 📊 Why Adaptive Difficulty?

A fixed-difficulty quiz may become too easy for experienced users or unnecessarily difficult for beginners.

Adaptive difficulty attempts to solve this by responding to the user's performance.

For example:

```text
Strong Performance
       ↓
More challenging questions
       ↓
Higher level of difficulty


Difficulty / Incorrect Answers
       ↓
More manageable questions
       ↓
Lower level of difficulty
```

This creates a quiz experience that can better match the user's current skill level.

## 🔮 Future Improvements

- Add more sophisticated difficulty-selection algorithms.
- Introduce multiple quiz categories.
- Add user authentication and personalized profiles.
- Provide detailed performance analytics.
- Add a leaderboard system.
- Track long-term learning progress.
- Introduce timed quiz modes.
- Add question randomization.
- Improve adaptive difficulty using historical performance.
- Deploy the application to a cloud platform.

## 👨‍💻 Author

**Manohar L U**

Computer Science & Design Engineer  
Java Full Stack & AI Developer

- GitHub: [Manohar-L-U](https://github.com/Manohar-L-U)
- LinkedIn: [Manohar L U](https://www.linkedin.com/in/manohar-l-u-727b88268)
- LeetCode: [ManoharLU731](https://leetcode.com/ManoharLU731)

## 📄 License

This project is developed for educational and portfolio purposes.
