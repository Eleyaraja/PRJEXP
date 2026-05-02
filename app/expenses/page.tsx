'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardHeader from '@/components/dashboard/header'
import { Plus, Download, Filter } from 'lucide-react'
import ExpenseTable from '@/components/expenses/expense-table'
import ExpenseFilters from '@/components/expenses/expense-filters'
import AddExpenseModal from '@/components/dashboard/add-expense-modal'

export default function ExpensesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [filters, setFilters] = useState({
    category: '',
    account: '',
    dateFrom: '',
    dateTo: '',
  })

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

  const handleExport = async () => {
    try {
      const supabaseClient = createClient()
      let query = supabaseClient
        .from('expenses')
        .select(`id, amount, description, date, categories (name), accounts (name)`)
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (filters.category) query = query.eq('category_id', filters.category)
      if (filters.account) query = query.eq('account_id', filters.account)
      if (filters.dateFrom) query = query.gte('date', filters.dateFrom)
      if (filters.dateTo) query = query.lte('date', filters.dateTo)

      const { data } = await query
      if (!data?.length) { alert('No expenses to export'); return }

      const rows = [
        ['Date', 'Description', 'Category', 'Account', 'Amount'],
        ...data.map((e: any) => [
          e.date,
          e.description,
          e.categories?.name || '',
          e.accounts?.name || '',
          parseFloat(e.amount).toFixed(2),
        ]),
      ]
      const csv = rows.map(r => r.map((v: any) => `"${v}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Export failed')
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
              <p className="text-muted-foreground mt-1">Manage and track all your expenses</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExport} className="gap-2 border-border">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </div>

          {/* Filters */}
          <ExpenseFilters filters={filters} onFilterChange={setFilters} userId={user.id} />

          {/* Expenses Table */}
          <ExpenseTable userId={user.id} filters={filters} onExpenseAdded={() => setRefreshKey(k => k + 1)} refreshKey={refreshKey} />
        </div>
      </main>

      <AddExpenseModal
        userId={user.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { setRefreshKey(k => k + 1); setIsModalOpen(false) }}
      />
    </div>
  )
}
