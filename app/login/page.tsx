"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Mail, UserPlus, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface LoginPageProps {
  onGuestLogin?: () => void
}

export default function LoginPage({ onGuestLogin }: LoginPageProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
    if (onGuestLogin) {
      onGuestLogin()
    } else {
      // Navigate to dashboard as guest
      router.push('/?mode=guest')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-60">
        {/* Will inherit the same Spline background from parent */}
      </div>

      {/* Watermark cover */}
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent to-black/40" />

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        <div className="glass-panel rounded-2xl p-8 bg-black/40 backdrop-blur-lg border border-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Attendify</h1>
            <p className="text-white/60">Smart Attendance Tracker</p>
          </div>

          {/* Login Options */}
          <div className="space-y-4">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Mail className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700">
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
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 glass-panel bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/20 font-medium"
            >
              <UserPlus className="w-5 h-5" />
              <span>Continue as Guest</span>
            </button>
          </div>

          {/* Info Text */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-white/60 text-sm">
              Google sign-in saves your data across devices
            </p>
            <p className="text-white/60 text-sm">
              Guest mode keeps data locally only
            </p>
          </div>
        </div>
      </div>

      {/* Watermark cover box */}
      <div className="fixed bottom-0 right-0 z-10 w-48 h-48 bg-black"></div>
    </div>
  )
}