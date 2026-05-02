'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'

interface MonthlyComparisonProps {
  userId: string
}

// Gradient from cool blue → warm purple across 12 months
const MONTH_COLORS = [
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#7c3aed', '#8b5cf6', '#a855f7', '#c026d3',
  '#db2777', '#f43f5e', '#f97316', '#f59e0b',
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-xl">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-lg font-bold mt-1" style={{ color: payload[0].fill }}>
          ?{payload[0].value.toFixed(2)}
        </p>
      </div>
    )
  }
  return null
}

export default function MonthlyComparison({ userId }: MonthlyComparisonProps) {
  const supabase = useRef(createClient()).current
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount, date')
          .eq('user_id', userId)
          .gte('date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])

        const monthly: Record<string, number> = {}
        expenses?.forEach((exp) => {
          const monthKey = new Date(exp.date).toLocaleDateString('en-US', { month: 'short' })
          monthly[monthKey] = (monthly[monthKey] || 0) + parseFloat(exp.amount)
        })

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const chartData = months.map((month, i) => ({
          month,
          amount: parseFloat((monthly[month] || 0).toFixed(2)),
          color: MONTH_COLORS[i],
        }))

        setData(chartData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId])

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Monthly Comparison</CardTitle></CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxAmount = Math.max(...data.map(d => d.amount))

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Monthly Comparison</CardTitle>
          <span className="text-xs text-muted-foreground">{new Date().getFullYear()}</span>
        </div>
      </CardHeader>
      <CardContent>
        {data.some(d => d.amount > 0) ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 24, right: 10, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                tickFormatter={(v) => `??{v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-?{index}`}
                    fill={entry.color}
                    fillOpacity={entry.amount === 0 ? 0.15 : entry.amount === maxAmount ? 1 : 0.75}
                  />
                ))}
                <LabelList
                  dataKey="amount"
                  position="top"
                  formatter={(v: number) => v > 0 ? `??{v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}` : ''}
                  style={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }}
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
