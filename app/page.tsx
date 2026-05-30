'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Code2, Zap, Share2, Lock, Sparkles, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Code2,
    title: 'Syntax Highlighting',
    description: 'Support for 100+ programming languages with beautiful syntax highlighting'
  },
  {
    icon: Zap,
    title: 'Instant Sharing',
    description: 'Share your pastes with a unique link or keep them private with password protection'
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Your code is encrypted and can be set to auto-delete after viewing'
  },
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Get intelligent summaries and explanations of your code instantly'
  },
  {
    icon: Share2,
    title: 'Collections',
    description: 'Organize your pastes into collections for better workflow management'
  },
  {
    icon: Zap,
    title: 'Analytics',
    description: 'Track views, engagement, and usage statistics for your pastes'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Code2 className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-bold text-lg">FlowPaste</span>
          </div>
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Now with AI-powered insights</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              Share Code the <span className="text-accent">Smart Way</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              FlowPaste is the modern code sharing platform. Create, share, and collaborate on code snippets with syntax highlighting, privacy controls, and AI-powered analysis.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2">
                Start Sharing <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Preview Card */}
          <div className="mt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent rounded-2xl blur-3xl" />
            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <pre className="text-sm text-muted-foreground overflow-x-auto">
                  <code>{`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Share instantly, analyze with AI
const result = fibonacci(10);`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card border-t border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features to make code sharing effortless
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="bg-background border border-border rounded-xl p-6 space-y-3 hover:border-accent/50 transition-colors">
                  <Icon className="w-6 h-6 text-accent" />
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-card border border-accent/20 rounded-2xl p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent" />
          <div className="relative space-y-6">
            <h2 className="text-4xl font-bold">Ready to share smarter?</h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of developers who use FlowPaste to share and collaborate on code
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg">Create Your First Paste</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center">
                <Code2 className="w-3 h-3 text-accent-foreground" />
              </div>
              <span className="font-semibold">FlowPaste</span>
            </div>
            <p className="text-muted-foreground text-sm">© 2024 FlowPaste. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
