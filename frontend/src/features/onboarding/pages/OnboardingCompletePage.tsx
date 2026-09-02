import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PartyPopper, CheckCircle2 } from 'lucide-react'

export function OnboardingCompletePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6 w-20 h-20 rounded-full bg-success-50 flex items-center justify-center"
        >
          <PartyPopper className="w-10 h-10 text-success-600" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">You're all set!</h1>
        <p className="text-gray-600 mb-8">
          Your profile is ready and Azouz is waiting to guide you through your
          first mission. Let's head to your dashboard.
        </p>

        <ul className="text-left space-y-2 mb-8">
          <li className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
            Age group saved
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
            Met your guide, Azouz
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
            Ready to start learning
          </li>
        </ul>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary w-full py-3 text-lg"
        >
          Go to My Dashboard
        </button>
      </motion.div>
    </div>
  )
}
