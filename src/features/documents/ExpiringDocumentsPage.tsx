import { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { civicStorage } from '@/services/storage'
import { ROUTES } from '@/constants/routes'

export function ExpiringDocumentsPage() {
  const navigate = useNavigate()
  const documents = useMemo(() => civicStorage.getDocuments(), [])

  // Filter documents that are expiring_soon or have expiry dates within 180 days
  const expiringDocs = useMemo(() => {
    return documents.filter(
      (d) =>
        d.verificationStatus === 'expiring_soon' ||
        (d.expiryDate && new Date(d.expiryDate).getFullYear() <= 2026)
    )
  }, [documents])

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => navigate(ROUTES.APP.DOCUMENTS)}
          variant="outline"
          size="sm"
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Vault
        </Button>
      </div>

      <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-card to-amber-500/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Statutory Expiry Monitor
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Expiring Documents & Credentials
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            SAMAGRA monitors your statutory certificates, licenses, and permits. Renew within the statutory grace window to avoid late penalty surcharges.
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {expiringDocs.length}
          </p>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase">Requiring Renewal</p>
        </div>
      </div>

      {/* List of Expiring Documents */}
      <div className="space-y-4">
        {expiringDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 uppercase">
                    Expires {doc.expiryDate}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    #{doc.documentNumber}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground">{doc.title}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {doc.issuer} • Owner: {doc.ownerName || 'Self'}
                </p>

                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  Recommendation: Initiate digital renewal 30 days before expiration.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                onClick={() => navigate(`/app/documents/${doc.id}`)}
                variant="outline"
                size="sm"
                className="text-xs font-bold rounded-xl"
              >
                Inspect Record
              </Button>
              <Button
                onClick={() => navigate(ROUTES.APP.SERVICES)}
                size="sm"
                className="text-xs font-bold rounded-xl shadow-sm"
              >
                Apply for Renewal <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
