import type { SupportedLanguage } from '@/types'

export interface LanguageOption {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
]

export interface LocalizedCivicAssistantPreset {
  welcomeMessage: string
  suggestions: { text: string; action: string }[]
  mockAnswers: Record<string, { answer: string; actions?: { label: string; action: string; targetUrl?: string }[] }>
}

export const CIVIC_ASSISTANT_CONTENT: Record<SupportedLanguage, LocalizedCivicAssistantPreset> = {
  en: {
    welcomeMessage: 'Namaste Rajesh. I am CiviqOne Intelligent Civic Assistant. How can I guide you with government services, document verification, filing grievances, or checking your pending applications today?',
    suggestions: [
      { text: 'Aadhaar-PAN name mismatch error - how to resolve?', action: 'aadhaar_pan_mismatch' },
      { text: 'Property mutation legal heir objection dispute', action: 'mutation_objection' },
      { text: 'RTO working hours and driving license fee schedule', action: 'office_hours_fees' },
      { text: 'How do I renew my driving license?', action: 'dl_renewal' },
      { text: 'Check status of my property mutation', action: 'check_mutation' },
      { text: 'Solar net-metering synchronization delayed by DISCOM', action: 'solar_delay' },
      { text: 'Lodge a civic grievance or complaint', action: 'file_grievance' },
      { text: 'Connect with a live citizen care officer', action: 'live_officer' },
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
      file_grievance: {
        answer: 'I can assist you in filing an official statutory grievance with CPGRAMS or your State Directorate. The system will assign an official Citizen Grievance Reference Number (CGRN) with a 48-hour SLA guarantee.',
        actions: [
          { label: 'Open Grievance Wizard', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
          { label: 'View Active Tickets', action: 'navigate', targetUrl: '/app/support?tab=tickets' },
        ],
      },
      live_officer: {
        answer: 'Connecting you with an active Citizen Care Officer. You can chat directly, submit escalated complaints, or schedule a priority phone callback.',
        actions: [
          { label: 'Enter Live Officer Console', action: 'navigate', targetUrl: '/app/support?tab=live' },
          { label: 'Dial Toll-Free 1905', action: 'navigate', targetUrl: '/app/support?tab=helpline' },
        ],
      },
    },
  },
  hi: {
    welcomeMessage: 'नमस्ते राजेश जी। मैं सिविकवन (CiviqOne) बुद्धिमान नागरिक सहायक हूँ। आज मैं सरकारी सेवाओं, दस्तावेज़ सत्यापन, शिकायत दर्ज करने या लंबित आवेदनों की स्थिति में आपकी क्या सहायता कर सकता हूँ?',
    suggestions: [
      { text: 'आधार और पैन नाम में अंतर कैसे सुधारें?', action: 'aadhaar_pan_mismatch' },
      { text: 'संपत्ति म्यूटेशन में वारिस आपत्ति विवाद कैसे सुलझाएं?', action: 'mutation_objection' },
      { text: 'आरटीओ कार्यालय समय और लाइसेंस फीस की जानकारी', action: 'office_hours_fees' },
      { text: 'ड्राइविंग लाइसेंस का नवीनीकरण कैसे करें?', action: 'dl_renewal' },
      { text: 'संपत्ति म्यूटेशन (दाखिल-खारिज) की स्थिति जांचें', action: 'check_mutation' },
      { text: 'बिजली विभाग सोलर नेट-मीटर लगाने में देरी कर रहा है', action: 'solar_delay' },
      { text: 'जन शिकायत (Grievance) दर्ज करें', action: 'file_grievance' },
      { text: 'नागरिक सेवा अधिकारी से बात करें', action: 'live_officer' },
    ],
    mockAnswers: {
      dl_renewal: {
        answer: 'आपके पास ड्राइविंग लाइसेंस नवीनीकरण के लिए एक सक्रिय आवेदन (#KA-RTO-2026-992140) है। लाइसेंसिंग अधिकारी ने आपके पते के प्रमाण को पुनः अपलोड करने का अनुरोध किया है। आप इसे आरटीओ जाए बिना सीधे पोर्टल से हल कर सकते हैं।',
        actions: [
          { label: 'डीएल आवेदन आपत्ति हल करें', action: 'navigate', targetUrl: '/app/applications/app_991' },
          { label: 'दस्तावेज़ देखें', action: 'navigate', targetUrl: '/app/documents' },
        ],
      },
      check_mutation: {
        answer: 'आपका ई-खाता संपत्ति दाखिल-खारिज आवेदन (#KA-REV-2026-004812) वर्तमान में चरण 3: 15-दिवसीय सार्वजनिक नोटिस अवधि में है। यह वैधानिक विंडो 29 सितंबर 2026 को समाप्त होगी। कोई आपत्ति दर्ज नहीं की गई है।',
        actions: [
          { label: 'म्यूटेशन स्थिति देखें', action: 'navigate', targetUrl: '/app/applications/app_992' },
        ],
      },
      solar_subsidy: {
        answer: 'पीएम सूर्य घर मुफ्त बिजली योजना के तहत, आवासीय आवेदक सीधे अपने बैंक खाते में ₹78,000 तक की सब्सिडी प्राप्त कर सकते हैं। आवश्यक दस्तावेज: पिछले 3 महीनों के बिजली बिल, छत के स्वामित्व का प्रमाण और रद्द चेक।',
        actions: [
          { label: 'सोलर सब्सिडी आवेदन करें', action: 'navigate', targetUrl: '/app/services' },
        ],
      },
      view_expiring: {
        answer: 'आपका 1 दस्तावेज़ जल्द समाप्त हो रहा है: ड्राइविंग लाइसेंस (KA03-20150009842), जो 28 अक्टूबर 2026 को समाप्त हो रहा है। आधार, पैन और डिग्री जैसे अन्य सभी पहचान पत्र पूरी तरह मान्य हैं।',
        actions: [
          { label: 'डिजिटल वॉल्ट खोलें', action: 'navigate', targetUrl: '/app/documents' },
        ],
      },
      file_grievance: {
        answer: 'मैं CPGRAMS या राज्य प्रशासनिक सुधार विभाग में आपकी आधिकारिक वैधानिक शिकायत दर्ज करने में मदद कर सकता हूँ। प्रणाली आपको 48 घंटे के SLA के साथ शिकायत संदर्भ संख्या (CGRN) प्रदान करेगी।',
        actions: [
          { label: 'शिकायत दर्ज करें', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
          { label: 'सक्रिय शिकायतें देखें', action: 'navigate', targetUrl: '/app/support?tab=tickets' },
        ],
      },
      live_officer: {
        answer: 'आपको हमारे उपलब्ध नागरिक सेवा अधिकारी से जोड़ा जा रहा है। आप लाइव चैट कर सकते हैं या फोन पर त्वरित कॉलबैक का अनुरोध कर सकते हैं।',
        actions: [
          { label: 'लाइव अधिकारी चैट खोलें', action: 'navigate', targetUrl: '/app/support?tab=live' },
          { label: 'टोल-फ्री हेल्पलाइन 1905', action: 'navigate', targetUrl: '/app/support?tab=helpline' },
        ],
      },
    },
  },
  te: {
    welcomeMessage: 'నమస్కారం రాజేష్ గారు. నేను మీ CiviqOne పౌర సేవా సహాయకుడిని. ప్రభుత్వ సేవలు, పత్రాల ధృవీకరణ, ఫిర్యాదుల నమోదు లేదా దరఖాస్తుల పురోగతి గురించి మీకు ఎలా సహాయపడగలను?',
    suggestions: [
      { text: 'డ్రైవింగ్ లైసెన్స్ పునరుద్ధరణ ఎలా చేయాలి?', action: 'dl_renewal' },
      { text: 'ఆస్తి మ్యుటేషన్ స్థితిని పరిశీలించండి', action: 'check_mutation' },
      { text: 'రూఫ్‌టాప్ సోలార్ సబ్సిడీ వివరాలు ఏమిటి?', action: 'solar_subsidy' },
      { text: 'గడువు ముగిసే నా పత్రాలను చూపించండి', action: 'view_expiring' },
      { text: 'పౌర సమస్యపై ఫిర్యాదు నమోదు చేయండి', action: 'file_grievance' },
      { text: 'హెల్ప్‌డెస్క్ అధికారితో మాట్లాడండి', action: 'live_officer' },
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
      file_grievance: {
        answer: 'మీ సమస్యను అధికారికంగా పరిష్కరించడానికి CPGRAMS పౌర వేదికలో ఫిర్యాదు నమోదు చేయవచ్చు. మీకు 48 గంటల SLA గ్యారెంటీతో అధికారిక రిఫరెన్స్ నంబర్ ఇవ్వబడుతుంది.',
        actions: [
          { label: 'ఫిర్యాదు నమోదు చేయండి', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
        ],
      },
      live_officer: {
        answer: 'లైవ్ సిటిజన్ కేర్ అధికారితో మిమ్మల్ని కనెక్ట్ చేస్తున్నాము. మీరు లైవ్ చాట్ చేయవచ్చు లేదా ఫోన్ కాల్ అభ్యర్థించవచ్చు.',
        actions: [
          { label: 'లైవ్ అధికారి కన్సోల్', action: 'navigate', targetUrl: '/app/support?tab=live' },
        ],
      },
    },
  },
  ta: {
    welcomeMessage: 'வணக்கம் ராஜேஷ். நான் CiviqOne குடிமக்கள் டிஜிட்டல் உதவியாளர். அரசு சேவைகள், ஆவண சரிபார்ப்பு, மக்கள் குறைதீர்ப்பு அல்லது உங்கள் விண்ணப்ப விவரங்களை அறிய உங்களுக்கு எவ்வாறு உதவலாம்?',
    suggestions: [
      { text: 'ஓட்டுநர் உரிமத்தை எவ்வாறு புதுப்பிப்பது?', action: 'dl_renewal' },
      { text: 'எனது சொத்து பட்டா / மாற்ற நிலையை காண்க', action: 'check_mutation' },
      { text: 'சூரிய ஒளி கூரை மானியம் பெறுவது எப்படி?', action: 'solar_subsidy' },
      { text: 'காலாவதியாகும் ஆவணங்களை சரிபார்க்கவும்', action: 'view_expiring' },
      { text: 'குறைதீர்ப்பு மனு தாக்கல் செய்ய', action: 'file_grievance' },
      { text: 'நேரடி சேவை அதிகாரியிடம் பேச', action: 'live_officer' },
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
      file_grievance: {
        answer: 'CPGRAMS தளத்தில் உங்கள் குறையை அதிகாரப்பூர்வமாக பதிவு செய்ய உதவுகிறேன். 48 மணி நேர SLA உடன் தனித்துவமான குறிப்பு எண் (CGRN) வழங்கப்படும்.',
        actions: [
          { label: 'குறைதீர்ப்பு மனு தொடங்கவும்', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
        ],
      },
      live_officer: {
        answer: 'குடிமக்கள் உதவி அதிகாரியுடன் நேரடி இணைப்பு ஏற்படுத்தப்படுகிறது. உடனடி சாட் அல்லது திரும்ப அழைக்கும் வசதி உள்ளது.',
        actions: [
          { label: 'அதிகாரி சாட் தொடங்கவும்', action: 'navigate', targetUrl: '/app/support?tab=live' },
        ],
      },
    },
  },
  kn: {
    welcomeMessage: 'ನಮಸ್ಕಾರ ರಾಜೇಶ್ ಅವರೇ. ನಾನು CiviqOne ನಾಗರಿಕ ಡಿಜಿಟಲ್ ಸಹಾಯಕ. ಸರಕಾರಿ ಸೇವೆಗಳು, ದಾಖಲೆಗಳ ಪರಿಶೀಲನೆ, ದೂರು ಸಲ್ಲಿಕೆ ಅಥವಾ ಅರ್ಜಿಗಳ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆಗೆ ನಾನು ಹೇಗೆ ನೆರವಾಗಲಿ?',
    suggestions: [
      { text: 'ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ನವೀಕರಣ ಹೇಗೆ?', action: 'dl_renewal' },
      { text: 'ಇ-ಖಾತಾ ಮ್ಯುಟೇಶನ್ ಅರ್ಜಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ', action: 'check_mutation' },
      { text: 'ಸೌರಶಕ್ತಿ ಸಬ್ಸಿಡಿ ಅರ್ಜಿ ನಿಯಮಗಳು ಯಾವುವು?', action: 'solar_subsidy' },
      { text: 'ಅವಧಿ ಮುಗಿಯುವ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ', action: 'view_expiring' },
      { text: 'ನಾಗರಿಕ ಕುಂದುಕೊರತೆ ದೂರು ದಾಖಲಿಸಿ', action: 'file_grievance' },
      { text: 'ಲೈವ್ ಸಹಾಯವಾಣಿ ಅಧಿಕಾರಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ', action: 'live_officer' },
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
      file_grievance: {
        answer: 'CPGRAMS ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಕುಂದುಕೊರತೆ ದೂರನ್ನು ಅಧಿಕೃತವಾಗಿ ದಾಖಲಿಸಲು ನೆರವಾಗುವೆ. 48 ಗಂಟೆಗಳ SLA ಭರವಸೆಯೊಂದಿಗೆ ಅಧಿಕೃತ CGRN ಸಂಖ್ಯೆ ಲಭಿಸಲಿದೆ.',
        actions: [
          { label: 'ದೂರು ದಾಖಲಿಸಿ', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
        ],
      },
      live_officer: {
        answer: 'ನಾಗರಿಕ ಸೇವಾ ಸಹಾಯಕರೊಂದಿಗೆ ಸಂಪರ್ಕ ಕಲ್ಪಿಸಲಾಗುತ್ತಿದೆ. ನೇರ ಚಾಟ್ ಅಥವಾ ಕಾಲ್‌ಬ್ಯಾಕ್ ಸೌಲಭ್ಯ ಲಭ್ಯವಿದೆ.',
        actions: [
          { label: 'ಲೈವ್ ಚಾಟ್ ಕನ್ಸೋಲ್', action: 'navigate', targetUrl: '/app/support?tab=live' },
        ],
      },
    },
  },
  ml: {
    welcomeMessage: 'നമസ്കാരം രാജേഷ്. ഞാൻ CiviqOne സിവിക് ഡിജിറ്റൽ അസിസ്റ്റന്റാണ്. സർക്കാർ സേവനങ്ങൾ, രേഖ പരിശോധന, പരാതി പരിഹാരം, അപേക്ഷാ നില പരിശോധന എന്നിവയിൽ ഞാൻ എങ്ങനെ സഹായിക്കണം?',
    suggestions: [
      { text: 'ഡ്രൈവിംഗ് ലൈസൻസ് എങ്ങനെ പുതുക്കാം?', action: 'dl_renewal' },
      { text: 'വസ്തു പോക്കുവരവ് അപേക്ഷ പരിശോധിക്കുക', action: 'check_mutation' },
      { text: 'സോളാർ സബ്സിഡിക്ക് എന്തൊക്കെ വേണം?', action: 'solar_subsidy' },
      { text: 'കാലഹരണപ്പെടുന്ന രേഖകൾ പരിശോധിക്കുക', action: 'view_expiring' },
      { text: 'പരാതി സമർപ്പിക്കുക (Grievance)', action: 'file_grievance' },
      { text: 'സഹായ ഉദ്യോഗസ്ഥനുമായി സംസാരിക്കുക', action: 'live_officer' },
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
      file_grievance: {
        answer: 'നിങ്ങളുടെ പരാതി CPGRAMS പ്ലാറ്റ്‌ഫോമിൽ ഔദ്യോഗികമായി രജിസ്റ്റർ ചെയ്യാം. 48 മണിക്കൂർ SLA സഹിതം CGRN നമ്പർ ലഭിക്കുന്നതാണ്.',
        actions: [
          { label: 'പരാതി സമർപ്പിക്കുക', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
        ],
      },
      live_officer: {
        answer: 'സിറ്റിസൺ കെയർ ഓഫീസറുമായി തത്സമയ ചാറ്റിലേക്ക് ബന്ധിപ്പിക്കുന്നു.',
        actions: [
          { label: 'ലൈവ് ചാറ്റ് തുടങ്ങുക', action: 'navigate', targetUrl: '/app/support?tab=live' },
        ],
      },
    },
  },
  bn: {
    welcomeMessage: 'নমস্কার রাজেশ বাবু। আমি সিভিকওয়ান (CiviqOne) বুদ্ধিমান নাগরিক সহায়ক। আজ আপনাকে সরকারি পরিষেবা, নথি যাচাইকরণ, অভিযোগ দায়ের বা মুলতুবি আবেদনের স্থিতিতে কীভাবে সাহায্য করতে পারি?',
    suggestions: [
      { text: 'ড্রাইভিং লাইসেন্স কীভাবে রিনিউ করব?', action: 'dl_renewal' },
      { text: 'সম্পত্তি মিউটেশনের স্থিতি পরীক্ষা করুন', action: 'check_mutation' },
      { text: 'সৌর বিদ্যুৎ ভর্তুকির নিয়ম কী?', action: 'solar_subsidy' },
      { text: 'মেয়াদোত্তীর্ণ হতে চলা নথিগুলি দেখুন', action: 'view_expiring' },
      { text: 'জন অভিযোগ দায়ের করুন', action: 'file_grievance' },
      { text: 'লাইভ সহায়তা আধিকারিকের সাথে কথা বলুন', action: 'live_officer' },
    ],
    mockAnswers: {
      dl_renewal: {
        answer: 'আপনার ড্রাইভিং লাইসেন্স পুনর্নবীকরণের জন্য একটি সক্রিয় আবেদন (#KA-RTO-2026-992140) রয়েছে। আরটিও পরিদর্শক আপনার ঠিকানার প্রমাণপত্র পুনরায় আপলোড করার অনুরোধ জানিয়েছেন।',
        actions: [
          { label: 'আবেদন ত্রুটি সমাধান করুন', action: 'navigate', targetUrl: '/app/applications/app_991' },
        ],
      },
      check_mutation: {
        answer: 'আপনার ই-খতিয়ান সম্পত্তি মিউটেশন আবেদন (#KA-REV-2026-004812) বর্তমানে ১৫ দিনের জনসাধারণের নোটিশ পর্যায়ে রয়েছে। এটি ২৯ সেপ্টেম্বর ২০২৬-এ সম্পন্ন হবে।',
        actions: [
          { label: 'অগ্রগতি ট্র্যাক করুন', action: 'navigate', targetUrl: '/app/applications/app_992' },
        ],
      },
      solar_subsidy: {
        answer: 'পিএম সূর্য ঘর যোজনার অধীনে আবাসিক আবেদনকারীরা সরাসরি তাদের ব্যাংক অ্যাকাউন্টে ₹৭৮,০০০ পর্যন্ত ভর্তুকি পেতে পারেন।',
        actions: [
          { label: 'ভর্তুকি আবেদন করুন', action: 'navigate', targetUrl: '/app/services' },
        ],
      },
      view_expiring: {
        answer: 'আপনার ১টি নথির মেয়াদ শীঘ্রই শেষ হচ্ছে: ড্রাইভিং লাইসেন্স (KA03-20150009842), যা ২৮ অক্টোবর ২০২৬-এ শেষ হবে।',
        actions: [
          { label: 'নথি ভল্ট খুলুন', action: 'navigate', targetUrl: '/app/documents' },
        ],
      },
      file_grievance: {
        answer: 'আমি CPGRAMS বা রাজ্য প্রশাসনিক সংস্কার পোর্টালে আপনার অভিযোগ নথিভুক্ত করতে সাহায্য করতে পারি। ৪৮ ঘণ্টার SLA সহ ট্র্যাকিং নম্বর (CGRN) প্রদান করা হবে।',
        actions: [
          { label: 'অভিযোগ দায়ের করুন', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
        ],
      },
      live_officer: {
        answer: 'আপনাকে নাগরিক সহায়তা অফিসারের সাথে যুক্ত করা হচ্ছে। সরাসরি চ্যাট করুন বা কলব্যাক অনুরোধ করুন।',
        actions: [
          { label: 'লাইভ অফিসার চ্যাট', action: 'navigate', targetUrl: '/app/support?tab=live' },
        ],
      },
    },
  },
  mr: {
    welcomeMessage: 'नमस्कार राजेश जी. मी सिव्हिकवन (CiviqOne) बुद्धिमान नागरिक सहाय्यक आहे. शासकीय सेवा, दस्तऐवज पडताळणी, तक्रार निवारण किंवा अर्जांच्या स्थितीबद्दल मी आज कशी मदत करू?',
    suggestions: [
      { text: 'ड्रायव्हिंग लायसन्सचे नूतनीकरण कसे करावे?', action: 'dl_renewal' },
      { text: 'मालमत्ता फेरफार (Mutation) स्थिती तपासा', action: 'check_mutation' },
      { text: 'रूफटॉप सोलर सबसिडीचे नियम काय आहेत?', action: 'solar_subsidy' },
      { text: 'मुदत संपत असलेले दस्तऐवज दाखवा', action: 'view_expiring' },
      { text: 'नागरी तक्रार नोंदवा', action: 'file_grievance' },
      { text: 'नागरिक सेवा अधिकाऱ्याशी संपर्क साधा', action: 'live_officer' },
    ],
    mockAnswers: {
      dl_renewal: {
        answer: 'तुमच्याकडे ड्रायव्हिंग लायसन्स नूतनीकरणासाठी एक सक्रिय अर्ज (#KA-RTO-2026-992140) आहे. परवाना अधिकाऱ्याने तुमचा पत्ता पुरावा पुन्हा अपलोड करण्याची विनंती केली आहे.',
        actions: [
          { label: 'लायसन्स अर्ज दुरुस्त करा', action: 'navigate', targetUrl: '/app/applications/app_991' },
        ],
      },
      check_mutation: {
        answer: 'तुमचा ई-खाते मालमत्ता फेरफार अर्ज (#KA-REV-2026-004812) सध्या १५ दिवसांच्या सार्वजनिक नोटीस टप्प्यात आहे. हा कालावधी २९ सप्टेंबर २०२६ रोजी पूर्ण होईल.',
        actions: [
          { label: 'फेरफार प्रगती पहा', action: 'navigate', targetUrl: '/app/applications/app_992' },
        ],
      },
      solar_subsidy: {
        answer: 'पीएम सूर्य घर योजनेअंतर्गत रहिवासी अर्जदार थेट बँक खात्यात ₹७८,००० पर्यंत अनुदान मिळवू शकतात.',
        actions: [
          { label: 'सोलर सबसिडी अर्ज करा', action: 'navigate', targetUrl: '/app/services' },
        ],
      },
      view_expiring: {
        answer: 'तुमचा १ दस्तऐवज लवकरच संपत आहे: ड्रायव्हिंग लायसन्स (KA03-20150009842), जो २८ ऑक्टोबर २०२६ रोजी संपेल.',
        actions: [
          { label: 'दस्तऐवज व्हॉल्ट उघडा', action: 'navigate', targetUrl: '/app/documents' },
        ],
      },
      file_grievance: {
        answer: 'मी CPGRAMS किंवा राज्य पोर्टलवर तुमची तक्रार दाखल करण्यास मदत करू शकतो. ४८ तासांच्या SLA सह तक्रार संदर्भ क्रमांक (CGRN) मिळेल.',
        actions: [
          { label: 'तक्रार नोंदवा', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
        ],
      },
      live_officer: {
        answer: 'तुम्हाला आमच्या उपलब्ध नागरिक सेवा अधिकाऱ्याशी जोडले जात आहे. थेट चॅट करा किंवा त्वरित कॉलबॅक मिळवा.',
        actions: [
          { label: 'लाइव्ह ऑफिसर चॅट', action: 'navigate', targetUrl: '/app/support?tab=live' },
        ],
      },
    },
  },
  gu: {
    welcomeMessage: 'નમસ્તે રાજેશભાઈ. હું CiviqOne ઇન્ટેલિજન્ટ સિટિઝન આસિસ્ટન્ટ છું. આજે સરકારી સેવાઓ, દસ્તાવેજ ચકાસણી, ફરિયાદ નિવારણ કે બાકી અરજીઓની સ્થિતિ જાણવામાં હું તમારી શું મદદ કરી શકું?',
    suggestions: [
      { text: 'ડ્રાઇવિંગ લાઇસન્સ રિન્યૂ કેવી રીતે કરવું?', action: 'dl_renewal' },
      { text: 'મિલકત મ્યુટેશનની સ્થિતિ તપાસો', action: 'check_mutation' },
      { text: 'સોલાર રૂફટોપ સબસિડીના નિયમો શું છે?', action: 'solar_subsidy' },
      { text: 'મુદત પૂરી થતા દસ્તાવેજો જુઓ', action: 'view_expiring' },
      { text: 'નાગરિક ફરિયાદ નોંધાવો', action: 'file_grievance' },
      { text: 'લાઈવ સિટિઝન કેર ઓફિસર સાથે વાત કરો', action: 'live_officer' },
    ],
    mockAnswers: {
      dl_renewal: {
        answer: 'તમારી પાસે ડ્રાઇવિંગ લાઇસન્સ રિન્યુઅલ માટે સક્રિય અરજી (#KA-RTO-2026-992140) છે. લાઇસન્સિંગ ઓફિસરે તમારા રહેઠાણ પુરાવાને ફરીથી અપલોડ કરવા જણાવ્યું છે.',
        actions: [
          { label: 'અરજી પ્રશ્ન ઉકેલો', action: 'navigate', targetUrl: '/app/applications/app_991' },
        ],
      },
      check_mutation: {
        answer: 'તમારી ઈ-ખાતા પ્રોપર્ટી મ્યુટેશન અરજી (#KA-REV-2026-004812) હાલમાં સ્ટેજ 3: 15-દિવસની જાહેર નોટિસ સમયગાળામાં છે. તે 29 સપ્ટેમ્બર 2026 ના રોજ પૂર્ણ થશે.',
        actions: [
          { label: 'મ્યુટેશન ટ્રેક કરો', action: 'navigate', targetUrl: '/app/applications/app_992' },
        ],
      },
      solar_subsidy: {
        answer: 'પીએમ સૂર્ય ઘર મફત વીજળી યોજના હેઠળ, રહેણાંક અરજદારો તેમના બેંક ખાતામાં સીધા ₹78,000 સુધીની સબસિડી મેળવી શકે છે.',
        actions: [
          { label: 'સબસિડી માટે અરજી કરો', action: 'navigate', targetUrl: '/app/services' },
        ],
      },
      view_expiring: {
        answer: 'તમારો 1 દસ્તાવેજ ટૂંક સમયમાં સમાપ્ત થઈ રહ્યો છે: ડ્રાઇવિંગ લાઇસન્સ (KA03-20150009842), જે 28 ઑક્ટોબર 2026 ના રોજ સમાપ્ત થાય છે.',
        actions: [
          { label: 'દસ્તાવેજ વૉલ્ટ ખોલો', action: 'navigate', targetUrl: '/app/documents' },
        ],
      },
      file_grievance: {
        answer: 'હું CPGRAMS પર તમારી સત્તાવાર ફરિયાદ દાખલ કરવામાં મદદ કરી શકું છું. 48-કલાકના SLA સાથે ફરિયાદ સંદર્ભ નંબર (CGRN) મળશે.',
        actions: [
          { label: 'ફરિયાદ નોંધાવો', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
        ],
      },
      live_officer: {
        answer: 'તમને અમારા ઉપલબ્ધ નાગરિક સેવા અધિકારી સાથે જોડી રહ્યા છીએ. સીધી ચેટ કરો અથવા કોલબેક વિનંતી મોકલો.',
        actions: [
          { label: 'લાઈવ ઓફિસર કન્સોલ', action: 'navigate', targetUrl: '/app/support?tab=live' },
        ],
      },
    },
  },
}
