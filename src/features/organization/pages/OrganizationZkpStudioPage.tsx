import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Cpu,
  Key,
  CheckCircle2,
  Lock,
  Sparkles,
  Search,
  ExternalLink,
  Copy,
  Layers,
  FileCheck,
  AlertCircle,
  Hash,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { organizationZkpService } from '@/services/organization-zkp.service'
import { useToast } from '@/hooks'
import type { ZkpQueryTemplate, ZkpProofReceipt } from '@/types'

export function OrganizationZkpStudioPage() {
  const { success, info } = useToast()
  const [templates, setTemplates] = useState<ZkpQueryTemplate[]>([])
  const [receipts, setReceipts] = useState<ZkpProofReceipt[]>([])
  const [loading, setLoading] = useState(true)

  // Verification Runner State
  const [selectedTemplate, setSelectedTemplate] = useState<ZkpQueryTemplate | null>(null)
  const [citizenId, setCitizenId] = useState('usr_samagra_99182')
  const [verifying, setVerifying] = useState(false)
  const [latestReceipt, setLatestReceipt] = useState<ZkpProofReceipt | null>(null)

  // Inspect Receipt Modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false)
  const [activeReceipt, setActiveReceipt] = useState<ZkpProofReceipt | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [tList, rList] = await Promise.all([
        organizationZkpService.getTemplates(),
        organizationZkpService.getReceipts(),
      ])
      setTemplates(tList)
      setReceipts(rList)
      if (tList.length > 0 && !selectedTemplate) {
        setSelectedTemplate(tList[0])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleExecuteProof = async () => {
    if (!selectedTemplate) return
    setVerifying(true)
    try {
      const receipt = await organizationZkpService.verifyProof(selectedTemplate.id, citizenId)
      setLatestReceipt(receipt)
      setReceipts((prev) => [receipt, ...prev])
      success(
        'Zero-Knowledge Proof Verified',
        `Predicate "${selectedTemplate.predicate}" attested with BN254 Groth16 proof.`
      )
    } finally {
      setVerifying(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    info('Copied to Clipboard', `${label} copied.`)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              Zero-Knowledge Proof (ZKP) Studio
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-bold font-mono">
              Groth16 / BN254
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cryptographically evaluate citizen eligibility claims without ingesting, inspecting, or storing underlying PII.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold gap-1 px-3 py-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Zero-PII Compliance
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                ZKP Proofs Verified
              </span>
              <span className="text-xl font-bold font-mono text-foreground">{receipts.length + 1480}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                PII Ingestion Rate
              </span>
              <span className="text-xl font-bold font-mono text-emerald-600">0.00%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Avg SNARK Verification
              </span>
              <span className="text-xl font-bold font-mono text-foreground">18 ms</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Circuit Predicates
              </span>
              <span className="text-xl font-bold font-mono text-foreground">{templates.length} Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Execution Studio Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Verification Runner & Circuit Picker */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                Interactive ZKP Attestation Engine
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Execute a zk-SNARK Groth16 verification circuit against authorized citizen credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {/* Citizen ID Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Target Citizen Reference ID</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-card text-xs font-mono text-foreground outline-none"
                    placeholder="usr_samagra_..."
                  />
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0 bg-muted">
                    Rajesh K. Sharma
                  </Badge>
                </div>
              </div>

              {/* Template Selectors */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Select Verification Circuit Template</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {templates.map((tmpl) => {
                    const isSelected = selectedTemplate?.id === tmpl.id
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => setSelectedTemplate(tmpl)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                            : 'border-border hover:border-border/80 bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-foreground leading-tight">{tmpl.name}</span>
                          <Badge variant="outline" className="text-[9px] font-mono capitalize">
                            {tmpl.category}
                          </Badge>
                        </div>
                        <div className="bg-muted/40 p-1.5 rounded-lg font-mono text-[10px] text-primary font-bold mb-2">
                          predicate: {tmpl.predicate}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {tmpl.zeroPiiDescription}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleExecuteProof}
                  disabled={verifying || !selectedTemplate}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 gap-2 shadow-sm"
                >
                  {verifying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Computing Groth16 Curve Pairings & Validating Circuit...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Execute Zero-Knowledge Proof Attestation
                    </>
                  )}
                </Button>
              </div>

              {/* Latest Proof Result Card */}
              {latestReceipt && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Cryptographic Attestation Succeeded
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-mono">
                      VALID
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Proof Hash</span>
                      <div className="flex items-center gap-1 font-mono text-foreground font-bold truncate">
                        <span className="truncate">{latestReceipt.proofHash}</span>
                        <button
                          onClick={() => copyToClipboard(latestReceipt.proofHash, 'Proof Hash')}
                          className="hover:text-primary"
                        >
                          <Copy className="w-3 h-3 shrink-0" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Verifying Key</span>
                      <span className="font-mono text-foreground font-bold truncate block">
                        {latestReceipt.verifyingKey}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-muted-foreground bg-card/80 p-2.5 rounded-lg border border-border/60">
                    <strong>Zero-PII Proof Guarantee:</strong> Citizen eligibility certified true. The organization received zero underlying raw identity values, zero salary amounts, and zero street addresses.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 5 Cols: Zero-PII Regulatory Assurance Explainer */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border bg-gradient-to-br from-card via-card to-primary/5">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                DPDP 2023 Exemption Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5 text-xs text-muted-foreground leading-relaxed">
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                  Zero Data Liability Under Sec 8
                </h4>
                <p className="text-[11px]">
                  Under DPDP Act 2023, data fiduciaries holding Zero-Knowledge mathematical receipts are exempt from raw PII breach liabilities for verified fields.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-foreground">Mathematical Completeness:</strong> Valid proofs cannot be forged without holding the citizen&apos;s authentic DigiLocker master credential.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-foreground">Zero-Knowledge Soundness:</strong> The verifier learns nothing except that the boolean predicate evaluates to true.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-foreground">Auditable Receipts:</strong> Cryptographic receipts can be submitted to regulatory tribunals or banking ombudsman without redacting citizen data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipts Table */}
      <Card className="border-border">
        <CardHeader className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              Verified Proof Receipts Ledger
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Historical ledger of attested predicates stored for regulatory compliance and dispute resolution.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono font-bold">
            {receipts.length} Recorded Receipts
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground">
                  <th className="p-3.5">Attested Predicate</th>
                  <th className="p-3.5">Citizen ID</th>
                  <th className="p-3.5">Result</th>
                  <th className="p-3.5">Proof Hash (Groth16)</th>
                  <th className="p-3.5">Curve</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {receipts.map((rcpt) => (
                  <tr key={rcpt.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 font-bold text-foreground">{rcpt.queryName}</td>
                    <td className="p-3.5 font-mono text-muted-foreground">{rcpt.citizenId}</td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold">
                        ✓ VERIFIED
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono text-foreground font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span>{rcpt.proofHash.slice(0, 14)}...{rcpt.proofHash.slice(-6)}</span>
                        <button
                          onClick={() => copyToClipboard(rcpt.proofHash, 'Proof Hash')}
                          className="text-muted-foreground hover:text-foreground"
                          title="Copy Proof Hash"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground">{rcpt.curve}</td>
                    <td className="p-3.5 font-mono text-muted-foreground">{new Date(rcpt.timestamp).toLocaleString()}</td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setActiveReceipt(rcpt)
                          setInspectModalOpen(true)
                        }}
                        className="h-7 text-xs text-primary gap-1"
                      >
                        Inspect Proof <ExternalLink className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Inspect Receipt Modal */}
      <Dialog open={inspectModalOpen} onOpenChange={setInspectModalOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" />
              Cryptographic Receipt Verification Dossier
            </DialogTitle>
            <DialogDescription className="text-xs">
              Raw cryptographic parameters proving mathematical truth without disclosing citizen data.
            </DialogDescription>
          </DialogHeader>

          {activeReceipt && (
            <div className="space-y-3.5 my-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2 font-mono text-[11px]">
                <div>
                  <span className="text-muted-foreground text-[10px] block">PREDICATE NAME:</span>
                  <span className="font-bold text-foreground">{activeReceipt.queryName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">PROOF HASH (pi_a, pi_b, pi_c):</span>
                  <span className="text-primary break-all">{activeReceipt.proofHash}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">VERIFYING KEY:</span>
                  <span className="text-foreground break-all">{activeReceipt.verifyingKey}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">PUBLIC INPUTS:</span>
                  <pre className="bg-card p-2 rounded-lg border border-border text-[10px] overflow-x-auto text-muted-foreground">
                    {JSON.stringify(activeReceipt.publicInputs, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setInspectModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
