'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

interface TrendingChartProps {
  userId: string
  timeRange: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-muted-foreground">{p.name}:</span>
            <span className="text-sm font-bold" style={{ color: p.color }}>${p.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function TrendingChart({ userId, timeRange }: TrendingChartProps) {
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
          .select('amount, date')
          .eq('user_id', userId)
          .gte('date', startDate.toISOString().split('T')[0])
          .order('date', { ascending: true })

        const daily: Record<string, number> = {}
        expenses?.forEach((exp) => {
          daily[exp.date] = (daily[exp.date] || 0) + parseFloat(exp.amount)
        })

        let runningTotal = 0
        const chartData = Object.entries(daily)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, amount]) => {
            runningTotal += amount
            return {
              date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              'Daily Spending': parseFloat(amount.toFixed(2)),
              'Cumulative': parseFloat(runningTotal.toFixed(2)),
            }
          })

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
        <CardHeader><CardTitle>Spending Trend</CardTitle></CardHeader>
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
        <CardTitle>Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="gradDaily" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="Daily Spending"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#gradDaily)"
                dot={false}
                activeDot={{ r: 4, fill: '#ef4444' }}
              />
              <Area
                type="monotone"
                dataKey="Cumulative"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fill="url(#gradCumulative)"
                dot={false}
                activeDot={{ r: 4, fill: '#06b6d4' }}
              />
            </AreaChart>
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
