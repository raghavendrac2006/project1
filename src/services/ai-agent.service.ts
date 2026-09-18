import { civicStorage } from './storage'
import { CIVIC_ASSISTANT_CONTENT } from '../constants/languages'
import type {
  AssistantMessage,
  AssistantAction,
  SupportedLanguage,
  DiagnosticBlueprint,
  CustomerCareTicket,
  CivicApplication,
} from '../types'

export type AgentIntent =
  // Tough Administrative Disputes (Statutory Blueprints)
  | 'TOUGH_AADHAAR_PAN_MISMATCH'
  | 'TOUGH_MUTATION_OBJECTION'
  | 'TOUGH_RTO_SCRUTINY_REJECTION'
  | 'TOUGH_SOLAR_NET_METERING_DELAY'
  | 'TOUGH_WATER_TARIFF_SURGE'
  | 'TOUGH_PENSION_BIOMETRIC_FAILURE'

  // Comprehensive Daily Civic Services (High Accuracy)
  | 'AADHAAR_MOBILE_UPDATE'
  | 'RATION_CARD_SERVICE'
  | 'CASTE_INCOME_CERTIFICATE'
  | 'BIRTH_DEATH_REGISTRATION'
  | 'MARRIAGE_REGISTRATION'
  | 'AYUSHMAN_BHARAT_PMJAY'
  | 'VOTER_ID_EPIC'
  | 'PASSPORT_POLICE_VERIFICATION'
  | 'RTI_APPLICATION'
  | 'LEARNER_LICENSE_TEST'
  | 'EPFO_PF_CLAIM'

  // Basic Statutory Lookups
  | 'BASIC_OFFICE_HOURS_FEES'
  | 'BASIC_DOWNLOAD_NAV'

  // Standard Workflows
  | 'APPLICATION_STATUS'
  | 'GRIEVANCE_LODGE'
  | 'SERVICE_INQUIRY'
  | 'DOCUMENT_VAULT'
  | 'PAYMENT_DUE'
  | 'HUMAN_OFFICER_ESCALATION'
  | 'GENERAL_CIVIC_HELP'

export interface AgentProcessingResult {
  message: AssistantMessage
  intent: AgentIntent
  confidence: number
}

