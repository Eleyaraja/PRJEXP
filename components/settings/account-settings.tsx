'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Pencil, Check, X, Landmark, CreditCard, Wallet, Smartphone, PiggyBank } from 'lucide-react'

interface AccountSettingsProps {
  userId: string
}

const TYPE_ICONS: Record<string, any> = {
  bank:           Landmark,
  credit_card:    CreditCard,
  cash:           Wallet,
  digital_wallet: Smartphone,
  savings:        PiggyBank,
}

const TYPE_COLORS: Record<string, string> = {
  bank:           'text-blue-400',
  credit_card:    'text-purple-400',
  cash:           'text-green-400',
  digital_wallet: 'text-cyan-400',
  savings:        'text-amber-400',
}

export default function AccountSettings({ userId }: AccountSettingsProps) {
  const supabase = useRef(createClient()).current
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  // Which account is being edited and its draft balance
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftBalance, setDraftBalance] = useState('')

  const [newAccount, setNewAccount] = useState({ name: '', type: 'bank', currency: 'INR', balance: '' })

  useEffect(() => {
    fetchAccounts()
  }, [userId])

  const fetchAccounts = async () => {
    try {
      const { data } = await supabase.from('accounts').select('*').eq('user_id', userId).order('is_default', { ascending: false })
      setAccounts(data || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = async () => {
    if (!newAccount.name) { alert('Please enter an account name'); return }
    try {
      const { data, error } = await supabase.from('accounts').insert({
        user_id: userId,
        name: newAccount.name,
        type: newAccount.type,
        currency: newAccount.currency,
        balance: parseFloat(newAccount.balance || '0'),
      }).select()
      if (error) throw error
      setAccounts([...accounts, data[0]])
      setNewAccount({ name: '', type: 'bank', currency: 'INR', balance: '' })
    } catch (error) {
      console.error('Error adding account:', error)
      alert('Failed to add account')
    }
  }

  const startEdit = (account: any) => {
    setEditingId(account.id)
    setDraftBalance(String(account.balance ?? '0'))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraftBalance('')
  }

  const saveBalance = async (id: string) => {
    const value = parseFloat(draftBalance)
    if (isNaN(value)) { alert('Please enter a valid number'); return }
    setSaving(id)
    try {
      const { error } = await supabase.from('accounts').update({ balance: value }).eq('id', id)
      if (error) throw error
      setAccounts(accounts.map(a => a.id === id ? { ...a, balance: value } : a))
      setEditingId(null)
    } catch (error) {
      console.error('Error updating balance:', error)
      alert('Failed to update balance')
    } finally {
      setSaving(null)
    }
  }

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return
    try {
      await supabase.from('accounts').delete().eq('id', id)
      setAccounts(accounts.filter(a => a.id !== id))
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0)

  return (
    <div className="space-y-6">

      {/* Total balance summary */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 sm:col-span-1">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Balance</p>
              <p className="text-2xl font-bold text-foreground mt-1">₹{totalBalance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
          {accounts.slice(0, 2).map(acc => {
            const Icon = TYPE_ICONS[acc.type] || Wallet
            return (
              <Card key={acc.id} className="bg-card border-border">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-3.5 w-3.5 ${TYPE_COLORS[acc.type] || 'text-muted-foreground'}`} />
                    <p className="text-xs text-muted-foreground truncate">{acc.name}</p>
                  </div>
                  <p className="text-xl font-bold text-foreground">₹{parseFloat(acc.balance || 0).toFixed(2)}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add new account */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Add New Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Account Name</Label>
              <Input
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                placeholder="e.g., My Checking"
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Type</Label>
              <Select value={newAccount.type} onValueChange={(v) => setNewAccount({ ...newAccount, type: v })}>
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Opening Balance</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                  className="bg-secondary border-border text-foreground pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Currency</Label>
              <Input
                value={newAccount.currency}
                onChange={(e) => setNewAccount({ ...newAccount, currency: e.target.value })}
                placeholder="INR"
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>
          <Button
            onClick={handleAddAccount}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </CardContent>
      </Card>

      {/* Account list */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map((account) => {
                const Icon = TYPE_ICONS[account.type] || Wallet
                const isEditing = editingId === account.id
                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg gap-4"
                  >
                    {/* Icon + name + badges */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg bg-background/50`}>
                        <Icon className={`h-4 w-4 ${TYPE_COLORS[account.type] || 'text-muted-foreground'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{account.name}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs capitalize">
                            {account.type.replace('_', ' ')}
                          </Badge>
                          {account.is_default && (
                            <Badge className="text-xs bg-primary text-primary-foreground">Default</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Balance edit */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={draftBalance}
                              onChange={(e) => setDraftBalance(e.target.value)}
                              className="bg-background border-border text-foreground w-32 pl-6 h-8 text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveBalance(account.id)
                                if (e.key === 'Escape') cancelEdit()
                              }}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => saveBalance(account.id)}
                            disabled={saving === account.id}
                            className="text-green-400 hover:bg-green-400/10 h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelEdit}
                            className="text-muted-foreground hover:bg-secondary h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              ₹{parseFloat(account.balance || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">{account.currency || 'INR'}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(account)}
                            className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                            title="Edit balance"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAccount(account.id)}
                            className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No accounts yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
