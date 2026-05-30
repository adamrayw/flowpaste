'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

type Account = {
  id: string
  name: string
  email: string
  bio: string | null
}

export default function Settings() {
  const [showPassword, setShowPassword] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadAccount = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetch('/api/account', { cache: 'no-store' })
        const data = (await response.json().catch(() => null)) as { account?: Account; message?: string } | null

        if (!response.ok || !data?.account) {
          throw new Error(data?.message ?? 'Failed to load account')
        }

        if (!active) return
        setAccount(data.account)
        setProfileForm({
          name: data.account.name,
          email: data.account.email,
          bio: data.account.bio ?? '',
        })
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load account')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadAccount()
    return () => {
      active = false
    }
  }, [])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
    setProfileMessage('')
    setError('')
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
    setPasswordMessage('')
    setError('')
  }

  const handleSaveProfile = async () => {
    setError('')
    setProfileMessage('')
    setSavingProfile(true)

    try {
      const response = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })

      const data = (await response.json().catch(() => null)) as { account?: Account; message?: string } | null
      if (!response.ok || !data?.account) {
        throw new Error(data?.message ?? 'Failed to update profile')
      }

      setAccount(data.account)
      setProfileMessage('Profile updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    setError('')
    setPasswordMessage('')
    setSavingPassword(true)

    try {
      const response = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      })
      const data = (await response.json().catch(() => null)) as { message?: string } | null

      if (!response.ok) {
        throw new Error(data?.message ?? 'Failed to update password')
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setPasswordMessage('Password updated successfully.')
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and security</p>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Account</h3>
          <p className="text-sm text-muted-foreground">Update your profile information</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              placeholder="Your name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              name="email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              name="bio"
              value={profileForm.bio}
              onChange={handleProfileChange}
              placeholder="Tell us about yourself"
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              rows={3}
              disabled={loading}
            />
          </div>

          {profileMessage ? <p className="text-sm text-green-600">{profileMessage}</p> : null}
          <Button onClick={handleSaveProfile} disabled={loading || savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            Security
          </h3>
          <p className="text-sm text-muted-foreground">Change your password</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <div className="relative">
              <Input
                name="currentPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <Input
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="At least 8 characters"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <Input
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Repeat new password"
            />
          </div>

          {passwordMessage ? <p className="text-sm text-green-600">{passwordMessage}</p> : null}
          <Button onClick={handleUpdatePassword} disabled={savingPassword}>
            {savingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </Card>

      {account ? (
        <p className="text-xs text-muted-foreground">
          Signed in as {account.email}
        </p>
      ) : null}
    </div>
  )
}
