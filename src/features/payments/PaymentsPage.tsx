import { useState, useMemo } from 'react'
import {
  CreditCard,
  CheckCircle2,
  Download,
  ShieldCheck,
  QrCode,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { paymentService } from '@/services/payment.service'
import { useToast } from '@/hooks'
import { civicStorage } from '@/services/storage'
import { formatCurrency } from '@/lib/utils'
import type { CivicPayment } from '@/types'

export function PaymentsPage() {
  const [payments, setPayments] = useState<CivicPayment[]>(() => civicStorage.getPayments())
  const [activePayment, setActivePayment] = useState<CivicPayment | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [isProcessing, setIsProcessing] = useState(false)
  const toast = useToast()

  const pendingPayments = useMemo(() => payments.filter((p) => p.status === 'pending'), [payments])
  const paidPayments = useMemo(() => payments.filter((p) => p.status === 'paid'), [payments])

  const totalDues = pendingPayments.reduce((acc, curr) => acc + curr.amount, 0)

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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Civic Dues & Statutory Payments
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Centralized billing gateway for municipal property taxes, utilities, and departmental statutory tariffs
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-subtle flex items-center gap-4">
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

      {/* Pending Invoices Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Outstanding Statutory Bills
        </h2>
        {pendingPayments.length === 0 ? (
          <div className="p-8 rounded-2xl border border-border bg-card/60 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-foreground">Zero Pending Civic Dues</h3>
            <p className="text-xs text-muted-foreground mt-1">
              All municipal taxes and statutory utilities for your household are paid in full.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {pendingPayments.map((item) => (
              <Card key={item.id} className="p-5 flex flex-col justify-between border-amber-500/30 bg-amber-500/5">
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
                  className="mt-4 w-full text-xs font-semibold gap-1.5"
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

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground uppercase font-mono text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Receipt Number</th>
                  <th className="py-3.5 px-4 font-semibold">Department & Bill Description</th>
                  <th className="py-3.5 px-4 font-semibold">Settled Date</th>
                  <th className="py-3.5 px-4 font-semibold">Method</th>
                  <th className="py-3.5 px-4 font-semibold">Amount</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Receipt</th>
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
                      <button
                        onClick={() =>
                          toast.success('Receipt Downloaded', `${p.receiptNumber}.pdf`)
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </button>
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
    </div>
  )
}
