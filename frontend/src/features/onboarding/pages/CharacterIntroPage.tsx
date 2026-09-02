import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, MessageCircle, Star } from 'lucide-react'

// PLACEHOLDER NOTICE:
// There is no illustrated character asset for "Azouz" yet. This screen uses
// a lucide-react icon inside a friendly CSS-drawn blob shape as a stand-in
// avatar. Swap the icon block below for a real illustration/sprite once
// character art is produced — the seeded Character record (name: "Azouz",
// role: GUIDE) is the source of truth this screen references by name.
export function CharacterIntroPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 text-center"
      >
        {/* Placeholder avatar — friendly blob shape + icon, not real character art */}
        <motion.div
          initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 180 }}
          className="mx-auto mb-6 relative w-32 h-32"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-400 to-primary-500 rounded-[40%_60%_60%_40%/60%_40%_60%_40%] shadow-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-14 h-14 text-white" strokeWidth={2.2} />
          </div>
          <div className="absolute -top-1 -right-1 bg-warning-400 rounded-full p-1.5 shadow">
            <Star className="w-4 h-4 text-white" fill="currentColor" />
          </div>
        </motion.div>

        <p className="inline-block text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-3 py-1 mb-4">
          Placeholder avatar — real illustrated character coming soon
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          Meet Azouz!
        </h1>
        <p className="text-primary-600 font-medium mb-6">Your Learning Guide</p>

        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl text-left mb-8">
          <MessageCircle className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
          <p className="text-gray-700">
            "Hi there! I'm Azouz, and I'll be with you every step of the way —
            cheering you on, giving hints when you're stuck, and celebrating
            every mission you complete. Ready to explore together?"
          </p>
        </div>

        <button
          onClick={() => navigate('/onboarding/complete')}
          className="btn btn-primary w-full py-3 text-lg"
        >
          Nice to meet you, Azouz!
        </button>
      </motion.div>
    </div>
  )
}
