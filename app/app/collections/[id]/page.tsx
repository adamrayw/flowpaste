'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Plus, Share2, Settings, Eye, Copy } from 'lucide-react'

const collectionData = {
  id: 1,
  name: 'React Patterns',
  description: 'Useful React hooks and component patterns for modern applications',
  pasteCount: 8,
  views: 1234,
  shared: true,
  pastes: [
    {
      id: 1,
      title: 'React Component Hook',
      language: 'typescript',
      views: 234,
      added: '2 hours ago',
      snippet: 'const useCustomHook = () => { ... }'
    },
    {
      id: 2,
      title: 'Custom useAsync Hook',
      language: 'typescript',
      views: 189,
      added: '1 day ago',
      snippet: 'const useAsync = (asyncFn) => { ... }'
    },
    {
      id: 3,
      title: 'Context Provider Pattern',
      language: 'typescript',
      views: 345,
      added: '3 days ago',
      snippet: 'const MyContext = createContext() ...'
    },
    {
      id: 4,
      title: 'useLocalStorage Hook',
      language: 'typescript',
      views: 234,
      added: '1 week ago',
      snippet: 'const useLocalStorage = (key) => { ... }'
    },
    {
      id: 5,
      title: 'useDebounce Hook',
      language: 'typescript',
      views: 567,
      added: '2 weeks ago',
      snippet: 'const useDebounce = (value, delay) => { ... }'
    },
    {
      id: 6,
      title: 'useAsync with TypeScript',
      language: 'typescript',
      views: 123,
      added: '3 weeks ago',
      snippet: 'type AsyncState = { ... }'
    },
    {
      id: 7,
      title: 'Error Boundary Component',
      language: 'typescript',
      views: 445,
      added: '1 month ago',
      snippet: 'class ErrorBoundary extends React.Component { ... }'
    },
    {
      id: 8,
      title: 'useReducer Pattern',
      language: 'typescript',
      views: 234,
      added: '1 month ago',
      snippet: 'const [state, dispatch] = useReducer(...)'
    }
  ]
}

export default function CollectionDetail({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/app/collections">
          <button className="flex items-center gap-2 text-accent hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to collections</span>
          </button>
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold">{collectionData.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">{collectionData.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" className="gap-2">
              <Settings className="w-4 h-4" />
            </Button>
            <Button size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Paste
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Pastes:</span>
            <span className="font-semibold">{collectionData.pasteCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Views:</span>
            <span className="font-semibold">{collectionData.views}</span>
          </div>
          {collectionData.shared && (
            <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
              Shared
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Collection
        </Button>
        <Button variant="outline">Edit Description</Button>
      </div>

      {/* Pastes List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Pastes in this collection</h2>
        <div className="space-y-2">
          {collectionData.pastes.map((paste) => (
            <Link key={paste.id} href={`/app/paste/${paste.id}`}>
              <Card className="p-4 hover:border-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="font-semibold hover:text-accent transition-colors truncate">
                      {paste.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono truncate">
                      {paste.snippet}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="px-2 py-0.5 bg-card rounded">{paste.language}</span>
                      <span>Added {paste.added}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{paste.views}</span>
                    </div>
                    <button className="p-1.5 hover:bg-card rounded transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      <Card className="p-4 space-y-3 border-border/50">
        <p className="text-sm font-medium">Bulk actions</p>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm">Move to collection</Button>
          <Button variant="outline" size="sm">Add tags</Button>
          <Button variant="outline" size="sm" className="text-destructive">Delete selected</Button>
        </div>
      </Card>
    </div>
  )
}
