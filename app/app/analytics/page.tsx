'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Eye, Share2, FileText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type ActivityPoint = {
  date: string
  label: string
  pastesCreated: number
  viewsFromCreated: number
  sharesFromCreated: number
}

type TopPaste = {
  id: string
  title: string
  views: number
  shares: number
  language: string
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
  topPastes: TopPaste[]
  range: {
    days: number
    from: string
    to: string
  }
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await fetch(`/api/analytics/overview?days=${days}`, { cache: 'no-store' })
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { message?: string } | null
          throw new Error(payload?.message ?? 'Failed to load analytics')
        }

        const payload = (await response.json()) as AnalyticsPayload
        if (!active) return
        setData(payload)
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load analytics')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [days])

  const stats = useMemo(() => {
    const totals = data?.totals
    return [
      {
        icon: FileText,
        label: 'Total Pastes',
        value: totals ? totals.totalPastes.toLocaleString('en-US') : '0',
      },
      {
        icon: Eye,
        label: 'Total Views',
        value: totals ? totals.totalViews.toLocaleString('en-US') : '0',
      },
      {
        icon: Share2,
        label: 'Total Shares',
        value: totals ? totals.totalShares.toLocaleString('en-US') : '0',
      },
      {
        icon: TrendingUp,
        label: 'Most Viewed',
        value: data?.mostViewed ? data.mostViewed.views.toLocaleString('en-US') : '0',
      },
    ]
  }, [data])

  const chartData = data?.activity ?? []
  const maxViews = Math.max(...(data?.topPastes.map((item) => item.views) ?? [1]), 1)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Dashboard Analytics</h1>
          <p className="text-muted-foreground">Track total views, total pastes, most viewed paste, and activity trends.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Range</span>
          <select
            value={String(days)}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 bg-card border border-border rounded-md text-sm"
          >
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
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

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Activity Chart: Pastes Created</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
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
          <h3 className="font-semibold">Activity Chart: Views & Shares (by created date)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
              <Line type="monotone" dataKey="viewsFromCreated" stroke="var(--accent)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sharesFromCreated" stroke="var(--muted-foreground)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 lg:col-span-1">
          <h3 className="font-semibold">Most Viewed Paste</h3>
          {data?.mostViewed ? (
            <div className="space-y-3">
              <Link href={`/app/paste/${data.mostViewed.id}`}>
                <p className="font-semibold hover:text-accent transition-colors line-clamp-2">
                  {data.mostViewed.title}
                </p>
              </Link>
              <p className="text-sm text-muted-foreground">{data.mostViewed.language}</p>
              <p className="text-2xl font-bold">{data.mostViewed.views.toLocaleString('en-US')} views</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No views yet.</p>
          )}
        </Card>

        <Card className="p-6 space-y-4 lg:col-span-2">
          <h3 className="font-semibold">Top Performing Pastes</h3>
          <div className="space-y-3">
            {(data?.topPastes ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No pastes yet.</p>
            ) : (
              data?.topPastes.map((paste) => (
                <div key={paste.id} className="p-3 bg-card/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <Link href={`/app/paste/${paste.id}`} className="font-medium hover:text-accent transition-colors truncate">
                      {paste.title}
                    </Link>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{paste.language}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{paste.views} views • {paste.shares} shares</p>
                  <div className="h-2 w-full bg-card rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${(paste.views / maxViews) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
          <Link href="/app/pastes">
            <Button variant="outline" size="sm">View All Pastes</Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
