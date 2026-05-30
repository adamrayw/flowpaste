'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Folder, Trash2, Copy, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type CollectionItem = {
  id: string
  name: string
  description: string | null
  pasteCount: number
  recentPastes: { id: string; title: string; hasPassword: boolean }[]
}

const colorTokens = [
  { color: 'bg-blue-500/20', border: 'border-blue-500/30' },
  { color: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  { color: 'bg-violet-500/20', border: 'border-violet-500/30' },
  { color: 'bg-amber-500/20', border: 'border-amber-500/30' },
  { color: 'bg-rose-500/20', border: 'border-rose-500/30' },
]

export default function Collections() {
  const [items, setItems] = useState<CollectionItem[]>([])
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const loadCollections = async () => {
    const response = await fetch('/api/collections', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to load collections')
    }

    const data = (await response.json()) as { collections: CollectionItem[] }
    setItems(data.collections)
  }

  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        setIsLoading(true)
        setError('')
        await loadCollections()
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load collections')
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

  const handleCreateCollection = async () => {
    setError('')

    if (!newCollectionName.trim()) {
      setError('Collection name is required')
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCollectionName,
          description: newDescription,
        }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(data?.message ?? 'Failed to create collection')
      }

      setNewCollectionName('')
      setNewDescription('')
      setShowNewCollection(false)
      await loadCollections()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create collection')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteCollection = async (id: string) => {
    const confirmed = window.confirm('Delete this collection?')
    if (!confirmed) {
      return
    }

    setError('')

    try {
      const response = await fetch(`/api/collections/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(data?.message ?? 'Failed to delete collection')
      }

      await loadCollections()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete collection')
    }
  }

  const handleCopyCollectionLink = async (id: string) => {
    const link = `${window.location.origin}/app/collections/${id}`
    await navigator.clipboard.writeText(link)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-muted-foreground">Organize your pastes into collections</p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => setShowNewCollection(!showNewCollection)}>
          <Plus className="w-4 h-4" />
          New Collection
        </Button>
      </div>

      {showNewCollection && (
        <Card className="p-6 space-y-4 border-accent/20 bg-accent/5">
          <h3 className="font-semibold">Create New Collection</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Collection Name</label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="e.g., React Patterns"
                className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What's this collection about?"
                className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button className="gap-2" onClick={handleCreateCollection} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Collection'}
              </Button>
              <Button variant="outline" onClick={() => setShowNewCollection(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <Card className="p-6 col-span-full text-muted-foreground">Loading collections...</Card>
        ) : items.map((collection, index) => {
          const token = colorTokens[index % colorTokens.length]

          return (
            <Card key={collection.id} className={`p-6 space-y-4 border-2 ${token.border}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg ${token.color} flex items-center justify-center`}>
                    <Folder className="w-5 h-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{collection.name}</h3>
                    <p className="text-xs text-muted-foreground">{collection.pasteCount} pastes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-1.5 hover:bg-card rounded transition-colors text-destructive"
                    onClick={() => handleDeleteCollection(collection.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{collection.description || 'No description yet.'}</p>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Recent pastes</p>
                <div className="space-y-1">
                  {collection.recentPastes.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No pastes yet</p>
                  ) : collection.recentPastes.map((paste) => (
                    <Link key={paste.id} href={`/app/paste/${paste.id}`}>
                      <button className="w-full text-left px-2 py-1 text-xs hover:bg-card/50 rounded transition-colors truncate text-accent flex items-center gap-1.5">
                        <span className="truncate">{paste.title}</span>
                        {paste.hasPassword ? <Lock className="w-3 h-3 text-amber-500 shrink-0" /> : null}
                      </button>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border flex gap-2">
                <Link href={`/app/collections/${collection.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">View</Button>
                </Link>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleCopyCollectionLink(collection.id)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {!isLoading && items.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <p className="text-muted-foreground">No collections yet</p>
          <p className="text-sm text-muted-foreground">Create your first collection to organize pastes</p>
        </Card>
      ) : null}
    </div>
  )
}
