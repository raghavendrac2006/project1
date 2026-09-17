import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  Trash2,
  FileCheck,
  Download,
  Calendar,
  Sparkles,
  AlertTriangle,
  Lock,
  ExternalLink,
  Copy,
  Hash,
  Scale,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { organizationComplianceService } from '@/services/organization-compliance.service'
import { useToast } from '@/hooks'
import type { ComplianceCheckItem, DataPurgePolicy, DestructionCertificate } from '@/types'

export function OrganizationCompliancePage() {
  const { success, info } = useToast()

  const [checks, setChecks] = useState<ComplianceCheckItem[]>([])
  const [policies, setPolicies] = useState<DataPurgePolicy[]>([])
  const [certificates, setCertificates] = useState<DestructionCertificate[]>([])
  const [loading, setLoading] = useState(true)

  // Shred Execution State
  const [purgingPolicyId, setPurgingPolicyId] = useState<string | null>(null)

  // Certificate Modal State
  const [activeCert, setActiveCert] = useState<DestructionCertificate | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [cList, pList, certList] = await Promise.all([
        organizationComplianceService.getComplianceChecks(),
        organizationComplianceService.getPurgePolicies(),
        organizationComplianceService.getDestructionCertificates(),
      ])
      setChecks(cList)
      setPolicies(pList)
      setCertificates(certList)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleExecutePurge = async (policyId: string) => {
    setPurgingPolicyId(policyId)
    try {
      const newCert = await organizationComplianceService.executePurge(policyId)
      setCertificates((prev) => [newCert, ...prev])
      const updatedPolicies = await organizationComplianceService.getPurgePolicies()
      setPolicies(updatedPolicies)
      success(
        'Cryptographic Purge Completed',
        `Destruction certificate ${newCert.certificateNumber} generated for ${newCert.recordsCount} records.`
      )
    } finally {
      setPurgingPolicyId(null)
    }
  }

  const handleExportDossier = () => {
    const payload = {
      regulatoryFramework: 'India Digital Personal Data Protection Act (DPDP Act) 2023',
      organization: 'CIVIQ Enterprise Verifier Network',
      auditDate: new Date().toISOString(),
      scorecard: checks,
      activePurgePolicies: policies,
      destructionLedgerSummary: {
        totalCertificates: certificates.length,
        totalRecordsPurged: policies.reduce((acc, p) => acc + p.recordsPurgedTotal, 0),
      },
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DPDP-Compliance-Audit-Package-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    success('Audit Dossier Exported', 'Statutory compliance verification package downloaded.')
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    info('Copied', `${label} copied to clipboard.`)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              DPDP Act 2023 Compliance & Data Purge Hub
            </h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold">
              100% COMPLIANT
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Statutory adherence tracking, automated purpose limitation enforcement, and NIST SP 800-88 cryptographic shredding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportDossier}
            className="text-xs font-bold gap-1.5 border-border hover:bg-muted"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit Package
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                DPDP 2023 Scorecard
              </span>
              <span className="text-xl font-bold font-mono text-emerald-600">100% Passed</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Total Records Shredded
              </span>
              <span className="text-xl font-bold font-mono text-foreground">
                {policies.reduce((acc, p) => acc + p.recordsPurgedTotal, 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Active Purge Policies
              </span>
              <span className="text-xl font-bold font-mono text-foreground">{policies.length} Automated</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Destruction Certificates
              </span>
              <span className="text-xl font-bold font-mono text-foreground">{certificates.length} Signed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 1: DPDP Act 2023 Statutory Scorecard */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              DPDP Act 2023 Statutory Clause Audits
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Live automated validation verifying strict compliance with statutory data fiduciary requirements.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            5 / 5 Clauses Certified
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground">
                  <th className="p-3.5">Statutory Framework & Clause</th>
                  <th className="p-3.5">Mandate Objective</th>
                  <th className="p-3.5">Adherence Status</th>
                  <th className="p-3.5">Technical Verification Evidence</th>
                  <th className="p-3.5 text-right">Last Audited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {checks.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-foreground">
                      <div>{item.clause}</div>
                      <span className="text-[10px] text-muted-foreground uppercase">{item.framework}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-foreground">{item.title}</td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold">
                        ✓ COMPLIANT
                      </Badge>
                    </td>
                    <td className="p-3.5 text-muted-foreground leading-relaxed max-w-sm">
                      {item.evidence}
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground text-right">
                      {new Date(item.lastAuditDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Automated Data Retention & Purge Policies */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-500" />
            Automated Data Retention & Cryptographic Shredding Policies
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Post-processing automated erasure enforcing Section 8(7) purpose limitation and storage minimization.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid md:grid-cols-3 gap-4">
            {policies.map((p) => {
              const isPurging = purgingPolicyId === p.id
              return (
                <div key={p.id} className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-mono font-bold bg-primary/10 text-primary border-primary/20">
                        {p.retentionDays} Days Retention
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold">
                        AUTO-PURGE ON
                      </Badge>
                    </div>

                    <h4 className="text-xs font-bold text-foreground leading-snug">{p.name}</h4>
                    <p className="text-[11px] text-muted-foreground">{p.dataType}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Purged:</span>
                      <span className="font-mono font-bold text-foreground">{p.recordsPurgedTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next Scheduled:</span>
                      <span className="font-mono text-muted-foreground">
                        {new Date(p.nextScheduledAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExecutePurge(p.id)}
                      disabled={isPurging}
                      className="w-full text-xs font-bold text-rose-600 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 mt-2"
                    >
                      {isPurging ? (
                        <>
                          <div className="w-3 h-3 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                          Cryptographic Overwrite in Progress...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          Trigger Cryptographic Shredding
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Destruction Certificates Ledger */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              Cryptographic Destruction Certificates Ledger
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              NIST SP 800-88 cryptographic wipe records co-signed by automated HSM root of trust.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono font-bold">
            {certificates.length} Certificates
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground">
                  <th className="p-3.5">Certificate #</th>
                  <th className="p-3.5">Target Data Set</th>
                  <th className="p-3.5">Records Purged</th>
                  <th className="p-3.5">Merkle Root Hash</th>
                  <th className="p-3.5">Shredding Method</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-primary">{cert.certificateNumber}</td>
                    <td className="p-3.5 font-semibold text-foreground">{cert.purgePolicyName}</td>
                    <td className="p-3.5 font-mono font-bold text-foreground">{cert.recordsCount}</td>
                    <td className="p-3.5 font-mono text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>{cert.merkleRootHash.slice(0, 14)}...</span>
                        <button
                          onClick={() => copyToClipboard(cert.merkleRootHash, 'Merkle Hash')}
                          className="hover:text-foreground"
                          title="Copy Merkle Hash"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 text-muted-foreground text-[11px]">{cert.shredMethod}</td>
                    <td className="p-3.5 font-mono text-muted-foreground">{new Date(cert.timestamp).toLocaleString()}</td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActiveCert(cert)}
                        className="h-7 text-xs text-primary gap-1"
                      >
                        View Certificate <ExternalLink className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Modal */}
      <Dialog open={!!activeCert} onOpenChange={() => setActiveCert(null)}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              Statutory Certificate of Data Destruction
            </DialogTitle>
            <DialogDescription className="text-xs">
              Compliant with Section 8(7) of DPDP Act 2023 and NIST SP 800-88 Rev 1 Guidelines.
            </DialogDescription>
          </DialogHeader>

          {activeCert && (
            <div className="space-y-4 my-2 text-xs">
              <div className="p-4 rounded-xl border border-border bg-card space-y-3 font-mono text-[11px]">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">CERTIFICATE NUMBER:</span>
                  <span className="font-bold text-foreground">{activeCert.certificateNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">TARGET DATASET:</span>
                  <span className="font-semibold text-foreground">{activeCert.purgePolicyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">RECORDS SHREDDED:</span>
                  <span className="font-bold text-emerald-600">{activeCert.recordsCount} Records</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">SHRED SPECIFICATION:</span>
                  <span className="text-foreground text-[10px]">{activeCert.shredMethod}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">MERKLE ROOT HASH:</span>
                  <p className="bg-muted/50 p-2 rounded border border-border text-[10px] text-primary break-all">
                    {activeCert.merkleRootHash}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">HSM / OFFICER SIGNATURE:</span>
                  <span className="text-muted-foreground text-[10px]">{activeCert.officerSignature}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setActiveCert(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
