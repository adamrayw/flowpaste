'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Plus, Search, Eye, Share2, Trash2, Copy } from 'lucide-react'
import { useState } from 'react'

const allPastes = [
  {
    id: 1,
    title: 'React Component Hook',
    language: 'typescript',
    views: 234,
    shares: 12,
    created: '2 hours ago',
    isPublic: true,
    snippet: 'const useCustomHook = () => { ... }'
  },
  {
    id: 2,
    title: 'Database Query',
    language: 'sql',
    views: 89,
    shares: 5,
    created: '1 day ago',
    isPublic: false,
    snippet: 'SELECT * FROM users WHERE...'
  },
  {
    id: 3,
    title: 'API Response Handler',
    language: 'javascript',
    views: 456,
    shares: 23,
    created: '3 days ago',
    isPublic: true,
    snippet: 'const handleResponse = (data) => { ... }'
  },
  {
    id: 4,
    title: 'CSS Grid Layout',
    language: 'css',
    views: 567,
    shares: 34,
    created: '1 week ago',
    isPublic: true,
    snippet: '.grid { display: grid; ... }'
  },
  {
    id: 5,
    title: 'Authentication Middleware',
    language: 'javascript',
    views: 189,
    shares: 8,
    created: '2 weeks ago',
    isPublic: true,
    snippet: 'export const authMiddleware = ...'
  },
  {
    id: 6,
    title: 'Data Validation Schema',
    language: 'typescript',
    views: 312,
    shares: 15,
    created: '3 weeks ago',
    isPublic: false,
    snippet: 'const schema = z.object({ ... })'
  },
]

export default function MyPastes() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  const filteredPastes = allPastes.filter(paste =>
    paste.title.toLowerCase().includes(search.toLowerCase()) ||
    paste.snippet.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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

      {/* Search and Filters */}
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

      {/* Pastes List */}
      <div className="space-y-3">
        {filteredPastes.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <p className="text-muted-foreground">No pastes found</p>
            <Link href="/app/create">
              <Button>Create your first paste</Button>
            </Link>
          </Card>
        ) : (
          filteredPastes.map((paste) => (
            <Card key={paste.id} className="p-4 hover:border-accent/50 transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <Link href={`/app/paste/${paste.id}`}>
                    <h3 className="font-semibold hover:text-accent transition-colors truncate">
                      {paste.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground font-mono truncate">
                    {paste.snippet}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="px-2 py-0.5 bg-card rounded">{paste.language}</span>
                    <span>{paste.created}</span>
                    {!paste.isPublic && (
                      <span className="px-2 py-0.5 bg-accent/10 text-accent rounded">Private</span>
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
                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-1.5 hover:bg-card rounded transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-card rounded transition-colors text-destructive">
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