// Multilingual keywords dictionary across English & 8 Indian languages
const INTENT_KEYWORDS: Record<AgentIntent, string[]> = {
  // ── TOUGH DISPUTES ──
  TOUGH_AADHAAR_PAN_MISMATCH: [
    'aadhaar pan mismatch', 'name mismatch', 'dob mismatch', 'pan linking error', 'name spelling', 'pan link failed', 'demographic mismatch', 'uidai pan', 'tax refund failed',
    'आधार पैन मिसमैच', 'नाम में अंतर', 'पैन लिंक नहीं हो रहा', 'जन्म तिथि गलत', 'स्पेलिंग मिस्टेक',
    'ఆధార్ పాన్ పేరు తేడా', 'పాన్ లింక్ విఫలం', 'పుట్టిన తేదీ తేడా',
    'ஆதார் பான் பெயர் வேறுபாடு', 'பான் இணைப்பு தோல்வி',
    'ಆಧಾರ್ ಪ್ಯಾನ್ ಹೆಸರು ವ್ಯತ್ಯಾಸ', 'ಪ್ಯಾನ್ ಲಿಂಕ್ ವಿಫಲ',
    'ആധാർ പാൻ പേര് പൊരുത്തക്കേട്', 'പാൻ ലിങ്ക് പരാജയപ്പെട്ടു',
    'আধার প্যান নামের অমিল', 'প্যান লিঙ্ক ব্যর্থ',
    'आधार पॅन नावातील तफावत', 'पॅन लिंक अयशस्वी',
    'આધાર પાન નામમાં ભૂલ', 'પાન લિંક નિષ્ફળ',
  ],

  TOUGH_MUTATION_OBJECTION: [
    'mutation objection', 'khata transfer dispute', 'legal heir objection', 'property objection', 'e-khata objection', 'succession dispute', 'tahsildar objection', 'contested mutation', 'notice objection', 'property registration objection', 'registration objection', 'tahsildar', 'land dispute',
    'दाखिल खारिज आपत्ति', 'म्यूटेशन विवाद', 'वारिस विवाद', 'संपत्ति आपत्ति', 'तहसीलदार आपत्ति', 'तहसीलदार', 'रजिस्ट्रेशन आपत्ति',
    'మ్యుటేషన్ అభ్యంతరం', 'ఖాతా బదిలీ వివాదం', 'వారసత్వ వివాదం',
    'பட்டா மாறுதல் எதிர்ப்பு', 'வாரிசு உரிமை தகராறு', 'சொத்து ஆட்சேபனை',
    'ಮ್ಯುಟೇಶನ್ ಆಕ್ಷೇಪಣೆ', 'ಖಾತಾ ವರ್ಗಾವಣೆ ವಿವಾದ', 'ವಾರಸುದಾರರ ಆಕ್ಷೇಪಣೆ',
    'പോക്കുവരവ് തടസ്സവാദം', 'അവകാശ തർക്കം', 'കരം ഒടുക്കൽ തടസ്സം',
    'মিউটেশন আপত্তি', 'উত্তরাধিকার বিরোধ', 'খতিয়ান আপত্তি',
    'फेरफार आक्षेप', 'वारस हक्क वाद', 'खातेवाटप अडचण',
    'મ્યુટેશન વાંધો', 'વારસાઈ તકરાર', 'ખાતા ફેરબદલી વિવાદ',
  ],

  TOUGH_RTO_SCRUTINY_REJECTION: [
    'rto rejection', 'dl rejected', 'medical certificate rejected', 'scrutiny objection', 'form 1a rejected', 'license query raised', 'rto objection', 'commercial badge rejection', 'parivahan rejection',
    'लाइसेंस रिजेक्ट', 'आरटीओ आपत्ति', 'मेडिकल सर्टिफिकेट अस्वीकृत', 'फॉर्म 1a निरस्त',
    'లైసెన్స్ తిరస్కరణ', 'ఫారమ్ 1A తిరస్కరణ', 'ఆర్టీవో అభ్యంతరం',
    'ஓட்டுநர் உரிமம் நிராகரிப்பு', 'படிவம் 1A நிராகரிக்கப்பட்டது',
    'ಲೈಸೆನ್ಸ್ ತಿರಸ್ಕೃತ', 'ಫಾರ್ಮ್ 1A ತಿರಸ್ಕೃತ', 'ಆರ್‌ಟಿಒ ಆಕ್ಷೇಪಣೆ',
    'ഡ്രൈവിംഗ് ലൈസൻസ് നിരസിച്ചു', 'ഫോം 1A നിരസിച്ചു',
    'ড্রাইভিং লাইসেন্স বাতিল', 'ফর্ম 1A প্রত্যাখ্যান',
    'लायसन्स फेटाळले', 'फॉर्म 1A नामंजूर', 'आरटीओ आक्षेप',
    'લાઇસન્સ નકારાયું', 'ફોર્મ 1A અસ્વીકૃત', 'આરટીઓ વાંધો',
  ],

  TOUGH_SOLAR_NET_METERING_DELAY: [
    'solar delay', 'net meter delay', 'discom delay', 'bescom solar', 'meter synchronization', 'solar subsidy delayed', 'solar meter not installed', 'grid synchronization delay',
    'सोलर मीटर देरी', 'बिजली विभाग देरी', 'नेट मीटर नहीं लगा', 'सब्सिडी देरी',
    'సౌర మీటర్ ఆలస్యం', 'నెట్ మీటరింగ్ ఆలస్యం', 'డిస్కాం ఆలస్యం',
    'சூரிய மின் மீட்டர் தாமதம்', 'மின்சார வாரியம் தாமதம்',
    'ಸೋಲಾರ್ ಮೀಟರ್ ವಿಳಂಬ', 'ಬೆಸ್ಕಾಂ ಮೀಟರ್ ವಿಳಂಬ',
    'സോളാർ മീറ്റർ താമസം', 'കെഎസ്ഇബി നെറ്റ് മീറ്റർ',
    'সৌর মিটার বিলম্ব', 'বিদ্যুৎ পর্ষদ বিলম্ব',
    'सोलर मीटर उशीर', 'महावितरण नेट मीटर विलंब',
    'સોલાર મીટર વિલંબ', 'વીજળી કંપની વિલંબ',
  ],

  TOUGH_WATER_TARIFF_SURGE: [
    'commercial water bill', 'tariff dispute', 'water meter surge', 'abnormal water bill', 'commercial tariff residential', 'faulty water meter', 'electricity surge bill', 'abnormal electricity bill',
    'पानी का बिल ज्यादा', 'कमर्शियल टैरिफ विवाद', 'गलत बिजली बिल', 'मीटर खराब',
    'నీటి బిల్లు ఎక్కువ', 'కమర్షియల్ టారిఫ్ వివాదం', 'మీటర్ తప్పు బిల్లు',
    'தண்ணீர் கட்டண சர்ச்சை', 'அதிக மின் கட்டணம்', 'தவறான மீட்டர்',
    'ನೀರಿನ ಬಿಲ್ ಹೆಚ್ಚು', 'ವಾಣಿಜ್ಯ ದರ ವಿವಾದ', 'ತಪ್ಪು ಮೀಟರ್ ಬಿಲ್',
    'വെള്ളക്കരം കൂടുതൽ', 'താരിഫ് തർക്കം', 'അമിത വൈദ്യുതി ബിൽ',
    'পানির বিল বেশি', 'বাণিজ্যিক শুল্ক বিরোধ', 'ভুল মিটার বিল',
    'पाण्याचे बिल जास्त', 'व्यावसायिक दर वाद', 'मीटर बिघाड बिल',
    'પાણીનું બિલ વધારે', 'કોમર્શિયલ ટેરિફ વિવાદ', 'ખોટું બિલ',
  ],

  TOUGH_PENSION_BIOMETRIC_FAILURE: [
    'pension stopped', 'jeevan pramaan failed', 'biometric failed pension', 'life certificate rejected', 'fingerprint not matching pension', 'face auth failed', 'digital life certificate failure',
    'पेंशन बंद', 'जीवन प्रमाण पत्र फेल', 'बायोमेट्रिक नहीं मिला', 'फिंगरप्रिंट मैच नहीं',
    'పింఛను ఆగిపోయింది', 'జీవన్ ప్రమాణ్ ఫెయిల్', 'బయోమెట్రిక్ విఫలం',
    'ஓய்வூதியம் நிறுத்தப்பட்டது', 'ஜீவன் பிரமாண் தோல்வி', 'கைரேகை பொருந்தவில்லை',
    'ಪಿಂಚಣಿ ನಿಂತಿದೆ', 'ಜೀವನ್ ಪ್ರಮಾಣ್ ವಿಫಲ', 'ಬಯೋಮೆಟ್ರಿಕ್ ಹೊಂದುತ್ತಿಲ್ಲ',
    'പെൻഷൻ തടസ്സപ്പെട്ടു', 'ജീവൻ പ്രമാൺ പരാജയം',
    'পেনশন বন্ধ', 'জীবন প্রমাণ ব্যর্থ', 'বায়োমেট্রিক অমিল',
    'पेन्शन बंद', 'जीवन प्रमाणपत्र अयशस्वी', 'बायोमेट्रिक जुळत नाही',
    'પેન્શન બંધ', 'જીવન પ્રમાણપત્ર નિષ્ફળ', 'બાયોમેટ્રિક નિષ્ફળ',
  ],

  // ── DAILY CIVIC SERVICES (HIGH ACCURACY) ──
  AADHAAR_MOBILE_UPDATE: [
    'aadhaar mobile', 'link mobile aadhaar', 'change phone aadhaar', 'mobile number aadhaar', 'update phone', 'aadhaar seva kendra', 'aadhaar biometric update', 'pvc aadhaar', 'download aadhaar',
    'change mobile number', 'update mobile', 'mobile update', 'change mobile', 'link mobile', 'phone number aadhaar', 'update aadhaar', 'aadhaar update', 'change address aadhaar', 'aadhaar address',
    'आधार मोबाइल', 'आधार में फोन नंबर', 'मोबाइल नंबर लिंक', 'आधार बायोमेट्रिक', 'पीवीसी आधार', 'मोबाइल नंबर बदलना', 'आधार अपडेट',
    'ఆధార్ మొబైల్ నంబర్', 'ఫోన్ నంబర్ లింక్', 'ఆధార్ బయోమెట్రిక్', 'మొబైల్ మార్పు', 'ఆధార్ అప్‌డేట్',
    'ஆதார் மொபைல் எண்', 'தொலைபேசி எண் மாற்றம்', 'ஆதார் புதுப்பித்தல்',
    'ಆಧಾರ್ ಮೊಬೈಲ್ ಲಿಂಕ್', 'ಫೋನ್ ನಂಬರ್ ಬದಲಾವಣೆ', 'ಆಧಾರ್ ನವೀಕರಣ',
    'ആധാർ മൊബൈൽ നമ്പർ മാറ്റം', 'ആധാർ പിവിസി',
    'আধার মোবাইল লিঙ্ক', 'ফোন নম্বর আপডেট',
    'आधार मोबाईल लिंक', 'मोबाईल नंबर बदल',
    'આધાર મોબાઇલ નંબર', 'ફોન નંબર લિંક',
  ],

  RATION_CARD_SERVICE: [
    'ration card', 'bpl card', 'apl card', 'antyodaya', 'ration quota', 'add name ration card', 'new ration card', 'ration dealer', 'food grain', 'nfsa',
    'राशन कार्ड', 'बीपीएल कार्ड', 'राशन में नाम जोड़ना', 'नया राशन कार्ड', 'अन्न योजना',
    'రేషన్ కార్డు', 'బీపీఎల్ కార్డు', 'రేషన్ లో పేరు చేర్చడం', 'కొత్త రేషన్ కార్డు',
    'ரேஷன் கார்டு', 'புதிய ரேஷன் அட்டை', 'பெயர் சேர்த்தல்',
    'ಪಡಿತರ ಚೀಟಿ', 'ರೇಷನ್ ಕಾರ್ಡ್', 'ಹೊಸ ರೇಷನ್ ಕಾರ್ಡ್', 'ಹೆಸರು ಸೇರಿಸುವುದು',
    'റേഷൻ കാർഡ്', 'ബിപിഎൽ കാർഡ്', 'റേഷൻ അലോട്ട്മെന്റ്',
    'রেশন কার্ড', 'নতুন রেশন কার্ড', 'নাম যোগ',
    'रेशन कार्ड', 'नवीन रेशन कार्ड', 'बीपीएल कार्ड',
    'રેશન કાર્ડ', 'નવું રેશન કાર્ડ', 'નામ ઉમેરવું',
  ],

  CASTE_INCOME_CERTIFICATE: [
    'caste certificate', 'income certificate', 'obc certificate', 'sc st certificate', 'ews certificate', 'domicile certificate', 'residence certificate', 'nadakacheri', 'meeseva', 'edistrict',
    'जाति प्रमाण पत्र', 'आय प्रमाण पत्र', 'निवास प्रमाण पत्र', 'ईडब्ल्यूएस प्रमाण पत्र',
    'కుల ధ్రువీకరణ పత్రం', 'ఆదాయ ధ్రువీకరణ పత్రం', 'నివాస ధ్రువీకరణ',
    'சாதி சான்றிதழ்', 'வருமான சான்றிதழ்', 'இருப்பிட சான்றிதழ்',
    'ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ', 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ', 'ನಿವಾಸ ಪ್ರಮಾಣಪತ್ರ',
    'ജാതി സർട്ടിഫിക്കറ്റ്', 'വരുമാന സർട്ടിഫിക്കറ്റ്',
    'জাতি শংসাপত্র', 'আয় শংসাপত্র', 'আবাসিক শংসাপত্র',
    'जातीचा दाखला', 'उत्पन्नाचा दाखला', 'रहिवासी दाखला',
    'જાતિનો દાખલો', 'આવકનો દાખલો', 'રહેઠાણ પ્રમાણપત્ર',
  ],

  BIRTH_DEATH_REGISTRATION: [
    'birth certificate', 'death certificate', 'register birth', 'register death', 'crs portal', 'municipal birth certificate', 'delayed birth order',
    'जन्म प्रमाण पत्र', 'मृत्यु प्रमाण पत्र', 'जन्म पंजीकरण', 'मृत्यु पंजीकरण',
    'జనన ధ్రువీకరణ పత్రం', 'మరణ ధ్రువీకరణ పత్రం', 'పుట్టిన సర్టిఫికೇట్',
    'பிறப்பு சான்றிதழ்', 'இறப்பு சான்றிதழ்',
    'ಜನನ ಪ್ರಮಾಣಪತ್ರ', 'ಮರಣ ಪ್ರಮಾಣಪತ್ರ',
    'ജനന സർട്ടിഫിക്കറ്റ്', 'മരണ സർട്ടിഫിക്കറ്റ്',
    'জন্ম শংসাপত্র', 'মৃত্যু শংসাপত্র',
    'जन्माचा दाखला', 'मृत्यूचा दाखला',
    'જન્મ પ્રમાણપત્ર', 'મરણ પ્રમાણપત્ર',
  ],

  MARRIAGE_REGISTRATION: [
    'marriage certificate', 'marriage registration', 'register marriage', 'sub registrar marriage', 'special marriage act', 'hindu marriage act', 'wedding registration',
    'विवाह प्रमाण पत्र', 'विवाह पंजीकरण', 'शादी का रजिस्ट्रेशन',
    'వివాహ ధ్రువీకరణ పత్రం', 'పెళ్లి రిజిస్ట్రేషన్',
    'திருமண சான்றிதழ்', 'திருமண பதிவு',
    'ವಿವಾಹ ಪ್ರಮಾಣಪತ್ರ', 'ಮದುವೆ ನೋಂದಣಿ',
    'വിവാഹ സർട്ടിഫിക്കറ്റ്', 'വിവാഹ രജിസ്ട്രേഷൻ',
    'বিবাহ শংসাপত্র', 'বিয়ে নিবন্ধন',
    'विवाह नोंदणी', 'लग्नाचा दाखला',
    'લગ્ન નોંધણી', 'લગ્ન પ્રમાણપત્ર',
  ],

  AYUSHMAN_BHARAT_PMJAY: [
    'ayushman bharat', 'pmjay', 'golden card', 'health card', '5 lakh health insurance', 'ayushman hospital list', 'ayushman card apply', 'bhasha health',
    'आयुष्मान भारत', 'गोल्डन कार्ड', 'पीएमजेएवाई', '5 लाख स्वास्थ्य बीमा', 'आयुष्मान कार्ड',
    'ఆయుష్మాన్ భారత్', 'గోల్డెన్ కార్డు', 'ఉచిత వైద్యం',
    'ஆயுஷ்மான் பாரத்', 'மருத்துவ காப்பீடு',
    'ಆಯುಷ್ಮಾನ್ ಭಾರತ್', 'ಗೋಲ್ಡನ್ ಕಾರ್ಡ್', 'ಆರೋಗ್ಯ ಕಾರ್ಡ್',
    'ആയുഷ്മാൻ ഭാരത്', 'ആരോഗ്യ ഇൻഷുറൻസ്',
    'আয়ুষ্মান ভারত', 'গোল্ডেন কার্ড', 'স্বাস্থ্য বীমা',
    'आयुष्मान भारत', 'गोल्डन कार्ड', 'आरोग्य विमा',
    'આયુષ્માન ભારત', 'ગોલ્ડન કાર્ડ', 'સ્વાસ્થ્ય વીમો',
  ],

  VOTER_ID_EPIC: [
    'voter id', 'epic card', 'voters portal', 'nvsp', 'download voter id', 'new voter registration', 'form 6 voter', 'form 8 voter', 'change voter address',
    'वोटर आईडी', 'मतदाता पहचान पत्र', 'एपिक कार्ड', 'नया वोटर फॉर्म 6',
    'ఓటర్ ఐడీ', 'ఓటరు కార్డు', 'ఎపిక్ కార్డు', 'కొత్త ఓటరు నమోదు',
    'வாக்காளர் அடையாள அட்டை', 'புதிய வாக்காளர் பதிவு',
    'ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ', 'ವೋಟರ್ ಐಡಿ', 'ಹೊಸ ಮತದಾರರ ನೋಂದಣಿ',
    'വോട്ടർ ഐഡി', 'തിരിച്ചറിയൽ കാർഡ്',
    'ভোটার আইডি', 'নতুন ভোটার আবেদন',
    'मतदार ओळखपत्र', 'व्होटर आयडी', 'नवीन मतदार नोंदणी',
    'મતદાર ઓળખપત્ર', 'વોટર આઈડી', 'નવા મતદાર નોંધણી',
  ],

  PASSPORT_POLICE_VERIFICATION: [
    'passport', 'police verification passport', 'passport seva kendra', 'tatkaal passport', 'pcc police clearance', 'passport appointment',
    'पासपोर्ट', 'पुलिस वेरिफिकेशन', 'पासपोर्ट सेवा केंद्र', 'तत्काल पासपोर्ट',
    'పాస్‌పోర్ట్', 'పోలీస్ వెరిఫికేషన్', 'పాస్‌పోర్ట్ సేవా కేంద్రం',
    'பாஸ்போர்ட்', 'காவல்துறை சரிபார்ப்பு',
    'ಪಾಸ್‌ಪೋರ್ಟ್', 'ಪೊಲೀಸ್ ಪರಿಶೀಲನೆ', 'ಪಾಸ್‌ಪೋರ್ಟ್ ಸೇವಾ ಕೇಂದ್ರ',
    'പാസ്പോർട്ട്', 'പോലീസ് വെരിഫിക്കേഷൻ',
    'পাসপোর্ট', 'পুলিশ ভেরিফিকেশন',
    'पारपत्र', 'पासपोर्ट पोलीस पडताळणी',
    'પાસપોર્ટ', 'પોલીસ વેરિફિકેશન',
  ],

  RTI_APPLICATION: [
    'rti application', 'right to information', 'file rti', 'rti online', 'first appeal rti', 'public information officer', 'pio rti', 'sec 6 rti',
    'आरटीआई', 'सूचना का अधिकार', 'आरटीआई आवेदन', 'प्रथम अपील',
    'సమాచార హక్కు', 'ఆర్టీఐ దరఖాస్తు', 'మొదటి అప్పీల్',
    'தகவல் அறியும் உரிமை சட்டம்', 'ஆர்டிஐ மனு',
    'ಮಾಹಿತಿ ಹಕ್ಕು', 'ಆರ್‌ಟಿಐ ಅರ್ಜಿ', 'ಮೊದಲ ಮೇಲ್ಮನವಿ',
    'വിവരാവകാശ നിയമം', 'ആർടിഐ അപേക്ഷ',
    'তথ্য অধিকার', 'আরটিআই আবেদন',
    'माहिती अधिकार', 'आरटीआय अर्ज',
    'માહિતી અધિકાર', 'આરટીઆઈ અરજી',
  ],

  LEARNER_LICENSE_TEST: [
    'learner license', 'llr test', 'driving test slot', 'llr mock test', 'sarathi llr', 'permanent license test', 'track slot booking', 'driving license test', 'driving test booking', 'driving test', 'license test', 'book driving test', 'driving slot',
    'लर्नर लाइसेंस', 'एलएलआर टेस्ट', 'ड्राइविंग टेस्ट स्लॉट', 'सारथी टेस्ट', 'ड्राइविंग टेस्ट', 'लाइसेंस टेस्ट',
    'లెర్నర్ లైసెన్స్', 'ఎల్‌ఎల్‌ఆర్ పరీక్ష', 'డ్రైవింగ్ టెస్ట్ స్లాట్', 'డ్రైవింగ్ టెస్ట్',
    'பழகுநர் உரிமம்', 'எல்எல்ஆர் தேர்வு',
    'ಕಲಿಕಾ ಲೈಸೆನ್ಸ್', 'ಎಲ್‌ಎಲ್‌ಆರ್ ಪರೀಕ್ಷೆ', 'ಡ್ರೈವಿಂಗ್ ಟೆಸ್ಟ್ ಸ್ಲಾಟ್',
    'ലേണേഴ്സ് ലൈസൻസ്', 'ഡ്രൈവിംഗ് ടെസ്റ്റ് സ്ലോട്ട്',
    'লার্নার্স লাইসেন্স', 'ড্রাইভিং টেস্ট স্লট',
    'लर्नर लायसन्स', 'ड्रायव्हिंग टेस्ट स्लॉट',
    'લર્નર લાયસન્સ', 'ડ્રાઇવિંગ ટેસ્ટ સ્લોટ',
  ],

  EPFO_PF_CLAIM: [
    'epfo', 'pf balance', 'uan activation', 'pf withdrawal', 'form 19 pf', 'form 10c pension', 'provident fund claim', 'passbook epfo',
    'पीएफ बैलेंस', 'यूएएन एक्टिवेशन', 'पीएफ निकासी', 'ईपीएफओ',
    'పీఎఫ్ బ్యాలెన్స్', 'యూఏఎన్ యాక్టివేషన్', 'పీఎఫ్ విత్‌డ్రాల్',
    'பிஎஃப் இருப்பு', 'யூஏஎன் செயல்படுத்தல்',
    'ಪಿಎಫ್ ಬ್ಯಾಲೆನ್ಸ್', 'ಯುಎಎನ್ ಆಕ್ಟಿವೇಶನ್', 'ಪಿಎಫ್ ಹಿಂಪಡೆಯುವಿಕೆ',
    'പിഎഫ് ബാലൻസ്', 'യുഎഎൻ ആക്റ്റിവേഷൻ',
    'পিএফ ব্যালেন্স', 'ইউএএন সক্রিয়করণ',
    'पीएफ शिल्लक', 'युएएन सक्रिय करणे', 'पीएफ काढणे',
    'પીએફ બેલેન્સ', 'યુએએન એક્ટિવેશન',
  ],

  // ── BASIC DIRECT INQUIRIES ──
  BASIC_OFFICE_HOURS_FEES: [
    'timing', 'office hours', 'working hours', 'fee', 'fees', 'cost', 'how much', 'charges', 'counter timing', 'lunch time', 'saturday open', 'working days',
    'समय', 'कार्यालय का समय', 'फीस', 'शुल्क', 'कितना खर्च', 'शनिवार खुला',
    'సమయం', 'ఆఫీస్ వేళలు', 'ఫీజు', 'రుసుము', 'ఎంత ఖర్చు',
    'நேரம்', 'அலுவலக நேரம்', 'கட்டணம்', 'எவ்வளவு செலவு',
    'ಸಮಯ', 'ಕಚೇರಿ ಸಮಯ', 'ಶುಲ್ಕ', 'ಎಷ್ಟು ಖರ್ಚು',
    'സമയം', 'ഓഫീസ് സമയം', 'ഫീസ്', 'എത്ര ചെലവ്',
    'সময়', 'অফিসের সময়', 'ফি', 'খরচ কত',
    'वेळ', 'कार्यालयीन वेळ', 'शुल्क', 'खर्च किती',
    'સમય', 'કચેરી સમય', 'ફી', 'કેટલો ખર્ચ',
  ],

  BASIC_DOWNLOAD_NAV: [
    'download', 'receipt', 'form 16', 'certificate download', 'digilocker', 'tax receipt', 'challan download', 'print copy',
    'डाउनलोड', 'रसीद', 'प्रमाण पत्र डाउनलोड', 'फॉर्म 16',
    'డౌన్‌లోడ్', 'రసీదు', 'సర్టిఫికెట్ డౌన్‌లోడ్',
    'பதிவிறக்கம்', 'ரசீது', 'சான்றிதழ் பதிவிறக்கம்',
    'ಡೌನ್‌ಲೋಡ್', 'ರಶೀದಿ', 'ಪ್ರಮಾಣಪತ್ರ ಡೌನ್‌ಲೋಡ್',
    'ഡൗൺലോഡ്', 'രസീത്', 'സർട്ടിഫിക്കറ്റ് ഡൗൺലോഡ്',
    'ডাউনলোড', 'রসিদ', 'সার্টিফিকেট ডাউনলোড',
    'डाउनलोड', 'पावती', 'प्रमाणपत्र डाउनलोड',
    'ડાઉનલોડ', 'રસીદ', 'પ્રમાણપત્ર ડાઉનલોડ',
  ],

  // ── CORE APPLICATION & ESCALATION WORKFLOWS ──
  HUMAN_OFFICER_ESCALATION: [
    'human', 'officer', 'agent', 'support person', 'talk to person', 'call me', 'representative', 'escalate to human', 'live chat',
    'अधिकारी से बात', 'इंसान', 'प्रतिनिधि', 'कॉल करें', 'लाइव अधिकारी',
    'అధికారితో మాట్లాడండి', 'లైవ్ చాట్', 'కాల్ చేయండి',
    'அதிகாரியிடம் பேச', 'நேரடி சாட்', 'அழைக்கவும்',
    'ಅಧಿಕಾರಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ', 'ಲೈವ್ ಚಾಟ್', 'ಕಾಲ್ ಮಾಡಿ',
    'ഉദ്യോഗസ്ഥനുമായി സംസാരിക്കുക', 'ലൈവ് ചാറ്റ്',
    'আধিকারিকের সাথে কথা', 'লাইভ চ্যাট', 'কল করুন',
    'अधिकाऱ्याशी बोला', 'लाइव्ह चॅट', 'कॉल करा',
    'અધિકારી સાથે વાત', 'લાઇવ ચેટ', 'કોલ કરો',
  ],

  GRIEVANCE_LODGE: [
    'grievance', 'complaint', 'problem', 'delay', 'bribe', 'stuck', 'corrupt', 'cpgrams', 'unresolved',
    'शिकायत', 'समस्या', 'विलंब', 'देरी', 'परेशानी', 'लंबित',
    'ఫిర్యాదు', 'సమస్య', 'ఆలస్యం', 'బాధ',
    'குறை', 'மனு', 'புகார்', 'தாமதம்', 'பிரச்சனை',
    'ದೂರು', 'ಕುಂದುಕೊರತೆ', 'ಸಮಸ್ಯೆ', 'ವಿಳಂಬ',
    'പരാതി', 'പ്രശ്നം', 'താമസം',
    'অভিযোগ', 'সমস্যা', 'বিলম্ব', 'দেরি',
    'तक्रार', 'समस्या', 'विलंब', 'अडचण',
    'ફરિયાદ', 'સમસ્યા', 'વિલંબ', 'મુશ્કેલી',
  ],

  APPLICATION_STATUS: [
    'application status', 'track application', 'check status', 'track status', 'track dl', 'track mutation', 'track license', 'arn status', 'acknowledgement status',
    'आवेदन स्थिति', 'स्थिति चेक', 'आवेदन ट्रैक', 'ट्रैक करें',
    'దరఖాస్తు స్థితి', 'ట్రాక్ అప్లికేషన్',
    'விண்ணப்ப நிலை', 'நிலையை சரிபார்க்க',
    'ಅರ್ಜಿ ಸ್ಥಿತಿ', 'ಟ್ರ್ಯಾಕ್ ಅರ್ಜಿ',
    'അപേക്ഷാ നില', 'സ്റ്റാറ്റസ് പരിശോധിക്കുക',
    'আবেদন স্থিতি', 'ট্র্যাক করুন',
    'अर्जाची स्थिती', 'स्थिती तपासा',
    'અરજી સ્થિતિ', 'ટ્રેક કરો',
  ],

  SERVICE_INQUIRY: [
    'service list', 'solar subsidy', 'scheme list', 'pension scheme', 'how to apply service', 'eligibility check',
    'सेवा सूची', 'सोलर सब्सिडी', 'योजना सूची', 'पेंशन योजना',
    'సేవల జాబితా', 'సౌర సబ్సిడీ', 'పథకాల జాబితా',
    'சேவைகள் பட்டியல்', 'சூரிய மானியம்',
    'ಸೇವೆಗಳ ಪಟ್ಟಿ', 'ಸೌರ ಸಬ್ಸಿಡಿ',
    'സേവനങ്ങളുടെ പട്ടിക',
    'পরিষেবা তালিকা',
    'सेवा यादी',
    'સેવા યાદી',
  ],

  DOCUMENT_VAULT: [
    'document vault', 'vault', 'my documents', 'upload document', 'document locker', 'digilocker', 'expiring documents', 'certificate locker',
    'दस्तावेज़ वॉल्ट', 'वॉल्ट', 'डिजिटल लॉकर', 'डॉक्यूमेंट अपलोड',
    'పత్రాల వాల్ట్', 'వాల్ట్', 'డిజిలాకర్',
    'ஆவண பெட்டகம்', 'டிஜிலாக்கர்',
    'ದಾಖಲೆ ವಾಲ್ಟ್', 'ಡಿಜಿಲಾಕರ್',
    'രേഖാ വോൾട്ട്',
    'নথি ভল্ট',
    'दस्तऐवज व्हॉल्ट',
    'દસ્તાવેજ વૉલ્ટ',
  ],

  PAYMENT_DUE: [
    'payment', 'tax', 'pay', 'receipt', 'due', 'challan', 'bbps',
    'भुगतान', 'टैक्स', 'कर', 'रसीद', 'शुल्क', 'बिल',
    'చెల్లింపు', 'పన్ను', 'రసీదు', 'రుసుము', 'బిల్లు',
    'கட்டணம்', 'வரி', 'ரசீது', 'செலுத்த',
    'ಪಾವತಿ', 'ತೆರಿಗೆ', 'ರಶೀದಿ', 'ಶುಲ್ಕ',
    'പേയ്‌മെന്റ്', 'നികുതി', 'രസീത്', 'ഫീസ്',
    'পেমেন্ট', 'ট্যাক্স', 'কর', 'রসিদ', 'ফি',
    'पेमेंट', 'कर', 'पावती', 'शुल्क',
    'ચુકવણી', 'ટેક્સ', 'કર', 'રસીદ', 'ફી',
  ],

  GENERAL_CIVIC_HELP: ['help', 'hello', 'hi', 'namaste', 'guide', 'info', 'menu'],
}

