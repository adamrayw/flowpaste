'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Eye, Share2, Zap } from 'lucide-react'
import { useState } from 'react'

const searchResults = [
  {
    id: 1,
    title: 'React Hook Pattern',
    author: 'Sarah Chen',
    language: 'typescript',
    views: 1234,
    shares: 89,
    description: 'A comprehensive guide to building custom React hooks with TypeScript',
    snippet: 'const useCustomHook = () => { ... }'
  },
  {
    id: 2,
    title: 'Express Middleware Setup',
    author: 'Mike Johnson',
    language: 'javascript',
    views: 567,
    shares: 34,
    description: 'Complete Express.js middleware setup for authentication and logging',
    snippet: 'app.use(authMiddleware); ...'
  },
  {
    id: 3,
    title: 'Database Connection Pool',
    author: 'Alex Davis',
    language: 'python',
    views: 890,
    shares: 45,
    description: 'Efficient database connection pooling implementation',
    snippet: 'class ConnectionPool: ...'
  },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('relevant')

  return (
    <div className="p-6 space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search Pastes</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all pastes..."
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
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {searchResults.map((result) => (
          <Card key={result.id} className="p-6 hover:border-accent/50 transition-colors cursor-pointer">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg hover:text-accent transition-colors">
                    {result.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.description}
                  </p>
                </div>
                <span className="px-3 py-1 bg-card rounded text-xs font-medium whitespace-nowrap">
                  {result.language}
                </span>
              </div>

              <p className="text-sm text-muted-foreground font-mono">
                {result.snippet}
              </p>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>by {result.author}</span>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{result.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    <span>{result.shares}</span>
                  </div>
                </div>
                <Button size="sm" className="gap-2">
                  <Zap className="w-3 h-3" />
                  Analyze with AI
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters Sidebar */}
      <div className="pt-6 border-t border-border space-y-4">
        <h3 className="font-semibold">Refine Results</h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">Language</h4>
            <div className="space-y-2">
              {['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL'].map(lang => (
                <label key={lang} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-sm">{lang}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
