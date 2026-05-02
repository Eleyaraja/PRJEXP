'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'

interface CategoryBreakdownProps {
  userId: string
  timeRange: string
}

const COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#f97316', '#14b8a6', '#8b5cf6', '#22c55e']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-xl">
        <p className="text-sm font-semibold text-foreground">{payload[0].payload.name}</p>
        <p className="text-lg font-bold mt-1" style={{ color: payload[0].fill }}>
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    )
  }
  return null
}

export default function CategoryBreakdown({ userId, timeRange }: CategoryBreakdownProps) {
  const supabase = useRef(createClient()).current
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const now = new Date()
        const startDate = new Date()
        if (timeRange === 'week') startDate.setDate(now.getDate() - 7)
        else if (timeRange === 'month') startDate.setMonth(now.getMonth() - 1)
        else if (timeRange === 'year') startDate.setFullYear(now.getFullYear() - 1)

        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount, categories (name)')
          .eq('user_id', userId)
          .gte('date', startDate.toISOString().split('T')[0])

        const grouped: Record<string, number> = {}
        expenses?.forEach((exp) => {
          const category = exp.categories?.name || 'Uncategorized'
          grouped[category] = (grouped[category] || 0) + parseFloat(exp.amount)
        })

        const chartData = Object.entries(grouped)
          .map(([name, value], i) => ({ name, amount: parseFloat(value.toFixed(2)), color: COLORS[i % COLORS.length] }))
          .sort((a, b) => b.amount - a.amount)

        setData(chartData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId, timeRange])

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Spending by Category</CardTitle></CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={52}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="amount"
                  position="top"
                  formatter={(v: number) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                  style={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground text-center">No data available</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
