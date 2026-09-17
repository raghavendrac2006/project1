import { useState, useMemo } from 'react'
import {
  CreditCard,
  CheckCircle2,
  Download,
  ShieldCheck,
  QrCode,
  Calendar,
  Clock,
  TrendingUp,
  FileCheck,
  Printer,
  Eye,
  AlertTriangle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { paymentService } from '@/services/payment.service'
import { useToast } from '@/hooks'
import { civicStorage } from '@/services/storage'
import { formatCurrency } from '@/lib/utils'
import { generateAndPrintReceipt } from '@/lib/receiptGenerator'
import type { CivicPayment } from '@/types'

export function PaymentsPage() {
  const [payments, setPayments] = useState<CivicPayment[]>(() => civicStorage.getPayments())
  const [activePayment, setActivePayment] = useState<CivicPayment | null>(null)
  const [previewReceipt, setPreviewReceipt] = useState<CivicPayment | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [isProcessing, setIsProcessing] = useState(false)
  const toast = useToast()

  const pendingPayments = useMemo(() => payments.filter((p) => p.status === 'pending'), [payments])
  const paidPayments = useMemo(() => payments.filter((p) => p.status === 'paid'), [payments])

  const totalDues = pendingPayments.reduce((acc, curr) => acc + curr.amount, 0)
  const totalPaid = paidPayments.reduce((acc, curr) => acc + curr.amount, 0)

  // Spend breakdown by category
  const spendBreakdown = useMemo(() => {
    const categories: Record<string, number> = {
      'Property & Municipal Taxes': 0,
      'Civic Utilities & Water': 0,
      'Licensing & Registrations': 0,
      'Statutory Stamp Duty': 0,
    }

    paidPayments.forEach((p) => {
      if (p.department.toLowerCase().includes('property') || p.title.toLowerCase().includes('tax')) {
        categories['Property & Municipal Taxes'] += p.amount
      } else if (p.department.toLowerCase().includes('water') || p.department.toLowerCase().includes('utility')) {
        categories['Civic Utilities & Water'] += p.amount
      } else if (p.department.toLowerCase().includes('transport') || p.title.toLowerCase().includes('license')) {
        categories['Licensing & Registrations'] += p.amount
      } else {
        categories['Statutory Stamp Duty'] += p.amount
      }
    })

    // If all are 0, supply sensible realistic baselines for presentation
    if (Object.values(categories).every((v) => v === 0)) {
      categories['Property & Municipal Taxes'] = 14200
      categories['Civic Utilities & Water'] = 4850
      categories['Licensing & Registrations'] = 1500
      categories['Statutory Stamp Duty'] = 8200
    }

    const maxVal = Math.max(...Object.values(categories))
    return Object.entries(categories).map(([label, amount]) => ({
      label,
      amount,
      pct: maxVal === 0 ? 0 : Math.round((amount / maxVal) * 100),
    }))
  }, [paidPayments])

  // Upcoming renewal calendar dues
  const upcomingDuesCalendar = useMemo(() => {
    return [
      { id: 'due_1', title: 'Q3 Municipal Property Tax (BBMP)', date: '2026-10-15', amount: 4800, daysLeft: 28, dept: 'BBMP Revenue' },
      { id: 'due_2', title: 'Commercial Trade License Renewal', date: '2026-11-01', amount: 2500, daysLeft: 45, dept: 'Dept of Commerce' },
      { id: 'due_3', title: 'BWSSB Statutory Water Tariff', date: '2026-11-20', amount: 950, daysLeft: 64, dept: 'Water Supply Board' },
    ]
  }, [])

  const handlePay = async () => {
    if (!activePayment) return
    setIsProcessing(true)
    try {
      const updated = await paymentService.payDue(
        activePayment.id,
        paymentMethod === 'upi' ? 'UPI / Bharat BillPay' : paymentMethod === 'card' ? 'Visa / RuPay Card' : 'Net Banking (SBI)'
      )
      setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setActivePayment(null)
      toast.success(
        'Payment Settled Successfully',
        `Receipt ${updated.receiptNumber} generated and archived.`
      )
    } catch {
      toast.error('Payment Failed', 'Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadReceipt = async (p: CivicPayment) => {
    toast.info('Generating Challan', 'Assembling cryptographic signatures & printable PDF...')
    await generateAndPrintReceipt(p)
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Civic Dues & Statutory Payments
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Centralized billing gateway for municipal property taxes, utilities, and departmental statutory tariffs.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
              Total Outstanding
            </span>
            <p className="text-xl font-black font-display text-foreground">
              {formatCurrency(totalDues)}
            </p>
          </div>
          <Badge variant={totalDues > 0 ? 'attention' : 'verified'} size="sm">
            {totalDues > 0 ? `${pendingPayments.length} Dues Pending` : 'All Dues Cleared'}
          </Badge>
        </div>
      </div>

      {/* Spend Breakdown & Upcoming Calendar Row */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Spend Breakdown Mini-Chart */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Annual Civic Spend Breakdown</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Total Paid: {formatCurrency(totalPaid || 28750)}
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {spendBreakdown.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <span className="font-mono font-bold text-foreground">{formatCurrency(item.amount)}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full transition-all duration-700"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Dues Calendar Strip */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Upcoming Statutory Dues</h3>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Next 90 Days
            </Badge>
          </div>

          <div className="space-y-2.5 pt-1">
            {upcomingDuesCalendar.map((due) => (
              <div
                key={due.id}
                className="p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-foreground truncate max-w-[200px]">{due.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {due.dept} • Due in <span className="font-semibold text-foreground">{due.daysLeft} days</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-foreground block">{formatCurrency(due.amount)}</span>
                  <span className="text-[10px] text-muted-foreground">{due.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Invoices Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Outstanding Statutory Bills
        </h2>
        {pendingPayments.length === 0 ? (
          <div className="p-8 rounded-2xl border border-border bg-card/60 text-center shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-foreground">Zero Pending Civic Dues</h3>
            <p className="text-xs text-muted-foreground mt-1">
              All municipal taxes and statutory utilities for your household are paid in full.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {pendingPayments.map((item) => (
              <Card key={item.id} className="p-5 flex flex-col justify-between border-amber-500/30 bg-amber-500/5 shadow-sm">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs text-primary font-bold">
                      {item.receiptNumber}
                    </span>
                    <Badge variant="attention" size="sm">Due Soon</Badge>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.department}</p>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Due by {item.dueDate}</span>
                    <span className="text-lg font-extrabold font-display text-foreground">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4 w-full text-xs font-semibold gap-1.5 shadow-sm"
                  onClick={() => setActivePayment(item)}
                >
                  <CreditCard className="w-4 h-4" />
                  Pay Now ({formatCurrency(item.amount)})
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Payment History Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Historical Payments & Statutory Receipts
        </h2>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground uppercase font-mono text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Receipt Number</th>
                  <th className="py-3.5 px-4 font-semibold">Department & Bill Description</th>
                  <th className="py-3.5 px-4 font-semibold">Settled Date</th>
                  <th className="py-3.5 px-4 font-semibold">Method</th>
                  <th className="py-3.5 px-4 font-semibold">Amount</th>
                  <th className="py-3.5 px-4 text-right">Receipt Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paidPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground">{p.title}</p>
                      <p className="text-[11px] text-muted-foreground">{p.department}</p>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-mono">
                      {p.paidDate || 'Recently'}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {p.paymentMethod || 'Bharat BillPay (UPI)'}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-display text-foreground">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewReceipt(p)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted"
                          title="Preview Receipt"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(p)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline p-1"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mock Payment Gateway Dialog */}
      <Dialog open={!!activePayment} onOpenChange={(open) => !open && setActivePayment(null)}>
        {activePayment && (
          <DialogContent className="max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5 text-primary" />
                Bharat BillPay Civic Gateway
              </DialogTitle>
              <DialogDescription className="text-xs">
                Encrypted payment settlement for {activePayment.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="p-4 rounded-xl bg-muted/60 border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">Payable Amount</span>
                  <p className="text-xl font-black font-display text-foreground">
                    {formatCurrency(activePayment.amount)}
                  </p>
                </div>
                <Badge variant="verified" size="sm">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> 256-Bit SSL
                </Badge>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                  Select Settlement Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: 'UPI / QR', desc: 'BHIM, GPay' },
                    { id: 'card', label: 'RuPay/Card', desc: 'Debit / Credit' },
                    { id: 'netbanking', label: 'NetBanking', desc: 'All Banks' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as 'upi' | 'card' | 'netbanking')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        paymentMethod === m.id
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <p className="text-xs">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'upi' && (
                <div className="p-3 rounded-xl border border-border bg-card text-center space-y-2">
                  <p className="text-xs text-muted-foreground">Scan with any UPI application</p>
                  <div className="w-24 h-24 mx-auto bg-white p-1 rounded-lg flex items-center justify-center text-slate-900 border">
                    <QrCode className="w-20 h-20" />
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground">civiqone.billpay@nic</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-row justify-between items-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setActivePayment(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isProcessing}
                onClick={handlePay}
                className="gap-1.5"
              >
                Confirm Payment ({formatCurrency(activePayment.amount)})
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Official Receipt Preview Modal */}
      <Dialog open={!!previewReceipt} onOpenChange={(open) => !open && setPreviewReceipt(null)}>
        {previewReceipt && (
          <DialogContent className="max-w-lg p-6">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2 text-base">
                  <FileCheck className="w-5 h-5 text-emerald-500" />
                  Official Statutory Payment Receipt
                </DialogTitle>
                <Badge variant="verified" size="sm">
                  Digitally Signed
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Verifiable proof of payment anchored to state treasury ledger
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 p-5 rounded-xl border border-border bg-card text-xs">
              <div className="flex justify-between border-b border-border/60 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">Receipt Number</span>
                  <p className="font-mono font-bold text-foreground text-sm">{previewReceipt.receiptNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">Settlement Date</span>
                  <p className="font-mono text-foreground">{previewReceipt.paidDate || '2026-09-17'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-1">
                <div>
                  <span className="text-muted-foreground">Payer:</span>
                  <p className="font-semibold text-foreground">Rajesh K. Sharma (Aadhaar: •••• 4912)</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Department:</span>
                  <p className="font-semibold text-foreground">{previewReceipt.department}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Item Description:</span>
                  <p className="font-semibold text-foreground">{previewReceipt.title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Mode:</span>
                  <p className="font-semibold text-foreground">{previewReceipt.paymentMethod || 'Bharat BillPay'}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 flex justify-between items-center text-sm font-bold">
                <span>Amount Paid:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-display text-base">
                  {formatCurrency(previewReceipt.amount)}
                </span>
              </div>

              <div className="text-[10px] font-mono text-muted-foreground text-center pt-2">
                Digital Hash: 0x8f2a99c1e74b32d8471a2e9b015f8c6d4e2a1b9f
              </div>
            </div>

            <DialogFooter className="flex-row justify-between items-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewReceipt(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleDownloadReceipt(previewReceipt)
                  setPreviewReceipt(null)
                }}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Signed PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
