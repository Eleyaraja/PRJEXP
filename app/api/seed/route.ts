import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  return POST()
}

export async function POST() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated', detail: authError?.message }, { status: 401 })
  }

  const userId = user.id
  const log: string[] = []

  try {
    // ── 1. Profile ───────────────────────────────────────────────────────────
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: userId, first_name: 'Alex', last_name: 'Morgan', currency: 'USD',
    })
    log.push(profileErr ? `profile ERROR: ${profileErr.message}` : 'profile: ok')

    // ── 2. Accounts — upsert all 4 by name ──────────────────────────────────
    const accountDefs = [
      { name: 'Chase Checking', type: 'bank',           currency: 'USD', balance: 4250.00, is_default: true  },
      { name: 'Visa Credit',    type: 'credit_card',    currency: 'USD', balance: 1800.00, is_default: false },
      { name: 'Cash Wallet',    type: 'cash',           currency: 'USD', balance: 320.00,  is_default: false },
      { name: 'PayPal',         type: 'digital_wallet', currency: 'USD', balance: 540.00,  is_default: false },
    ]

    // Fetch existing accounts
    const { data: existingAccounts } = await supabase
      .from('accounts').select('id, name').eq('user_id', userId)
    const existingAccountNames = new Set(existingAccounts?.map(a => a.name) || [])

    const accountIds: Record<string, string> = {}
    existingAccounts?.forEach(a => { accountIds[a.name] = a.id })

    // Insert only missing accounts
    const missingAccounts = accountDefs.filter(a => !existingAccountNames.has(a.name))
    if (missingAccounts.length) {
      const { data: newAccounts, error: accErr } = await supabase
        .from('accounts')
        .insert(missingAccounts.map(a => ({ ...a, user_id: userId })))
        .select()
      if (accErr) log.push(`accounts ERROR: ${accErr.message}`)
      else {
        newAccounts?.forEach(a => { accountIds[a.name] = a.id })
        log.push(`accounts: inserted ${newAccounts?.length} new`)
      }
    } else {
      log.push(`accounts: all ${existingAccounts?.length} exist`)
    }

    // ── 3. Categories — upsert all 10 by name ───────────────────────────────
    const categoryDefs = [
      { name: 'Food & Dining',    type: 'expense', color: '#ef4444', is_default: true  },
      { name: 'Transportation',   type: 'expense', color: '#f59e0b', is_default: true  },
      { name: 'Shopping',         type: 'expense', color: '#8b5cf6', is_default: true  },
      { name: 'Entertainment',    type: 'expense', color: '#06b6d4', is_default: true  },
      { name: 'Health & Fitness', type: 'expense', color: '#10b981', is_default: true  },
      { name: 'Utilities',        type: 'expense', color: '#3b82f6', is_default: true  },
      { name: 'Rent',             type: 'expense', color: '#ec4899', is_default: true  },
      { name: 'Subscriptions',    type: 'expense', color: '#f97316', is_default: false },
      { name: 'Travel',           type: 'expense', color: '#14b8a6', is_default: false },
      { name: 'Salary',           type: 'income',  color: '#22c55e', is_default: true  },
    ]

    const { data: existingCats } = await supabase
      .from('categories').select('id, name').eq('user_id', userId)
    const existingCatNames = new Set(existingCats?.map(c => c.name) || [])

    const catIds: Record<string, string> = {}
    existingCats?.forEach(c => { catIds[c.name] = c.id })

    const missingCats = categoryDefs.filter(c => !existingCatNames.has(c.name))
    if (missingCats.length) {
      const { data: newCats, error: catErr } = await supabase
        .from('categories')
        .insert(missingCats.map(c => ({ ...c, user_id: userId })))
        .select()
      if (catErr) log.push(`categories ERROR: ${catErr.message}`)
      else {
        newCats?.forEach(c => { catIds[c.name] = c.id })
        log.push(`categories: inserted ${newCats?.length} new`)
      }
    } else {
      log.push(`categories: all ${existingCats?.length} exist`)
    }

    // ── 4. Expenses — wipe and re-seed ──────────────────────────────────────
    const { error: delExpErr } = await supabase
      .from('expenses').delete().eq('user_id', userId)
    if (delExpErr) log.push(`expenses-delete ERROR: ${delExpErr.message}`)

    const today = new Date()
    const d = (daysAgo: number) => {
      const dt = new Date(today)
      dt.setDate(dt.getDate() - daysAgo)
      return dt.toISOString().split('T')[0]
    }

    const checking = accountIds['Chase Checking']
    const visa     = accountIds['Visa Credit']
    const cash     = accountIds['Cash Wallet']
    const paypal   = accountIds['PayPal']
    const food     = catIds['Food & Dining']
    const trans    = catIds['Transportation']
    const shop     = catIds['Shopping']
    const ent      = catIds['Entertainment']
    const health   = catIds['Health & Fitness']
    const util     = catIds['Utilities']
    const rent     = catIds['Rent']
    const subs     = catIds['Subscriptions']
    const travel   = catIds['Travel']

    log.push(`account IDs: checking=${checking}, visa=${visa}, cash=${cash}, paypal=${paypal}`)
    log.push(`cat IDs: food=${food}, rent=${rent}, subs=${subs}`)

    const expenses = [
      // This month
      { description: 'Monthly Rent',         amount: 1500.00, category_id: rent,   account_id: checking, date: d(2)  },
      { description: 'Electricity Bill',      amount: 87.50,   category_id: util,   account_id: checking, date: d(3)  },
      { description: 'Internet Bill',         amount: 59.99,   category_id: util,   account_id: checking, date: d(3)  },
      { description: 'Grocery Store',         amount: 124.30,  category_id: food,   account_id: checking, date: d(4)  },
      { description: 'Netflix',               amount: 15.99,   category_id: subs,   account_id: visa,     date: d(5)  },
      { description: 'Spotify Premium',       amount: 9.99,    category_id: subs,   account_id: visa,     date: d(5)  },
      { description: 'Gym Membership',        amount: 45.00,   category_id: health, account_id: checking, date: d(6)  },
      { description: 'Uber Ride',             amount: 18.50,   category_id: trans,  account_id: visa,     date: d(7)  },
      { description: 'Restaurant Dinner',     amount: 67.80,   category_id: food,   account_id: visa,     date: d(8)  },
      { description: 'Amazon Purchase',       amount: 89.99,   category_id: shop,   account_id: visa,     date: d(9)  },
      { description: 'Coffee Shop',           amount: 12.50,   category_id: food,   account_id: cash,     date: d(10) },
      { description: 'Movie Tickets',         amount: 32.00,   category_id: ent,    account_id: visa,     date: d(11) },
      { description: 'Gas Station',           amount: 55.00,   category_id: trans,  account_id: checking, date: d(12) },
      { description: 'Pharmacy',              amount: 28.75,   category_id: health, account_id: cash,     date: d(13) },
      { description: 'Lunch with Colleagues', amount: 42.00,   category_id: food,   account_id: visa,     date: d(14) },
      { description: 'Apple iCloud',          amount: 2.99,    category_id: subs,   account_id: visa,     date: d(15) },
      { description: 'Bus Pass',              amount: 30.00,   category_id: trans,  account_id: cash,     date: d(16) },
      { description: 'Clothing Store',        amount: 145.00,  category_id: shop,   account_id: visa,     date: d(17) },
      { description: 'Concert Tickets',       amount: 95.00,   category_id: ent,    account_id: paypal,   date: d(18) },
      { description: 'Sushi Restaurant',      amount: 78.40,   category_id: food,   account_id: visa,     date: d(19) },
      // Last month
      { description: 'Monthly Rent',          amount: 1500.00, category_id: rent,   account_id: checking, date: d(32) },
      { description: 'Electricity Bill',      amount: 92.00,   category_id: util,   account_id: checking, date: d(33) },
      { description: 'Grocery Store',         amount: 138.60,  category_id: food,   account_id: checking, date: d(34) },
      { description: 'Netflix',               amount: 15.99,   category_id: subs,   account_id: visa,     date: d(35) },
      { description: 'Gym Membership',        amount: 45.00,   category_id: health, account_id: checking, date: d(36) },
      { description: 'Uber Eats',             amount: 34.50,   category_id: food,   account_id: visa,     date: d(37) },
      { description: 'Weekend Trip Hotel',    amount: 220.00,  category_id: travel, account_id: visa,     date: d(38) },
      { description: 'Flight Tickets',        amount: 310.00,  category_id: travel, account_id: visa,     date: d(39) },
      { description: 'Bookstore',             amount: 52.00,   category_id: shop,   account_id: cash,     date: d(40) },
      { description: 'Dentist Visit',         amount: 150.00,  category_id: health, account_id: checking, date: d(41) },
      { description: 'Gas Station',           amount: 60.00,   category_id: trans,  account_id: checking, date: d(42) },
      { description: 'Streaming Bundle',      amount: 19.99,   category_id: subs,   account_id: visa,     date: d(43) },
      { description: 'Birthday Dinner',       amount: 110.00,  category_id: food,   account_id: visa,     date: d(44) },
      { description: 'Parking Fee',           amount: 25.00,   category_id: trans,  account_id: cash,     date: d(45) },
      // 2 months ago
      { description: 'Monthly Rent',          amount: 1500.00, category_id: rent,   account_id: checking, date: d(62) },
      { description: 'Grocery Store',         amount: 115.20,  category_id: food,   account_id: checking, date: d(63) },
      { description: 'Electricity Bill',      amount: 78.00,   category_id: util,   account_id: checking, date: d(64) },
      { description: 'Gym Membership',        amount: 45.00,   category_id: health, account_id: checking, date: d(65) },
      { description: 'Netflix',               amount: 15.99,   category_id: subs,   account_id: visa,     date: d(66) },
      { description: 'New Shoes',             amount: 89.00,   category_id: shop,   account_id: visa,     date: d(67) },
      { description: 'Taxi',                  amount: 22.00,   category_id: trans,  account_id: cash,     date: d(68) },
      { description: 'Coffee Shop',           amount: 8.50,    category_id: food,   account_id: cash,     date: d(69) },
      { description: 'Video Game',            amount: 59.99,   category_id: ent,    account_id: paypal,   date: d(70) },
      { description: 'Internet Bill',         amount: 59.99,   category_id: util,   account_id: checking, date: d(71) },
      // 3 months ago
      { description: 'Monthly Rent',          amount: 1500.00, category_id: rent,   account_id: checking, date: d(92) },
      { description: 'Grocery Store',         amount: 130.00,  category_id: food,   account_id: checking, date: d(93) },
      { description: 'Electricity Bill',      amount: 95.00,   category_id: util,   account_id: checking, date: d(94) },
      { description: 'Gym Membership',        amount: 45.00,   category_id: health, account_id: checking, date: d(95) },
      { description: 'Spotify Premium',       amount: 9.99,    category_id: subs,   account_id: visa,     date: d(96) },
      { description: 'Restaurant',            amount: 55.00,   category_id: food,   account_id: visa,     date: d(97) },
      { description: 'Gas Station',           amount: 50.00,   category_id: trans,  account_id: checking, date: d(98) },
      { description: 'Online Course',         amount: 29.99,   category_id: ent,    account_id: paypal,   date: d(99) },
    ].filter(e => e.category_id && e.account_id)

    const { error: expInsertErr } = await supabase.from('expenses').insert(
      expenses.map(e => ({ ...e, user_id: userId }))
    )
    if (expInsertErr) log.push(`expenses ERROR: ${expInsertErr.message}`)
    else log.push(`expenses: inserted ${expenses.length}`)

    // ── 5. Budgets — wipe and re-seed ───────────────────────────────────────
    const { error: delBudErr } = await supabase
      .from('budgets').delete().eq('user_id', userId)
    if (delBudErr) log.push(`budgets-delete ERROR: ${delBudErr.message}`)

    const budgets = [
      { category_id: catIds['Food & Dining'],    limit_amount: 400, period: 'monthly', alert_threshold: 80 },
      { category_id: catIds['Transportation'],   limit_amount: 200, period: 'monthly', alert_threshold: 80 },
      { category_id: catIds['Shopping'],         limit_amount: 300, period: 'monthly', alert_threshold: 75 },
      { category_id: catIds['Entertainment'],    limit_amount: 150, period: 'monthly', alert_threshold: 80 },
      { category_id: catIds['Subscriptions'],    limit_amount: 50,  period: 'monthly', alert_threshold: 90 },
      { category_id: catIds['Health & Fitness'], limit_amount: 100, period: 'monthly', alert_threshold: 80 },
      { category_id: catIds['Utilities'],        limit_amount: 250, period: 'monthly', alert_threshold: 85 },
    ].filter(b => b.category_id)

    const { error: budInsertErr } = await supabase.from('budgets').insert(
      budgets.map(b => ({ ...b, user_id: userId }))
    )
    if (budInsertErr) log.push(`budgets ERROR: ${budInsertErr.message}`)
    else log.push(`budgets: inserted ${budgets.length}`)

    return NextResponse.json({ success: true, log })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: error.message, log }, { status: 500 })
  }
}
