'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'

interface CategoryManagerProps {
  userId: string
}

export default function CategoryManager({ userId }: CategoryManagerProps) {
  const supabase = createClient()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense',
    color: '#3B82F6',
  })

  useEffect(() => {
    fetchCategories()
  }, [userId])

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', false)
        .order('name')

      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      alert('Please enter a category name')
      return
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: userId,
          ...newCategory,
        })
        .select()

      if (error) throw error

      setCategories([...categories, data[0]])
      setNewCategory({ name: '', type: 'expense', color: '#3B82F6' })
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate')) {
        alert('This category already exists')
      } else {
        console.error('Error adding category:', error)
        alert('Failed to add category')
      }
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await supabase.from('categories').delete().eq('id', id)
      setCategories(categories.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Add Custom Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name" className="text-foreground">
                Category Name
              </Label>
              <Input
                id="cat-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="e.g., Subscriptions"
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-type" className="text-foreground">
                Type
              </Label>
              <Select
                value={newCategory.type}
                onValueChange={(value) => setNewCategory({ ...newCategory, type: value })}
              >
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="text-foreground">
              Color
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="color"
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                className="bg-secondary border-border w-12 h-10"
              />
              <Input
                type="text"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                className="bg-secondary border-border text-foreground flex-1"
              />
            </div>
          </div>

          <Button
            onClick={handleAddCategory}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Custom Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div>
                      <p className="font-medium text-foreground">{category.name}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {category.type}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No custom categories yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
