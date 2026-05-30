'use client'

import { Card } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Eye, Share2, Heart } from 'lucide-react'

const viewsData = [
  { date: 'Mon', views: 120, shares: 30 },
  { date: 'Tue', views: 200, shares: 45 },
  { date: 'Wed', views: 150, shares: 35 },
  { date: 'Thu', views: 280, shares: 60 },
  { date: 'Fri', views: 220, shares: 50 },
  { date: 'Sat', views: 310, shares: 75 },
  { date: 'Sun', views: 280, shares: 65 },
]

const languageData = [
  { name: 'JavaScript', value: 35, color: '#571 0.201 290.5' },
  { name: 'TypeScript', value: 25, color: '#571 0.201 290.5' },
  { name: 'Python', value: 20, color: '#571 0.201 290.5' },
  { name: 'SQL', value: 12, color: '#571 0.201 290.5' },
  { name: 'Other', value: 8, color: '#571 0.201 290.5' },
]

const stats = [
  {
    icon: Eye,
    label: 'Total Views',
    value: '2,451',
    change: '+12%'
  },
  {
    icon: Share2,
    label: 'Total Shares',
    value: '128',
    change: '+8%'
  },
  {
    icon: Heart,
    label: 'Total Favorites',
    value: '342',
    change: '+22%'
  },
  {
    icon: TrendingUp,
    label: 'Avg. Views/Paste',
    value: '58.4',
    change: '+5%'
  },
]

export default function Analytics() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your paste performance and engagement</p>
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
              <p className="text-xs text-accent">{stat.change} vs last week</p>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Views & Shares Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="var(--accent)" 
                strokeWidth={2}
                dot={{ fill: 'var(--accent)' }}
              />
              <Line 
                type="monotone" 
                dataKey="shares" 
                stroke="var(--muted-foreground)" 
                strokeWidth={2}
                dot={{ fill: 'var(--muted-foreground)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Bar Chart */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Daily Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="views" fill="var(--accent)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Language Distribution */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Language Distribution</h3>
        <div className="grid sm:grid-cols-2 gap-8">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={languageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="var(--accent)"
                dataKey="value"
              >
                {languageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="var(--accent)" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {languageData.map((lang) => (
              <div key={lang.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent rounded-full" />
                  <span className="text-sm">{lang.name}</span>
                </div>
                <span className="font-semibold">{lang.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Top Performing Pastes */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Top Performing Pastes</h3>
        <div className="space-y-3">
          {[
            { title: 'React Component Hook', views: 1234, shares: 89 },
            { title: 'API Response Handler', views: 867, shares: 56 },
            { title: 'Database Query Optimization', views: 734, shares: 45 },
          ].map((paste) => (
            <div key={paste.title} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium">{paste.title}</p>
                <p className="text-xs text-muted-foreground">{paste.views} views • {paste.shares} shares</p>
              </div>
              <div className="h-2 w-24 bg-card rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full" 
                  style={{ width: `${(paste.views / 1234) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
