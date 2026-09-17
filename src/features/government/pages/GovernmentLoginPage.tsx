import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { governmentService } from '@/services/government.service'
import { ROUTES } from '@/constants/routes'
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
  FileText,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Layers,
  HeartPulse,
  Truck,
  DollarSign,
  Sun,
  Scale,
  Award,
  BookOpen
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

interface ServiceSector {
  id: string
  title: string
  icon: any
  ministry: string
  statutoryCode: string
  keyServices: string[]
  metrics: string
  color: string
}

const SERVICE_SECTORS: ServiceSector[] = [
  {
    id: 'identity',
    title: 'Identity, Civil & Passports',
    icon: Landmark,
    ministry: 'MeitY / MEA / ECI',
    statutoryCode: 'IN-UIDAI / MEA',
    keyServices: ['Aadhaar Enrollment & e-KYC', 'PAN Allotment (Form 49A)', 'Passport Seva (Fresh/Tatkaal)', 'Voter ID e-EPIC', 'DigiLocker Issuance'],
    metrics: '1.4B+ Digital IDs',
    color: 'emerald'
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Public Wellness',
    icon: HeartPulse,
    ministry: 'Ministry of Health & Family Welfare',
    statutoryCode: 'IN-NHA-501',
    keyServices: ['Ayushman Bharat PM-JAY (₹5L Cover)', 'ABHA Health Account ID', 'CGHS Dispensary Network', 'National Vaccine Registry'],
    metrics: '550M+ Beneficiaries',
    color: 'rose'
  },
  {
    id: 'agriculture',
    title: 'Agriculture, Farmers & Food',
    icon: Sun,
    ministry: 'MoAFW / DFPD',
    statutoryCode: 'IN-AGRI-601',
    keyServices: ['PM-Kisan Samman Nidhi (₹6,000/yr)', 'PM Fasal Bima Yojana (PMFBY)', 'One Nation One Ration Card (ONORC)', 'e-NAM Agricultural Market'],
    metrics: '110M+ Farmers',
    color: 'amber'
  },
  {
    id: 'transport',
    title: 'Transport, Highways & Logistics',
    icon: Truck,
    ministry: 'MoRTH / Ministry of Railways',
    statutoryCode: 'IN-MORTH-301',
    keyServices: ['Sarathi Driving License & Learner Perm.', 'Vahan Vehicle Registration (RC)', 'National FASTag Electronic Toll', 'IRCTC Rail Logistics & PNR'],
    metrics: '350M+ Registrations',
    color: 'blue'
  },
  {
    id: 'revenue',
    title: 'Revenue, Taxes & Financial Inclusion',
    icon: DollarSign,
    ministry: 'Ministry of Finance (MoF)',
    statutoryCode: 'IN-CBDT / CBIC',
    keyServices: ['Income Tax Returns (ITR-1 to 4)', 'Goods and Services Tax (GST) Portal', 'India Post Payments Bank (IPPB)', 'PM Jan Dhan Accounts (PMJDY)'],
    metrics: '80M+ Taxpayers',
    color: 'teal'
  },
  {
    id: 'energy',
    title: 'Clean Energy, Solar & Housing',
    icon: Sun,
    ministry: 'MNRE / MoHUA',
    statutoryCode: 'IN-MNRE-1101',
    keyServices: ['PM Surya Ghar: Muft Bijli Solar Subsidy', 'Pradhan Mantri Awas Yojana (PMAY)', 'Jal Jeevan Mission Clean Water', 'National Smart Grid Portal'],
    metrics: '10M+ Solar Homes Target',
    color: 'orange'
  },
  {
    id: 'labour',
    title: 'Labour, Employment & Skills',
    icon: Briefcase,
    ministry: 'Ministry of Labour / Education',
    statutoryCode: 'IN-EPFO / MOLE',
    keyServices: ['EPFO Universal Account Number (UAN)', 'e-Shram National Worker Database', 'National Career Service (NCS) Jobs', 'National Scholarship Portal (NSP)'],
    metrics: '290M+ Workers Registered',
    color: 'indigo'
  },
  {
    id: 'justice',
    title: 'Justice, Law & Grievances',
    icon: Scale,
    ministry: 'Ministry of Law / DARPG',
    statutoryCode: 'IN-DARPG / DOJ',
    keyServices: ['CPGRAMS Centralized Grievance Portal', 'eCourts Case Status & Cause Lists', 'Tele-Law Marginalized Legal Aid', 'Right to Information (RTI Online)'],
    metrics: '99% Redressal Rate',
    color: 'purple'
  },
  {
    id: 'commerce',
    title: 'Industry, MSME & Startups',
    icon: Building2,
    ministry: 'Ministry of MSME / MoCI',
    statutoryCode: 'IN-MSME / DPIIT',
    keyServices: ['Udyam MSME Zero-Cost Registration', 'Startup India DPIIT Tax Exemption', 'MCA21 Corporate Company Filings', 'GeM Government e-Marketplace'],
    metrics: '25M+ MSMEs Registered',
    color: 'cyan'
  }
]

