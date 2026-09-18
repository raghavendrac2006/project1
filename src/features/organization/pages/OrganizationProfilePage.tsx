import React from 'react'
import { Building2, ShieldCheck, Mail, Phone, MapPin, Globe, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { civicStorage } from '@/services/storage'

export function OrganizationProfilePage() {
  const session = civicStorage.getOrgSession()
  const org = session?.organization

  if (!org) return null

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
          Organization Entity Profile
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Verified regulatory accreditation and corporate civic registration details.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden">
                <img src={org.logo} alt={org.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-bold text-foreground">{org.name}</CardTitle>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    Verified Partner
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {org.legalName}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground font-mono uppercase">Statutory Registration #</span>
                <p className="font-bold text-foreground mt-0.5">{org.registrationNumber}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground font-mono uppercase">Industry Sector</span>
                <p className="font-bold text-foreground mt-0.5">{org.category}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground font-mono uppercase">Partner Since</span>
                <p className="font-bold text-foreground mt-0.5">{new Date(org.joinedAt).toLocaleDateString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground font-mono uppercase">Website URL</span>
                <p className="font-bold text-primary mt-0.5">{org.website}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>{org.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>{org.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{org.address}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vetting Credentials */}
        <Card className="border-border">
          <CardHeader className="p-5 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              CiviqOne Sovereign Vetting
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs text-muted-foreground">
            <p>
              This organization has passed statutory KYC vetting by the Government Registrar and maintains an active cryptographic root certificate.
            </p>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[11px]">
              SHA-256 Fingerprint:
              <br />
              <span className="break-all">9A:4B:82:1F:EE:39:B0:9C:18:22:A4:77:88:91</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
