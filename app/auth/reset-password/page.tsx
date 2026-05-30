'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Code2, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Mock password reset request
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/auth/sign-in" className="flex items-center gap-2 w-fit">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">Back to sign in</span>
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

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-center">Reset Password</h1>
                <p className="text-center text-muted-foreground">
                  Enter your email address and we&apos;ll send you a link to reset your password
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Check Your Email</h1>
                <p className="text-muted-foreground">
                  We&apos;ve sent a password reset link to <span className="font-semibold">{email}</span>
                </p>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-sm">
                <p>The link will expire in 24 hours. If you don&apos;t see the email, check your spam folder.</p>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/sign-in">Back to Sign In</Link>
              </Button>
            </div>
          )}

          {/* Footer Text */}
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/auth/sign-in" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
