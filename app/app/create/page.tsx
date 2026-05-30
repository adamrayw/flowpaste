'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { Copy, Share2, Lock, Eye, Trash2, Save } from 'lucide-react'

const languages = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'csharp',
  'php', 'ruby', 'go', 'rust', 'sql', 'html', 'css', 'json', 'xml'
]

export default function CreatePaste() {
  const [title, setTitle] = useState('')
  const [code, setCode] = useState(`// Start typing your code here...
function helloWorld() {
  console.log("Hello, FlowPaste!");
}`)
  const [language, setLanguage] = useState('javascript')
  const [visibility, setVisibility] = useState('public')
  const [expiresIn, setExpiresIn] = useState('never')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    setLoading(true)
    // Mock paste creation
    setTimeout(() => {
      setLoading(false)
      // Would redirect to paste view
    }, 1000)
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Create New Paste</h1>
          <p className="text-muted-foreground">Share your code with the world</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Paste Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., React Component Hook"
              className="text-base"
            />
          </div>

          {/* Language Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Code Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Code</label>
            <div className="relative border border-border rounded-lg overflow-hidden bg-card">
              {/* Line numbers and code */}
              <div className="flex bg-card/50 text-xs text-muted-foreground border-b border-border">
                <div className="px-4 py-3 bg-card/50 border-r border-border w-12 text-right select-none">
                  {code.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <div className="flex-1" />
              </div>

              {/* Editor */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-4 font-mono text-sm bg-card border-0 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                rows={20}
                spellCheck="false"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>

        {/* Sidebar Options */}
        <div className="space-y-4">
          {/* Visibility */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4 text-accent" />
              Visibility
            </h3>
            <div className="space-y-2">
              {[
                { value: 'public', label: 'Public', desc: 'Anyone can view' },
                { value: 'private', label: 'Private', desc: 'Only you can view' },
                { value: 'unlisted', label: 'Unlisted', desc: 'Only with link' }
              ].map(option => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-card transition-colors">
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Security */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent" />
              Security
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password (Optional)</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expires In</label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm"
                >
                  <option value="never">Never</option>
                  <option value="1hour">1 Hour</option>
                  <option value="1day">1 Day</option>
                  <option value="7days">7 Days</option>
                  <option value="30days">30 Days</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={loading || !title || !code}
            className="w-full gap-2"
            size="lg"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Paste'}
          </Button>
        </div>
      </div>
    </div>
  )
}
