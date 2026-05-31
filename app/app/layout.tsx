'use client'

import Link from 'next/link'
import { Code2, Home, Plus, FileText, Heart, Search, BarChart3, Settings, LogOut, Menu, X, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Kbd } from '@/components/ui/kbd'

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
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [commandResults, setCommandResults] = useState<Array<{ id: string; title: string; language: string }>>([])
  const [isSearchingPastes, setIsSearchingPastes] = useState(false)

  useEffect(() => {
    let active = true

    const loadMe = async () => {
      try {
        setAuthError('')

        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        if (response.status === 401) {
          router.replace('/auth/sign-in')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to load session')
        }

        const data = (await response.json()) as { user: { name: string; email: string } }
        if (active) {
          setUser(data.user)
        }
      } catch (error) {
        if (active) {
          setAuthError(error instanceof Error ? error.message : 'Failed to load session')
        }
      } finally {
        if (active) {
          setIsCheckingAuth(false)
        }
      }
    }

    void loadMe()

    return () => {
      active = false
    }
  }, [router])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ redirect: false })
    } finally {
      router.push('/auth/sign-in')
      router.refresh()
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (!commandOpen) {
      setCommandQuery('')
      setCommandResults([])
      return
    }

    let active = true
    const run = async () => {
      setIsSearchingPastes(true)
      try {
        const params = new URLSearchParams()
        if (commandQuery.trim()) {
          params.set('q', commandQuery.trim())
        }

        const response = await fetch(`/api/pastes?${params.toString()}`, { cache: 'no-store' })
        if (!response.ok) return

        const data = (await response.json()) as { pastes: Array<{ id: string; title: string; language: string }> }
        if (!active) return

        setCommandResults(data.pastes.slice(0, 8))
      } finally {
        if (active) {
          setIsSearchingPastes(false)
        }
      }
    }

    const timeout = setTimeout(run, 150)
    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [commandOpen, commandQuery])

  const navigateFromCommand = (href: string) => {
    setCommandOpen(false)
    router.push(href)
  }

  if (isCheckingAuth) {
    return <div className="h-screen grid place-items-center text-sm text-muted-foreground">Checking session...</div>
  }

  if (authError) {
    return (
      <div className="h-screen grid place-items-center p-6">
        <div className="text-center space-y-3">
          <p className="text-sm text-red-500">{authError}</p>
          <Button onClick={() => router.replace('/auth/sign-in')}>Go to Sign In</Button>
        </div>
      </div>
    )
  }

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
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
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
          <Link href="/app/settings" onClick={() => setSidebarOpen(false)}>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-card transition-colors text-left text-sm">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </Link>
          <button
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-card transition-colors text-left text-sm text-destructive disabled:opacity-60"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="w-4 h-4" />
            <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
          <p className="px-4 pt-2 text-xs text-muted-foreground">
            A product by <span className="font-medium text-foreground/70">raytech.cloud</span>
          </p>
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
          <div className="flex-1">
            <button
              type="button"
              className="w-full max-w-md rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground flex items-center justify-between hover:border-accent/50 transition-colors"
              onClick={() => setCommandOpen(true)}
            >
              <span className="inline-flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search pastes or jump to page...</span>
                <span className="sm:hidden">Search...</span>
              </span>
              <Kbd>Ctrl K</Kbd>
            </button>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name ?? 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
            </div>
            <div className="w-8 h-8 bg-accent/20 rounded-full" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput
          placeholder="Type a command or search pastes..."
          value={commandQuery}
          onValueChange={setCommandQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isSearchingPastes ? 'Searching...' : 'No matching results.'}
          </CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => navigateFromCommand('/app/dashboard')}>
              <Home className="w-4 h-4" />
              Dashboard
              <CommandShortcut>G D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => navigateFromCommand('/app/create')}>
              <Plus className="w-4 h-4" />
              New Paste
              <CommandShortcut>G N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => navigateFromCommand('/app/pastes')}>
              <FileText className="w-4 h-4" />
              My Pastes
              <CommandShortcut>G P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => navigateFromCommand('/app/collections')}>
              <FileText className="w-4 h-4" />
              Collections
              <CommandShortcut>G C</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => navigateFromCommand('/app/settings')}>
              <Settings className="w-4 h-4" />
              Settings
              <CommandShortcut>G S</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Pastes">
            {commandResults.map((item) => (
              <CommandItem key={item.id} onSelect={() => navigateFromCommand(`/app/paste/${item.id}`)}>
                <FileText className="w-4 h-4" />
                <span className="truncate">{item.title}</span>
                <CommandShortcut>{item.language}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
