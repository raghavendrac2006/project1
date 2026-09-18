import React from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Lock,
  ExternalLink,
  ShieldCheck,
  Shield,
  QrCode,
} from 'lucide-react'
import type { CiviqOneCardData } from './civiqone-card.types'
import { CiviqOneCardQr } from './CiviqOneCardQr'
import { ROUTES } from '@/constants/routes'

interface CiviqOneCardBackProps {
  data: CiviqOneCardData
  privacyMode?: boolean
}

export const CiviqOneCardBack: React.FC<CiviqOneCardBackProps> = ({
  data,
  privacyMode = false,
}) => {
  const formattedCredentialsCount =
    data.credentialCount < 10 ? `0${data.credentialCount}` : `${data.credentialCount}`

  return (
    <div className="civiq-glass-card-face civiq-glass-card-face-back select-none">
      {/* 1. Subtle Digital Guilloche Watermark */}
      <div className="civiq-glass-pattern" />

      {/* 2. Top Header: SAMAGRA Identity Verification */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm border border-blue-500/20">
            <Shield className="w-4 h-4 fill-current/20" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase">
                SAMAGRA
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">|</span>
              <span className="text-[9px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                CIVIC OS
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
              Identity Verification
            </h3>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[8.5px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-3 h-3" /> SECURE AUDIT
        </span>
      </div>

      {/* 3. Center Grid: Large QR Code + Verification Reference Table */}
      <div className="relative z-10 grid grid-cols-12 gap-3.5 items-center my-auto">
        {/* Left: Large QR Verification Section */}
        <div className="col-span-5 flex flex-col items-center justify-center space-y-1">
          <div className="relative p-2.5 rounded-2xl bg-white dark:bg-black/60 border border-slate-200 dark:border-white/15 shadow-sm">
            <CiviqOneCardQr
              value={data.verificationReference}
              size={106}
              isProtected={privacyMode}
            />
          </div>
          <span className="text-[7.5px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 pt-0.5">
            <QrCode className="w-2.5 h-2.5" /> Scan to Verify
          </span>
        </div>

        {/* Right: Structured Verification Audit Record */}
        <div className="col-span-7 space-y-1.5 text-left pl-1">
          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-1 text-xs">
            {/* Verification Reference */}
            <div className="flex justify-between items-center text-[9.5px]">
              <span className="font-mono text-slate-500 dark:text-slate-400">Verification Reference</span>
              <span className="font-mono font-bold text-violet-700 dark:text-violet-300">
                {data.verificationReference}
              </span>
            </div>

            {/* Identity Status */}
            <div className="flex justify-between items-center text-[9.5px]">
              <span className="font-mono text-slate-500 dark:text-slate-400">Identity Status</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> ✓ Active
              </span>
            </div>

            {/* Credentials */}
            <div className="flex justify-between items-center text-[9.5px]">
              <span className="font-mono text-slate-500 dark:text-slate-400">Credentials</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formattedCredentialsCount} Verified
              </span>
            </div>

            {/* Last Verified */}
            <div className="flex justify-between items-center text-[9.5px]">
              <span className="font-mono text-slate-500 dark:text-slate-400">Last Verified</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {data.lastVerifiedAt || '18 Sep 2026'}
              </span>
            </div>
          </div>

          {/* Privacy Summary: 2 Active Shares • Consent Controlled */}
          <Link
            to={ROUTES.APP.PRIVACY}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between p-2 px-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 text-[9.5px] text-violet-700 dark:text-violet-300 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 font-mono font-semibold truncate">
              <Lock className="w-3 h-3 shrink-0 text-violet-600 dark:text-violet-400" />
              <span>Privacy: {data.activeShares} Active Shares</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="truncate">Consent Controlled</span>
            </div>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </div>

      {/* 4. Bottom Footer Security Indicators */}
      <div className="relative z-10 pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[8px] font-mono text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> Phone Verified
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> Email Verified
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> Biometric MFA
        </span>
      </div>
    </div>
  )
}
