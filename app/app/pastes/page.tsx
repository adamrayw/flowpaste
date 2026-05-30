'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Plus, Search, Eye, Share2, Trash2, Copy, Link2, Heart, Lock } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type PasteItem = {
  id: string
  title: string
  content: string
  description: string | null
  language: string
  visibility: 'public' | 'private' | 'unlisted'
  isFavorite: boolean
  hasPassword: boolean
  views: number
  shares: number
  createdAt: string
}

function formatRelative(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function MyPastes() {
  const [items, setItems] = useState<PasteItem[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPastes = async (query?: string) => {
    const params = new URLSearchParams()
    if (query?.trim()) {
      params.set('q', query.trim())
    }

    const response = await fetch(`/api/pastes?${params.toString()}`, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to load pastes')
    }

    const data = (await response.json()) as { pastes: PasteItem[] }
    setItems(data.pastes)
  }

  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        setIsLoading(true)
        setError('')
        await loadPastes(search)
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load pastes')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    const timeout = setTimeout(run, 250)
    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [search])

  const sortedPastes = useMemo(() => {
    const cloned = [...items]

    if (sortBy === 'popular') {
      cloned.sort((a, b) => b.views - a.views)
      return cloned
    }

    if (sortBy === 'shared') {
      cloned.sort((a, b) => b.shares - a.shares)
      return cloned
    }

    if (sortBy === 'oldest') {
      cloned.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      return cloned
    }

    cloned.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return cloned
  }, [items, sortBy])

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this paste? This action cannot be undone.')
    if (!confirmed) {
      return
    }

    setError('')

    try {
      const response = await fetch(`/api/pastes/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(data?.message ?? 'Failed to delete paste')
      }

      await loadPastes(search)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete paste')
    }
  }

  const handleCopyContent = async (content: string) => {
    await navigator.clipboard.writeText(content)
  }

  const handleCopyLink = async (id: string) => {
    const link = `${window.location.origin}/app/paste/${id}`
    await navigator.clipboard.writeText(link)
  }

  const handleToggleFavorite = async (item: PasteItem) => {
    setError('')

    try {
      const response = await fetch(`/api/pastes/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFavorite: !item.isFavorite,
        }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(data?.message ?? 'Failed to update favorite')
      }

      setItems((prev) => prev.map((paste) => (paste.id === item.id ? { ...paste, isFavorite: !paste.isFavorite } : paste)))
    } catch (favoriteError) {
      setError(favoriteError instanceof Error ? favoriteError.message : 'Failed to update favorite')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">My Pastes</h1>
          <p className="text-muted-foreground">All your code snippets in one place</p>
        </div>
        <Link href="/app/create">
          <Button size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            New Paste
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pastes..."
            className="pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-md text-sm"
        >
          <option value="recent">Recent</option>
          <option value="popular">Most Viewed</option>
          <option value="shared">Most Shared</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading pastes...</p>
          </Card>
        ) : sortedPastes.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <p className="text-muted-foreground">No pastes found</p>
            <Link href="/app/create">
              <Button>Create your first paste</Button>
            </Link>
          </Card>
        ) : (
          sortedPastes.map((paste) => (
            <Card key={paste.id} className="p-4 hover:border-accent/50 transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <Link href={`/app/paste/${paste.id}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-semibold hover:text-accent transition-colors truncate">
                        {paste.title}
                      </h3>
                      {paste.hasPassword ? <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : null}
                    </div>
                  </Link>
                  <p className="text-sm text-muted-foreground font-mono truncate">
                    {paste.description || paste.content.split('\n')[0] || 'No preview'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="px-2 py-0.5 bg-card rounded">{paste.language}</span>
                    <span>{formatRelative(paste.createdAt)}</span>
                    {paste.visibility !== 'public' && (
                      <span className="px-2 py-0.5 bg-accent/10 text-accent rounded capitalize">{paste.visibility}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{paste.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    <span>{paste.shares}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      className={`p-1.5 hover:bg-card rounded transition-colors ${paste.isFavorite ? 'text-accent' : ''}`}
                      onClick={() => handleToggleFavorite(paste)}
                      title={paste.isFavorite ? 'Remove favorite' : 'Add favorite'}
                    >
                      <Heart className={`w-4 h-4 ${paste.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      className="p-1.5 hover:bg-card rounded transition-colors"
                      onClick={() => handleCopyContent(paste.content)}
                      title="Copy content"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-card rounded transition-colors"
                      onClick={() => handleCopyLink(paste.id)}
                      title="Copy link"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-card rounded transition-colors text-destructive"
                      onClick={() => handleDelete(paste.id)}
                      title="Delete paste"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
