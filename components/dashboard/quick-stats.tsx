'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, Wallet, PieChart, Target } from 'lucide-react'

interface QuickStatsProps {
  userId: string
}

export default function QuickStats({ userId }: QuickStatsProps) {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalBalance: 0,
    categories: 0,
    budgets: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [expensesRes, accountsRes, categoriesRes, budgetsRes] = await Promise.all([
          supabase.from('expenses').select('amount').eq('user_id', userId),
          supabase.from('accounts').select('balance').eq('user_id', userId),
          supabase.from('categories').select('id').eq('user_id', userId),
          supabase.from('budgets').select('id').eq('user_id', userId),
        ])

        const totalExpenses =
          expensesRes.data?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0
        const totalBalance =
          accountsRes.data?.reduce((sum, acc) => sum + parseFloat(acc.balance), 0) || 0

        setStats({
          totalExpenses,
          totalBalance,
          categories: categoriesRes.data?.length || 0,
          budgets: budgetsRes.data?.length || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId, supabase])

  const statItems = [
    {
      label: 'Total Expenses',
      value: `$${stats.totalExpenses.toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-red-400',
    },
    {
      label: 'Total Balance',
      value: `$${stats.totalBalance.toFixed(2)}`,
      icon: Wallet,
      color: 'text-green-400',
    },
    {
      label: 'Categories',
      value: stats.categories.toString(),
      icon: PieChart,
      color: 'text-blue-400',
    },
    {
      label: 'Budgets',
      value: stats.budgets.toString(),
      icon: Target,
      color: 'text-purple-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
