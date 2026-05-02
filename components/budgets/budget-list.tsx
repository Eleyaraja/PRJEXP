'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Trash2 } from 'lucide-react'

interface BudgetListProps {
  userId: string
  isModalOpen: boolean
  refreshKey?: number
}

export default function BudgetList({ userId, isModalOpen, refreshKey }: BudgetListProps) {
  const supabase = useRef(createClient()).current
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      // Select category_id so we can query expenses by it
      const { data, error } = await supabase
        .from('budgets')
        .select(`id, category_id, limit_amount, period, alert_threshold, categories (name)`)
        .eq('user_id', userId)

      if (error) throw error

      if (data) {
        const withSpending = await Promise.all(
          data.map(async (budget) => {
            const { data: expenses } = await supabase
              .from('expenses')
              .select('amount')
              .eq('user_id', userId)
              .eq('category_id', budget.category_id)

            const spent = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0
            const percentage = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0

            return {
              ...budget,
              spent: parseFloat(spent.toFixed(2)),
              percentage: Math.min(percentage, 100),
            }
          })
        )
        setBudgets(withSpending)
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Re-fetch whenever refreshKey changes or modal closes (isModalOpen goes false)
  useEffect(() => {
    fetchBudgets()
  }, [userId, refreshKey, isModalOpen])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return
    try {
      await supabase.from('budgets').delete().eq('id', id)
      setBudgets(budgets.filter(b => b.id !== id))
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-card border border-border rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {budgets.length > 0 ? (
        budgets.map((budget) => {
          const isWarning = budget.percentage >= budget.alert_threshold
          const isExceeded = budget.percentage >= 100

          return (
            <Card
              key={budget.id}
              className={`bg-card border ${
                isExceeded ? 'border-red-500/50' : isWarning ? 'border-yellow-500/50' : 'border-border'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{budget.categories?.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(budget.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${budget.spent.toFixed(2)} / ${parseFloat(budget.limit_amount).toFixed(2)}
                  </span>
                  <span className={`font-semibold ${
                    isExceeded ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {budget.percentage.toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={budget.percentage}
                  className={`h-2 ${
                    isExceeded ? 'bg-red-900/30' : isWarning ? 'bg-yellow-900/30' : 'bg-green-900/30'
                  }`}
                />
              </CardContent>
            </Card>
          )
        })
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No budgets yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create a budget to set spending limits for categories
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
