import { useState } from 'react'
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Edit2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { useAuth, useToast } from '@/hooks'
import { userService } from '@/services/user.service'
import { civicStorage } from '@/services/storage'
import { CiviqOneCard } from '@/components/civiqone-card'

export function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [identity] = useState(() => civicStorage.getIdentity())
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [city, setCity] = useState(user?.city || '')
  const [state, setState] = useState(user?.state || '')
  const [pincode, setPincode] = useState(user?.pincode || '')
  const [isSaving, setIsSaving] = useState(false)

  const toast = useToast()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await userService.updateProfile({
        name,
        email,
        phone,
        city,
        state,
        pincode,
        address: identity.address,
      })
      await refreshUser()
      setEditModalOpen(false)
      toast.success('Citizen Profile Updated', 'Information reconciled with identity core.')
    } catch {
      toast.error('Update Failed', 'Please verify your details.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="relative">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-primary/40 shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                {user?.name}
              </h1>
              <Badge variant="verified" size="sm">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Sovereign Level 3
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground font-mono">
              CITIZEN ID: {user?.nationalId} • Member Since {user?.memberSince}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> {user?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" /> +91 {user?.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {user?.city}, {user?.state}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs self-center sm:self-start"
            onClick={() => setEditModalOpen(true)}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Update Profile
          </Button>
        </div>
      </div>

      {/* 3D Glassmorphism SAMAGRA Card Showcase (Section 28) */}
      <div className="p-6 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md shadow-card">
        <div className="max-w-xl mx-auto mb-4 text-center sm:text-left">
          <h3 className="font-display font-bold text-base text-foreground flex items-center justify-center sm:justify-start gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Sovereign Digital Identity Smart Card
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Digital civic identity card for verified civic attestation. Click or press Space to flip.
          </p>
        </div>
        <CiviqOneCard />
      </div>

      {/* Completeness Meter & Security Overview */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Profile Completeness
            </span>
            <span className="text-sm font-bold text-emerald-500">95% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[95%]" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Aadhaar, PAN, Biometrics, and Residential Address verified. Add emergency contact to reach 100%.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Account Security Integrity
            </span>
            <span className="text-sm font-bold text-primary">Score: 94/100</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full w-[94%]" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Hardware biometric 2FA active. Session logs monitored via Central Security Gateway.
          </p>
        </Card>
      </div>

      {/* Structured Profile Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base">Statutory Civil Records</CardTitle>
            <CardDescription className="text-xs">
              Synchronized from Central Registrar database
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Full Legal Name</span>
              <span className="font-semibold text-foreground">{identity.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Date of Birth</span>
              <span className="font-semibold text-foreground">{identity.dateOfBirth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Gender</span>
              <span className="font-semibold text-foreground">{identity.gender}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Blood Group</span>
              <span className="font-semibold text-foreground">{identity.bloodGroup}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">KYC Clearance</span>
              <Badge variant="verified" size="sm">Level 3 Sovereign</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base">Registered Residential Address</CardTitle>
            <CardDescription className="text-xs">
              Official address of record for statutory delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-mono">
                Premises & Street
              </span>
              <p className="font-semibold text-foreground mt-0.5 leading-relaxed">
                {identity.address}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-mono">City</span>
                <p className="font-semibold text-foreground mt-0.5">{user?.city}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-mono">State</span>
                <p className="font-semibold text-foreground mt-0.5">{user?.state}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-mono">PIN Code</span>
                <p className="font-semibold text-foreground mt-0.5 font-mono">{user?.pincode}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base">Update Contact Details</DialogTitle>
            <DialogDescription className="text-xs">
              Update registered communication phone, email, or regional location
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 my-2 text-xs">
            <Input
              label="Citizen Legal Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Registered Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Mobile Number (10 Digits)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <Input
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
              <Input
                label="PIN"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSaving}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
