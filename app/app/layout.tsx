'use client'

import Link from 'next/link'
import { Code2, Home, Plus, FileText, Heart, Search, BarChart3, Settings, LogOut, Menu, X, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/app/dashboard' },
  { icon: Plus, label: 'New Paste', href: '/app/create' },
  { icon: FileText, label: 'My Pastes', href: '/app/pastes' },
  { icon: Heart, label: 'Favorites', href: '/app/favorites' },
  { icon: Search, label: 'Search', href: '/app/search' },
  { icon: FileText, label: 'Collections', href: '/app/collections' },
  { icon: BarChart3, label: 'Analytics', href: '/app/analytics' },
  { icon: Sparkles, label: 'AI Tools', href: '/app/ai-tools' },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative w-64 h-full border-r border-border bg-background
        transition-transform duration-300 z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Code2 className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-bold">FlowPaste</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-card transition-colors text-left text-sm">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Link href="/app/settings">
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-card transition-colors text-left text-sm">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-card transition-colors text-left text-sm text-destructive">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-border h-16 flex items-center px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john@example.com</p>
            </div>
            <div className="w-8 h-8 bg-accent/20 rounded-full" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
