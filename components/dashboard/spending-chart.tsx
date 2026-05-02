'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface SpendingChartProps {
  userId: string
}

const COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#f97316', '#14b8a6', '#8b5cf6', '#22c55e']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const total = payload[0].payload.total
    const pct = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : '0'
    return (
      <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-xl">
        <p className="text-sm font-semibold text-foreground">{payload[0].name}</p>
        <p className="text-lg font-bold mt-1" style={{ color: payload[0].payload.fill }}>
          ?{payload[0].value.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">{pct}% of total</p>
      </div>
    )
  }
  return null
}

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`?{(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function SpendingChart({ userId }: SpendingChartProps) {
  const supabase = useRef(createClient()).current
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount, categories (name)')
          .eq('user_id', userId)

        const grouped: Record<string, number> = {}
        expenses?.forEach((exp) => {
          const category = exp.categories?.name || 'Uncategorized'
          grouped[category] = (grouped[category] || 0) + parseFloat(exp.amount)
        })

        const total = Object.values(grouped).reduce((s, v) => s + v, 0)
        const chartData = Object.entries(grouped)
          .map(([name, value], i) => ({
            name,
            value: parseFloat(value.toFixed(2)),
            fill: COLORS[i % COLORS.length],
            total,
          }))
          .sort((a, b) => b.value - a.value)

        setData(chartData)
      } catch (error) {
        console.error('Error fetching spending data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId])

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
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                outerRadius={110}
                innerRadius={40}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-?{index}`}
                    fill={entry.fill}
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground text-center">
              <p className="text-lg font-medium">No expenses yet</p>
              <p className="text-sm">Add your first expense to see the chart</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
