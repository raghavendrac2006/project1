import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { governmentService } from '@/services/government.service'
import { ROUTES } from '@/constants/routes'
import { useTheme } from '@/hooks'
import {
  Landmark,
  Shield,
  Lock,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  MapPin,
  Building2,
  Globe2,
  Search,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Layers,
  HeartPulse,
  Truck,
  DollarSign,
  Sun,
  Moon,
  Scale,
  Award,
  BookOpen,
  FileCheck2,
  Clock,
  ShieldCheck,
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

interface TerritoryItem {
  name: string
  code: string
  capital: string
  type: 'State' | 'Union Territory'
  portalName: string
  zone: 'Northern' | 'Southern' | 'Western' | 'Eastern' | 'Central' | 'North-Eastern' | 'Island'
}

const ALL_JURISDICTIONS: TerritoryItem[] = [
  // 28 States
  { name: 'Andhra Pradesh', code: 'AP', capital: 'Amaravati', type: 'State', portalName: 'MeeSeva Portal', zone: 'Southern' },
  { name: 'Arunachal Pradesh', code: 'AR', capital: 'Itanagar', type: 'State', portalName: 'e-Service Arunachal', zone: 'North-Eastern' },
  { name: 'Assam', code: 'AS', capital: 'Dispur', type: 'State', portalName: 'Sewa Setu Assam', zone: 'North-Eastern' },
  { name: 'Bihar', code: 'BR', capital: 'Patna', type: 'State', portalName: 'RTPS Bihar Portal', zone: 'Eastern' },
  { name: 'Chhattisgarh', code: 'CG', capital: 'Raipur', type: 'State', portalName: 'e-District Chhattisgarh', zone: 'Central' },
  { name: 'Goa', code: 'GA', capital: 'Panaji', type: 'State', portalName: 'Goa Online Portal', zone: 'Western' },
  { name: 'Gujarat', code: 'GJ', capital: 'Gandhinagar', type: 'State', portalName: 'Digital Gujarat Portal', zone: 'Western' },
  { name: 'Haryana', code: 'HR', capital: 'Chandigarh', type: 'State', portalName: 'Antyodaya Saral Haryana', zone: 'Northern' },
  { name: 'Himachal Pradesh', code: 'HP', capital: 'Shimla', type: 'State', portalName: 'e-District Himachal', zone: 'Northern' },
  { name: 'Jharkhand', code: 'JH', capital: 'Ranchi', type: 'State', portalName: 'JharSewa Jharkhand', zone: 'Eastern' },
  { name: 'Karnataka', code: 'KA', capital: 'Bengaluru', type: 'State', portalName: 'Seva Sindhu Karnataka', zone: 'Southern' },
  { name: 'Kerala', code: 'KL', capital: 'Thiruvananthapuram', type: 'State', portalName: 'e-District Kerala', zone: 'Southern' },
  { name: 'Madhya Pradesh', code: 'MP', capital: 'Bhopal', type: 'State', portalName: 'MP e-District Lok Seva', zone: 'Central' },
  { name: 'Maharashtra', code: 'MH', capital: 'Mumbai', type: 'State', portalName: 'Aaple Sarkar Maharashtra', zone: 'Western' },
  { name: 'Manipur', code: 'MN', capital: 'Imphal', type: 'State', portalName: 'e-District Manipur', zone: 'North-Eastern' },
  { name: 'Meghalaya', code: 'ML', capital: 'Shillong', type: 'State', portalName: 'e-District Meghalaya', zone: 'North-Eastern' },
  { name: 'Mizoram', code: 'MZ', capital: 'Aizawl', type: 'State', portalName: 'Mizoram Citizen Portal', zone: 'North-Eastern' },
  { name: 'Nagaland', code: 'NL', capital: 'Kohima', type: 'State', portalName: 'e-District Nagaland', zone: 'North-Eastern' },
  { name: 'Odisha', code: 'OD', capital: 'Bhubaneswar', type: 'State', portalName: 'Odisha One Portal', zone: 'Eastern' },
  { name: 'Punjab', code: 'PB', capital: 'Chandigarh', type: 'State', portalName: 'Sewa Kendra Punjab', zone: 'Northern' },
  { name: 'Rajasthan', code: 'RJ', capital: 'Jaipur', type: 'State', portalName: 'e-Mitra Rajasthan', zone: 'Northern' },
  { name: 'Sikkim', code: 'SK', capital: 'Gangtok', type: 'State', portalName: 'Sikkim Citizen Service Portal', zone: 'North-Eastern' },
  { name: 'Tamil Nadu', code: 'TN', capital: 'Chennai', type: 'State', portalName: 'TNeGA e-Sevai Tamil Nadu', zone: 'Southern' },
  { name: 'Telangana', code: 'TS', capital: 'Hyderabad', type: 'State', portalName: 'MeeSeva 2.0 Telangana', zone: 'Southern' },
  { name: 'Tripura', code: 'TR', capital: 'Agartala', type: 'State', portalName: 'e-District Tripura', zone: 'North-Eastern' },
  { name: 'Uttar Pradesh', code: 'UP', capital: 'Lucknow', type: 'State', portalName: 'e-District Uttar Pradesh', zone: 'Northern' },
  { name: 'Uttarakhand', code: 'UK', capital: 'Dehradun', type: 'State', portalName: 'e-District Uttarakhand', zone: 'Northern' },
  { name: 'West Bengal', code: 'WB', capital: 'Kolkata', type: 'State', portalName: 'Duare Sarkar & e-District WB', zone: 'Eastern' },

  // 8 Union Territories
  { name: 'Andaman and Nicobar Islands', code: 'AN', capital: 'Port Blair', type: 'Union Territory', portalName: 'e-District Andaman', zone: 'Island' },
  { name: 'Chandigarh', code: 'CH', capital: 'Chandigarh', type: 'Union Territory', portalName: 'e-JanSampark Chandigarh', zone: 'Northern' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DH', capital: 'Daman', type: 'Union Territory', portalName: 'e-Sugam Citizen Portal', zone: 'Western' },
  { name: 'Delhi (NCT)', code: 'DL', capital: 'New Delhi', type: 'Union Territory', portalName: 'e-District Delhi NCT', zone: 'Northern' },
  { name: 'Jammu and Kashmir', code: 'JK', capital: 'Srinagar / Jammu', type: 'Union Territory', portalName: 'e-UNNAT J&K Portal', zone: 'Northern' },
  { name: 'Ladakh', code: 'LA', capital: 'Leh', type: 'Union Territory', portalName: 'e-District UT Ladakh', zone: 'Northern' },
  { name: 'Lakshadweep', code: 'LD', capital: 'Kavaratti', type: 'Union Territory', portalName: 'Lakshadweep Service Portal', zone: 'Island' },
  { name: 'Puducherry', code: 'PY', capital: 'Puducherry', type: 'Union Territory', portalName: 'e-District Puducherry', zone: 'Southern' },
]

export interface OfficialDepartmentLogin {
  deptId: string
  deptCode: string
  deptName: string
  ministry: string
  officerName: string
  designation: string
  email: string
  badgeId: string
  scope: string
  statutoryAct: string
  avgSlaDays: number
  complianceRate: number
  keySchemes: string[]
  icon: any
  tagColor: string
}

export const OFFICIAL_DEPARTMENT_LOGINS: OfficialDepartmentLogin[] = [
  {
    deptId: 'dept_transport',
    deptCode: 'MORTH-KA',
    deptName: 'Ministry of Road Transport & Highways',
    ministry: 'Road Transport & Highways',
    officerName: 'Shri Rajiv Patel',
    designation: 'Joint Commissioner & Transport Controller',
    email: 'rajiv.patel@transport.gov.in',
    badgeId: 'GOV-OFF-2024-8841',
    scope: 'Karnataka RTOs (KA-01 to KA-71) & Central MoRTH',
    statutoryAct: 'Motor Vehicles Act, 1988 & Central Motor Vehicles Rules, 1989',
    avgSlaDays: 3,
    complianceRate: 98.4,
    keySchemes: ['Sarathi Driving License Renewal', 'Vahan Motor Vehicle RC', 'Commercial All-India Tourist Permit', 'HSRP High Security Plates'],
    icon: Truck,
    tagColor: 'blue',
  },
  {
    deptId: 'dept_revenue',
    deptCode: 'REV-BLR',
    deptName: 'Department of Revenue & Land Records',
    ministry: 'State Revenue Department',
    officerName: 'Sunita Desai',
    designation: 'District Magistrate & Sub-Registrar',
    email: 'sunita.desai@revenue.gov.in',
    badgeId: 'GOV-OFF-2023-1104',
    scope: 'Bengaluru Urban & Rural Revenue Divisions',
    statutoryAct: 'Karnataka Land Revenue Act, 1964 & Indian Registration Act, 1908',
    avgSlaDays: 5,
    complianceRate: 96.8,
    keySchemes: ['Bhoomi Land Records (RTC/Pahani)', 'E-Khata Property Mutation', 'Caste & Income Certificate', 'Encumbrance Certificate (Form 15)'],
    icon: MapPin,
    tagColor: 'amber',
  },
  {
    deptId: 'dept_health',
    deptCode: 'MOHFW-NHA',
    deptName: 'Ministry of Health & Family Welfare',
    ministry: 'Health & Family Welfare / NHA',
    officerName: 'Dr. Ramesh Gupta',
    designation: 'Chief Health Commissioner & NHA Director',
    email: 'ramesh.gupta@health.gov.in',
    badgeId: 'GOV-NHA-2023-4412',
    scope: 'All 36 States & UTs (National Health Grid)',
    statutoryAct: 'Ayushman Bharat PM-JAY Operational Guidelines & ABDM',
    avgSlaDays: 2,
    complianceRate: 99.1,
    keySchemes: ['Ayushman Bharat PM-JAY (₹5L Cashless)', 'ABHA Digital Health Account ID', 'CGHS Dispensary Network'],
    icon: HeartPulse,
    tagColor: 'rose',
  },
  {
    deptId: 'dept_finance',
    deptCode: 'MOF-CBDT',
    deptName: 'Ministry of Finance & Revenue',
    ministry: 'Ministry of Finance (CBDT / CBIC)',
    officerName: 'Meenakshi Sundaram',
    designation: 'Revenue Commissioner (Direct Taxes & MSME)',
    email: 'meenakshi.s@incometax.gov.in',
    badgeId: 'GOV-MOF-2022-7789',
    scope: 'Central Tax Jurisdiction (Pan-India)',
    statutoryAct: 'Income-tax Act, 1961, CGST Act, 2017 & MSMED Act',
    avgSlaDays: 4,
    complianceRate: 98.9,
    keySchemes: ['Permanent Account Number (PAN) Form 49A', 'Income Tax Return (ITR-1/4)', 'GST Registration & Filings', 'Udyam MSME Registration'],
    icon: DollarSign,
    tagColor: 'teal',
  },
  {
    deptId: 'dept_meity',
    deptCode: 'MEITY-UIDAI',
    deptName: 'Ministry of Electronics & IT',
    ministry: 'Electronics and Information Technology',
    officerName: 'Alok Verma',
    designation: 'Director General (UIDAI & Digital Infrastructure)',
    email: 'alok.verma@meity.gov.in',
    badgeId: 'GOV-UIDAI-2021-9921',
    scope: 'Central Identity Data Repository (CIDR Pan-India)',
    statutoryAct: 'Aadhaar Act, 2016 & Digital Personal Data Protection Act, 2023',
    avgSlaDays: 2,
    complianceRate: 99.5,
    keySchemes: ['Aadhaar Enrollment & e-KYC', 'DigiLocker Digital Credential Issuance', 'APAAR Automated Permanent Academic Account'],
    icon: Landmark,
    tagColor: 'emerald',
  },
  {
    deptId: 'dept_agri',
    deptCode: 'MOAFW-AGRI',
    deptName: 'Ministry of Agriculture & Farmers Welfare',
    ministry: 'Agriculture & Farmers Welfare',
    officerName: 'Baldev Singh',
    designation: 'Agriculture Direct Benefit Transfer Controller',
    email: 'baldev.singh@agri.gov.in',
    badgeId: 'GOV-AGRI-2024-3321',
    scope: 'National Agriculture DBT Grid (110M+ Farmers)',
    statutoryAct: 'PM-Kisan Operational Guidelines & PMFBY Rules',
    avgSlaDays: 4,
    complianceRate: 97.2,
    keySchemes: ['PM-Kisan Samman Nidhi (₹6,000/yr)', 'PM Fasal Bima Yojana (Crop Insurance)'],
    icon: Sun,
    tagColor: 'green',
  },
  {
    deptId: 'dept_energy',
    deptCode: 'MNRE-SOLAR',
    deptName: 'Ministry of New & Renewable Energy',
    ministry: 'New & Renewable Energy',
    officerName: 'Priya Sharma',
    designation: 'Solar Mission Project Director',
    email: 'priya.sharma@mnre.gov.in',
    badgeId: 'GOV-MNRE-2023-8812',
    scope: 'National Solar Grid & State DISCOM Networks',
    statutoryAct: 'Electricity Act, 2003 & National Solar Mission Directives',
    avgSlaDays: 6,
    complianceRate: 95.8,
    keySchemes: ['PM Surya Ghar: Muft Bijli Rooftop Solar Subsidy', 'National Solar Net-Metering Grid Interconnect'],
    icon: Sun,
    tagColor: 'orange',
  },
  {
    deptId: 'dept_food',
    deptCode: 'DFPD-FOOD',
    deptName: 'Department of Food & Public Distribution',
    ministry: 'Consumer Affairs, Food & Public Distribution',
    officerName: 'S. K. Mukherjee',
    designation: 'National PDS Controller (ONORC Grid)',
    email: 'sk.mukherjee@food.gov.in',
    badgeId: 'GOV-DFPD-2022-5501',
    scope: 'Pan-India 5.4 Lakh Fair Price Shops Network',
    statutoryAct: 'National Food Security Act (NFSA), 2013 & TPDS Order',
    avgSlaDays: 3,
    complianceRate: 98.0,
    keySchemes: ['One Nation One Ration Card (ONORC)', 'NFSA Priority Foodgrain Entitlement'],
    icon: Briefcase,
    tagColor: 'yellow',
  },
  {
    deptId: 'dept_labour',
    deptCode: 'MOLE-EPFO',
    deptName: 'Ministry of Labour & Employment',
    ministry: 'Labour & Employment / EPFO',
    officerName: 'Vikram Seth',
    designation: 'Regional Provident Fund Commissioner',
    email: 'vikram.seth@epfo.gov.in',
    badgeId: 'GOV-EPFO-2023-6623',
    scope: 'National Social Security & Regional EPFO Offices',
    statutoryAct: "Employees' Provident Funds Act, 1952 & Unorganized Workers Act",
    avgSlaDays: 4,
    complianceRate: 97.6,
    keySchemes: ['Universal Account Number (UAN) PF Claim', 'e-Shram National Unorganized Worker Card'],
    icon: Scale,
    tagColor: 'indigo',
  },
  {
    deptId: 'dept_municipal',
    deptCode: 'BBMP-CIVIC',
    deptName: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    ministry: 'Urban Development Directorate',
    officerName: 'K. N. Suresh',
    designation: 'Chief Municipal Revenue Officer',
    email: 'suresh.kn@bbmp.gov.in',
    badgeId: 'GOV-BBMP-2024-1190',
    scope: 'Bengaluru Metropolitan Corporation (8 Zones)',
    statutoryAct: 'Karnataka Municipal Corporations Act, 1976',
    avgSlaDays: 5,
    complianceRate: 96.2,
    keySchemes: ['Municipal Property Tax SAS & Khata', 'Trade License & Health NOC', 'Birth & Death Civil Registration'],
    icon: Building2,
    tagColor: 'cyan',
  },
  {
    deptId: 'dept_pan_india',
    deptCode: 'NIC-CPGRAMS',
    deptName: 'Department of Administrative Reforms & Grievances',
    ministry: 'Personnel, Public Grievances and Pensions',
    officerName: 'Dr. Anand V. Vardhan, IAS',
    designation: 'Secretary (Public Grievances & Coordination)',
    email: 'anand.vardhan@nic.in',
    badgeId: 'GOV-DIR-2022-0001',
    scope: 'Central Secretariat & Inter-State Coordination',
    statutoryAct: 'Right to Public Services & DARPG Guidelines',
    avgSlaDays: 5,
    complianceRate: 96.5,
    keySchemes: ['CPGRAMS Central Grievance Escalation', 'Inter-State Gazette Compliance Review'],
    icon: ShieldCheck,
    tagColor: 'purple',
  },
]

export function GovernmentLoginPage() {
  const navigate = useNavigate()
  const [selectedDeptId, setSelectedDeptId] = useState('dept_transport')
  const [email, setEmail] = useState('rajiv.patel@transport.gov.in')
  const [password, setPassword] = useState('GovSecure#2026')
  const [hardwareDsc, setHardwareDsc] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Showcase state
  const [activeTab, setActiveTab] = useState<'departments' | 'territories' | 'isolation'>('departments')
  const [territoryTypeFilter, setTerritoryTypeFilter] = useState<'all' | 'State' | 'Union Territory'>('all')
  const [territorySearch, setTerritorySearch] = useState('')
  const [deptSearch, setDeptSearch] = useState('')

  const handleDeptSelect = (deptId: string) => {
    const found = OFFICIAL_DEPARTMENT_LOGINS.find((d) => d.deptId === deptId)
    if (found) {
      setSelectedDeptId(found.deptId)
      setEmail(found.email)
      setError(null)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await governmentService.login(email)
      navigate(ROUTES.GOVERNMENT.DASHBOARD)
    } catch {
      setError('Invalid officer credentials or access token expired.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (officerEmail: string, deptId: string) => {
    setEmail(officerEmail)
    setSelectedDeptId(deptId)
    setLoading(true)
    setError(null)
    try {
      await governmentService.login(officerEmail)
      navigate(ROUTES.GOVERNMENT.DASHBOARD)
    } catch {
      setError('Quick login failed')
    } finally {
      setLoading(false)
    }
  }

  const filteredTerritories = ALL_JURISDICTIONS.filter((t) => {
    const matchesType = territoryTypeFilter === 'all' || t.type === territoryTypeFilter
    const matchesSearch =
      t.name.toLowerCase().includes(territorySearch.toLowerCase()) ||
      t.capital.toLowerCase().includes(territorySearch.toLowerCase()) ||
      t.code.toLowerCase().includes(territorySearch.toLowerCase()) ||
      t.portalName.toLowerCase().includes(territorySearch.toLowerCase())
    return matchesType && matchesSearch
  })

  const filteredDepts = OFFICIAL_DEPARTMENT_LOGINS.filter((d) => {
    const q = deptSearch.toLowerCase()
    return (
      d.deptName.toLowerCase().includes(q) ||
      d.deptCode.toLowerCase().includes(q) ||
      d.officerName.toLowerCase().includes(q) ||
      d.ministry.toLowerCase().includes(q) ||
      d.statutoryAct.toLowerCase().includes(q)
    )
  })

  const currentSelectedDept = OFFICIAL_DEPARTMENT_LOGINS.find((d) => d.deptId === selectedDeptId) || OFFICIAL_DEPARTMENT_LOGINS[0]
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans transition-colors duration-200">
      {/* Background decorative subtle glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.06),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top National Header Bar */}
      <header className="relative z-20 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/85 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <Link to={ROUTES.ROOT} className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800 p-1.5 shrink-0 group-hover:scale-105 transition-transform">
              <img src="/civiqone-icon.png" alt="CiviQone" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight font-display">
                  Civi<span className="text-[#E11D48]">Q</span>one<span className="text-blue-600 dark:text-blue-400 font-black ml-1.5 text-xs px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">GOV</span> Secretariat
                </span>
                <Badge variant="outline" className="hidden sm:inline-flex text-[10px] text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/50 font-semibold">
                  Department Isolation Gateway
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Unique Statutory Desks · 11 Dedicated Ministries · 28 States & 8 Union Territories
              </p>
            </div>
          </Link>
        </div>

        {/* National Stats Strip & Theme Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] flex items-center gap-1.5 shrink-0 shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-500 dark:text-slate-400">Desks:</span>
            <strong className="text-blue-700 dark:text-blue-300 font-mono">11 Departments</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] flex items-center gap-1.5 shrink-0 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-500 dark:text-slate-400">Data Isolation:</span>
            <strong className="text-emerald-700 dark:text-emerald-300 font-mono">100% Partitioned</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] flex items-center gap-1.5 shrink-0 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-slate-500 dark:text-slate-400">Scope:</span>
            <strong className="text-amber-700 dark:text-amber-300 font-mono">28 States · 8 UTs</strong>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs ml-1 shrink-0"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          <Link
            to={ROUTES.ROOT}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
            title="Return to Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content: Split Screen Layout */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* LEFT COLUMN: Department Showcase & Isolation Architecture */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider shadow-xs">
              <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Sovereign Department-Isolated Governance Desks
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight font-display">
              Official Department Portals <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400">
                Independent Desks · Strict Data Isolation
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Every Government Department operates as an isolated statutory unit. When you log in as an officer, you access exclusively your department&apos;s schemes, case files, verification queue, and SLA metrics. No cross-departmental data is merged.
            </p>
          </div>

          {/* Interactive Showcase Navigator Tabs */}
          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm dark:shadow-xl flex-1 flex flex-col transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('departments')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'departments'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>11 Unique Departments</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('territories')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'territories'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>28 States & 8 UTs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('isolation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'isolation'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Statutory Architecture</span>
                </button>
              </div>

              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                Zero Inter-Dept Data Leakage
              </span>
            </div>

            {/* TAB 1: 11 Unique Departments List & 1-Click Launchers */}
            {activeTab === 'departments' && (
              <div className="mt-4 space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Click any department below to inspect its unique mandate or log in directly:
                  </p>
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search departments, acts..."
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Departments Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredDepts.map((dept) => {
                    const IconComp = dept.icon
                    const isSelected = selectedDeptId === dept.deptId
                    return (
                      <div
                        key={dept.deptId}
                        onClick={() => handleDeptSelect(dept.deptId)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-600 shadow-sm ring-1 ring-blue-500/50'
                            : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-blue-400 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 dark:text-slate-200 text-xs truncate block">
                                  {dept.deptName}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                                  {dept.officerName} · {dept.designation}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="font-mono text-[9px] px-1.5 py-0.5 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 shrink-0"
                            >
                              {dept.deptCode}
                            </Badge>
                          </div>

                          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-serif italic line-clamp-1 mt-1">
                            &quot;{dept.statutoryAct}&quot;
                          </p>

                          <div className="mt-2.5 space-y-1">
                            {dept.keySchemes.slice(0, 2).map((scheme, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                                <span className="truncate">{scheme}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 dark:text-slate-400">
                            SLA: <strong className="text-blue-700 dark:text-blue-300 font-mono">{dept.avgSlaDays} Days</strong> · Comp: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{dept.complianceRate}%</strong>
                          </span>
                          <Button
                            size="sm"
                            variant={isSelected ? 'primary' : 'outline'}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuickLogin(dept.email, dept.deptId)
                            }}
                            className="h-6 px-2.5 text-[10px] bg-blue-700 hover:bg-blue-800 text-white shadow-xs"
                          >
                            Log In Desk <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Showing {filteredDepts.length} autonomous departments</span>
                  <span className="text-blue-700 dark:text-blue-400 font-medium">Click any card to select for sign-in</span>
                </div>
              </div>
            )}

            {/* TAB 2: 28 States & 8 Union Territories */}
            {activeTab === 'territories' && (
              <div className="mt-4 space-y-3 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTerritoryTypeFilter('all')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        territoryTypeFilter === 'all'
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      All 36
                    </button>
                    <button
                      type="button"
                      onClick={() => setTerritoryTypeFilter('State')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        territoryTypeFilter === 'State'
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      28 States
                    </button>
                    <button
                      type="button"
                      onClick={() => setTerritoryTypeFilter('Union Territory')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        territoryTypeFilter === 'Union Territory'
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/50'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      8 Union Territories
                    </button>
                  </div>

                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search state, capital, portal..."
                      value={territorySearch}
                      onChange={(e) => setTerritorySearch(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {filteredTerritories.map((item) => (
                    <div
                      key={item.code}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-blue-400 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-all text-xs flex flex-col justify-between group shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="truncate">
                          <span className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 truncate block">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                            Capital: {item.capital}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`font-mono text-[9px] shrink-0 ${
                            item.type === 'State'
                              ? 'text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30'
                              : 'text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/30'
                          }`}
                        >
                          {item.code}
                        </Badge>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="truncate">{item.portalName}</span>
                        <span className="text-[9px] text-slate-400 shrink-0">{item.zone}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Displaying {filteredTerritories.length} state & UT jurisdictions</span>
                  <span className="text-blue-700 dark:text-blue-400 font-medium">Interoperable National Service Grid</span>
                </div>
              </div>
            )}

            {/* TAB 3: Department Data Isolation Architecture */}
            {activeTab === 'isolation' && (
              <div className="mt-4 space-y-4 text-xs text-slate-700 dark:text-slate-300 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-700 flex items-center justify-center text-blue-700 dark:text-blue-400 mb-2">
                      <Lock className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Strict Workspace Siloing</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Each department has a dedicated data scope. An officer logged in under Transport (MORTH-KA) sees ONLY Transport schemes and vehicle applications.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-700 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-2">
                      <Scale className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Autonomous Gazette Desks</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Schemes gazetted by Revenue (Bhoomi, RTC) never bleed into Health (PM-JAY) or UIDAI (Aadhaar). Every department governs its own catalog.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-2">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Independent SLAs & Audits</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      SLA turnaround timers, biometric verification scores, and compliance metrics are isolated per ministry under the Allocation of Business Rules.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-2">
                  <h4 className="font-bold text-blue-900 dark:text-blue-300 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    Government of India Allocation of Business Rules Mandate
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Statutory powers are conferred directly upon each administrative Ministry. All citizen records, application dossiers, and verification decisions are cryptographically partitioned and signed by the designated Department Controller.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Constitutional Authority: Article 77(3) & NeGP 2.0 Directives</span>
                  <span className="text-blue-700 dark:text-blue-400 font-medium">100% Zero-Trust Data Isolation</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Officer Authentication Console */}
        <div className="w-full lg:w-[440px] shrink-0 flex flex-col justify-center">
          <div className="bg-white dark:bg-slate-900/95 backdrop-blur-md py-7 px-6 sm:px-8 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 relative transition-colors">
            <div className="mb-5 text-center">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 flex items-center justify-center text-white mx-auto shadow-md border border-blue-400/30 mb-2">
                <Landmark className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight font-display">
                Department Officer Sign-In
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Authenticating into <span className="text-blue-700 dark:text-blue-400 font-bold">{currentSelectedDept.deptCode}</span> Desk
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-3.5" onSubmit={handleLogin}>
              {/* Department Dropdown Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Department Desk
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => handleDeptSelect(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-950/90 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {OFFICIAL_DEPARTMENT_LOGINS.map((dept) => (
                    <option key={dept.deptId} value={dept.deptId}>
                      [{dept.deptCode}] {dept.deptName}
                    </option>
                  ))}
                </select>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-0.5">
                  <span className="truncate">{currentSelectedDept.officerName}</span>
                  <span className="text-blue-700 dark:text-blue-400 font-mono font-bold">{currentSelectedDept.badgeId}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Official GovID / NIC Email
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer.name@gov.in"
                  className="bg-slate-50 dark:bg-slate-950/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 text-xs h-10"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Security Passphrase / Token PIN
                  </label>
                  <span className="text-[11px] text-blue-700 dark:text-blue-400 hover:underline cursor-pointer font-medium">
                    Hardware DSC?
                  </span>
                </div>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 text-xs h-10"
                />
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="dscCheck"
                  checked={hardwareDsc}
                  onChange={(e) => setHardwareDsc(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                <label htmlFor="dscCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Authenticate via PKI Smart Card / USB Token
                </label>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-300 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-700 dark:text-blue-400" />
                <span>
                  Logging into {currentSelectedDept.deptName} with isolated statutory jurisdiction.
                </span>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 shadow-md shadow-blue-700/30 text-xs"
              >
                {loading ? 'Validating Department Access...' : `Sign In to ${currentSelectedDept.deptCode} Secretariat`}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Quick 1-Click Logins for All 11 Unique Departments */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Direct Department Desks (11 Unique)
                </p>
                <span className="text-[10px] text-blue-700 dark:text-blue-400 font-mono font-bold">1-Click Sign-In</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {OFFICIAL_DEPARTMENT_LOGINS.map((dept) => {
                  const isCurrent = selectedDeptId === dept.deptId
                  return (
                    <button
                      key={dept.deptId}
                      type="button"
                      onClick={() => handleQuickLogin(dept.email, dept.deptId)}
                      className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between text-xs group ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-300'
                          : 'bg-slate-50/70 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 text-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-700 dark:text-blue-400 font-bold shrink-0">
                            {dept.deptCode}
                          </span>
                          <span className="font-bold text-xs truncate">
                            {dept.officerName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                          {dept.deptName}
                        </span>
                      </div>
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-500 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
            Official Secrets Act 1923 · DPDP Act 2023 · Cyber Defense Tier-IV
          </p>
        </div>
      </main>

      {/* Sovereign Footer */}
      <footer className="relative z-20 border-t border-slate-200 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 px-4 sm:px-8 py-3 text-center text-[11px] text-slate-500 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors">
        <span>© 2026 National Portal of India · National Informatics Centre (NIC)</span>
        <span>Secretariat Level-4 Air-Gapped Security Profile</span>
      </footer>
    </div>
  )
}
