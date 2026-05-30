'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, TrendingUp, Eye, Share2, Zap } from 'lucide-react'

const recentPastes = [
  {
    id: 1,
    title: 'React Component Hook',
    language: 'typescript',
    views: 234,
    shares: 12,
    created: '2 hours ago',
    isPublic: true
  },
  {
    id: 2,
    title: 'Database Query',
    language: 'sql',
    views: 89,
    shares: 5,
    created: '1 day ago',
    isPublic: false
  },
  {
    id: 3,
    title: 'API Response Handler',
    language: 'javascript',
    views: 456,
    shares: 23,
    created: '3 days ago',
    isPublic: true
  },
  {
    id: 4,
    title: 'CSS Grid Layout',
    language: 'css',
    views: 567,
    shares: 34,
    created: '1 week ago',
    isPublic: true
  }
]

const stats = [
  {
    icon: FileText,
    label: 'Total Pastes',
    value: '42',
    trend: '+5 this week'
  },
  {
    icon: Eye,
    label: 'Total Views',
    value: '2,451',
    trend: '+234 this week'
  },
  {
    icon: Share2,
    label: 'Total Shares',
    value: '128',
    trend: '+12 this week'
  },
  {
    icon: Zap,
    label: 'AI Analyses',
    value: '87',
    trend: '+8 this week'
  }
]

import { FileText } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Welcome back, John</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your pastes</p>
        </div>
        <Link href="/app/create">
          <Button size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            New Paste
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-accent">{stat.trend}</p>
            </Card>
          )
        })}
      </div>

      {/* Recent Pastes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Pastes</h2>
          <Link href="/app/pastes">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {recentPastes.map((paste) => (
            <Link key={paste.id} href={`/app/paste/${paste.id}`}>
              <Card className="p-4 hover:border-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{paste.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="px-2 py-0.5 bg-card rounded text-xs">
                        {paste.language}
                      </span>
                      <span>{paste.created}</span>
                      {!paste.isPublic && (
                        <span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{paste.views}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      <span>{paste.shares}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-6 space-y-4 border-accent/20 bg-accent/5">
          <div className="space-y-1">
            <h3 className="font-semibold">AI Code Analysis</h3>
            <p className="text-sm text-muted-foreground">Get intelligent summaries of your code</p>
          </div>
          <Button variant="outline" size="sm">Learn More</Button>
        </Card>
        <Card className="p-6 space-y-4 border-accent/20 bg-accent/5">
          <div className="space-y-1">
            <h3 className="font-semibold">Create Collection</h3>
            <p className="text-sm text-muted-foreground">Organize your pastes into groups</p>
          </div>
          <Button variant="outline" size="sm">Create</Button>
        </Card>
      </div>
    </div>
  )
}
