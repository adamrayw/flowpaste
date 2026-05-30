'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Eye, Share2, Sparkles, FileText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

type SearchPaste = {
  id: string
  title: string
  content: string
  description: string | null
  language: string
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

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('relevant')
  const [items, setItems] = useState<SearchPaste[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        setIsLoading(true)
        setError('')

        const params = new URLSearchParams()
        if (query.trim()) {
          params.set('q', query.trim())
        }

        const response = await fetch(`/api/pastes?${params.toString()}`, { cache: 'no-store' })
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { message?: string } | null
          throw new Error(data?.message ?? 'Failed to search pastes')
        }

        const data = (await response.json()) as { pastes: SearchPaste[] }
        if (!active) return
        setItems(data.pastes)
      } catch (searchError) {
        if (active) {
          setError(searchError instanceof Error ? searchError.message : 'Failed to search pastes')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    const timeout = setTimeout(run, 220)
    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [query])

  const sorted = useMemo(() => {
    const cloned = [...items]
    if (sortBy === 'recent') {
      return cloned.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    if (sortBy === 'popular') {
      return cloned.sort((a, b) => b.views - a.views)
    }
    if (sortBy === 'shared') {
      return cloned.sort((a, b) => b.shares - a.shares)
    }
    return cloned.sort((a, b) => {
      const scoreA = (query ? Number(a.title.toLowerCase().includes(query.toLowerCase())) * 3 : 0) + a.views * 0.01 + a.shares * 0.03
      const scoreB = (query ? Number(b.title.toLowerCase().includes(query.toLowerCase())) * 3 : 0) + b.views * 0.01 + b.shares * 0.03
      return scoreB - scoreA
    })
  }, [items, query, sortBy])

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search Pastes</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your pastes..."
              className="pl-10 text-base"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-md text-sm"
          >
            <option value="relevant">Most Relevant</option>
            <option value="recent">Most Recent</option>
            <option value="popular">Most Viewed</option>
            <option value="shared">Most Shared</option>
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-8 text-sm text-muted-foreground">Searching...</Card>
        ) : sorted.length === 0 ? (
          <Empty className="border border-border bg-card/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>No pastes found</EmptyTitle>
              <EmptyDescription>
                {query.trim() ? `No result for "${query}". Try another keyword.` : 'Create your first paste to start searching.'}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/app/create">
                <Button>Create New Paste</Button>
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          sorted.map((result) => (
            <Card key={result.id} className="p-4 sm:p-6 hover:border-accent/50 transition-colors">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/app/paste/${result.id}`}>
                      <h3 className="font-semibold text-lg hover:text-accent transition-colors truncate">
                        {result.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {result.description || result.content.split('\n')[0] || 'No description'}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-card rounded text-xs font-medium whitespace-nowrap">
                    {result.language}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground font-mono line-clamp-2">
                  {result.content}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatRelative(result.createdAt)}</span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{result.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      <span>{result.shares}</span>
                    </div>
                  </div>
                  <Link href={`/app/ai-tools?pasteId=${result.id}&tool=explain_code&run=1`}>
                    <Button size="sm" className="gap-2">
                      <Sparkles className="w-3 h-3" />
                      Analyze with AI
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
