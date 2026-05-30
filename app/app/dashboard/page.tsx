'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Eye, Share2, FileText, Lock, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type PasteItem = {
  id: string
  title: string
  content: string
  language: string
  visibility: 'public' | 'private' | 'unlisted'
  hasPassword: boolean
  views: number
  shares: number
  createdAt: string
}

type Account = {
  id: string
  name: string
  email: string
  bio: string | null
}

type ActivityPoint = {
  date: string
  label: string
  pastesCreated: number
  viewsFromCreated: number
  sharesFromCreated: number
}

type AnalyticsPayload = {
  totals: {
    totalPastes: number
    totalViews: number
    totalShares: number
  }
  mostViewed: {
    id: string
    title: string
    views: number
    language: string
  } | null
  activity: ActivityPoint[]
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

export default function Dashboard() {
  const [account, setAccount] = useState<Account | null>(null)
  const [items, setItems] = useState<PasteItem[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        setIsLoading(true)
        setError('')

        const [accountResponse, pastesResponse, analyticsResponse] = await Promise.all([
          fetch('/api/account', { cache: 'no-store' }),
          fetch('/api/pastes', { cache: 'no-store' }),
          fetch('/api/analytics/overview?days=14', { cache: 'no-store' }),
        ])

        if (!accountResponse.ok) {
          const data = (await accountResponse.json().catch(() => null)) as { message?: string } | null
          throw new Error(data?.message ?? 'Failed to load account')
        }

        if (!pastesResponse.ok) {
          const data = (await pastesResponse.json().catch(() => null)) as { message?: string } | null
          throw new Error(data?.message ?? 'Failed to load pastes')
        }

        if (!analyticsResponse.ok) {
          const data = (await analyticsResponse.json().catch(() => null)) as { message?: string } | null
          throw new Error(data?.message ?? 'Failed to load analytics')
        }

        const accountData = (await accountResponse.json()) as { account: Account }
        const pasteData = (await pastesResponse.json()) as { pastes: PasteItem[] }
        const analyticsData = (await analyticsResponse.json()) as AnalyticsPayload

        if (!active) return
        setAccount(accountData.account)
        setItems(pasteData.pastes)
        setAnalytics(analyticsData)
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void run()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const totals = analytics?.totals

    return [
      { icon: FileText, label: 'Total Pastes', value: totals ? totals.totalPastes.toLocaleString('en-US') : '0' },
      { icon: Eye, label: 'Total Views', value: totals ? totals.totalViews.toLocaleString('en-US') : '0' },
      { icon: Share2, label: 'Total Shares', value: totals ? totals.totalShares.toLocaleString('en-US') : '0' },
      {
        icon: TrendingUp,
        label: 'Most Viewed',
        value: analytics?.mostViewed ? analytics.mostViewed.views.toLocaleString('en-US') : '0',
      },
    ]
  }, [analytics])

  const recentPastes = useMemo(() => {
    return [...items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
  }, [items])

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">
            Welcome back{account?.name ? `, ${account.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your pastes</p>
        </div>
        <Link href="/app/create">
          <Button size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            New Paste
          </Button>
        </Link>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <p className="text-2xl font-bold">{isLoading ? '...' : stat.value}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Activity Chart (Last 14 Days)</h2>
            <Link href="/app/analytics">
              <Button variant="outline" size="sm">Dashboard Analytics</Button>
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics?.activity ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="pastesCreated" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Most Viewed Paste</h2>
          {analytics?.mostViewed ? (
            <div className="space-y-3">
              <Link href={`/app/paste/${analytics.mostViewed.id}`}>
                <p className="font-semibold hover:text-accent transition-colors line-clamp-2">
                  {analytics.mostViewed.title}
                </p>
              </Link>
              <p className="text-sm text-muted-foreground">
                {analytics.mostViewed.language}
              </p>
              <p className="text-2xl font-bold">{analytics.mostViewed.views.toLocaleString('en-US')} views</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No view data yet.</p>
          )}
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Pastes</h2>
          <Link href="/app/pastes">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <Card className="p-8 text-sm text-muted-foreground">Loading pastes...</Card>
        ) : recentPastes.length === 0 ? (
          <Card className="p-8 text-sm text-muted-foreground">No pastes yet. Create your first paste.</Card>
        ) : (
          <div className="space-y-3">
            {recentPastes.map((paste) => (
              <Link key={paste.id} href={`/app/paste/${paste.id}`}>
                <Card className="p-4 hover:border-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-semibold truncate">{paste.title}</h3>
                        {paste.hasPassword ? <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : null}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="px-2 py-0.5 bg-card rounded text-xs">{paste.language}</span>
                        <span>{formatRelative(paste.createdAt)}</span>
                        {paste.visibility !== 'public' ? (
                          <span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs capitalize">
                            {paste.visibility}
                          </span>
                        ) : null}
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
        )}
      </div>
    </div>
  )
}
