import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Rocket, BookOpen } from 'lucide-react'

export function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6 w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center"
        >
          <Sparkles className="w-10 h-10 text-primary-600" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to USAM Learning Worlds!
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          A place where you'll go on missions, build cool projects, and level up
          your skills in coding, English, and more — one fun step at a time.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8 text-left">
          <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl">
            <Rocket className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              Complete missions and earn XP as you learn
            </p>
          </div>
          <div className="flex items-start gap-3 p-4 bg-secondary-50 rounded-xl">
            <BookOpen className="w-6 h-6 text-secondary-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              Get help from your own learning guide
            </p>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          First, let's get to know you a little — it only takes a minute!
        </p>

        <button
          onClick={() => navigate('/onboarding/age')}
          className="btn btn-primary w-full py-3 text-lg"
        >
          Let's Get Started
        </button>
      </motion.div>
    </div>
  )
}
