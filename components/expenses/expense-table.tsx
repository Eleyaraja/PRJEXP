'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit2 } from 'lucide-react'

interface ExpenseTableProps {
  userId: string
  filters: {
    category: string
    account: string
    dateFrom: string
    dateTo: string
  }
  onExpenseAdded: () => void
  refreshKey?: number
}

export default function ExpenseTable({ userId, filters, onExpenseAdded, refreshKey }: ExpenseTableProps) {
  const supabase = createClient()
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('expenses')
        .select(`
          id,
          amount,
          description,
          date,
          categories (name, color),
          accounts (name)
        `)
        .eq('user_id', userId)

      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.account) {
        query = query.eq('account_id', filters.account)
      }

      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo)
      }

      const { data, error } = await query.order('date', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [userId, filters, supabase, refreshKey])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      await supabase.from('expenses').delete().eq('id', id)
      setExpenses(expenses.filter(exp => exp.id !== id))
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>All Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        ) : expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Account</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Amount</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-border hover:bg-secondary transition">
                    <td className="py-3 px-4 text-foreground text-sm">{expense.date}</td>
                    <td className="py-3 px-4 text-foreground font-medium">{expense.description}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-secondary border-border">
                        {expense.categories?.name}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">{expense.accounts?.name}</td>
                    <td className="py-3 px-4 text-right font-semibold text-red-400">
                      ₹{parseFloat(expense.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No expenses found matching your filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
