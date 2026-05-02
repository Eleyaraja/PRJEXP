import { createClient } from '@/lib/supabase/server'

export async function getExpenses(userId: string, limit = 50) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      categories (name, color, icon),
      accounts (name, type)
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getCategories(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  if (error) throw error
  return data
}

export async function getAccounts(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })

  if (error) throw error
  return data
}

export async function getTotalExpenses(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', userId)

  if (error) throw error
  return data?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0
}

export async function getExpensesByCategory(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      amount,
      categories (name, color)
    `)
    .eq('user_id', userId)

  if (error) throw error
  
  const grouped: Record<string, { total: number; color: string }> = {}
  data?.forEach(exp => {
    const category = exp.categories?.name || 'Uncategorized'
    const color = exp.categories?.color || '#666'
    if (!grouped[category]) {
      grouped[category] = { total: 0, color }
    }
    grouped[category].total += parseFloat(exp.amount)
  })
  
  return grouped
}

export async function createExpense(
  userId: string,
  accountId: string,
  categoryId: string,
  amount: number,
  description: string,
  date: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: userId,
      account_id: accountId,
      category_id: categoryId,
      amount,
      description,
      date,
    })
    .select()

  if (error) throw error
  return data?.[0]
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) throw error
}
