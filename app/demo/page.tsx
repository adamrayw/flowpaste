'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Code2, Copy, Eye, Heart, Share2, Lock } from 'lucide-react'

export default function Demo() {
  const demoCode = `// Example: Fibonacci Function
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(result); // 55`

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Code2 className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-bold text-lg">FlowPaste</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">View Demo Paste</h1>
            <p className="text-muted-foreground">See how FlowPaste makes code sharing beautiful</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Code Editor */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold">Fibonacci Function</h2>
                    <p className="text-sm text-muted-foreground">A classic recursive example</p>
                  </div>
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                    javascript
                  </span>
                </div>
              </div>

              {/* Code Display */}
              <Card className="border-0 bg-card/50 overflow-hidden">
                <div className="bg-card/50 text-xs text-muted-foreground border-b border-border flex">
                  <div className="px-4 py-3 bg-card/50 border-r border-border w-12 text-right select-none">
                    {demoCode.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <pre className="flex-1 p-4 overflow-x-auto">
                    <code className="font-mono text-sm text-foreground">{demoCode}</code>
                  </pre>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <Button className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Code
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button variant="outline" className="gap-2">
                  <Heart className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              {/* Details */}
              <Card className="p-4 space-y-4">
                <h3 className="font-semibold">Paste Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Author</span>
                    <span className="font-medium">Demo User</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">Today</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Views</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shares</span>
                    <span className="font-medium">56</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-medium">JavaScript</span>
                  </div>
                </div>
              </Card>

              {/* Security */}
              <Card className="p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-accent" />
                  Visibility
                </h3>
                <div className="inline-block px-3 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                  Public
                </div>
              </Card>

              {/* AI Analysis */}
              <Card className="p-4 space-y-4 border-accent/20 bg-accent/5">
                <h3 className="font-semibold">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  A recursive function that calculates Fibonacci numbers. The function calls itself twice per iteration, creating an exponential time complexity.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Full Analysis
                </Button>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-card border border-accent/20 rounded-2xl p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to share your code?</h2>
            <p className="text-muted-foreground">Create your account and start building today</p>
            <Link href="/auth/sign-up">
              <Button size="lg">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
