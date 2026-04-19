"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft,
  Flag, Play, Pause, RotateCcw, ArrowRight, Award, XCircle,
  List, Eye, HelpCircle, Star, Target
} from "lucide-react"

const mockQuiz = {
  id: "qz-1",
  title: "Mathematics - Chapter 5",
  subject: "Mathematics",
  duration: 30,
  totalMarks: 50,
  passingMarks: 25,
  maxAttempts: 2,
  shuffleQuestions: false,
  showResults: true,
}

const mockQuestions = [
  {
    id: "qn-1",
    type: "MCQ_SINGLE",
    text: "What is the value of π to two decimal places?",
    options: ["3.14", "3.14159", "3.142", "3.1416"],
    correctAnswer: "0",
    marks: 2,
    order: 1,
    explanation: "π is approximately 3.14 when rounded to two decimal places.",
  },
  {
    id: "qn-2",
    type: "MCQ_SINGLE",
    text: "Solve: 2x + 5 = 15",
    options: ["x = 5", "x = 10", "x = 7.5", "x = 2"],
    correctAnswer: "0",
    marks: 3,
    order: 2,
    explanation: "2x = 10, therefore x = 5.",
  },
  {
    id: "qn-3",
    type: "MCQ_SINGLE",
    text: "What is the area of a circle with radius 7 cm?",
    options: ["154 cm²", "49 cm²", "44 cm²", "21 cm²"],
    correctAnswer: "0",
    marks: 2,
    order: 3,
    explanation: "Area = πr² = 3.14 × 7² = 3.14 × 49 = 153.86 ≈ 154 cm².",
  },
  {
    id: "qn-4",
    type: "TRUE_FALSE",
    text: "The square root of 144 is 12.",
    options: ["True", "False"],
    correctAnswer: "0",
    marks: 1,
    order: 4,
    explanation: "12 × 12 = 144, so the square root of 144 is 12.",
  },
  {
    id: "qn-5",
    type: "MCQ_SINGLE",
    text: "What is 15% of 200?",
    options: ["15", "30", "45", "60"],
    correctAnswer: "1",
    marks: 2,
    order: 5,
    explanation: "15% of 200 = (15/100) × 200 = 30.",
  },
]

