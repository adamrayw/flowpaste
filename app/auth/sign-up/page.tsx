'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Code2, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = (await response.json().catch(() => null)) as { message?: string } | null
      if (!response.ok) {
        throw new Error(data?.message ?? 'Failed to create account')
      }

      const loginResult = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (!loginResult || loginResult.error) {
        throw new Error('Account created, but auto sign-in failed. Please sign in manually.')
      }

      router.push('/app/dashboard')
      router.refresh()
    } catch (signUpError) {
      setError(signUpError instanceof Error ? signUpError.message : 'Failed to create account')
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
              <h1 className="text-2xl font-bold text-center">Create Account</h1>
              <p className="text-center text-muted-foreground">
                Join thousands of developers sharing code
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

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
                <label className="text-sm font-medium">Password</label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link href="/auth/sign-in">
            <Button variant="outline" className="w-full">
              Sign In Instead
            </Button>
          </Link>

          {/* Footer Text */}
          <p className="text-center text-sm text-muted-foreground">
            By signing up, you agree to our{' '}
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
