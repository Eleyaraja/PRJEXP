'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'

interface ExpenseFiltersProps {
  filters: {
    category: string
    account: string
    dateFrom: string
    dateTo: string
  }
  onFilterChange: (filters: any) => void
  userId: string
}

export default function ExpenseFilters({ filters, onFilterChange, userId }: ExpenseFiltersProps) {
  const supabase = createClient()
  const [categories, setCategories] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])

  useEffect(() => {
    const fetchOptions = async () => {
      const [categoriesRes, accountsRes] = await Promise.all([
        supabase.from('categories').select('id, name').eq('user_id', userId).order('name'),
        supabase.from('accounts').select('id, name').eq('user_id', userId).order('name'),
      ])

      setCategories(categoriesRes.data || [])
      setAccounts(accountsRes.data || [])
    }

    fetchOptions()
  }, [userId, supabase])

  const handleReset = () => {
    onFilterChange({
      category: '',
      account: '',
      dateFrom: '',
      dateTo: '',
    })
  }

  const hasActiveFilters = Object.values(filters).some(f => f)

  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) =>
                onFilterChange({ ...filters, category: value === "all" ? "" : value })
              }
            >
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Account</label>
            <Select
              value={filters.account || "all"}
              onValueChange={(value) =>
                onFilterChange({ ...filters, account: value === "all" ? "" : value })
              }
            >
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="All accounts" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">From</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                onFilterChange({ ...filters, dateFrom: e.target.value })
              }
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">To</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                onFilterChange({ ...filters, dateTo: e.target.value })
              }
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full border-border gap-2"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
