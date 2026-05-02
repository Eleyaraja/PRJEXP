'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RecentExpensesProps {
  userId: string
}

export default function RecentExpenses({ userId }: RecentExpensesProps) {
  const supabase = createClient()
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await supabase
          .from('expenses')
          .select(`
            id,
            amount,
            description,
            date,
            categories (name, color)
          `)
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(5)

        setExpenses(data || [])
      } catch (error) {
        console.error('Error fetching recent expenses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [userId, supabase])

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        ) : expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{expense.description}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {expense.categories?.name}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-400">-?{parseFloat(expense.amount).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{expense.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No recent expenses</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