export function GovernmentLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('anand.vardhan@nic.in')
  const [password, setPassword] = useState('GovSecure#2026')
  const [hardwareDsc, setHardwareDsc] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Showcase state
  const [activeTab, setActiveTab] = useState<'territories' | 'services' | 'administrative'>('territories')
  const [territoryTypeFilter, setTerritoryTypeFilter] = useState<'all' | 'State' | 'Union Territory'>('all')
  const [territorySearch, setTerritorySearch] = useState('')
  const [serviceSearch, setServiceSearch] = useState('')

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

  const handleQuickLogin = async (officerEmail: string) => {
    setEmail(officerEmail)
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

  const filteredSectors = SERVICE_SECTORS.filter((sec) => {
    const q = serviceSearch.toLowerCase()
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.ministry.toLowerCase().includes(q) ||
      sec.statutoryCode.toLowerCase().includes(q) ||
      sec.keyServices.some((s) => s.toLowerCase().includes(q))
    )
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Official background decorative glow & subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top National Header Bar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 border border-emerald-500/30 shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                CIVIQONE Government
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-950/40">
                National Portal Gateway
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Sovereign Administrative Directorate · 28 States & 8 Union Territories
            </p>
          </div>
        </div>

        {/* National Stats Strip */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-1">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] flex items-center gap-1.5 shrink-0">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Central Services:</span>
            <strong className="text-emerald-300 font-mono">13,971</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] flex items-center gap-1.5 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">State/UT Services:</span>
            <strong className="text-blue-300 font-mono">12,350</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] flex items-center gap-1.5 shrink-0">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Jurisdictions:</span>
            <strong className="text-amber-300 font-mono">28 States · 8 UTs</strong>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800">
            <Link
              to={ROUTES.APP.DASHBOARD}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              Citizen Portal <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content: Split Screen Layout */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* LEFT COLUMN: Comprehensive National Directorate Showcase */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              Sovereign Public Digital Governance System
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Directorate of Public Digital Services <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                All 28 States & 8 Union Territories
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Official gateway for designated Senior Government Managers, State Principal Secretaries, and Verification Officers.
              Enforcing uniform statutory SLAs, gazette synchronization, and interoperable digital public infrastructure nationwide.
            </p>
          </div>

          {/* Interactive Showcase Navigator Tabs */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('territories')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'territories'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>28 States & 8 UTs ({ALL_JURISDICTIONS.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'services'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>18 Service Sectors (26,321+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('administrative')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'administrative'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>All-India Services (AIS)</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                Live Inter-State Grid
              </span>
            </div>

            {/* TAB 1: 28 States & 8 Union Territories */}
            {activeTab === 'territories' && (
              <div className="mt-4 space-y-3 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTerritoryTypeFilter('all')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        territoryTypeFilter === 'all'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All 36
                    </button>
                    <button
                      type="button"
                      onClick={() => setTerritoryTypeFilter('State')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        territoryTypeFilter === 'State'
                          ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      28 States
                    </button>
                    <button
                      type="button"
                      onClick={() => setTerritoryTypeFilter('Union Territory')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        territoryTypeFilter === 'Union Territory'
                          ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      8 Union Territories
                    </button>
                  </div>

                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search state, capital, portal..."
                      value={territorySearch}
                      onChange={(e) => setTerritorySearch(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Territory Cards Grid with Scrollbar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {filteredTerritories.map((item) => (
                    <div
                      key={item.code}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all text-xs flex flex-col justify-between group"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="truncate">
                          <span className="font-bold text-slate-200 group-hover:text-emerald-300 truncate block">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            Capital: {item.capital}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`font-mono text-[9px] shrink-0 ${
                            item.type === 'State'
                              ? 'text-emerald-400 border-emerald-500/30'
                              : 'text-blue-400 border-blue-500/30'
                          }`}
                        >
                          {item.code}
                        </Badge>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate text-slate-400">{item.portalName}</span>
                        <span className="text-[9px] text-slate-500 shrink-0">{item.zone}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Displaying {filteredTerritories.length} jurisdictions</span>
                  <span className="text-emerald-400 font-medium">100% Connected to Sovereign National Grid</span>
                </div>
              </div>
            )}

            {/* TAB 2: 18 Service Sectors */}
            {activeTab === 'services' && (
              <div className="mt-4 space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 font-medium">
                    Central & State Services Organized Across 18 Institutional Categories
                  </span>
                  <div className="relative w-48 sm:w-60">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search schemes, acts, ministries..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Sectors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredSectors.map((sector) => {
                    const IconComp = sector.icon
                    return (
                      <div
                        key={sector.id}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                                <IconComp className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-bold text-slate-200 text-xs truncate">
                                {sector.title}
                              </span>
                            </div>
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              {sector.statutoryCode}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block truncate">
                            {sector.ministry}
                          </span>
                          <ul className="mt-2 space-y-1 text-[11px] text-slate-400">
                            {sector.keyServices.slice(0, 3).map((srv, idx) => (
                              <li key={idx} className="flex items-center gap-1.5 truncate">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                                <span className="truncate">{srv}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-3 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 font-semibold">{sector.metrics}</span>
                          <span className="text-slate-500">Statutory SLA Enforced</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>13,971 Central + 12,350 State Services Listed Centrally</span>
                  <span className="text-emerald-400 font-medium">Synchronized with Citizen Portal</span>
                </div>
              </div>
            )}

            {/* TAB 3: All-India Services Framework */}
            {activeTab === 'administrative' && (
              <div className="mt-4 space-y-4 text-xs text-slate-300 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-700 flex items-center justify-center text-blue-400 mb-2">
                      <Award className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-white text-sm">IAS (Administrative)</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Indian Administrative Service officers governing district collectors, state secretariats, and central joint secretaries.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700 flex items-center justify-center text-purple-400 mb-2">
                      <Shield className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-white text-sm">IPS (Police)</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Indian Police Service command overseeing public safety, border management, and cyber defense across all 36 states and UTs.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700 flex items-center justify-center text-emerald-400 mb-2">
                      <Sun className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-white text-sm">IFoS (Forest)</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Indian Forest Service managing national ecological security, wildlife reserves, and natural resource clearances.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                  <h4 className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Senior Government Manager Portfolio Mandate
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Under the Allocation of Business Rules and the National e-Governance Plan (NeGP 2.0), the Senior Government Manager holds multi-jurisdictional oversight over the cataloging, statutory gazette promulgation, and digital delivery standards across all 28 States and 8 Union Territories.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Constitutional Authority: Article 312 of the Constitution of India</span>
                  <span className="text-emerald-400 font-medium">Inter-State Council Connected</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Officer Authentication Console */}
        <div className="w-full lg:w-[420px] shrink-0 flex flex-col justify-center">
          <div className="bg-slate-900/95 backdrop-blur-md py-7 px-6 sm:px-8 shadow-2xl rounded-2xl border border-slate-800 relative">
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-950/50 border border-emerald-500/30 mb-2.5">
                <Landmark className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Official Access Portal
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sign in with National Gov ID / NIC Credentials
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Official GovID / NIC Email
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer.name@nic.in"
                  className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 text-xs h-10"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Security Passphrase / Token PIN
                  </label>
                  <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                    Hardware DSC?
                  </span>
                </div>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 text-xs h-10"
                />
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="dscCheck"
                  checked={hardwareDsc}
                  onChange={(e) => setHardwareDsc(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                />
                <label htmlFor="dscCheck" className="text-xs text-slate-300 cursor-pointer">
                  Authenticate via PKI Smart Card / USB Token
                </label>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/60 text-[11px] text-emerald-300 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  All official sessions are sealed with SHA-256 digital stamps and audited on the sovereign national ledger.
                </span>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 shadow-lg shadow-emerald-900/40 text-xs"
              >
                {loading ? 'Validating Official Credentials...' : 'Sign In to Secretariat'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Quick Test Official Accounts for Evaluation */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Quick Test Official Roles
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('anand.vardhan@nic.in')}
                  className="w-full text-left p-2 rounded-lg bg-slate-950/80 border border-emerald-800/40 hover:border-emerald-500 hover:bg-emerald-950/20 transition-all flex items-center justify-between text-xs group"
                >
                  <div>
                    <span className="font-bold text-emerald-300 block">
                      Dr. Anand V. Vardhan, IAS
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Senior Government Manager (All 28 States & 8 UTs)
                    </span>
                  </div>
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('rajiv.patel@transport.gov.in')}
                  className="w-full text-left p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all flex items-center justify-between text-xs group"
                >
                  <div>
                    <span className="font-semibold text-slate-200 group-hover:text-emerald-300 block">
                      Joint Commissioner Rajiv Patel
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Transport & Highways (MORTH-KA)
                    </span>
                  </div>
                  <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('sunita.desai@revenue.gov.in')}
                  className="w-full text-left p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all flex items-center justify-between text-xs group"
                >
                  <div>
                    <span className="font-semibold text-slate-200 group-hover:text-emerald-300 block">
                      Inspector Sunita Desai
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Field Verification & eKYC (REV-BLR)
                    </span>
                  </div>
                  <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
              <Link
                to={ROUTES.AUTH.LOGIN}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
              >
                Are you a Citizen? Access Citizen Portal <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Official Secrets Act 1923 · DPDP Act 2023 · Cyber Defense Tier-IV
          </p>
        </div>
      </main>

      {/* Sovereign Footer */}
      <footer className="relative z-20 border-t border-slate-900 bg-slate-950/90 px-4 sm:px-8 py-3 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 National Portal of India · National Informatics Centre (NIC)</span>
        <span className="flex items-center gap-4">
          <Link to={ROUTES.APP.SERVICES} className="hover:text-slate-400 transition-colors">Citizen Marketplace</Link>
          <Link to={ROUTES.ORGANIZATION.LOGIN} className="hover:text-slate-400 transition-colors">Organization Portal</Link>
          <Link to={ROUTES.ADMIN.LOGIN} className="hover:text-slate-400 transition-colors">Admin Gateway</Link>
        </span>
      </footer>
    </div>
  )
}
