'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Plus, Share2, Eye, Copy, Trash2, Lock } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type CollectionPaste = {
  id: string
  title: string
  language: string
  content: string
  description: string | null
  hasPassword: boolean
  views: number
  shares: number
  createdAt: string
  addedAt: string
}

type CollectionDetail = {
  id: string
  name: string
  description: string | null
  pasteCount: number
  createdAt: string
  updatedAt: string
  pastes: CollectionPaste[]
}

type PasteSummary = {
  id: string
  title: string
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

export default function CollectionDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [collection, setCollection] = useState<CollectionDetail | null>(null)
  const [allPastes, setAllPastes] = useState<PasteSummary[]>([])
  const [selectedPasteId, setSelectedPasteId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const unassignedPastes = useMemo(() => {
    const assigned = new Set((collection?.pastes ?? []).map((paste) => paste.id))
    return allPastes.filter((paste) => !assigned.has(paste.id))
  }, [allPastes, collection])

  const loadCollection = async () => {
    if (!params?.id) return

    const response = await fetch(`/api/collections/${params.id}`, { cache: 'no-store' })
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null
      throw new Error(data?.message ?? 'Failed to load collection')
    }

    const data = (await response.json()) as { collection: CollectionDetail }
    setCollection(data.collection)
  }

  const loadAllPastes = async () => {
    const response = await fetch('/api/pastes', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to load pastes')
    }

    const data = (await response.json()) as { pastes: PasteSummary[] }
    setAllPastes(data.pastes)
  }

  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        setIsLoading(true)
        setError('')
        await Promise.all([loadCollection(), loadAllPastes()])
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load collection')
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
  }, [params?.id])

  const handleAddPaste = async () => {
    if (!params?.id || !selectedPasteId) {
      return
    }

    setError('')
    setIsSaving(true)

    try {
      const response = await fetch(`/api/collections/${params.id}/pastes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pasteId: selectedPasteId }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(data?.message ?? 'Failed to add paste')
      }

      setSelectedPasteId('')
      await loadCollection()
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Failed to add paste')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemovePaste = async (pasteId: string) => {
    if (!params?.id) return

    setError('')

    try {
      const response = await fetch(`/api/collections/${params.id}/pastes`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pasteId }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(data?.message ?? 'Failed to remove paste')
      }

      await loadCollection()
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Failed to remove paste')
    }
  }

  const handleDeleteCollection = async () => {
    if (!params?.id) return

    const confirmed = window.confirm('Delete this collection?')
    if (!confirmed) {
      return
    }

    const response = await fetch(`/api/collections/${params.id}`, { method: 'DELETE' })
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null
      setError(data?.message ?? 'Failed to delete collection')
      return
    }

    router.push('/app/collections')
  }

  const handleShareCollection = async () => {
    if (!collection) return
    const link = `${window.location.origin}/app/collections/${collection.id}`

    if (navigator.share) {
      await navigator.share({
        title: collection.name,
        text: collection.description || 'FlowPaste collection',
        url: link,
      })
      return
    }

    await navigator.clipboard.writeText(link)
  }

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading collection...</div>
  }

  if (error && !collection) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  if (!collection) {
    return <div className="p-6 text-muted-foreground">Collection not found.</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <Link href="/app/collections">
          <button className="flex items-center gap-2 text-accent hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to collections</span>
          </button>
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold">{collection.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">{collection.description || 'No description yet.'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" className="gap-2" onClick={handleDeleteCollection}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Pastes:</span>
            <span className="font-semibold">{collection.pasteCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span className="font-semibold">{new Date(collection.createdAt).toLocaleDateString('en-US')}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="gap-2" onClick={handleShareCollection}>
          <Share2 className="w-4 h-4" />
          Share Collection
        </Button>
      </div>

      <Card className="p-4 space-y-3 border-accent/20 bg-accent/5">
        <h3 className="font-semibold">Add paste to collection</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedPasteId}
            onChange={(e) => setSelectedPasteId(e.target.value)}
            className="flex-1 px-3 py-2 bg-card border border-border rounded-md text-sm"
          >
            <option value="">Select paste...</option>
            {unassignedPastes.map((paste) => (
              <option key={paste.id} value={paste.id}>{paste.title}</option>
            ))}
          </select>
          <Button className="gap-2" onClick={handleAddPaste} disabled={!selectedPasteId || isSaving}>
            <Plus className="w-4 h-4" />
            {isSaving ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </Card>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Pastes in this collection</h2>
        <div className="space-y-2">
          {collection.pastes.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground">No pastes in this collection yet.</Card>
          ) : collection.pastes.map((paste) => (
            <Card key={paste.id} className="p-4 hover:border-accent/50 transition-colors">
              <div className="flex items-center justify-between gap-4">
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
                    <span>Added {formatRelative(paste.addedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{paste.views}</span>
                  </div>
                  <button
                    className="p-1.5 hover:bg-card rounded transition-colors"
                    onClick={() => navigator.clipboard.writeText(paste.content)}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-card rounded transition-colors text-destructive"
                    onClick={() => handleRemovePaste(paste.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
