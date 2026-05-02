'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProfileSettingsProps {
  userId: string
}

export default function ProfileSettings({ userId }: ProfileSettingsProps) {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()

      setProfile(data || {})
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const { error } = await supabase.from('profiles').update(profile).eq('id', userId)

      if (error) throw error

      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-foreground">
            First Name
          </Label>
          <Input
            id="first_name"
            value={profile?.first_name || ''}
            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            className="bg-secondary border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-foreground">
            Last Name
          </Label>
          <Input
            id="last_name"
            value={profile?.last_name || ''}
            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            className="bg-secondary border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency" className="text-foreground">
            Currency
          </Label>
          <Input
            id="currency"
            value={profile?.currency || 'INR'}
            onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
            className="bg-secondary border-border text-foreground"
            placeholder="INR"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  )
}
