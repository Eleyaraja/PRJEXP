'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import DashboardHeader from '@/components/dashboard/header'
import ExpenseList from '@/components/dashboard/expense-list'
import QuickStats from '@/components/dashboard/quick-stats'
import SpendingChart from '@/components/dashboard/spending-chart'
import RecentExpenses from '@/components/dashboard/recent-expenses'
import { Sparkles } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      setLoading(false)
    }
    checkAuth()
  }, [router, supabase])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const json = await res.json()
      if (json.error) {
        alert(`Seed failed: ${json.error}\n\nLog:\n${json.log?.join('\n') || 'none'}`)
        return
      }
      // Hard reload so all components re-fetch fresh data
      window.location.reload()
    } catch (err: any) {
      alert('Seed failed: ' + err.message)
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page title + seed button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeed}
              disabled={seeding}
              className="gap-2 border-border text-muted-foreground hover:text-foreground"
            >
              <Sparkles className="h-4 w-4" />
              {seeding ? 'Loading...' : 'Load Demo Data'}
            </Button>
          </div>

          {/* Quick Stats */}
          <QuickStats key={`stats-${refreshKey}`} userId={user.id} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SpendingChart key={`chart-${refreshKey}`} userId={user.id} />
            </div>
            <div>
              <RecentExpenses key={`recent-${refreshKey}`} userId={user.id} />
            </div>
          </div>

          {/* All Expenses */}
          <ExpenseList key={`list-${refreshKey}`} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
