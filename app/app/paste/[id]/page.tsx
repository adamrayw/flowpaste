'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Copy, Share2, Heart, MessageSquare, Edit2, Trash2, Zap } from 'lucide-react'
import { useState } from 'react'

const pasteData = {
  id: 1,
  title: 'React Component Hook',
  author: 'You',
  created: '2 hours ago',
  language: 'typescript',
  views: 234,
  shares: 12,
  favorites: 45,
  code: `import { useState, useCallback, useRef } from 'react';

interface UseCustomHookOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useCustomHook = (options: UseCustomHookOptions = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (params: any) => {
    try {
      setLoading(true);
      setError(null);
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: abortControllerRef.current.signal,
      });

      const result = await response.json();
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [options]);

  return { data, loading, error, execute };
};`,
  description: 'A reusable React hook for handling async operations with proper error handling and cleanup',
  tags: ['react', 'hooks', 'typescript', 'custom-hook']
}

export default function PasteView({ params }: { params: { id: string } }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(pasteData.code)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold truncate">{pasteData.title}</h1>
              <p className="text-muted-foreground mt-2">
                by {pasteData.author} • {pasteData.created}
              </p>
            </div>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium whitespace-nowrap">
              {pasteData.language}
            </span>
          </div>
          {pasteData.description && (
            <p className="text-muted-foreground max-w-2xl">{pasteData.description}</p>
          )}
        </div>

        {/* Tags */}
        {pasteData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pasteData.tags.map(tag => (
              <button key={tag} className="px-2 py-1 bg-card/50 hover:bg-card border border-border rounded text-xs font-medium transition-colors">
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Code Display */}
        <div className="lg:col-span-2 space-y-4">
          {/* Code Editor */}
          <Card className="border-0 bg-card/50 overflow-hidden">
            <div className="bg-card/50 text-xs text-muted-foreground border-b border-border flex">
              <div className="px-4 py-3 bg-card/50 border-r border-border w-12 text-right select-none">
                {pasteData.code.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <pre className="flex-1 p-4 overflow-x-auto">
                <code className="font-mono text-sm text-foreground">{pasteData.code}</code>
              </pre>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
              Copy Code
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-accent' : ''}`} />
              Save
            </Button>
            <Button variant="outline" className="gap-2">
              <Zap className="w-4 h-4" />
              AI Analysis
            </Button>
          </div>

          {/* Comments Section */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <textarea
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  rows={3}
                />
                <Button size="sm">Post Comment</Button>
              </div>

              {/* Sample Comments */}
              <div className="space-y-3 pt-4 border-t border-border">
                {[
                  { author: 'Sarah Chen', text: 'Great implementation! I like the error handling approach.', time: '1 hour ago' },
                  { author: 'Mike Johnson', text: 'This would be even better with TypeScript strict mode.', time: '30 minutes ago' },
                ].map((comment) => (
                  <div key={comment.author} className="p-3 bg-card/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{comment.author}</p>
                      <p className="text-xs text-muted-foreground">{comment.time}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{pasteData.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shares</span>
                <span className="font-medium">{pasteData.shares}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Favorites</span>
                <span className="font-medium">{pasteData.favorites}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lines</span>
                <span className="font-medium">{pasteData.code.split('\n').length}</span>
              </div>
            </div>
          </Card>

          {/* AI Analysis */}
          <Card className="p-4 space-y-4 border-accent/20 bg-accent/5">
            <h3 className="font-semibold">AI Analysis</h3>
            <p className="text-sm text-muted-foreground">
              This is a well-structured custom React hook with proper TypeScript typing. It implements the AbortController pattern for request cancellation and handles both success and error states effectively.
            </p>
            <Button variant="outline" size="sm" className="w-full">View Full Analysis</Button>
          </Card>

          {/* Related Pastes */}
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold">Related</h3>
            <div className="space-y-2">
              {['Custom React Hooks', 'TypeScript Patterns', 'Error Handling'].map(related => (
                <button
                  key={related}
                  className="w-full text-left p-2 text-sm hover:bg-card/50 rounded transition-colors text-accent"
                >
                  {related}
                </button>
              ))}
            </div>
          </Card>

          {/* Edit/Delete (if owner) */}
          <div className="space-y-2 pt-4 border-t border-border">
            <Button variant="outline" className="w-full gap-2">
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="outline" className="w-full gap-2 text-destructive">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
