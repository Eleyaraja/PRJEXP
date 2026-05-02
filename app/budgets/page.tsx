'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import DashboardHeader from '@/components/dashboard/header'
import { Plus } from 'lucide-react'
import BudgetList from '@/components/budgets/budget-list'
import AddBudgetModal from '@/components/budgets/add-budget-modal'

export default function BudgetsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      setLoading(false)
    }

    checkAuth()
  }, [router, supabase])

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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
              <p className="text-muted-foreground mt-1">Set and manage your spending limits</p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Budget
            </Button>
          </div>

          {/* Budget List */}
          <BudgetList userId={user.id} isModalOpen={isModalOpen} refreshKey={refreshKey} />
        </div>
      </main>

      <AddBudgetModal
        userId={user.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { setRefreshKey(k => k + 1); setIsModalOpen(false) }}
      />
    </div>
  )
}
