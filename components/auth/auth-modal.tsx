"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { X, LogIn, UserPlus, Mail } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onGuestLogin: () => void
}

export default function AuthModal({ isOpen, onClose, onGuestLogin }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestLogin = () => {
    onGuestLogin()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto p-6 glass-panel rounded-xl border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Welcome to Attendify</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700 font-medium">
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          <div className="flex items-center space-x-4">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="text-white/60 text-sm">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Guest Login */}
          <button
            onClick={handleGuestLogin}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white border border-white/20"
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-medium">Continue as Guest</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            Google sign-in saves your data across devices
          </p>
          <p className="text-white/60 text-sm mt-1">
            Guest mode keeps data locally only
          </p>
        </div>
      </div>
    </div>
  )
}