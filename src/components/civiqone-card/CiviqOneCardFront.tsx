import React from 'react'
import { Shield, CheckCircle2, Lock } from 'lucide-react'
import type { CiviqOneCardData } from './civiqone-card.types'
import { CiviqOneCardBadge } from './CiviqOneCardBadge'
import { CiviqOneCardQr } from './CiviqOneCardQr'

interface CiviqOneCardFrontProps {
  data: CiviqOneCardData
  privacyMode?: boolean
}

export const CiviqOneCardFront: React.FC<CiviqOneCardFrontProps> = ({
  data,
  privacyMode = false,
}) => {
  const formattedCredentialsCount =
    data.credentialCount < 10 ? `0${data.credentialCount}` : `${data.credentialCount}`

  return (
    <div className="civiq-glass-card-face civiq-glass-card-face-front select-none">
      {/* 1. Subtle Digital Guilloche Watermark */}
      <div className="civiq-glass-pattern" />

      {/* 2. Top Header: SAMAGRA Brand & Status Badges */}
      <div className="relative z-10 flex items-start justify-between">
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
            <p className="text-[7.5px] font-mono font-semibold text-slate-500 dark:text-slate-400 tracking-widest uppercase">
              NATIONAL IDENTITY MATRIX
            </p>
          </div>
        </div>

        {/* Right Badges: Protected View & Restrained Violet Verified Pill */}
        <div className="flex items-center gap-2">
          {privacyMode && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35">
              <Lock className="w-2.5 h-2.5" /> PROTECTED VIEW
            </span>
          )}

          <CiviqOneCardBadge status={privacyMode ? 'protected' : data.verificationStatus} />
        </div>
      </div>

      {/* 3. Center Body: Biometric Avatar & Citizen Details */}
      <div className="relative z-10 flex items-center gap-4 sm:gap-5 my-auto">
        {/* Biometric Avatar with Emerald Checkmark */}
        <div className="civiq-glass-photo-wrapper">
          {privacyMode ? (
            <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center text-center p-1 border border-white/10">
              <Lock className="w-5 h-5 text-amber-400 mb-0.5" />
              <span className="text-[7px] font-mono font-bold text-amber-300 tracking-wider uppercase">
                MASKED
              </span>
            </div>
          ) : data.photoUrl ? (
            <div className="w-full h-full rounded-[15px] overflow-hidden relative shadow-inner">
              <img
                src={data.photoUrl}
                alt={data.displayName}
                className="w-full h-full object-cover rounded-[15px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="w-full h-full rounded-[15px] bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xl font-serif font-bold text-slate-700 dark:text-slate-200">
              {data.displayName.charAt(0)}
            </div>
          )}

          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm ring-2 ring-white dark:ring-slate-900">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Citizen Information */}
        <div className="flex-1 min-w-0 space-y-1">
          <span className="text-[8.5px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold block">
            Digital Civic Identity
          </span>

          {/* Citizen Name: Editorial Serif */}
          <h2
            className="text-2xl sm:text-3xl font-serif tracking-tight text-slate-950 dark:text-white truncate leading-snug font-normal"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            {privacyMode ? 'Protected Citizen' : data.displayName}
          </h2>

          {/* Masked National ID: CIV-2048-••••-4821 */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-slate-700 dark:text-slate-300">
              {privacyMode ? 'CIV-••••-••••-••••' : data.maskedCitizenId}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Information: Verified Today, Credentials, Active Shares, Scan Preview */}
      <div className="relative z-10 pt-2.5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
        <div className="grid grid-cols-3 gap-3 sm:gap-6 text-xs font-mono">
          {/* Col 1: Verified Status */}
          <div>
            <p className="text-[7.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Verified Status
            </p>
            <p className="text-[10.5px] sm:text-[11.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified Today
            </p>
          </div>

          {/* Col 2: Credentials */}
          <div className="pl-2 sm:pl-3 border-l border-slate-200/80 dark:border-white/10">
            <p className="text-[7.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Credentials
            </p>
            <p className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-900 dark:text-white">
              {formattedCredentialsCount} Credentials
            </p>
          </div>

          {/* Col 3: Active Shares */}
          <div className="pl-2 sm:pl-3 border-l border-slate-200/80 dark:border-white/10">
            <p className="text-[7.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Active Shares
            </p>
            <p className="text-[10.5px] sm:text-[11.5px] font-bold text-violet-600 dark:text-violet-400">
              {data.activeShares} Active Shares
            </p>
          </div>
        </div>

        {/* Micro QR Preview with Reference */}
        <div className="flex items-center gap-2 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-[7.5px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">
              Scan Reference
            </p>
            <p className="text-[9.5px] font-mono font-bold text-violet-700 dark:text-violet-300">
              {data.verificationReference}
            </p>
          </div>
          <div className="relative p-1 rounded-lg bg-white/90 dark:bg-black/50 border border-slate-200 dark:border-white/15 shadow-sm">
            <CiviqOneCardQr variant="compact" value={data.verificationReference} />
          </div>
        </div>
      </div>
    </div>
  )
}
