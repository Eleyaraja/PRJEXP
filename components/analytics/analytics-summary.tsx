'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, AlertCircle } from 'lucide-react'

interface AnalyticsSummaryProps {
  userId: string
  timeRange: string
}

export default function AnalyticsSummary({ userId, timeRange }: AnalyticsSummaryProps) {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalSpent: 0,
    avgDaily: 0,
    highestCategory: '',
    highestAmount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const now = new Date()
        let startDate = new Date()

        if (timeRange === 'week') {
          startDate.setDate(now.getDate() - 7)
        } else if (timeRange === 'month') {
          startDate.setMonth(now.getMonth() - 1)
        } else if (timeRange === 'year') {
          startDate.setFullYear(now.getFullYear() - 1)
        }

        const { data: expenses } = await supabase
          .from('expenses')
          .select(`amount, categories (name)`)
          .eq('user_id', userId)
          .gte('date', startDate.toISOString().split('T')[0])

        const totalSpent = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0
        const days = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const avgDaily = totalSpent / days

        const categoryTotals: Record<string, number> = {}
        expenses?.forEach((exp) => {
          const cat = exp.categories?.name || 'Uncategorized'
          categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount)
        })

        const [highestCategory, highestAmount] = Object.entries(categoryTotals).sort(
          ([, a], [, b]) => b - a
        )[0] || ['N/A', 0]

        setStats({
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          avgDaily: parseFloat(avgDaily.toFixed(2)),
          highestCategory: highestCategory as string,
          highestAmount: parseFloat((highestAmount as number).toFixed(2)),
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId, timeRange, supabase])

  const summaryItems = [
    {
      label: 'Total Spent',
      value: `₹${stats.totalSpent}`,
      icon: DollarSign,
      color: 'text-red-400',
    },
    {
      label: 'Average Daily',
      value: `₹${stats.avgDaily}`,
      icon: TrendingUp,
      color: 'text-orange-400',
    },
    {
      label: 'Highest Category',
      value: stats.highestCategory,
      icon: AlertCircle,
      color: 'text-yellow-400',
    },
    {
      label: 'Category Total',
      value: `₹${stats.highestAmount}`,
      icon: DollarSign,
      color: 'text-cyan-400',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-card border border-border rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryItems.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              <Icon className={`h-4 w-4 ?{item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{item.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