export default function QuizPlayerPage() {
  const [quizState, setQuizState] = useState<"instructions" | "playing" | "paused" | "submitted">("instructions")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(mockQuiz.duration * 60)
  const [showResults, setShowResults] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (quizState === "playing" && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [quizState, timeRemaining])

  const handleStartQuiz = () => {
    setQuizState("playing")
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(mockQuestions[currentQuestion].id)) {
        newSet.delete(mockQuestions[currentQuestion].id)
      } else {
        newSet.add(mockQuestions[currentQuestion].id)
      }
      return newSet
    })
  }

  const handleSubmitQuiz = () => {
    setQuizState("submitted")
    setShowResults(true)
  }

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestion(index)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const calculateScore = () => {
    let score = 0
    mockQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        score += q.marks
      }
    })
    return score
  }

  const score = calculateScore()
  const percentage = (score / mockQuiz.totalMarks) * 100
  const passed = score >= mockQuiz.passingMarks
  const answeredCount = Object.keys(answers).length

  if (quizState === "instructions") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{mockQuiz.title}</h1>
            <p className="text-gray-600">{mockQuiz.subject}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{mockQuiz.duration}</p>
              <p className="text-sm text-gray-600">Minutes</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{mockQuiz.totalMarks}</p>
              <p className="text-sm text-gray-600">Total Marks</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{mockQuiz.passingMarks}</p>
              <p className="text-sm text-gray-600">Passing Marks</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <List className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{mockQuestions.length}</p>
              <p className="text-sm text-gray-600">Questions</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Instructions
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Read each question carefully before answering</li>
              <li>• You have {mockQuiz.duration} minutes to complete the quiz</li>
              <li>• You can navigate between questions using the Next/Previous buttons</li>
              <li>• You can flag questions to review them later</li>
              <li>• Once submitted, you cannot change your answers</li>
              <li>• Passing score: {mockQuiz.passingMarks} marks ({Math.round((mockQuiz.passingMarks / mockQuiz.totalMarks) * 100)}%)</li>
            </ul>
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Quiz
          </button>
        </motion.div>
      </div>
    )
  }

  if (quizState === "submitted" && showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8"
        >
          <div className="text-center mb-8">
            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
              passed ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-gradient-to-br from-red-400 to-red-600"
            }`}>
              {passed ? (
                <Award className="w-12 h-12 text-white" />
              ) : (
                <XCircle className="w-12 h-12 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {passed ? "Congratulations!" : "Keep Trying!"}
            </h1>
            <p className="text-gray-600">
              {passed ? "You have passed the quiz." : "You did not meet the passing score."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{score}</p>
              <p className="text-sm text-gray-600">Score</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <Star className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{percentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Percentage</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{answeredCount}/{mockQuestions.length}</p>
              <p className="text-sm text-gray-600">Answered</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Question Review</h3>
            <div className="space-y-3">
              {mockQuestions.map((q, index) => {
                const isCorrect = answers[q.id] === q.correctAnswer
                const isAnswered = answers[q.id] !== undefined
                return (
                  <div
                    key={q.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isCorrect ? "bg-emerald-50 border border-emerald-200" : isAnswered ? "bg-red-50 border border-red-200" : "bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Q{index + 1}: {q.text}</p>
                      <p className="text-sm text-gray-600 mt-1">{q.explanation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAnswered && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-700">{q.marks} marks</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setQuizState("instructions")
                setCurrentQuestion(0)
                setAnswers({})
                setFlaggedQuestions(new Set())
                setTimeRemaining(mockQuiz.duration * 60)
                setShowResults(false)
              }}
              className="flex-1 py-4 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Quiz
            </button>
            <button className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 flex items-center justify-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{mockQuiz.title}</h1>
              <p className="text-gray-600">{mockQuiz.subject}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining < 300 ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"
              }`}>
                <Clock className="w-5 h-5" />
                <span className="text-xl font-bold">{formatTime(timeRemaining)}</span>
              </div>
              <button
                onClick={() => setQuizState(quizState === "playing" ? "paused" : "playing")}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {quizState === "playing" ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {currentQuestion + 1} / {mockQuestions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {mockQuestions.map((q, index) => {
              const isAnswered = answers[q.id] !== undefined
              const isFlagged = flaggedQuestions.has(q.id)
              const isCurrent = index === currentQuestion
              return (
                <button
                  key={q.id}
                  onClick={() => handleJumpToQuestion(index)}
                  className={`min-w-12 h-12 rounded-lg flex items-center justify-center font-medium transition-colors ${
                    isCurrent
                      ? "bg-purple-600 text-white"
                      : isAnswered
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  } relative`}
                >
                  {index + 1}
                  {isFlagged && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                      <Flag className="w-2 h-2 text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                {currentQuestion + 1}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                {mockQuestions[currentQuestion].type}
              </span>
              <span className="text-sm text-gray-500">{mockQuestions[currentQuestion].marks} marks</span>
            </div>
            <button
              onClick={handleFlag}
              className={`p-2 rounded-lg ${
                flaggedQuestions.has(mockQuestions[currentQuestion].id)
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Flag className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {mockQuestions[currentQuestion].text}
          </h2>

          <div className="space-y-3">
            {mockQuestions[currentQuestion].options.map((option, index) => {
              const isSelected = answers[mockQuestions[currentQuestion].id] === index.toString()
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(mockQuestions[currentQuestion].id, index.toString())}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-purple-500 bg-purple-500" : "border-gray-300"
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentQuestion === mockQuestions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pause Overlay */}
      <AnimatePresence>
        {quizState === "paused" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 text-center"
            >
              <Pause className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Paused</h2>
              <p className="text-gray-600 mb-6">Your timer has been paused.</p>
              <button
                onClick={() => setQuizState("playing")}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Resume
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
