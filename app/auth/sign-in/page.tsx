'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Code2, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function SignIn() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let active = true

    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        if (response.ok) {
          router.replace('/app/dashboard')
          return
        }
      } finally {
        if (active) {
          setCheckingSession(false)
        }
      }
    }

    void checkSession()

    return () => {
      active = false
    }
  }, [router])

  if (checkingSession) {
    return <div className="min-h-screen bg-background grid place-items-center text-sm text-muted-foreground">Checking session...</div>
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (!result || result.error) {
        throw new Error('Invalid email or password')
      }

      router.push('/app/dashboard')
      router.refresh()
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">Back to home</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2 justify-center">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-bold text-xl">FlowPaste</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
              <p className="text-center text-muted-foreground">
                Sign in to your FlowPaste account
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <Link href="/auth/reset-password" className="text-xs text-accent hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">New to FlowPaste?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link href="/auth/sign-up">
            <Button variant="outline" className="w-full">
              Create Account
            </Button>
          </Link>

          {/* Footer Text */}
          <p className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-accent hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
