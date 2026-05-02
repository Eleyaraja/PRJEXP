'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import AddExpenseModal from './add-expense-modal'

interface ExpenseListProps {
  userId: string
}

export default function ExpenseList({ userId }: ExpenseListProps) {
  const supabase = createClient()
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchExpenses = async () => {
    try {
      const { data } = await supabase
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
        .order('date', { ascending: false })

      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [userId, supabase])

  const handleDeleteExpense = async (id: string) => {
    try {
      await supabase.from('expenses').delete().eq('id', id)
      setExpenses(expenses.filter(exp => exp.id !== id))
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const handleAddExpense = async () => {
    setIsModalOpen(false)
    fetchExpenses()
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Expenses</CardTitle>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
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
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Account</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Amount</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-border hover:bg-secondary transition">
                      <td className="py-3 px-4 text-foreground">{expense.description}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{expense.categories?.name}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{expense.accounts?.name}</td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{expense.date}</td>
                      <td className="py-3 px-4 text-right font-semibold text-red-400">
                        ${parseFloat(expense.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No expenses yet</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add Your First Expense
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddExpenseModal
        userId={userId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAddExpense}
      />
    </>
  )
}