export const aiAgentService = {
  detectIntent(userText: string): { intent: AgentIntent; confidence: number } {
    const text = userText.toLowerCase().trim()

    // 1. Check for Tough Disputes first
    if (INTENT_KEYWORDS.TOUGH_AADHAAR_PAN_MISMATCH.some((k) => text.includes(k))) return { intent: 'TOUGH_AADHAAR_PAN_MISMATCH', confidence: 0.98 }
    if (INTENT_KEYWORDS.TOUGH_MUTATION_OBJECTION.some((k) => text.includes(k))) return { intent: 'TOUGH_MUTATION_OBJECTION', confidence: 0.98 }
    if (INTENT_KEYWORDS.TOUGH_RTO_SCRUTINY_REJECTION.some((k) => text.includes(k))) return { intent: 'TOUGH_RTO_SCRUTINY_REJECTION', confidence: 0.97 }
    if (INTENT_KEYWORDS.TOUGH_SOLAR_NET_METERING_DELAY.some((k) => text.includes(k))) return { intent: 'TOUGH_SOLAR_NET_METERING_DELAY', confidence: 0.96 }
    if (INTENT_KEYWORDS.TOUGH_WATER_TARIFF_SURGE.some((k) => text.includes(k))) return { intent: 'TOUGH_WATER_TARIFF_SURGE', confidence: 0.95 }
    if (INTENT_KEYWORDS.TOUGH_PENSION_BIOMETRIC_FAILURE.some((k) => text.includes(k))) return { intent: 'TOUGH_PENSION_BIOMETRIC_FAILURE', confidence: 0.97 }

    // 2. Human escalation request
    if (INTENT_KEYWORDS.HUMAN_OFFICER_ESCALATION.some((k) => text.includes(k))) return { intent: 'HUMAN_OFFICER_ESCALATION', confidence: 0.99 }

    // 3. High-Accuracy Daily Civic Services
    if (INTENT_KEYWORDS.AADHAAR_MOBILE_UPDATE.some((k) => text.includes(k))) return { intent: 'AADHAAR_MOBILE_UPDATE', confidence: 0.96 }
    if (INTENT_KEYWORDS.RATION_CARD_SERVICE.some((k) => text.includes(k))) return { intent: 'RATION_CARD_SERVICE', confidence: 0.96 }
    if (INTENT_KEYWORDS.CASTE_INCOME_CERTIFICATE.some((k) => text.includes(k))) return { intent: 'CASTE_INCOME_CERTIFICATE', confidence: 0.95 }
    if (INTENT_KEYWORDS.BIRTH_DEATH_REGISTRATION.some((k) => text.includes(k))) return { intent: 'BIRTH_DEATH_REGISTRATION', confidence: 0.95 }
    if (INTENT_KEYWORDS.MARRIAGE_REGISTRATION.some((k) => text.includes(k))) return { intent: 'MARRIAGE_REGISTRATION', confidence: 0.95 }
    if (INTENT_KEYWORDS.AYUSHMAN_BHARAT_PMJAY.some((k) => text.includes(k))) return { intent: 'AYUSHMAN_BHARAT_PMJAY', confidence: 0.96 }
    if (INTENT_KEYWORDS.VOTER_ID_EPIC.some((k) => text.includes(k))) return { intent: 'VOTER_ID_EPIC', confidence: 0.95 }
    if (INTENT_KEYWORDS.PASSPORT_POLICE_VERIFICATION.some((k) => text.includes(k))) return { intent: 'PASSPORT_POLICE_VERIFICATION', confidence: 0.95 }
    if (INTENT_KEYWORDS.RTI_APPLICATION.some((k) => text.includes(k))) return { intent: 'RTI_APPLICATION', confidence: 0.95 }
    if (INTENT_KEYWORDS.LEARNER_LICENSE_TEST.some((k) => text.includes(k))) return { intent: 'LEARNER_LICENSE_TEST', confidence: 0.94 }
    if (INTENT_KEYWORDS.EPFO_PF_CLAIM.some((k) => text.includes(k))) return { intent: 'EPFO_PF_CLAIM', confidence: 0.94 }

    // 4. Basic Inquiries (Hours, Fees, Downloads)
    if (INTENT_KEYWORDS.BASIC_OFFICE_HOURS_FEES.some((k) => text.includes(k))) return { intent: 'BASIC_OFFICE_HOURS_FEES', confidence: 0.94 }
    if (INTENT_KEYWORDS.BASIC_DOWNLOAD_NAV.some((k) => text.includes(k))) return { intent: 'BASIC_DOWNLOAD_NAV', confidence: 0.93 }

    // 5. Standard Intent Workflows
    if (INTENT_KEYWORDS.GRIEVANCE_LODGE.some((k) => text.includes(k))) return { intent: 'GRIEVANCE_LODGE', confidence: 0.94 }
    if (INTENT_KEYWORDS.APPLICATION_STATUS.some((k) => text.includes(k))) return { intent: 'APPLICATION_STATUS', confidence: 0.95 }
    if (INTENT_KEYWORDS.PAYMENT_DUE.some((k) => text.includes(k))) return { intent: 'PAYMENT_DUE', confidence: 0.92 }
    if (INTENT_KEYWORDS.DOCUMENT_VAULT.some((k) => text.includes(k))) return { intent: 'DOCUMENT_VAULT', confidence: 0.90 }
    if (INTENT_KEYWORDS.SERVICE_INQUIRY.some((k) => text.includes(k))) return { intent: 'SERVICE_INQUIRY', confidence: 0.88 }

    return { intent: 'GENERAL_CIVIC_HELP', confidence: 0.70 }
  },

  async processMessage(
    userText: string,
    lang: SupportedLanguage
  ): Promise<AssistantMessage> {
    const { intent } = this.detectIntent(userText)
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const preset = CIVIC_ASSISTANT_CONTENT[lang] || CIVIC_ASSISTANT_CONTENT.en
    const lower = userText.toLowerCase()

    let content = ''
    let suggestedActions: AssistantAction[] = []
    let cardType: AssistantMessage['cardType']
    let cardData: Record<string, any> | undefined
    let isEscalated = false

    switch (intent) {
      // ════════════════════════════════════════════════════════════
      // HIGH ACCURACY CIVIC DOMAIN 1: AADHAAR MOBILE & BIOMETRICS
      // ════════════════════════════════════════════════════════════
      case 'AADHAAR_MOBILE_UPDATE': {
        content = lang === 'hi'
          ? `🆔 **आधार मोबाइल नंबर लिंक एवं बायोमेट्रिक अपडेट प्रक्रिया:**\n\n📌 **सीधा उत्तर:** सुरक्षा नियमों के अनुसार मोबाइल नंबर लिंक कराने के लिए आधार सेवा केंद्र (ASK) या डाकघर जाना अनिवार्य है (बायोमेट्रिक प्रमाणीकरण आवश्यक है)।\n\n📋 **आवश्यक दस्तावेज़:**\n• कोई दस्तावेज़ आवश्यक नहीं (केवल मूल आधार कार्ड या 12 अंकों का आधार नंबर)।\n\n💰 **आधिकारिक सरकारी शुल्क:** ₹50 (बायोमेट्रिक अपडेट के लिए ₹100)।\n⏱️ **वैधानिक समय सीमा (SLA):** 7 कार्य दिवस (अपडेट स्थिति एसएमएस द्वारा भेजी जाती है)।\n\n🚀 **अगला कदम:** आप नजदीकी आधार सेवा केंद्र के लिए ऑनलाइन अपॉइंटमेंट बुक कर सकते हैं या कतार से बचने के लिए टोकन ले सकते हैं।`
          : lang === 'te'
          ? `🆔 **ఆధార్ మొబైల్ నంబర్ లింక్ & అప్‌డేట్ విధానం:**\n\n📌 **సూటి సమాధానం:** ఆధార్‌లో మొబైల్ నంబర్ మార్చడానికి సమీప ఆధార్ సేవా కేంద్రం (ASK) లేదా పోస్టాఫీస్‌ను సందర్శించాలి.\n\n📋 **కావలసిన పత్రాలు:** ఆధార్ నంబర్ మాత్రమే సరిపోతుంది.\n💰 **అధికారిక రుసుము:** ₹50 (బయోమెట్రిక్‌కు ₹100).\n⏱️ **సమయం (SLA):** 7 పని దినాలు.`
          : `🆔 **Aadhaar Mobile Number Link & Biometric Update Guide:**\n\n📌 **Direct Answer:** Linking or updating a mobile number in Aadhaar requires mandatory physical biometric verification (fingerprint/iris) at an authorized Aadhaar Seva Kendra (ASK) or post office.\n\n📋 **Documents Required:**\n• No supporting documents needed! Only your original 12-digit Aadhaar number is required.\n\n💰 **Official Statutory Fee:** ₹50 for demographic update (₹100 for biometric updates).\n⏱️ **Turnaround SLA:** 7 Business Days (SMS confirmation sent upon generation).\n\n🚀 **Next Step:** You can book an online appointment slot at your nearest UIDAI Seva Kendra to skip the queue.`

        suggestedActions = [
          { label: 'Find Nearest Aadhaar Kendra', action: 'navigate', targetUrl: '/app/services' },
          { label: 'Open Document Vault', action: 'navigate', targetUrl: '/app/documents' },
          { label: 'Aadhaar-PAN Mismatch Help', action: 'send_text' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // HIGH ACCURACY CIVIC DOMAIN 2: RATION CARD (NFSA)
      // ════════════════════════════════════════════════════════════
      case 'RATION_CARD_SERVICE': {
        content = lang === 'hi'
          ? `🌾 **राशन कार्ड (राष्ट्रीय खाद्य सुरक्षा अधिनियम) संपूर्ण जानकारी:**\n\n📌 **सीधा उत्तर:** बीपीएल (गरीबी रेखा से नीचे), एपीएल, या अंत्योदय (AAY) राशन कार्ड के लिए ऑनलाइन अथवा ई-सेवा केंद्र से आवेदन किया जा सकता है।\n\n📋 **आवश्यक दस्तावेज़:**\n• सभी पारिवारिक सदस्यों के आधार कार्ड\n• परिवार के मुखिया (महिला वरीयता) का पासपोर्ट साइज फोटो\n• आय प्रमाण पत्र (वार्षिक आय ₹1.20 लाख से कम बीपीएल हेतु)\n• आवासीय पता प्रमाण (बिजली बिल / मकान किराया अनुबंध)\n• गैस कनेक्शन विवरण (उपभोक्ता संख्या)\n\n💰 **सरकारी शुल्क:** ₹50 (डिजिटल स्मार्ट कार्ड जारी करने हेतु ₹100)।\n⏱️ **वैधानिक समय सीमा (SLA):** खाद्य निरीक्षक द्वारा 15 दिनों में भौतिक सत्यापन, 30 दिनों में कार्ड जारी।\n\n⚖️ **खाद्यान्न पात्रता:** बीपीएल कार्डधारकों को प्रति व्यक्ति 5 किलोग्राम मुफ्त खाद्यान्न (चावल/गेहूं) प्रतिमाह।`
          : `🌾 **Ration Card (NFSA - National Food Security Act) Guide:**\n\n📌 **Direct Answer:** Eligible families can apply for BPL (Priority Household), APL, or Antyodaya (AAY) Ration Cards online via the Food & Civil Supplies Portal or at CSC/Citizen service centers.\n\n📋 **Documents Required:**\n• Aadhaar Cards of all family members\n• Income Certificate (family income under ₹1.20 Lakh/year for BPL status)\n• Address Proof (Electricity bill / Property tax / Rental agreement)\n• LPG Consumer Gas Connection details\n• Passport photo of the Female Head of the Household\n\n💰 **Official Statutory Fee:** ₹50 application charge (₹100 for biometric smart card).\n⏱️ **Statutory Turnaround (SLA):** 15 Days for Food Inspector field scrutiny; 30 Days for card dispatch.\n\n⚖️ **Grain Entitlement:** 5 kg food grains per member/month free under PM-GKAY.`

        suggestedActions = [
          { label: 'Apply for Ration Card', action: 'navigate', targetUrl: '/app/services' },
          { label: 'Lodge Ration PDS Grievance', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // HIGH ACCURACY CIVIC DOMAIN 3: CASTE & INCOME CERTIFICATES
      // ════════════════════════════════════════════════════════════
      case 'CASTE_INCOME_CERTIFICATE': {
        content = lang === 'hi'
          ? `📜 **जाति एवं आय प्रमाण पत्र (राजस्व विभाग) आवेदन नियम:**\n\n📌 **सीधा उत्तर:** सरकारी छात्रवृत्ति, नौकरी आरक्षण, अथवा योजनाओं के लिए तहसीलदार द्वारा हस्ताक्षरित डिजिटल प्रमाण पत्र जारी किया जाता है।\n\n📋 **आवश्यक दस्तावेज़:**\n• आवेदक एवं माता-पिता का आधार कार्ड\n• पिता/भाई का पूर्व जाति प्रमाण पत्र या स्कूल लीविंग सर्टिफिकेट\n• वेतन पर्ची / आईटीआर अथवा ग्राम पटवारी आय रिपोर्ट\n• आवासीय प्रमाण पत्र (निवास)\n\n💰 **आधिकारिक शुल्क:** ₹25 से ₹40 (ई-डिस्ट्रिक्ट पोर्टल)\n⏱️ **वैधानिक समय सीमा (सकल अधिनियम):** 21 कार्य दिवस।\n⏳ **वैधता अवधि:** जाति प्रमाण पत्र आजीवन वैध होता है; आय प्रमाण पत्र 1 से 3 वर्ष के लिए मान्य होता है।`
          : `📜 **Caste, Income & Domicile Certificate Guidelines:**\n\n📌 **Direct Answer:** Revenue certificates (SC/ST, OBC, EWS, Income) are digitally issued by the Tahsildar / Sub-Divisional Magistrate for scholarships, employment quotas, and subsidies.\n\n📋 **Documents Required:**\n• Aadhaar Cards of applicant and parents\n• School Leaving Certificate showing caste category\n• Father's/Sibling's existing caste proof or ancestral land revenue record\n• Income proof (Salary slip / Form 16 / Village Administrative Officer report)\n• Notarized Self-Declaration Affidavit\n\n💰 **Official Fee:** ₹25 to ₹40 on e-District / Nadakacheri portal.\n⏱️ **Turnaround SLA (Right to Services):** 21 Business Days guaranteed.\n⏳ **Validity:** Caste certificate has lifetime validity; Income certificate is valid for 1 to 3 financial years.`

        suggestedActions = [
          { label: 'Apply on Services Portal', action: 'navigate', targetUrl: '/app/services' },
          { label: 'View Stored Certificates', action: 'navigate', targetUrl: '/app/documents' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // HIGH ACCURACY CIVIC DOMAIN 4: BIRTH & DEATH REGISTRATION
      // ════════════════════════════════════════════════════════════
      case 'BIRTH_DEATH_REGISTRATION': {
        content = lang === 'hi'
          ? `👶 **जन्म एवं मृत्यु प्रमाण पत्र पंजीकरण (नागरिक पंजीकरण प्रणाली - CRS):**\n\n📌 **सीधा उत्तर:** जन्म या मृत्यु की घटना के 21 दिनों के भीतर पंजीकरण पूर्णतः निःशुल्क है।\n\n📋 **आवश्यक दस्तावेज़:**\n• अस्पताल से जारी डिस्चार्ज/जन्म रिपोर्ट फॉर्म (अस्पताल संस्थागत प्रसव)\n• माता और पिता दोनों का आधार कार्ड\n• यदि गृह प्रसव हो: स्थानीय पार्षद/ग्राम प्रधान का सत्यापन प्रमाण पत्र\n\n💰 **शुल्क:** 21 दिनों में ₹0 (निःशुल्क); 21 से 30 दिन में ₹2 विलंब शुल्क; 1 वर्ष बाद तहसीलदार/एसडीएम अनुमति के साथ ₹10 शुल्क।\n⏱️ **जारी करने की समय सीमा:** 7 से 14 कार्य दिवस (डिजिटल क्यूआर कोड के साथ)।`
          : `👶 **Birth & Death Civil Registration Guidelines (RBD Act 1969):**\n\n📌 **Direct Answer:** Registration of birth or death within 21 days of occurrence is completely free of statutory charges on the CRS / Municipal portal.\n\n📋 **Documents Required:**\n• Hospital Institutional Birth/Death Intimation Slip\n• Aadhaar Cards of both parents / informants\n• Marriage Certificate of parents (for child registration)\n• Informant declaration form\n\n💰 **Fee Schedule:**\n• Within 21 Days: ₹0 (Free)\n• 21 to 30 Days: ₹2 Late Fee\n• 30 Days to 1 Year: ₹5 + Revenue Inspector endorsement\n• After 1 Year: ₹10 + Sub-Divisional Magistrate (SDM) Delayed Order under Section 13(3).\n⏱️ **Dispatch SLA:** 7 to 14 Business Days with verifiable digital QR stamp.`

        suggestedActions = [
          { label: 'Open Civic Services', action: 'navigate', targetUrl: '/app/services' },
          { label: 'Check Document Vault', action: 'navigate', targetUrl: '/app/documents' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // HIGH ACCURACY CIVIC DOMAIN 5: MARRIAGE REGISTRATION
      // ════════════════════════════════════════════════════════════
      case 'MARRIAGE_REGISTRATION': {
        content = lang === 'hi'
          ? `💍 **विवाह पंजीकरण (हिन्दू विवाह अधिनियम / विशेष विवाह अधिनियम):**\n\n📌 **सीधा उत्तर:** कानूनी अधिकारों, संयुक्त संपत्ति, पासपोर्ट एवं वीज़ा के लिए विवाह का पंजीकरण अनिवार्य है। यह सब-रजिस्ट्रार कार्यालय (SRO) द्वारा किया जाता है।\n\n📋 **आवश्यक दस्तावेज़:**\n• वर और वधू दोनों के आयु प्रमाण (10वीं सर्टिफिकेट/पासपोर्ट - वर ≥21 वर्ष, वधू ≥18 वर्ष)\n• दोनों का आवासीय पता प्रमाण (आधार/वोटर आईडी)\n• विवाह आमंत्रण पत्रिका (Wedding Card) एवं विवाह स्थल रसीद\n• विवाह की 4 संयुक्त तस्वीरें एवं वरमाला की तस्वीर\n• 3 बालिग गवाह (आधार कार्ड एवं फोटो सहित)\n\n💰 **सरकारी शुल्क:** हिन्दू विवाह अधिनियम: ₹100 + ₹50 आवेदन; विशेष विवाह अधिनियम: ₹150।\n⏱️ **समय सीमा:** हिन्दू विवाह: 7 कार्य दिवस; विशेष विवाह: 30 दिवसीय सार्वजनिक नोटिस के बाद।`
          : `💍 **Marriage Registration Guidelines (HMA 1955 & SMA 1954):**\n\n📌 **Direct Answer:** Legal registration of marriage is mandatory for spousal benefits, foreign travel, passport updating, and joint property rights before the Sub-Registrar of Assurances.\n\n📋 **Documents Required:**\n• Age Proof of Bride (≥18) & Groom (≥21) - 10th Certificate / Passport / Birth Certificate\n• Residence Proof (Aadhaar / Voter ID / Passport)\n• Wedding Invitation Card & Hall Booking Receipt / Priest Certificate\n• 4 Passport photos of bride & groom + 2 wedding photos\n• 3 Adult Witnesses with verified Aadhaar credentials\n\n💰 **Official Statutory Fee:** ₹100 under Hindu Marriage Act (₹150 under Special Marriage Act).\n⏱️ **SLA:** Same-day or 7 days under Hindu Marriage Act; 30-day statutory notice period under Special Marriage Act.`

        suggestedActions = [
          { label: 'Browse Civic Services', action: 'navigate', targetUrl: '/app/services' },
          { label: 'Customer Care Support', action: 'navigate', targetUrl: '/app/support' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // HIGH ACCURACY CIVIC DOMAIN 6: AYUSHMAN BHARAT PM-JAY
      // ════════════════════════════════════════════════════════════
      case 'AYUSHMAN_BHARAT_PMJAY': {
        content = lang === 'hi'
          ? `🏥 **आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (PM-JAY):**\n\n📌 **सीधा उत्तर:** पात्र गरीब एवं मध्यमवर्गीय परिवारों को प्रतिवर्ष ₹5,00,000 का निःशुल्क कैशलेस स्वास्थ्य बीमा मिलता है।\n\n📋 **पात्रता एवं दस्तावेज़:**\n• सामाजिक-आर्थिक जाति जनगणना (SECC 2011) सूची अथवा बीपीएल राशन कार्ड में नाम\n• आधार कार्ड (ओटीपी या फिंगरप्रिंट सत्यापन)\n• मोबाइल नंबर (ओटीपी हेतु)\n\n💰 **कार्ड निर्माण शुल्क:** सरकारी अस्पताल/आरोग्य मंदिर में ₹0 (निःशुल्क); सीएससी पर ₹30।\n⏱️ **आयुष्मान गोल्डन कार्ड:** ई-केवाईसी सत्यापन के 2 घंटे के भीतर डिजिटल कार्ड तुरंत डाउनलोड किया जा सकता है।\n\n🏥 **लाभ:** देश के 27,000+ सूचीबद्ध सरकारी व निजी अस्पतालों में सर्जरी, कैंसर, हृदय रोग सहित 1,949 चिकित्सा प्रक्रियाओं पर कैशलेस उपचार।`
          : `🏥 **Ayushman Bharat PM-JAY Health Protection Scheme:**\n\n📌 **Direct Answer:** Provides up to ₹5,00,000 annual cashless hospitalization cover per family across 27,000+ empaneled government and private hospitals nationwide.\n\n📋 **Eligibility & Credentials:**\n• Families listed in SECC 2011 database or possessing NFSA BPL Ration Cards\n• Aadhaar Card with active biometric/OTP link\n• Active Mobile Number\n\n💰 **Card Fee:** ₹0 (Completely Free at public hospitals / Ayushman Arogya Mandirs).\n⏱️ **Issuance Turnaround:** Instant download within 2 hours of e-KYC approval.\n\n🏥 **Coverage:** 1,949 medical treatments, including surgeries, chemotherapy, ICU hospitalization, and 15-day post-hospitalization medications.`

        suggestedActions = [
          { label: 'Check PM-JAY Eligibility', action: 'navigate', targetUrl: '/app/services' },
          { label: 'Open Health Documents', action: 'navigate', targetUrl: '/app/documents' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // HIGH ACCURACY CIVIC DOMAIN 7: VOTER ID & EPIC
      // ════════════════════════════════════════════════════════════
      case 'VOTER_ID_EPIC': {
        content = lang === 'hi'
          ? `🗳️ **मतदाता पहचान पत्र (Voter ID / EPIC) सेवा निर्देश:**\n\n📌 **सीधा उत्तर:** 18 वर्ष पूर्ण कर चुके सभी भारतीय नागरिक नए मतदाता पहचान पत्र के लिए **Form 6** द्वारा भारत निर्वाचन आयोग (ECI) के पोर्टल पर ऑनलाइन आवेदन कर सकते हैं।\n\n📋 **आवश्यक दस्तावेज़:**\n• आयु प्रमाण (आधार, पैन, जन्म प्रमाण पत्र, अथवा 10वीं मार्कशीट)\n• निवास प्रमाण (बिजली/पानी बिल, बैंक पासबुक, अथवा आधार)\n• पासपोर्ट साइज रंगीन फोटो\n\n💰 **शुल्क:** ₹0 (पूर्णतः निःशुल्क; स्पीड पोस्ट से पीवीसी कार्ड घर भेजा जाता है)।\n⏱️ **समय सीमा:** 15 से 30 दिन में बूथ लेवल अधिकारी (BLO) द्वारा सत्यापन।\n\n📲 **डिजिटल ई-एपिक:** आवेदन स्वीकृत होते ही ई-एपिक (PDF वोटर आईडी) डाउनलोड किया जा सकता है।`
          : `🗳️ **Voter ID Card (EPIC) Registration & Download Guide:**\n\n📌 **Direct Answer:** Any citizen aged 18+ can enroll as a new voter using **Form 6** on the Voters' Service Portal (ECI) or make address/name corrections using **Form 8**.\n\n📋 **Documents Required:**\n• Proof of Age (Aadhaar, Birth Certificate, or 10th Certificate)\n• Proof of Ordinary Residence (Aadhaar, Electricity Bill, or Bank Passbook)\n• Color passport photo with white background\n\n💰 **Official Fee:** ₹0 (Completely Free of cost; PVC EPIC card dispatched via Speed Post).\n⏱️ **Turnaround SLA:** 15 to 30 Days after Booth Level Officer (BLO) physical verification.\n\n📲 **Digital e-EPIC:** Download your digitally signed PDF Voter Card instantly using your EPIC Number.`

        suggestedActions = [
          { label: 'Apply on Civic Services', action: 'navigate', targetUrl: '/app/services' },
          { label: 'View Linked Digital IDs', action: 'navigate', targetUrl: '/app/identity' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // HIGH ACCURACY CIVIC DOMAIN 8: PASSPORT POLICE VERIFICATION
      // ════════════════════════════════════════════════════════════
      case 'PASSPORT_POLICE_VERIFICATION': {
        content = lang === 'hi'
          ? `✈️ **पासपोर्ट सेवा एवं पुलिस सत्यापन (Police Verification) प्रक्रिया:**\n\n📌 **सीधा उत्तर:** पासपोर्ट सेवा केंद्र (PSK) में बायोमेट्रिक साक्षात्कार के पश्चात स्थानीय पुलिस थाने द्वारा निवास एवं आपराधिक रिकॉर्ड का सत्यापन किया जाता है।\n\n📋 **आवश्यक दस्तावेज़:**\n• आधार कार्ड एवं पैन कार्ड\n• वर्तमान निवास प्रमाण (कम से कम 1 वर्ष का निवास)\n• जन्म तिथि प्रमाण (जन्म प्रमाण पत्र या 10वीं मार्कशीट)\n• सरकारी कर्मचारियों के लिए अनापत्ति प्रमाण पत्र (NOC / Annexure M)\n\n💰 **शुल्क:** सामान्य 36-पेज पासपोर्ट: ₹1,500; तत्काल पासपोर्ट: ₹3,500।\n⏱️ **पुलिस सत्यापन SLA:** 21 दिन सामान्य; तत्काल में पुलिस सत्यापन पासपोर्ट जारी होने के बाद होता है।\n\n💡 **सलाह:** पुलिस सत्यापन के समय सभी मूल दस्तावेज़ और 2 स्थानीय पड़ोसियों के पहचान प्रमाण पत्र उपलब्ध रखें।`
          : `✈️ **Passport Application & Police Verification (PCC) Guide:**\n\n📌 **Direct Answer:** Following your in-person biometric appointment at the Passport Seva Kendra (PSK), local police verification (mPassport Police App) is conducted at your residential address.\n\n📋 **Documents Required:**\n• Proof of Date of Birth (Birth Certificate / Class 10 Certificate / Aadhaar)\n• Proof of Present Address (Aadhaar, Passbook, Utility Bill valid for past 1 year)\n• PAN Card & Voter ID\n• 2 Reference letters with contact numbers of neighborhood witnesses\n\n💰 **Official Statutory Fee:** Normal 36-Page Passport: ₹1,500; Tatkaal Scheme: ₹3,500.\n⏱️ **Turnaround SLA:** Police verification completed within 21 Days (Post-issuance under Tatkaal).`

        suggestedActions = [
          { label: 'Verify Documents in Vault', action: 'navigate', targetUrl: '/app/documents' },
          { label: 'Lodge Delayed Police Query', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // HIGH ACCURACY CIVIC DOMAIN 9: RTI (RIGHT TO INFORMATION)
      // ════════════════════════════════════════════════════════════
      case 'RTI_APPLICATION': {
        content = lang === 'hi'
          ? `⚖️ **सूचना का अधिकार (RTI अधिनियम 2005) संपूर्ण नियम:**\n\n📌 **सीधा उत्तर:** किसी भी सरकारी विभाग, प्राधिकरण या सार्वजनिक उपक्रम से कार्यों, निविदाओं, फाइलों या नियमों की आधिकारिक प्रमाणित प्रतियां धारा 6(1) के तहत मांगी जा सकती हैं।\n\n📋 **आवेदन प्रक्रिया:**\n• विषय एवं मांगी गई सूचना के स्पष्ट बिंदु लिखें (अधिकतम 500 शब्द)\n• लोक सूचना अधिकारी (PIO) के नाम संबोधित करें\n• बीपीएल कार्डधारकों के लिए कोई शुल्क नहीं है (बीपीएल कार्ड संलग्न करें)\n\n💰 **वैधानिक शुल्क:** ₹10 (पोस्टल ऑर्डर / यूपीआई / ई-चालान)।\n⏱️ **जवाब की अनिवार्य समय सीमा:** 30 दिन (जीवन या स्वतंत्रता से जुड़े मामलों में 48 घंटे)।\n\n🚨 **यदि 30 दिन में जवाब न मिले:** धारा 19(1) के तहत प्रथम अपीलीय प्राधिकारी (FAA) के समक्ष निःशुल्क प्रथम अपील दायर करें।`
          : `⚖️ **Right to Information (RTI Act 2005) Filing & Appeal Guide:**\n\n📌 **Direct Answer:** Every Indian citizen is entitled to inspect government files, obtain certified copies of records, and inquire into delayed public works under Section 6(1) of the RTI Act.\n\n📋 **Filing Checklist:**\n• Specific, concise list of queries addressed to the Public Information Officer (PIO)\n• Clearly specify the department name and timeframe of records sought\n• BPL citizens are completely exempted from all application and photocopying fees\n\n💰 **Statutory Fee:** ₹10 (Postal Order, Court Fee stamp, or online payment).\n⏱️ **Mandatory Turnaround Timeline:** 30 Days (48 Hours if concerning life or liberty).\n\n🚨 **If PIO fails to respond in 30 Days:** You have the statutory right to file a First Appeal under Section 19(1) within 30 days without any fee.`

        suggestedActions = [
          { label: 'File Grievance / Appeal', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
          { label: 'Contact Nodal Officer', action: 'navigate', targetUrl: '/app/support?tab=live' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // HIGH ACCURACY CIVIC DOMAIN 10: LEARNER'S LICENSE & DRIVING
      // ════════════════════════════════════════════════════════════
      case 'LEARNER_LICENSE_TEST': {
        content = lang === 'hi'
          ? `🚗 **लर्नर लाइसेंस (LLR) टेस्ट एवं स्थायी ड्राइविंग टेस्ट स्लॉट बुक करने का तरीका:**\n\n📌 **सीधा उत्तर:** लर्नर लाइसेंस के लिए घर बैठे आधार आधारित ऑनलाइन टेस्ट (सारथी पोर्टल) दिया जा सकता है। एलएलआर जारी होने के 30 दिन बाद स्थायी ड्राइविंग लाइसेंस टेस्ट का स्लॉट बुक किया जा सकता है।\n\n📋 **आवश्यक दस्तावेज़:**\n• आधार कार्ड (ई-केवाईसी)\n• आयु प्रमाण एवं पता प्रमाण\n• फॉर्म 1 (स्वयं घोषणा) अथवा 40 वर्ष से अधिक आयु पर डॉक्टर द्वारा हस्ताक्षरित फॉर्म 1A\n\n💰 **आधिकारिक सरकारी शुल्क:**\n• एलएलआर आवेदन शुल्क: ₹150 + ₹50 टेस्ट शुल्क = **₹200**\n• स्थायी लाइसेंस नवीनीकरण/जारी: ₹200 + ₹200 स्मार्ट कार्ड = **₹400**\n⏱️ **वैधता:** लर्नर लाइसेंस 6 माह के लिए वैध होता है।`
          : `🚗 **Learner's License (LLR) & Permanent Driving Test Guide:**\n\n📌 **Direct Answer:** You can take the Computerized Learner's License (LLR) road sign test online from home via Aadhaar contactless authentication on the Sarathi Parivahan portal.\n\n📋 **Documents Required:**\n• Aadhaar Card for contactless e-KYC\n• Self-declaration Medical Fitness Form 1 (or Form 1A certified by doctor if age 40+)\n• Address & Date of Birth proof\n\n💰 **Statutory Fee Schedule:**\n• LLR Application: ₹150 + ₹50 Test Fee = **₹200**\n• Permanent DL Test + Smart Card: ₹300 Driving Test + ₹200 Smart Card = **₹500**\n⏱️ **Validity:** LLR is valid for 6 months. You can book permanent driving test slots after 30 days of LLR issuance.`

        suggestedActions = [
          { label: 'View Active DL Application', action: 'navigate', targetUrl: '/app/applications/app_991' },
          { label: 'Check License in Vault', action: 'navigate', targetUrl: '/app/documents' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // HIGH ACCURACY CIVIC DOMAIN 11: EPFO / PF WITHDRAWAL
      // ════════════════════════════════════════════════════════════
      case 'EPFO_PF_CLAIM': {
        content = lang === 'hi'
          ? `💼 **ईपीएफओ भविष्य निधि (PF) निकासी एवं यूएएन (UAN) नियम:**\n\n📌 **सीधा उत्तर:** नौकरी छोड़ने के 2 महीने बाद अथवा बीमारी/विवाह/मकान खरीद के लिए ऑनलाइन ईपीएफओ पोर्टल से पीएफ की आंशिक या पूर्ण निकासी की जा सकती है।\n\n📋 **आवश्यक शर्तें एवं दस्तावेज़:**\n• सक्रिय यूएएन (UAN) नंबर\n• आधार, पैन कार्ड एवं बैंक खाता यूएएन से सीडेड (सत्यापित) होना चाहिए\n• रद्दीकृत बैंक चेक (बैंक खाता संख्या और आईएफएससी कोड स्पष्ट)\n\n💰 **शुल्क:** ₹0 (ईपीएफओ की सभी ऑनलाइन सेवाएं पूर्णतः निःशुल्क हैं)।\n⏱️ **दावा निपटान समय (SLA):** 7 से 15 कार्य दिवस में सीधे आपके बैंक खाते में राशि ट्रांसफर होती है।`
          : `💼 **EPFO Provident Fund (PF) Withdrawal & UAN Guide:**\n\n📌 **Direct Answer:** Employees can withdraw PF balance (Form 19 for full PF, Form 10C for EPS pension, or Form 31 for advance illness/housing) directly via the Member e-Sewa Unified Portal.\n\n📋 **Prerequisites:**\n• Activated Universal Account Number (UAN)\n• Aadhaar, PAN & Bank Account seeded and verified in EPFO portal\n• Uploaded cancelled cheque with account number & IFSC visible\n\n💰 **Fee:** ₹0 (All EPFO portal claim filing services are completely free of charge).\n⏱️ **Settlement SLA:** 7 to 15 Business Days credited directly via NEFT into your verified bank account.`

        suggestedActions = [
          { label: 'View Documents Vault', action: 'navigate', targetUrl: '/app/documents' },
          { label: 'Customer Care Support', action: 'navigate', targetUrl: '/app/support' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // TOUGH DISPUTE 1: AADHAAR - PAN NAME MISMATCH
      // ════════════════════════════════════════════════════════════
      case 'TOUGH_AADHAAR_PAN_MISMATCH': {
        cardType = 'diagnostic'
        isEscalated = true
        content = lang === 'hi'
          ? 'वरिष्ठ निदान: आधार और पैन डेटाबेस में नाम/जन्म तिथि वर्तनी भिन्नता के कारण आपका ई-केवाईसी और आयकर रिफंड रुका हुआ है। मैंने आयकर अधिनियम की धारा 139AA के तहत एक 3-चरणीय समाधान तैयार किया है।'
          : 'Diagnostic Analysis: A demographic mismatch (name spelling, initials, or date of birth discrepancy) between UIDAI and NSDL databases is blocking your e-KYC and tax refund verification. Here is your definitive statutory resolution blueprint under Section 139AA.'

        const blueprint: DiagnosticBlueprint = {
          problemTitle: 'Aadhaar-PAN Demographic Discrepancy & E-KYC Lock',
          category: 'DEMOGRAPHIC_MISMATCH',
          statutoryAct: 'Section 139AA, Income Tax Act 1961 & UIDAI Demographic Guidelines 2024',
          statutorySLA: '48 to 72 Business Hours',
          severity: 'high',
          rootCause: 'Demographic mismatch between UIDAI (Aadhaar Central Identities Data Repository) and Protean/NSDL PAN registry. Differences in expanded initials or patronymic format prevent automatic algorithmic deduplication.',
          actionSteps: [
            {
              stepNumber: 1,
              title: 'Identify Primary Master Document',
              description: 'Check whether your Class 10 Certificate or Passport matches Aadhaar or PAN. Whichever document has the legal name will serve as the Golden Master.',
              mandatoryDocument: 'Class 10th Certificate / Passport',
            },
            {
              stepNumber: 2,
              title: 'Execute Single-Platform Update',
              description: 'If PAN is incorrect, submit Form 49A Online via Protean/UTIITSL. If Aadhaar differs, submit online update with Gazetted Officer Group A certificate.',
              mandatoryDocument: 'Form 49A / UIDAI Standard Certificate',
            },
            {
              stepNumber: 3,
              title: 'Submit Biometric Authentication Exception Request',
              description: 'Visit the designated Aadhaar Seva Kendra or Income Tax Facilitation Centre for biometric manual override linking.',
              mandatoryDocument: 'Signed Aadhaar-PAN Linking Requisition',
            },
          ],
          remedies: [
            { label: 'Auto-Draft Grievance Dossier', action: 'auto_file_grievance' },
            { label: 'Download Legal Affidavit', action: 'download_template' },
            { label: 'Connect Grievance Officer', action: 'book_officer_callback' },
          ],
          prefillGrievance: {
            department: 'Central Board of Direct Taxes & UIDAI Liaison',
            category: 'Demographic Data Mismatch / Verification',
            subject: 'Aadhaar-PAN Demographic Name Discrepancy Redressal Request',
            description: `Citizen requests administrative resolution for Aadhaar-PAN linking demographic discrepancy under Income Tax Act Section 139AA. Verified identity credentials ready for biometric manual clearance.`,
            priority: 'high',
          },
        }

        cardData = blueprint
        suggestedActions = [
          { label: 'Auto-Draft Grievance Dossier', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
          { label: 'Open Document Vault', action: 'navigate', targetUrl: '/app/documents' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // TOUGH DISPUTE 2: PROPERTY MUTATION LEGAL HEIR OBJECTION
      // ════════════════════════════════════════════════════════════
      case 'TOUGH_MUTATION_OBJECTION': {
        cardType = 'diagnostic'
        isEscalated = true
        content = lang === 'hi'
          ? 'वरिष्ठ निदान: संपत्ति ई-खाता दाखिल-खारिज (म्यूटेशन) में 15-30 दिवसीय सार्वजनिक नोटिस के दौरान विधिक वारिस/तृतीय पक्ष द्वारा आपत्ति दर्ज की गई है। भू-राजस्व अधिनियम की धारा 129 एवं सकल गारंटी अधिनियम के तहत विधिक समाधान ब्लूप्रिंट नीचे है।'
          : 'Diagnostic Analysis: A formal objection has been lodged against your property mutation (Khata transfer) during the statutory public notice period. Below is your procedural defense blueprint under Land Revenue Act Section 129.'

        const blueprint: DiagnosticBlueprint = {
          problemTitle: 'Contested Property Mutation & Legal Heir Title Objection',
          category: 'PROPERTY_DISPUTE',
          statutoryAct: 'Section 128 & 129, Land Revenue Act & Right to Public Services (Sakala) Act',
          statutorySLA: '15 Business Days (Summary Inquiry)',
          severity: 'critical',
          rootCause: 'A caveat or contestation was filed during the statutory public notice window contesting registered genealogical pedigree or testamentary succession (will/settlement).',
          actionSteps: [
            {
              stepNumber: 1,
              title: 'Obtain Certified Copy of Objection Petition',
              description: 'Apply for the official objection dossier and evidentiary annexures submitted to the Revenue Inspector / Shirastedar.',
              mandatoryDocument: 'Notice Objection Form & Caveat Petition',
            },
            {
              stepNumber: 2,
              title: 'Furnish Registered Pedigree (Vamshavruksha)',
              description: 'Submit an executive magistrate-certified family genealogical tree along with registered Death Certificate and surviving legal heir NOC / Release Deed.',
              mandatoryDocument: 'Registered Vamshavruksha + Notarized NOC',
            },
            {
              stepNumber: 3,
              title: 'Appear at Tahsildar Summary Inquiry (Sec 129)',
              description: 'Present registered sale deed/succession certificate. If the objection is frivolous or non-maintainable without civil court injunction, the Revenue Officer is legally bound to endorse the mutation within 15 days.',
              mandatoryDocument: 'Title Deed & Encumbrance Certificate (15 Years)',
            },
          ],
          remedies: [
            { label: 'Auto-Draft Grievance Dossier', action: 'auto_file_grievance' },
            { label: 'Download Affidavit Format', action: 'download_template' },
            { label: 'Connect Grievance Officer', action: 'book_officer_callback' },
          ],
          prefillGrievance: {
            department: 'Revenue & Land Records Directorate',
            category: 'Property Mutation / Title Dispute',
            subject: 'Urgent Redressal: Contested Property Mutation Objection Disposal',
            description: `Citizen requests expeditious summary inquiry under Section 129 of Land Revenue Act for contested E-Khata Mutation. All registered legal heir title deeds, death certificate, and Vamshavruksha genealogical pedigree are submitted.`,
            priority: 'critical',
          },
        }

        cardData = blueprint
        suggestedActions = [
          { label: 'Auto-Draft Grievance Dossier', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
          { label: 'Track Mutation Timeline', action: 'navigate', targetUrl: '/app/applications/app_992' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // TOUGH DISPUTE 3: RTO SCRUTINY REJECTION / MEDICAL AUDIT
      // ════════════════════════════════════════════════════════════
      case 'TOUGH_RTO_SCRUTINY_REJECTION': {
        cardType = 'diagnostic'
        isEscalated = true
        content = lang === 'hi'
          ? 'वरिष्ठ निदान: आपके ड्राइविंग लाइसेंस नवीनीकरण में फॉर्म 1A (चिकित्सा प्रमाण पत्र) या आरटीओ स्क्रूटनी आपत्ति उठाई गई है। मोटर वाहन अधिनियम धारा 19(2) और सीएमवीआर नियम 5 के अंतर्गत आपका वैधानिक समाधान ब्लूप्रिंट प्रस्तुत है।'
          : 'Diagnostic Analysis: The Licensing Authority has raised a formal scrutiny query or rejected your Form 1A Medical Fitness Certificate. Below is your statutory appeal and resolution blueprint under Rule 14, CMVR 1989.'

        const blueprint: DiagnosticBlueprint = {
          problemTitle: 'RTO Scrutiny Rejection & Medical Fitness Stamp Query',
          category: 'RTO_REJECTION',
          statutoryAct: 'Rules 5 & 14, Central Motor Vehicles Rules 1989 & Section 19 Motor Vehicles Act',
          statutorySLA: '3 Business Days',
          severity: 'high',
          rootCause: 'Digital Form 1A medical fitness certificate lacked the registered MBBS physician’s National Medical Commission (NMC) UID stamp, or residential proof seal required re-verification.',
          actionSteps: [
            {
              stepNumber: 1,
              title: 'Download Specific Audit Deficiency Memo',
              description: 'Retrieve the exact scrutiny rejection reason code from Sarathi Parivahan dashboard.',
              mandatoryDocument: 'RTO Audit Deficiency Memo',
            },
            {
              stepNumber: 2,
              title: 'Obtain NMC-Stamped Form 1A Attestation',
              description: 'Get Form 1A signed by a registered medical doctor with physical seal showing doctor name, MBBS degrees, and State Medical Council registration number.',
              mandatoryDocument: 'Signed & Stamped Form 1A with Eye-Test',
            },
            {
              stepNumber: 3,
              title: 'Re-Upload & Invoke Section 19(2) Fast-Track Review',
              description: 'Upload the sealed scan directly to your Application Portal. If unresolved within 3 business days, the Regional Transport Officer is statutorily mandated to grant a personal hearing.',
              mandatoryDocument: 'Valid Address Proof + Original DL Copy',
            },
          ],
          remedies: [
            { label: 'Auto-Draft Grievance Dossier', action: 'auto_file_grievance' },
            { label: 'Download Affidavit Format', action: 'download_template' },
            { label: 'Connect Grievance Officer', action: 'book_officer_callback' },
          ],
          prefillGrievance: {
            department: 'Transport Department (RTO)',
            category: 'Driving License / Scrutiny Objection',
            subject: 'Expedite Scrutiny Clearance: Form 1A Medical Fitness Re-Submission',
            description: `Citizen has re-attested and uploaded Form 1A Medical Fitness Certificate with full NMC doctor credentials and verified residential proof. Requests immediate approval under Sakala Citizen Charter.`,
            priority: 'high',
          },
        }

        cardData = blueprint
        suggestedActions = [
          { label: 'Auto-Draft Grievance Dossier', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
          { label: 'Resolve Query in Application', action: 'navigate', targetUrl: '/app/applications/app_991' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // TOUGH DISPUTE 4: SOLAR NET-METERING DELAY
      // ════════════════════════════════════════════════════════════
      case 'TOUGH_SOLAR_NET_METERING_DELAY': {
        cardType = 'diagnostic'
        isEscalated = true
        content = lang === 'hi'
          ? 'वरिष्ठ निदान: रूफटॉप सोलर लगाने के बाद बिजली वितरण कंपनी (DISCOM) द्वारा नेट-मीटर स्थापना में 30 दिन की वैधानिक सीमा का उल्लंघन किया गया है। विद्युत अधिनियम 2003 की धारा 43 के अंतर्गत प्रति दिन ₹1,000 जुर्माने का दावा एवं ब्लूप्रिंट प्रस्तुत है।'
          : 'Diagnostic Analysis: Your DISCOM has breached the statutory 30-day timeline for bi-directional net-meter installation following solar commissioning. You are legally entitled to compensation under Section 43 of the Electricity Act 2003.'

        const blueprint: DiagnosticBlueprint = {
          problemTitle: 'DISCOM Net-Metering Synchronization Delay & Subsidy Block',
          category: 'SOLAR_DISCOM_DELAY',
          statutoryAct: 'Section 43 Electricity Act 2003 & State Electricity Regulatory Commission (SERC) Grid Code',
          statutorySLA: '7 Business Days (Statutory Penalty: ₹1,000/day delay)',
          severity: 'high',
          rootCause: 'DISCOM meter testing division stock backlog or substation feeder synchronization delay beyond the 30-day statutory ceiling specified under Central Electricity Authority regulations.',
          actionSteps: [
            {
              stepNumber: 1,
              title: 'Verify Work Completion Report (WCR)',
              description: 'Ensure your empanelled solar installer has uploaded the electrical safety inspector test report and inverter synchronization certificate.',
              mandatoryDocument: 'Solar Vendor Work Completion Certificate',
            },
            {
              stepNumber: 2,
              title: 'Serve 7-Day Statutory Notice to AEE Electrical',
              description: 'Issue formal written notice to the Sub-divisional Assistant Executive Engineer citing Section 43 statutory compensation.',
              mandatoryDocument: 'Statutory Notice Draft for Net-Metering',
            },
            {
              stepNumber: 3,
              title: 'Escalate to Consumer Grievance Redressal Forum (CGRF)',
              description: 'If synchronization is not completed within 7 days, file directly before the CGRF / Electricity Ombudsman for immediate meter installation and penalty award.',
              mandatoryDocument: 'Sanction Letter & 3 Months Electricity Bills',
            },
          ],
          remedies: [
            { label: 'Auto-Draft Grievance Dossier', action: 'auto_file_grievance' },
            { label: 'Download Affidavit Format', action: 'download_template' },
            { label: 'Connect Grievance Officer', action: 'book_officer_callback' },
          ],
          prefillGrievance: {
            department: 'Electricity Supply Company (DISCOM) & Energy Department',
            category: 'Rooftop Solar / Net-Metering Synchronization Delay',
            subject: 'Statutory Notice: Delay in Bi-directional Net-Meter Installation (Sec 43 Penalty)',
            description: `Rooftop Solar PV installation completed and verified. DISCOM has exceeded the 30-day statutory grid synchronization window. Citizen requests immediate net-meter commissioning and claim for statutory delay compensation.`,
            priority: 'high',
          },
        }

        cardData = blueprint
        suggestedActions = [
          { label: 'Auto-Draft Grievance Dossier', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
          { label: 'Customer Care Desk', action: 'navigate', targetUrl: '/app/support' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // TOUGH DISPUTE 5: WATER / COMMERCIAL TARIFF SURGE
      // ════════════════════════════════════════════════════════════
      case 'TOUGH_WATER_TARIFF_SURGE': {
        cardType = 'diagnostic'
        isEscalated = true
        content = lang === 'hi'
          ? 'वरिष्ठ निदान: आपके आवासीय परिसर में कमर्शियल स्लैब या खराब मीटर के कारण अत्यधिक बिलिंग का विवाद उत्पन्न हुआ है। नगर जल बोर्ड अधिनियम के तहत श्रेणी सुधार एवं मीटर जांच का वैधानिक ब्लूप्रिंट प्रस्तुत है।'
          : 'Diagnostic Analysis: Your residential premises has been misclassified under commercial tariff or billed erroneously due to meter gear seizure. Below is your statutory joint-calibration and dispute stay blueprint.'

        const blueprint: DiagnosticBlueprint = {
          problemTitle: 'Erroneous Commercial Tariff Misclassification & Water Meter Surge',
          category: 'TARIFF_DISPUTE',
          statutoryAct: 'Municipal Water Supply Regulations & State Electricity Supply Code Sec 56',
          statutorySLA: '5 Business Days (Disconnection Stay Granted)',
          severity: 'moderate',
          rootCause: 'Administrative miscoding of domestic residential property as non-domestic/commercial, or mechanical turbine meter jamming resulting in extrapolated average surge billing.',
          actionSteps: [
            {
              stepNumber: 1,
              title: 'Petition for Category Reclassification to Domestic',
              description: 'Submit property tax receipt and residential occupancy certificate proving the premises is strictly used for dwelling.',
              mandatoryDocument: 'Property Tax Paid Receipt / Residential Khata',
            },
            {
              stepNumber: 2,
              title: 'Demand NABL Accredited Joint Meter Calibration',
              description: 'Deposit the statutory meter testing fee (typically ₹250) and demand testing in an independent certified lab in your presence.',
              mandatoryDocument: 'Formal Meter Testing Requisition',
            },
            {
              stepNumber: 3,
              title: 'Obtain Provisional Bill Stay Against Disconnection',
              description: 'Under Section 56 regulations, once a formal testing deposit is paid, the utility cannot disconnect supply and must adjust future bills based on calibration results.',
              mandatoryDocument: 'Stay Application & Previous Normal Bills',
            },
          ],
          remedies: [
            { label: 'Auto-Draft Grievance Dossier', action: 'auto_file_grievance' },
            { label: 'Download Affidavit Format', action: 'download_template' },
            { label: 'Connect Grievance Officer', action: 'book_officer_callback' },
          ],
          prefillGrievance: {
            department: 'Municipal Water Board / Public Health Engineering',
            category: 'Billing Dispute / Tariff Reclassification',
            subject: 'Petition for Residential Tariff Reclassification & Meter Calibration Test',
            description: `Citizen disputes abnormal commercial tariff surcharge on residential property. Evidence of purely residential occupancy attached. Requesting immediate provisional bill freeze and NABL joint meter testing.`,
            priority: 'high',
          },
        }

        cardData = blueprint
        suggestedActions = [
          { label: 'Auto-Draft Grievance Dossier', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
          { label: 'View Civic Payments Ledger', action: 'navigate', targetUrl: '/app/payments' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // TOUGH DISPUTE 6: PENSION JEEVAN PRAMAAN BIOMETRIC FAILURE
      // ════════════════════════════════════════════════════════════
      case 'TOUGH_PENSION_BIOMETRIC_FAILURE': {
        cardType = 'diagnostic'
        isEscalated = true
        content = lang === 'hi'
          ? 'वरिष्ठ निदान: डिजिटल जीवन प्रमाण पत्र (Jeevan Pramaan) में बायोमेट्रिक/फेशियल पहचान विफल होने से पेंशन रुकने का खतरा है। पेंशन एवं पेंशनभोगी कल्याण विभाग (DoP&PW) के वैकल्पिक नियमों के तहत समाधान ब्लूप्रिंट प्रस्तुत है।'
          : 'Diagnostic Analysis: Fingerprint ridge attrition or facial recognition camera lighting failure is obstructing your Digital Life Certificate. The Department of Pension & Pensioners’ Welfare provides 3 guaranteed alternative submission channels.'

        const blueprint: DiagnosticBlueprint = {
          problemTitle: 'Pension Digital Life Certificate (Jeevan Pramaan) Biometric Failure',
          category: 'PENSION_AUTH',
          statutoryAct: 'Ministry of Personnel, Public Grievances and Pensions (DoP&PW) O.M. on DLC Alternatives',
          statutorySLA: '24 to 48 Hours',
          severity: 'high',
          rootCause: 'Age-related loss of epidermal ridge fingerprint clarity or iris scanner reflection failure in standard biometric sensors.',
          actionSteps: [
            {
              stepNumber: 1,
              title: 'Book Doorstep Postman Service (IPPB)',
              description: 'Request a postman via India Post Payments Bank (toll-free 155299 or Post Info App). A certified Gramin Dak Sevak visits home with iris and face scanners.',
              mandatoryDocument: 'PPO Number & Aadhaar Card',
            },
            {
              stepNumber: 2,
              title: 'Attempt Aadhaar FaceRD Mobile App Authentication',
              description: 'Download the official UIDAI FaceRD App and Jeevan Pramaan App on an Android phone. Perform facial scan under indirect natural daylight without glare.',
              mandatoryDocument: 'Smartphone with 5MP+ Front Camera',
            },
            {
              stepNumber: 3,
              title: 'Submit Physical Form 12 Manual Life Certificate',
              description: 'If biometrics continually fail, submit physical Form 12 signed by any Gazetted Officer, Magistrate, or your Pension Disbursing Bank Branch Manager.',
              mandatoryDocument: 'Form 12 Certificate Signed by Bank Manager',
            },
          ],
          remedies: [
            { label: 'Auto-Draft Grievance Dossier', action: 'auto_file_grievance' },
            { label: 'Download Affidavit Format', action: 'download_template' },
            { label: 'Connect Grievance Officer', action: 'book_officer_callback' },
          ],
          prefillGrievance: {
            department: 'Department of Pension & Pensioners Welfare (DoP&PW)',
            category: 'Pension Disbursal / Biometric Exception',
            subject: 'Biometric Exemption Request for Digital Life Certificate (Jeevan Pramaan)',
            description: `Senior citizen pensioner experiencing biometric authentication exceptions on Jeevan Pramaan portal. Requesting doorstep postal verification or bank manager manual Form 12 endorsement without pension interruption.`,
            priority: 'critical',
          },
        }

        cardData = blueprint
        suggestedActions = [
          { label: 'Auto-Draft Grievance Dossier', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
          { label: 'Helpline 1905', action: 'navigate', targetUrl: '/app/support?tab=helpline' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // BASIC DIRECT INQUIRIES: HOURS & FEES
      // ════════════════════════════════════════════════════════════
      case 'BASIC_OFFICE_HOURS_FEES': {
        content = lang === 'hi'
          ? `🏛️ **आधिकारिक कार्यालय समय एवं वैधानिक शुल्क तालिका:**\n\n• **कार्यालय समय:** सोमवार से शनिवार: प्रातः 10:00 बजे से सायं 5:30 बजे तक (भोजन अवकाश: 1:30 - 2:00 PM)। द्वितीय और चतुर्थ शनिवार एवं राजपत्रित अवकाशों पर कार्यालय बंद रहते हैं।\n• **ड्राइविंग लाइसेंस नवीनीकरण:** ₹200 (नवीनीकरण) + ₹200 (स्मार्ट कार्ड) = **₹400 कुल**\n• **डुप्लिकेट लाइसेंस:** ₹200\n• **संपत्ति ई-खाता म्यूटेशन शुल्क:** ₹150 + ₹50 डिजिटल स्कैनिंग\n• **डिजिटल छूट:** भारत बिलपे (BBPS) या यूपीआई से भुगतान पर 5% तत्काल छूट उपलब्ध है।`
          : `🏛️ **Official Office Hours & Statutory Fee Schedules:**\n\n• **Working Hours:** Monday to Saturday: 10:00 AM – 5:30 PM (Lunch Break: 1:30 PM – 2:00 PM). Closed on 2nd & 4th Saturdays and Gazetted Public Holidays.\n• **Driving License Renewal Fee:** ₹200 (Renewal) + ₹200 (Smart Card Issuance) = **₹400 Total**\n• **Duplicate Driving License:** ₹200\n• **Property E-Khata Mutation Fee:** ₹150 statutory charge + ₹50 digital scanning\n• **Digital Incentive:** 5% prompt payment discount applies automatically on online UPI/BBPS transactions.`

        suggestedActions = [
          { label: 'View Fee & Payments Ledger', action: 'navigate', targetUrl: '/app/payments' },
          { label: 'Explore 40+ Civic Services', action: 'navigate', targetUrl: '/app/services' },
          { label: 'Contact Helpdesk', action: 'navigate', targetUrl: '/app/support?tab=helpline' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // BASIC DIRECT INQUIRIES: DOWNLOADS & NAVIGATION
      // ════════════════════════════════════════════════════════════
      case 'BASIC_DOWNLOAD_NAV': {
        content = lang === 'hi'
          ? `📥 **डिजिटल दस्तावेज़ एवं रसीद डाउनलोड करने का तरीका:**\n\n1. **डिजिटल पहचान एवं प्रमाण पत्र:** अपने बाएँ मेन्यू से **Document Vault** (/app/documents) खोलें। यहाँ आधार, पैन, ड्राइविंग लाइसेंस और डिग्री प्रमाण पत्र सीधे 256-बिट एन्क्रिप्शन के साथ डाउनलोड कर सकते हैं।\n2. **कर एवं चालान रसीदें:** अपने **Civic Payments** (/app/payments) पृष्ठ पर जाएं। किसी भी पूर्ण भुगतान के सामने 'Download Receipt' पर क्लिक करें। सभी रसीदें क्यूआर मुहरबंद एवं डिजिटल रूप से हस्ताक्षरित हैं।`
          : `📥 **How to Download Certificates, Forms & Payment Receipts:**\n\n1. **Official Identity & Certificates:** Navigate to the **Digital Document Vault** (/app/documents). Your linked Aadhaar, PAN card, Driving License, and Educational Degree are available with official digital signatures.\n2. **Tax Receipts & Challans:** Go to **Civic Payments** (/app/payments). Click 'Download Receipt' next to any completed transaction for BBPS QR-certified tax vouchers.`

        suggestedActions = [
          { label: 'Open Document Vault', action: 'navigate', targetUrl: '/app/documents' },
          { label: 'Download Tax Receipts', action: 'navigate', targetUrl: '/app/payments' },
        ]
        break
      }

      // ════════════════════════════════════════════════════════════
      // STANDARD CORE WORKFLOWS
      // ════════════════════════════════════════════════════════════
      case 'APPLICATION_STATUS': {
        cardType = 'application'
        if (lower.includes('license') || lower.includes('driving') || lower.includes('लाइसेंस')) {
          const dlPreset = preset.mockAnswers.dl_renewal
          content = dlPreset ? dlPreset.answer : 'You have an active Driving License Renewal application (#KA-RTO-2026-992140).'
          suggestedActions = [
            { label: 'Resolve Query in Application', action: 'navigate', targetUrl: '/app/applications/app_991' },
            { label: 'Open Grievance if Delayed', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
          ]
          cardData = {
            id: 'app_991',
            applicationNumber: 'KA-RTO-2026-992140',
            serviceName: 'Driving License Renewal & Smart Card Issuance',
            department: 'Transport Department (RTO Indiranagar)',
            status: 'action_required',
            currentStep: 3,
            totalSteps: 5,
            actionRequiredMessage: 'Address proof seal verification query raised. Please upload clear copy.',
            targetUrl: '/app/applications/app_991',
          }
        } else {
          const mutPreset = preset.mockAnswers.check_mutation
          content = mutPreset ? mutPreset.answer : 'Your E-Khata Property Mutation application (#KA-REV-2026-004812) is in the 15-day statutory public notice stage.'
          suggestedActions = [
            { label: 'Track All Applications', action: 'navigate', targetUrl: '/app/applications' },
            { label: 'File Helpdesk Query', action: 'navigate', targetUrl: '/app/support' },
          ]
          cardData = {
            id: 'app_992',
            applicationNumber: 'KA-REV-2026-004812',
            serviceName: 'E-Khata Property Mutation & Digital Title Endorsement',
            department: 'Revenue & Land Records Department',
            status: 'in_progress',
            currentStep: 3,
            totalSteps: 4,
            actionRequiredMessage: 'Statutory 15-Day Public Notice Period underway until 29 Sep 2026.',
            targetUrl: '/app/applications/app_992',
          }
        }
        break
      }

      case 'GRIEVANCE_LODGE': {
        cardType = 'grievance'
        isEscalated = true
        content = lang === 'hi'
          ? 'मैंने आपकी समस्या का विश्लेषण किया है। आप लोक सेवा गारंटी अधिनियम के तहत 48 घंटे के SLA के साथ तत्काल आधिकारिक शिकायत दर्ज कर सकते हैं। मैंने आपका फॉर्म पूर्व-भरित कर दिया है।'
          : 'I analyzed your issue. Under the Right to Public Services Act, you are entitled to statutory redressal with a guaranteed 48-Hour SLA. You can lodge this grievance with one click or view your active tickets.'

        suggestedActions = [
          { label: 'Open Grievance Wizard', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
          { label: 'Track Existing Grievances', action: 'navigate', targetUrl: '/app/support?tab=tickets' },
        ]

        cardData = {
          suggestedDepartment: lower.includes('transport') || lower.includes('license') || lower.includes('rto')
            ? 'Transport Department'
            : lower.includes('tax') || lower.includes('mutation') || lower.includes('property')
            ? 'Municipal & Revenue Directorate'
            : 'Department of Administrative Reforms & Grievances (CPGRAMS)',
          suggestedSubject: `Citizen Grievance: ${userText.slice(0, 50)}...`,
          slaHours: 48,
          targetUrl: '/app/support?tab=lodge',
        }
        break
      }

      case 'HUMAN_OFFICER_ESCALATION': {
        cardType = 'officer'
        isEscalated = true
        content = lang === 'hi'
          ? 'आपको वरिष्ठ नागरिक सेवा अधिकारी विक्रम राव से जोड़ा जा रहा है। वे आपकी फ़ाइल और लंबित आवेदनों की सीधी जांच कर सकते हैं।'
          : 'Connecting you with Senior Grievance Redressal Officer Vikramaditya Rao. He has direct clearance to expedite your pending applications and review municipal queries.'

        suggestedActions = [
          { label: 'Open Live Officer Console', action: 'navigate', targetUrl: '/app/support?tab=live' },
          { label: 'Dial Toll-Free 1905', action: 'navigate', targetUrl: '/app/support?tab=helpline' },
        ]

        cardData = {
          officerName: 'Vikramaditya Rao',
          designation: 'Senior Grievance Redressal Officer',
          department: 'Centralized Citizen Assistance Desk',
          status: 'Available Now',
          queueWaitTime: '< 1 Minute',
          targetUrl: '/app/support?tab=live',
        }
        break
      }

      case 'SERVICE_INQUIRY': {
        cardType = 'service'
        const solarPreset = preset.mockAnswers.solar_subsidy
        content = solarPreset
          ? solarPreset.answer
          : 'Under the PM Surya Ghar Muft Bijli Yojana, residential applicants can claim up to ₹78,000 direct subsidy into their bank account.'

        suggestedActions = [
          { label: 'Apply for Solar Subsidy', action: 'navigate', targetUrl: '/app/services' },
          { label: 'Browse 40+ Civic Services', action: 'navigate', targetUrl: '/app/services' },
        ]

        cardData = {
          id: 'srv_solar_01',
          title: 'PM Surya Ghar Muft Bijli Yojana (Rooftop Solar Subsidy)',
          department: 'Ministry of New & Renewable Energy',
          subsidyAmount: 'Up to ₹78,000 Direct Benefit Transfer',
          processingTime: '15 Business Days',
          requiredDocs: ['Electricity Bill', 'Roof Ownership Proof / Khata', 'Cancelled Bank Cheque'],
          targetUrl: '/app/services',
        }
        break
      }

      case 'DOCUMENT_VAULT': {
        const expiringPreset = preset.mockAnswers.view_expiring
        content = expiringPreset
          ? expiringPreset.answer
          : 'You have 1 document expiring soon: Driving License (KA03-20150009842), expiring on 28 Oct 2026.'

        suggestedActions = [
          { label: 'Open Document Vault', action: 'navigate', targetUrl: '/app/documents' },
          { label: 'View Expiring Documents', action: 'navigate', targetUrl: '/app/documents/expiring' },
        ]
        break
      }

      case 'PAYMENT_DUE': {
        cardType = 'payment'
        content = lang === 'hi'
          ? 'आपके सभी नागरिक कर और चालान रिकॉर्ड सुरक्षित हैं। आप अपने सभी पूर्ण और लंबित भुगतानों की आधिकारिक क्यूआर मुहरबंद रसीदें डाउनलोड कर सकते हैं।'
          : 'All your civic taxes, water bills, and transport fees are synchronized with the Bharat BillPay gateway. Official QR-stamped receipts with digital signatures are ready for download.'

        suggestedActions = [
          { label: 'Open Civic Payments', action: 'navigate', targetUrl: '/app/payments' },
          { label: 'Download Tax Receipts', action: 'navigate', targetUrl: '/app/payments' },
        ]

        cardData = {
          recentTransaction: 'BBMP Property Tax (PID 112-9012)',
          amount: '₹ 4,850.00',
          status: 'COMPLETED & VERIFIED',
          targetUrl: '/app/payments',
        }
        break
      }

      // ════════════════════════════════════════════════════════════
      // DYNAMIC CONTEXTUAL FALLBACK (HIGH CLARITY & SPECIFIC GUIDANCE)
      // ════════════════════════════════════════════════════════════
      default: {
        content = lang === 'hi'
          ? `🔍 **नागरिक सेवा सहायता परामर्श:**\n\n📌 **सीधा उत्तर:** आपके प्रश्न "${userText}" के संबंध में, CiviqOne पोर्टल पर सभी नागरिक सेवाओं के लिए 3-चरणीय मानक प्रक्रिया उपलब्ध है:\n\n1. **दस्तावेज़ सत्यापन:** अपने डिजिटल पहचान पत्र (आधार/पैन/निवास) तैयार रखें।\n2. **आवेदन प्रस्तुति:** संबंधित विभाग के पोर्टल अथवा ई-सेवा केंद्र से ऑनलाइन आवेदन करें।\n3. **समय सीमा (SLA):** लोक सेवा गारंटी अधिनियम के तहत 15 से 30 दिनों में सेवा प्रदान की जाती है।\n\nयदि यह कोई विशेष समस्या या विलंब है, तो आप 48 घंटे के गारंटीड निवारण हेतु शिकायत दर्ज कर सकते हैं या अधिकारी से सीधे जुड़ सकते हैं।`
          : `🔍 **Statutory Citizen Assistance Advisory:**\n\n📌 **Direct Guidance regarding "${userText}":**\nAll civic transactions in this category follow a standardized 3-step citizen charter procedure:\n\n1. **Credential Verification:** Ensure your linked Aadhaar, PAN, and address proof in your Document Vault (/app/documents) are up to date.\n2. **Application Submission:** File through the designated state/central department portal with biometric or OTP e-sign.\n3. **Statutory SLA Guarantee:** Governed under the Right to Public Services Act (15 to 30 Business Days delivery ceiling).\n\nIf your matter involves an administrative delay, scrutiny objection, or billing dispute, you can file a guaranteed 48-hour grievance or connect live with our Redressal Officer.`

        suggestedActions = [
          { label: 'Explore 40+ Civic Services', action: 'navigate', targetUrl: '/app/services' },
          { label: 'Lodge 48h SLA Grievance', action: 'navigate', targetUrl: '/app/support?tab=lodge' },
          { label: 'Connect Live Officer', action: 'navigate', targetUrl: '/app/support?tab=live' },
        ]
        break
      }
    }

    const assistantMsg: AssistantMessage = {
      id: `msg_asst_${Date.now()}`,
      sender: 'assistant',
      content,
      timestamp: nowTime,
      suggestedActions,
      language: lang,
      cardType,
      cardData,
      isEscalated,
    }

    return assistantMsg
  },
}
