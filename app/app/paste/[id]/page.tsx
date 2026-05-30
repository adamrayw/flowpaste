'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Copy, Share2, Heart, Trash2, Link2, Lock, Download } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getHljsLanguage, getLanguageFileExtension, highlightCode, normalizeLanguage } from '@/lib/paste-utils'

type PasteCollection = {
  id: string
  name: string
}

type PasteDetail = {
  id: string
  title: string
  content: string
  description: string | null
  language: string
  visibility: 'public' | 'private' | 'unlisted'
  isFavorite: boolean
  views: number
  shares: number
  createdAt: string
  updatedAt: string
  collections: PasteCollection[]
  hasPassword: boolean
}

function getPasswordStorageKey(pasteId: string) {
  return `flowpaste:paste-password:${pasteId}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function sanitizeFileName(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'paste'
}

export default function PasteView() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [paste, setPaste] = useState<PasteDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [pastePassword, setPastePassword] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [hasStoredPassword, setHasStoredPassword] = useState(false)

  const pasteLink = useMemo(() => {
    if (!paste || typeof window === 'undefined') {
      return ''
    }

    return `${window.location.origin}/app/paste/${paste.id}`
  }, [paste])

  const renderedCodeHtml = useMemo(() => {
    if (!paste || normalizeLanguage(paste.language) === 'markdown') {
      return ''
    }
    return highlightCode(paste.content, paste.language)
  }, [paste])

  const loadPaste = useCallback(async (password?: string) => {
    if (!params?.id) {
      return
    }

    const savedPassword =
      typeof window !== 'undefined' ? window.sessionStorage.getItem(getPasswordStorageKey(params.id)) ?? '' : ''
    const activePassword = password ?? savedPassword

    const response = await fetch(`/api/pastes/${params.id}`, {
      cache: 'no-store',
      headers: activePassword ? { 'x-paste-password': activePassword } : undefined,
    })

    const data = (await response.json().catch(() => null)) as
      | { paste?: PasteDetail; message?: string; requiresPassword?: boolean }
      | null

    if (!response.ok) {
      if (data?.requiresPassword) {
        setRequiresPassword(true)
        setPaste(null)
        if (typeof window !== 'undefined' && activePassword) {
          window.sessionStorage.removeItem(getPasswordStorageKey(params.id))
          setHasStoredPassword(false)
        }
      }
      throw new Error(data?.message ?? 'Failed to load paste')
    }

    if (!data?.paste) {
      throw new Error('Paste not found')
    }

    setRequiresPassword(false)
    if (typeof window !== 'undefined') {
      if (activePassword) {
        window.sessionStorage.setItem(getPasswordStorageKey(params.id), activePassword)
        setHasStoredPassword(true)
      } else {
        setHasStoredPassword(Boolean(window.sessionStorage.getItem(getPasswordStorageKey(params.id))))
      }
    }
    setPaste(data.paste)
  }, [params?.id])

  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        setIsLoading(true)
        setError('')
        if (typeof window !== 'undefined' && params?.id) {
          const saved = window.sessionStorage.getItem(getPasswordStorageKey(params.id))
          setHasStoredPassword(Boolean(saved))
          setPastePassword(saved ?? '')
        }
        await loadPaste()
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load paste')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void run()

    return () => {
      active = false
    }
  }, [loadPaste])

  const handleUnlock = async () => {
    if (!pastePassword.trim()) {
      setError('Password is required')
      return
    }

    setError('')
    setIsUnlocking(true)

    try {
      await loadPaste(pastePassword)
      setPastePassword('')
    } catch (unlockError) {
      setError(unlockError instanceof Error ? unlockError.message : 'Failed to unlock paste')
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleCopyContent = async () => {
    if (!paste) return
    await navigator.clipboard.writeText(paste.content)
  }

  const handleCopyLink = async () => {
    if (!pasteLink) return
    await navigator.clipboard.writeText(pasteLink)
  }

  const incrementShare = async () => {
    if (!paste) return

    const response = await fetch(`/api/pastes/${paste.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ incrementShare: true }),
    })

    if (!response.ok) return

    const data = (await response.json().catch(() => null)) as { paste?: { shares: number } } | null
    if (data?.paste?.shares != null) {
      setPaste((prev) => (prev ? { ...prev, shares: data.paste!.shares } : prev))
    }
  }

  const handleShare = async () => {
    if (!paste || !pasteLink) return

    if (navigator.share) {
      await navigator.share({
        title: paste.title,
        text: paste.description || `Check this ${paste.language} paste on FlowPaste`,
        url: pasteLink,
      })
      await incrementShare()
      return
    }

    await navigator.clipboard.writeText(pasteLink)
    await incrementShare()
  }

  const handleToggleFavorite = async () => {
    if (!paste) return

    const response = await fetch(`/api/pastes/${paste.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isFavorite: !paste.isFavorite,
      }),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null
      setError(data?.message ?? 'Failed to update favorite')
      return
    }

    setPaste((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : prev))
  }

  const handleDelete = async () => {
    if (!paste) return

    const confirmed = window.confirm('Delete this paste? This action cannot be undone.')
    if (!confirmed) {
      return
    }

    const response = await fetch(`/api/pastes/${paste.id}`, { method: 'DELETE' })
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null
      setError(data?.message ?? 'Failed to delete paste')
      return
    }

    router.push('/app/pastes')
  }

  const handleDownload = () => {
    if (!paste) return

    const extension = getLanguageFileExtension(paste.language)
    const fileName = `${sanitizeFileName(paste.title)}.${extension}`
    const blob = new Blob([paste.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()

    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading paste...</div>
  }

  if (requiresPassword) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            Password Protected Paste
          </h2>
          <p className="text-sm text-muted-foreground">Enter password to view this paste.</p>
          {hasStoredPassword ? (
            <p className="text-xs text-muted-foreground">
              A saved password was detected for this paste. Submit again if access still fails.
            </p>
          ) : null}
          <input
            type="password"
            value={pastePassword}
            onChange={(e) => {
              setPastePassword(e.target.value)
              setError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void handleUnlock()
              }
            }}
            className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Paste password"
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button onClick={handleUnlock} disabled={isUnlocking} className="w-full">
            {isUnlocking ? 'Unlocking...' : 'Unlock Paste'}
          </Button>
        </Card>
      </div>
    )
  }

  if (error && !paste) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  if (!paste) {
    return <div className="p-6 text-muted-foreground">Paste not found.</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-3xl font-bold truncate">{paste.title}</h1>
                {paste.hasPassword ? <Lock className="w-4 h-4 text-amber-500 shrink-0" /> : null}
              </div>
              <p className="text-muted-foreground mt-2">
                Created {formatDate(paste.createdAt)}
              </p>
            </div>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium whitespace-nowrap">
              {paste.language}
            </span>
          </div>
          {paste.description ? (
            <p className="text-muted-foreground max-w-2xl">{paste.description}</p>
          ) : null}
        </div>

        {paste.collections.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {paste.collections.map((collection) => (
              <Link key={collection.id} href={`/app/collections/${collection.id}`}>
                <span className="px-2 py-1 rounded-full text-xs bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
                  {collection.name}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 bg-card/50 overflow-hidden">
            {normalizeLanguage(paste.language) === 'markdown' ? (
              <div className="p-4 markdown-body min-h-[300px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{paste.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="bg-card/50 text-xs text-muted-foreground border-b border-border flex">
                <div className="px-4 py-3 bg-card/50 border-r border-border w-12 text-right select-none">
                  {paste.content.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <pre className="flex-1 p-4 overflow-x-auto hljs editor-highlight">
                  <code
                    className={`font-mono text-sm language-${getHljsLanguage(paste.language)}`}
                    dangerouslySetInnerHTML={{ __html: renderedCodeHtml }}
                  />
                </pre>
              </div>
            )}
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button className="gap-2" onClick={handleCopyContent}>
              <Copy className="w-4 h-4" />
              Copy Content
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleCopyLink}>
              <Link2 className="w-4 h-4" />
              Copy Link
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              Share Link
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleToggleFavorite}>
              <Heart className={`w-4 h-4 ${paste.isFavorite ? 'fill-current text-accent' : ''}`} />
              {paste.isFavorite ? 'Favorited' : 'Add Favorite'}
            </Button>
            <Button variant="outline" className="gap-2 text-destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{paste.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shares</span>
                <span className="font-medium">{paste.shares}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visibility</span>
                <span className="font-medium capitalize">{paste.visibility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lines</span>
                <span className="font-medium">{paste.content.split('\n').length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
