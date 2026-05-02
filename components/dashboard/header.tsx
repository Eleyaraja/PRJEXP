'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Settings } from 'lucide-react'
import MobileNav from '@/components/layout/mobile-nav'

interface DashboardHeaderProps {
  user: any
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">$</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">ExpenseTrack</h1>
            <p className="text-sm text-muted-foreground">Smart Finance Management</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="/dashboard" className="text-foreground hover:text-primary transition">Dashboard</a>
          <a href="/expenses" className="text-muted-foreground hover:text-primary transition">Expenses</a>
          <a href="/budgets" className="text-muted-foreground hover:text-primary transition">Budgets</a>
          <a href="/analytics" className="text-muted-foreground hover:text-primary transition">Analytics</a>
        </nav>

        <div className="flex items-center gap-4">
          <MobileNav />
          <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
