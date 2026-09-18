import type { SupportedLanguage } from '@/types'

export interface LanguageOption {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
]

export interface LocalizedCivicAssistantPreset {
  welcomeMessage: string
  suggestions: { text: string; action: string }[]
  mockAnswers: Record<string, { answer: string; actions?: { label: string; action: string; targetUrl?: string }[] }>
}

export const CIVIC_ASSISTANT_CONTENT: Record<SupportedLanguage, LocalizedCivicAssistantPreset> = {
  en: {
    welcomeMessage: 'Namaste Rajesh. I am CiviqOne Intelligent Civic Assistant. How can I guide you with government services, document verification, or your pending applications today?',
    suggestions: [
      { text: 'How do I renew my driving license?', action: 'dl_renewal' },
      { text: 'Check status of my property mutation', action: 'check_mutation' },
      { text: 'What documents are required for Rooftop Solar?', action: 'solar_subsidy' },
      { text: 'View my expiring documents', action: 'view_expiring' },
    ],
    mockAnswers: {
      dl_renewal: {
        answer: 'You have an active application (#KA-RTO-2026-992140) for Driving License Renewal! Note that the Licensing Officer has requested a re-upload of your residential proof of address. You can update this immediately from your Applications tracker without visiting the RTO.',
        actions: [
          { label: 'Resolve DL Application Query', action: 'navigate', targetUrl: '/app/applications/app_991' },
          { label: 'View License Details', action: 'navigate', targetUrl: '/app/documents' },
        ],
      },
      check_mutation: {
        answer: 'Your E-Khata Property Mutation application (#KA-REV-2026-004812) is currently in Stage 3: Statutory 15-Day Public Notice Period. The statutory window completes on 29 September 2026. No objections have been filed.',
        actions: [
          { label: 'Track Mutation Timeline', action: 'navigate', targetUrl: '/app/applications/app_992' },
        ],
      },
      solar_subsidy: {
        answer: 'Under the PM Surya Ghar Muft Bijli Yojana, residential applicants can claim up to ₹78,000 direct subsidy into their bank account. Required credentials: Electricity bills of the last 3 months, roof ownership proof (or Khata), and a cancelled bank cheque.',
        actions: [
          { label: 'Apply for Solar Subsidy', action: 'navigate', targetUrl: '/app/services' },
        ],
      },
      view_expiring: {
        answer: 'You have 1 document expiring soon: Commercial & Non-Transport Driving License (KA03-20150009842), expiring on 28 Oct 2026. All other identity cards (Aadhaar, PAN, Degree) have verified lifetime or long-term validity.',
        actions: [
          { label: 'Open Document Vault', action: 'navigate', targetUrl: '/app/documents' },
        ],
      },
    },
  },
  te: {
    welcomeMessage: 'నమస్కారం రాజేష్ గారు. నేను మీ CiviqOne పౌర సేవా సహాయకుడిని. ప్రభుత్వ సేవలు, పత్రాల ధృవీకరణ లేదా దరఖాస్తుల పురోగతి గురించి మీకు ఎలా సహాయపడగలను?',
    suggestions: [
      { text: 'డ్రైవింగ్ లైసెన్స్ పునరుద్ధరణ ఎలా చేయాలి?', action: 'dl_renewal' },
      { text: 'ఆస్తి మ్యుటేషన్ స్థితిని పరిశీలించండి', action: 'check_mutation' },
      { text: 'రూఫ్‌టాప్ సోలార్ సబ్సిడీ వివరాలు ఏమిటి?', action: 'solar_subsidy' },
      { text: 'గడువు ముగిసే నా పత్రాలను చూపించండి', action: 'view_expiring' },
    ],
    mockAnswers: {
      dl_renewal: {
        answer: 'మీ వద్ద డ్రైవింగ్ లైసెన్స్ పునరుద్ధరణ కోసం క్రియాశీల దరఖాస్తు (#KA-RTO-2026-992140) ఉంది. లైసెన్సింగ్ అధికారి మీ చిరునామా ధృవీకరణ పత్రాన్ని స్పష్టంగా మళ్లీ అప్‌లోడ్ చేయాలని కోరారు.',
        actions: [
          { label: 'దరఖాస్తును సరిదిద్దండి', action: 'navigate', targetUrl: '/app/applications/app_991' },
        ],
      },
      check_mutation: {
        answer: 'మీ ఈ-ఖాతా ఆస్తి మ్యుటేషన్ (#KA-REV-2026-004812) ప్రస్తుతం 15 రోజుల పబ్లిక్ నోటీసు దశలో ఉంది. సెప్టెంబర్ 29 నాటికి పూర్తవుతుంది.',
        actions: [
          { label: 'పురోగతిని చూడండి', action: 'navigate', targetUrl: '/app/applications/app_992' },
        ],
      },
      solar_subsidy: {
        answer: 'సూర్య ఘర్ ఉచిత విద్యుత్ యోజన కింద ₹78,000 వరకు నేరుగా సబ్సిడీ లభిస్తుంది. చివరి 3 నెలల విద్యుత్ బిల్లు, ఆస్తి పత్రాలు అవసరం.',
        actions: [
          { label: 'సేవలను బ్రౌజ్ చేయండి', action: 'navigate', targetUrl: '/app/services' },
        ],
      },
      view_expiring: {
        answer: 'మీ డ్రైవింగ్ లైసెన్స్ (KA03-20150009842) 28 అక్టోబర్ 2026న ముగుస్తుంది. ఆధార్ మరియు పాన్ కార్డులు ధృవీకరించబడి ఉన్నాయి.',
        actions: [
          { label: 'పత్రాల వాల్ట్ తెరవండి', action: 'navigate', targetUrl: '/app/documents' },
        ],
      },
    },
  },
  ta: {
    welcomeMessage: 'வணக்கம் ராஜேஷ். நான் CiviqOne குடிமக்கள் டிஜிட்டல் உதவியாளர். அரசு சேவைகள், ஆவண சரிபார்ப்பு அல்லது உங்கள் விண்ணப்ப விவரங்களை அறிய உங்களுக்கு எவ்வாறு உதவலாம்?',
    suggestions: [
      { text: 'ஓட்டுநர் உரிமத்தை எவ்வாறு புதுப்பிப்பது?', action: 'dl_renewal' },
      { text: 'எனது சொத்து பட்டா / மாற்ற நிலையை காண்க', action: 'check_mutation' },
      { text: 'சூரிய ஒளி கூரை மானியம் பெறுவது எப்படி?', action: 'solar_subsidy' },
      { text: 'காலாவதியாகும் ஆவணங்களை சரிபார்க்கவும்', action: 'view_expiring' },
    ],
    mockAnswers: {
      dl_renewal: {
        answer: 'உங்களிடம் செயலில் உள்ள ஓட்டுநர் உரிம விண்ணப்பம் (#KA-RTO-2026-992140) உள்ளது. முகவரி சான்றை மீண்டும் பதிவேற்றுமாறு அதிகாரி கோரியுள்ளார்.',
        actions: [
          { label: 'விண்ணப்பத்தை சரிபார்க்கவும்', action: 'navigate', targetUrl: '/app/applications/app_991' },
        ],
      },
      check_mutation: {
        answer: 'உங்கள் சொத்து மாற்றம் விண்ணப்பம் (#KA-REV-2026-004812) பொது அறிவிப்பு காலத்தில் உள்ளது. 29 செப்டம்பர் 2026 அன்று நிறைவடையும்.',
        actions: [
          { label: 'விண்ணப்ப நிலையை காண்க', action: 'navigate', targetUrl: '/app/applications/app_992' },
        ],
      },
      solar_subsidy: {
        answer: 'பிரதம மந்திரி சூர்யா கர் திட்டத்தின் கீழ் ரூ. 78,000 வரை நேரடி வங்கி மானியம் வழங்கப்படுகிறது.',
        actions: [
          { label: 'சேவைகளை காண்க', action: 'navigate', targetUrl: '/app/services' },
        ],
      },
      view_expiring: {
        answer: 'உங்கள் ஓட்டுநர் உரிமம் 28 அக்டோபர் 2026 அன்று காலாவதியாகிறது. பிற ஆவணங்கள் செல்லுபடியாகும் நிலையில் உள்ளன.',
        actions: [
          { label: 'ஆவணப் பெட்டகம் திறக்கவும்', action: 'navigate', targetUrl: '/app/documents' },
        ],
      },
    },
  },
  kn: {
    welcomeMessage: 'ನಮಸ್ಕಾರ ರಾಜೇಶ್ ಅವರೇ. ನಾನು CiviqOne ನಾಗರಿಕ ಡಿಜಿಟಲ್ ಸಹಾಯಕ. ಸರಕಾರಿ ಸೇವೆಗಳು, ದಾಖಲೆಗಳ ಪರಿಶೀಲನೆ ಅಥವಾ ಅರ್ಜಿಗಳ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆಗೆ ನಾನು ಹೇಗೆ ನೆರವಾಗಲಿ?',
    suggestions: [
      { text: 'ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ನವೀಕರಣ ಹೇಗೆ?', action: 'dl_renewal' },
      { text: 'ಇ-ಖಾತಾ ಮ್ಯುಟೇಶನ್ ಅರ್ಜಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ', action: 'check_mutation' },
      { text: 'ಸೌರಶಕ್ತಿ ಸಬ್ಸಿಡಿ ಅರ್ಜಿ ನಿಯಮಗಳು ಯಾವುವು?', action: 'solar_subsidy' },
      { text: 'ಅವಧಿ ಮುಗಿಯುವ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ', action: 'view_expiring' },
    ],
    mockAnswers: {
      dl_renewal: {
        answer: 'ನಿಮ್ಮ ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ನವೀಕರಣ ಅರ್ಜಿ (#KA-RTO-2026-992140) ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ. ಲೈಸೆನ್ಸಿಂಗ್ ಅಧಿಕಾರಿಯು ನಿಮ್ಮ ವಿಳಾಸ ದೃಢೀಕರಣ ಪತ್ರವನ್ನು ಮರು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಸೂಚಿಸಿದ್ದಾರೆ.',
        actions: [
          { label: 'ಅರ್ಜಿ ತಿದ್ದುಪಡಿ ಮಾಡಿ', action: 'navigate', targetUrl: '/app/applications/app_991' },
        ],
      },
      check_mutation: {
        answer: 'ನಿಮ್ಮ ಇ-ಖಾತಾ ಮ್ಯುಟೇಶನ್ (#KA-REV-2026-004812) 15 ದಿನಗಳ ಸಾರ್ವಜನಿಕ ಆಕ್ಷೇಪಣೆ ಹಂತದಲ್ಲಿದೆ. ಸೆಪ್ಟೆಂಬರ್ 29 ಕ್ಕೆ ಇದು ಪೂರ್ಣಗೊಳ್ಳಲಿದೆ.',
        actions: [
          { label: 'ಅರ್ಜಿ ವಿವರಗಳನ್ನು ನೋಡಿ', action: 'navigate', targetUrl: '/app/applications/app_992' },
        ],
      },
      solar_subsidy: {
        answer: 'ಪಿಎಂ ಸೂರ್ಯ ಘರ್ ಯೋಜನೆಯಡಿ ₹78,000 ವರೆಗೆ ನೇರ ಸಬ್ಸಿಡಿ ದೊರೆಯುತ್ತದೆ. 3 ತಿಂಗಳ ವಿದ್ಯುತ್ ಬಿಲ್ ಹಾಗೂ ಕಟ್ಟಡ ಮಾಲೀಕತ್ವ ದಾಖಲೆ ಅಗತ್ಯವಿದೆ.',
        actions: [
          { label: 'ಸೇವೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ', action: 'navigate', targetUrl: '/app/services' },
        ],
      },
      view_expiring: {
        answer: 'ನಿಮ್ಮ ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ 28 ಅಕ್ಟೋಬರ್ 2026 ರಂದು ಅವಧಿ ಮುಗಿಯಲಿದೆ. ಆಧಾರ್ ಹಾಗೂ ಪಾನ್ ಕಾರ್ಡ್‌ಗಳು ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿವೆ.',
        actions: [
          { label: 'ದಾಖಲೆಗಳ ವಾಲ್ಟ್ ತೆರೆಯಿರಿ', action: 'navigate', targetUrl: '/app/documents' },
        ],
      },
    },
  },
  ml: {
    welcomeMessage: 'നമസ്കാരം രാജേഷ്. ഞാൻ CiviqOne സിവിക് ഡിജിറ്റൽ അസിസ്റ്റന്റാണ്. സർക്കാർ സേവനങ്ങൾ, രേഖ പരിശോധന, അപേക്ഷാ നില പരിശോധന എന്നിവയിൽ ഞാൻ എങ്ങനെ സഹായിക്കണം?',
    suggestions: [
      { text: 'ഡ്രൈവിംഗ് ലൈസൻസ് എങ്ങനെ പുതുക്കാം?', action: 'dl_renewal' },
      { text: 'വസ്തു പോക്കുവരവ് അപേക്ഷ പരിശോധിക്കുക', action: 'check_mutation' },
      { text: 'സോളാർ സബ്സിഡിക്ക് എന്തൊക്കെ വേണം?', action: 'solar_subsidy' },
      { text: 'കാലഹരണപ്പെടുന്ന രേഖകൾ പരിശോധിക്കുക', action: 'view_expiring' },
    ],
    mockAnswers: {
      dl_renewal: {
        answer: 'നിങ്ങളുടെ ഡ്രൈവിംഗ് ലൈസൻസ് പുതുക്കൽ അപേക്ഷ (#KA-RTO-2026-992140) നിലവിലുണ്ട്. മേൽവിലാസ രേഖ വീണ്ടും അപ്‌ലോഡ് ചെയ്യാൻ ഉദ്യോഗസ്ഥൻ ആവശ്യപ്പെട്ടിട്ടുണ്ട്.',
        actions: [
          { label: 'അപേക്ഷ അപ്ഡേറ്റ് ചെയ്യുക', action: 'navigate', targetUrl: '/app/applications/app_991' },
        ],
      },
      check_mutation: {
        answer: 'നിങ്ങളുടെ വസ്തു പോക്കുവരവ് അപേക്ഷ (#KA-REV-2026-004812) പൊതു നോട്ടീസ് ഘട്ടത്തിലാണ്. സെപ്റ്റംബർ 29-ന് പൂർത്തിയാകും.',
        actions: [
          { label: 'അപേക്ഷ കാണുക', action: 'navigate', targetUrl: '/app/applications/app_992' },
        ],
      },
      solar_subsidy: {
        answer: 'സൂര്യ ഘർ പദ്ധതി വഴി ₹78,000 വരെ സബ്സിഡി ബാങ്ക് അക്കൗണ്ടിലേക്ക് ലഭിക്കും. വൈദ്യുതി ബിൽ, ഉടമസ്ഥാവകാശ രേഖ എന്നിവ ആവശ്യമാണ്.',
        actions: [
          { label: 'സേവനങ്ങൾ കാണുക', action: 'navigate', targetUrl: '/app/services' },
        ],
      },
      view_expiring: {
        answer: 'നിങ്ങളുടെ ഡ്രൈവിംഗ് ലൈസൻസ് 2026 ഒക്ടോബർ 28-ന് കാലാവധി തീരും. മറ്റ് തിരിച്ചറിയൽ രേഖകൾ സാധുവാണ്.',
        actions: [
          { label: 'രേഖകൾ കാണുക', action: 'navigate', targetUrl: '/app/documents' },
        ],
      },
    },
  },
}
