'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { Bell, Lock, Palette, Key, Trash2, Eye, EyeOff } from 'lucide-react'

export default function Settings() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Full-stack developer passionate about code sharing',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Profile</h3>
          <p className="text-sm text-muted-foreground">Update your profile information</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👨</span>
            </div>
            <Button variant="outline" size="sm">Change Avatar</Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              rows={3}
            />
          </div>

          <Button>Save Changes</Button>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            Security
          </h3>
          <p className="text-sm text-muted-foreground">Manage your security settings</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>

          <Button>Update Password</Button>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            Notifications
          </h3>
          <p className="text-sm text-muted-foreground">Control how you receive updates</p>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Email notifications', desc: 'Get updates about your pastes' },
            { label: 'Share notifications', desc: 'When someone shares your paste' },
            { label: 'Comment notifications', desc: 'When someone comments on your paste' },
            { label: 'Marketing emails', desc: 'News and updates from FlowPaste' }
          ].map(notif => (
            <label key={notif.label} className="flex items-center gap-3 cursor-pointer p-3 hover:bg-card/50 rounded-lg transition-colors">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <div className="flex-1">
                <p className="text-sm font-medium">{notif.label}</p>
                <p className="text-xs text-muted-foreground">{notif.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* API Keys */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="w-5 h-5 text-accent" />
            API Keys
          </h3>
          <p className="text-sm text-muted-foreground">Manage your API access</p>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-card/50 rounded-lg flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Primary API Key</p>
              <p className="text-xs text-muted-foreground">sk_live_...abc123</p>
            </div>
            <Button variant="outline" size="sm">Regenerate</Button>
          </div>
        </div>

        <Button variant="outline" className="w-full">Create New API Key</Button>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 space-y-4 border-destructive/20 bg-destructive/5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground">Irreversible actions</p>
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full">Delete All Pastes</Button>
          <Button variant="destructive" className="w-full">Delete Account</Button>
        </div>
      </Card>
    </div>
  )
}
