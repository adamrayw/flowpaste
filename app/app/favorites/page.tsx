'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Eye, Share2, Trash2, Heart } from 'lucide-react'

const favoritePastes = [
  {
    id: 3,
    title: 'API Response Handler',
    author: 'Sarah Chen',
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
    author: 'Mike Johnson',
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
    author: 'You',
    language: 'javascript',
    views: 189,
    shares: 8,
    created: '2 weeks ago',
    isPublic: true,
    snippet: 'export const authMiddleware = ...'
  },
]

export default function Favorites() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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

      {/* Favorites Grid */}
      <div className="space-y-3">
        {favoritePastes.map((paste) => (
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
                  <span>by {paste.author}</span>
                  <span>{paste.created}</span>
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
                <button className="p-1.5 hover:bg-card rounded transition-colors text-accent">
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state if no favorites */}
      {favoritePastes.length === 0 && (
        <Card className="p-12 text-center space-y-3">
          <p className="text-muted-foreground">No favorites yet</p>
          <p className="text-sm text-muted-foreground">Heart your favorite pastes to save them here</p>
        </Card>
      )}
    </div>
  )
}
