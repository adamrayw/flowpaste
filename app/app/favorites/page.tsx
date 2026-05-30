'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Eye, Share2, Heart, Copy, Link2, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'

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
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Favorites() {
  const [items, setItems] = useState<PasteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadFavorites = async () => {
    const response = await fetch('/api/pastes?favorite=true', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to load favorites')
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
        await loadFavorites()
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load favorites')
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
  }, [])

  const handleToggleFavorite = async (item: PasteItem) => {
    setError('')

    try {
      const response = await fetch(`/api/pastes/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFavorite: !item.isFavorite }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(data?.message ?? 'Failed to update favorite')
      }

      setItems((prev) => prev.filter((paste) => paste.id !== item.id))
    } catch (favoriteError) {
      setError(favoriteError instanceof Error ? favoriteError.message : 'Failed to update favorite')
    }
  }

  const handleCopyContent = async (content: string) => {
    await navigator.clipboard.writeText(content)
  }

  const handleCopyLink = async (id: string) => {
    const link = `${window.location.origin}/app/paste/${id}`
    await navigator.clipboard.writeText(link)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Favorites</h1>
          <p className="text-muted-foreground">Your saved pastes and snippets</p>
        </div>
        <Link href="/app/create">
          <Button size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            New Paste
          </Button>
        </Link>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading favorites...</p>
          </Card>
        ) : items.map((paste) => (
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
                <button className="p-1.5 hover:bg-card rounded transition-colors" onClick={() => handleCopyContent(paste.content)}>
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-card rounded transition-colors" onClick={() => handleCopyLink(paste.id)}>
                  <Link2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-card rounded transition-colors text-accent" onClick={() => handleToggleFavorite(paste)}>
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!isLoading && items.length === 0 && (
        <Card className="p-12 text-center space-y-3">
          <p className="text-muted-foreground">No favorites yet</p>
          <p className="text-sm text-muted-foreground">Heart your favorite pastes to save them here</p>
        </Card>
      )}
    </div>
  )
}
