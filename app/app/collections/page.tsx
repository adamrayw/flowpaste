'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Folder, Trash2, Edit2, Copy } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

const collections = [
  {
    id: 1,
    name: 'React Patterns',
    description: 'Useful React hooks and component patterns',
    pasteCount: 8,
    color: 'bg-blue-500/20',
    colorBorder: 'border-blue-500/30',
    pastes: [
      { id: 1, title: 'React Component Hook' },
      { id: 2, title: 'Custom useAsync Hook' },
      { id: 3, title: 'Context Provider Pattern' }
    ]
  },
  {
    id: 2,
    name: 'Database Queries',
    description: 'SQL and database optimization examples',
    pasteCount: 12,
    color: 'bg-green-500/20',
    colorBorder: 'border-green-500/30',
    pastes: [
      { id: 4, title: 'Database Query' },
      { id: 5, title: 'Join Optimization' }
    ]
  },
  {
    id: 3,
    name: 'CSS Snippets',
    description: 'Reusable CSS layouts and utilities',
    pasteCount: 15,
    color: 'bg-purple-500/20',
    colorBorder: 'border-purple-500/30',
    pastes: [
      { id: 6, title: 'CSS Grid Layout' },
      { id: 7, title: 'Flexbox Patterns' }
    ]
  },
  {
    id: 4,
    name: 'API Endpoints',
    description: 'REST and GraphQL endpoint examples',
    pasteCount: 10,
    color: 'bg-orange-500/20',
    colorBorder: 'border-orange-500/30',
    pastes: [
      { id: 8, title: 'API Response Handler' }
    ]
  }
]

export default function Collections() {
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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

      {/* Create Collection Form */}
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
                placeholder="What's this collection about?"
                className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button className="gap-2">Create Collection</Button>
              <Button variant="outline" onClick={() => setShowNewCollection(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Collections Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <Card key={collection.id} className={`p-6 space-y-4 border-2 ${collection.colorBorder}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 rounded-lg ${collection.color} flex items-center justify-center`}>
                  <Folder className="w-5 h-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{collection.name}</h3>
                  <p className="text-xs text-muted-foreground">{collection.pasteCount} pastes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-card rounded transition-colors">
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-1.5 hover:bg-card rounded transition-colors text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{collection.description}</p>

            {/* Recent Pastes */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Recent pastes</p>
              <div className="space-y-1">
                {collection.pastes.slice(0, 3).map((paste) => (
                  <Link key={paste.id} href={`/app/paste/${paste.id}`}>
                    <button className="w-full text-left px-2 py-1 text-xs hover:bg-card/50 rounded transition-colors truncate text-accent">
                      {paste.title}
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-border flex gap-2">
              <Link href={`/app/collections/${collection.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">View</Button>
              </Link>
              <Button variant="outline" size="sm" className="gap-2">
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Tips Section */}
      <Card className="p-6 space-y-4 bg-card/50">
        <h3 className="font-semibold">Tips for organizing</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span>•</span>
            <span>Group related pastes together by topic or language</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Use descriptive names to quickly find collections later</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Share collections with your team for better collaboration</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
