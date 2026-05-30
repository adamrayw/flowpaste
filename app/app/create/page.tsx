'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Copy, Lock, Eye, Trash2, Save, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  detectLanguageFromContent,
  getAllLanguageOptions,
  getHljsLanguage,
  highlightCode,
  normalizeLanguage,
} from '@/lib/paste-utils'

type PasteVisibility = 'public' | 'private' | 'unlisted'
type ExpireOption = 'never' | '1hour' | '1day' | '7days' | '30days'
type EditorView = 'write' | 'preview'

export default function CreatePaste() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState(`// Start typing your code here...\nfunction helloWorld() {\n  console.log("Hello, FlowPaste!");\n}`)
  const [language, setLanguage] = useState('javascript')
  const [visibility, setVisibility] = useState<PasteVisibility>('public')
  const [expiresIn, setExpiresIn] = useState<ExpireOption>('never')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDetectingLanguage, setIsDetectingLanguage] = useState(false)
  const [editorView, setEditorView] = useState<EditorView>('write')
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const highlightRef = useRef<HTMLPreElement | null>(null)
  const lineNumbersRef = useRef<HTMLDivElement | null>(null)

  const normalizedLanguage = normalizeLanguage(language)
  const languageOptions = useMemo(() => {
    const base = getAllLanguageOptions()
    if (base.some((item) => item.value === language)) {
      return base
    }
    return [{ value: language, label: language.charAt(0).toUpperCase() + language.slice(1) }, ...base]
  }, [language])

  const renderedCodeHtml = useMemo(() => {
    if (!code.trim() || normalizedLanguage === 'markdown') {
      return ''
    }
    return highlightCode(code, language)
  }, [code, language, normalizedLanguage])

  useEffect(() => {
    if (normalizedLanguage !== 'markdown') {
      setEditorView('write')
    }
  }, [normalizedLanguage])

  const handleCreate = async () => {
    setError('')

    if (!title.trim() || !code.trim()) {
      setError('Title and content are required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          content: code,
          language,
          visibility,
          password,
          expiresIn,
        }),
      })

      const data = (await response.json().catch(() => null)) as { message?: string; paste?: { id: string } } | null
      if (!response.ok || !data?.paste?.id) {
        throw new Error(data?.message ?? 'Failed to create paste')
      }

      router.push(`/app/paste/${data.paste.id}`)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create paste')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
  }

  const handleClear = () => {
    setCode('')
  }

  const handleDetectLanguage = async () => {
    if (!code.trim()) {
      setError('Add content first to detect language')
      return
    }

    setError('')
    setIsDetectingLanguage(true)

    try {
      const detectedLanguage = detectLanguageFromContent(code)
      setLanguage(detectedLanguage || 'plaintext')
      if (detectedLanguage === 'markdown') {
        setEditorView('write')
      }
    } finally {
      setIsDetectingLanguage(false)
    }
  }

  const syncEditorScroll = () => {
    const top = textareaRef.current?.scrollTop ?? 0
    const left = textareaRef.current?.scrollLeft ?? 0

    if (highlightRef.current) {
      highlightRef.current.scrollTop = top
      highlightRef.current.scrollLeft = left
    }

    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = top
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Create New Paste</h1>
          <p className="text-muted-foreground">Share your code with the world</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Paste Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., React Component Hook"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short context for this paste"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium">Language</label>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                type="button"
                onClick={handleDetectLanguage}
                disabled={isDetectingLanguage || !code.trim()}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isDetectingLanguage ? 'Detecting...' : 'Detect Language'}
              </Button>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium">Content</label>
              {normalizedLanguage === 'markdown' ? (
                <div className="inline-flex rounded-md border border-border overflow-hidden">
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-xs ${editorView === 'write' ? 'bg-accent text-accent-foreground' : 'bg-card text-muted-foreground'}`}
                    onClick={() => setEditorView('write')}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-xs ${editorView === 'preview' ? 'bg-accent text-accent-foreground' : 'bg-card text-muted-foreground'}`}
                    onClick={() => setEditorView('preview')}
                  >
                    Preview
                  </button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Live syntax highlighting</span>
              )}
            </div>

            <div className="relative border border-border rounded-lg overflow-hidden bg-card">
              {normalizedLanguage === 'markdown' && editorView === 'preview' ? (
                <div className="p-4 markdown-body min-h-[420px]">
                  {code.trim() ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{code}</ReactMarkdown>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
                  )}
                </div>
              ) : (
                <div className="bg-card/50 text-xs text-muted-foreground border-b border-border flex h-[420px] overflow-hidden">
                  <div
                    ref={lineNumbersRef}
                    className="px-4 py-3 bg-card/50 border-r border-border w-12 text-right select-none overflow-hidden"
                  >
                    {code.split('\n').map((_, i) => (
                      <div key={i} className="leading-6">{i + 1}</div>
                    ))}
                  </div>

                  <div className="relative flex-1">
                    {normalizedLanguage === 'markdown' ? (
                      <textarea
                        ref={textareaRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onScroll={syncEditorScroll}
                        className="w-full h-[420px] p-4 font-mono text-sm leading-6 bg-card border-0 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                        spellCheck
                      />
                    ) : (
                      <>
                        <pre
                          ref={highlightRef}
                          className="absolute inset-0 m-0 p-4 overflow-auto pointer-events-none whitespace-pre-wrap break-words hljs editor-highlight"
                        >
                          <code
                            className={`font-mono text-sm leading-6 language-${getHljsLanguage(language)}`}
                            dangerouslySetInnerHTML={{
                              __html: `${renderedCodeHtml || code || ' '}${code.endsWith('\n') ? '\n ' : ''}`,
                            }}
                          />
                        </pre>
                        <textarea
                          ref={textareaRef}
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          onScroll={syncEditorScroll}
                          className="relative z-10 w-full h-[420px] p-4 font-mono text-sm leading-6 bg-transparent text-transparent caret-foreground selection:bg-accent/30 selection:text-transparent border-0 resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                          spellCheck={false}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              className="gap-2"
              type="button"
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              type="button"
              onClick={handleClear}
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4 text-accent" />
              Visibility
            </h3>
            <div className="space-y-2">
              {[
                { value: 'public', label: 'Public', desc: 'Anyone can view' },
                { value: 'private', label: 'Private', desc: 'Hidden from list (link only)' },
                { value: 'unlisted', label: 'Unlisted', desc: 'Only with link' },
              ].map(option => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-card transition-colors">
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={(e) => setVisibility(e.target.value as PasteVisibility)}
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
                  onChange={(e) => setExpiresIn(e.target.value as ExpireOption)}
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

          <Button
            onClick={handleCreate}
            disabled={loading || !title.trim() || !code.trim()}
            className="w-full gap-2"
            size="lg"
            type="button"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Paste'}
          </Button>
        </div>
      </div>
    </div>
  )
}
