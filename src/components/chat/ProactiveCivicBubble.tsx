import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Volume2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SupportedLanguage } from '@/types'

interface ProactiveCivicBubbleProps {
  language: SupportedLanguage
  onSelectPrompt: (text: string) => void
  onSpeakText?: (text: string) => void
}

interface LocalizedTip {
  text: Record<SupportedLanguage, string>
  actionPrompt: Record<SupportedLanguage, string>
}

const ROUTE_TIPS: Record<string, LocalizedTip> = {
  '/app/documents': {
    text: {
      en: 'Driving License expires on 28 Oct 2026. Want me to assist in 1-click renewal?',
      hi: 'आपका ड्राइविंग लाइसेंस 28 अक्टूबर को समाप्त हो रहा है। क्या आप नवीनीकरण में सहायता चाहते हैं?',
      te: 'డ్రైవింగ్ లైసెన్స్ అక్టోబర్ 28న ముగుస్తుంది. పునరుద్ధరణ ప్రారంభించాలా?',
      ta: 'ஓட்டுநர் உரிமம் அக்டோபர் 28 அன்று முடிவடைகிறது. புதுப்பிக்க உதவவா?',
      kn: 'ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ಅಕ್ಟೋಬರ್ 28 ರಂದು ಮುಕ್ತಾಯಗೊಳ್ಳಲಿದೆ. ನವೀಕರಿಸಲು ಸಹಾಯ ಬೇಕೆ?',
      ml: 'ഡ്രൈവിംഗ് ലൈസൻസ് ഒക്ടോബർ 28-ന് തീരും. പുതുക്കാൻ സഹായിക്കണോ?',
      bn: 'ড্রাইভিং লাইসেন্স ২৮ অক্টোবর শেষ হবে। রিনিউ করতে চান?',
      mr: 'ड्रायव्हिंग लायसन्स २८ ऑक्टोबरला संपत आहे. नूतनीकरण सुरू करू का?',
      gu: 'ડ્રાઇવિંગ લાઇસન્સ 28 ઑક્ટોબરે સમાપ્ત થાય છે. રિન્યુ કરવામાં મદદ કરું?',
    },
    actionPrompt: {
      en: 'How do I renew my expiring driving license?',
      hi: 'ड्राइविंग लाइसेंस का नवीनीकरण कैसे करें?',
      te: 'డ్రైవింగ్ లైసెన్స్ పునరుద్ధరణ ఎలా చేయాలి?',
      ta: 'ஓட்டுநர் உரிமத்தை எவ்வாறு புதுப்பிப்பது?',
      kn: 'ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ನವೀಕರಣ ಹೇಗೆ?',
      ml: 'ഡ്രൈവിംഗ് ലൈസൻസ് എങ്ങനെ പുതുക്കാം?',
      bn: 'ড্রাইভিং লাইসেন্স কীভাবে রিনিউ করব?',
      mr: 'ड्रायव्हिंग लायसन्सचे नूतनीकरण कसे करावे?',
      gu: 'ડ્રાઇવિંગ લાઇસન્સ રિન્યૂ કેવી રીતે કરવું?',
    },
  },
  '/app/applications': {
    text: {
      en: 'E-Khata Property Mutation is in statutory 15-day notice period. No objections filed!',
      hi: 'ई-खाता संपत्ति दाखिल-खारिज 15-दिवसीय सार्वजनिक नोटिस अवधि में है। कोई आपत्ति नहीं है।',
      te: 'ఈ-ఖాతా ఆస్తి మ్యుటేషన్ 15 రోజుల పబ్లిక్ నోటీసు దశలో ఉంది. ఎటువంటి అభ్యంతరాలు లేవు.',
      ta: 'சொத்து மாற்றம் 15 நாட்கள் பொது அறிவிப்பு காலத்தில் உள்ளது. ஆட்சேபனை இல்லை.',
      kn: 'ಇ-ಖಾತಾ ಮ್ಯುಟೇಶನ್ 15 ದಿನಗಳ ಸಾರ್ವಜನಿಕ ಆಕ್ಷೇಪಣೆ ಹಂತದಲ್ಲಿದೆ.',
      ml: 'വസ്തു പോക്കുവരവ് നോട്ടീസ് ഘട്ടത്തിലാണ്. തടസ്സങ്ങളില്ല.',
      bn: 'ই-খতিয়ান মিউটেশন ১৫ দিনের নোটিশ পর্যায়ে রয়েছে। কোনো আপত্তি নেই।',
      mr: 'ई-खाते मालमत्ता फेरफार १५ दिवसांच्या सार्वजनिक नोटीस टप्प्यात आहे.',
      gu: 'ઈ-ખાતા મ્યુટેશન 15 દિવસની જાહેર નોટિસ સમયગાળામાં છે.',
    },
    actionPrompt: {
      en: 'Check status of my property mutation',
      hi: 'संपत्ति म्यूटेशन की स्थिति जांचें',
      te: 'ఆస్తి మ్యుటేషన్ స్థితిని పరిశీలించండి',
      ta: 'எனது சொத்து பட்டா நிலையை காண்க',
      kn: 'ಇ-ಖಾತಾ ಮ್ಯುಟೇಶನ್ ಅರ್ಜಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ',
      ml: 'വസ്തു പോക്കുവരവ് അപേക്ഷ പരിശോധിക്കുക',
      bn: 'সম্পত্তি মিউটেশনের স্থিতি পরীক্ষা করুন',
      mr: 'मालमत्ता फेरफार स्थिती तपासा',
      gu: 'મિલકત મ્યુટેશનની સ્થિતિ તપાસો',
    },
  },
  '/app/services': {
    text: {
      en: 'Eligible for up to ₹78,000 direct bank subsidy under PM Surya Ghar Solar scheme!',
      hi: 'पीएम सूर्य घर सोलर योजना के तहत ₹78,000 तक की प्रत्यक्ष बैंक सब्सिडी के पात्र हैं!',
      te: 'సూర్య ఘర్ సోలార్ పథకం కింద ₹78,000 వరకు సబ్సిడీ పొందే అర్హత ఉంది!',
      ta: 'ரூ. 78,000 வரை நேரடி சூரிய ஒளி மானியம் பெற தகுதி உள்ளது!',
      kn: 'ಪಿಎಂ ಸೂರ್ಯ ಘರ್ ಯೋಜನೆಯಡಿ ₹78,000 ನೇರ ಸಬ್ಸಿಡಿ ಪಡೆಯಲು ಅರ್ಹರಿದ್ದೀರಿ!',
      ml: 'സൂര്യ ഘർ പദ്ധതി വഴി ₹78,000 സബ്സിഡി ലഭിക്കാൻ അർഹതയുണ്ട്!',
      bn: 'পিএম সূর্য ঘর যোজনায় ₹৭৮,০০০ পর্যন্ত ভর্তুকি পাওয়ার যোগ্য!',
      mr: 'पीएम सूर्य घर योजनेअंतर्गत ₹७८,००० पर्यंत अनुदानासाठी पात्र आहात!',
      gu: 'પીએમ સૂર્ય ઘર યોજના હેઠળ ₹78,000 સુધીની સબસિડી મેળવવા પાત્ર છો!',
    },
    actionPrompt: {
      en: 'What documents are required for Rooftop Solar subsidy?',
      hi: 'रूफटॉप सोलर सब्सिडी के नियम क्या हैं?',
      te: 'రూఫ్‌టాప్ సోలార్ సబ్సిడీ వివరాలు ఏమిటి?',
      ta: 'சூரிய ஒளி கூரை மானியம் பெறுவது எப்படி?',
      kn: 'ಸೌರಶಕ್ತಿ ಸಬ್ಸಿಡಿ ಅರ್ಜಿ ನಿಯಮಗಳು ಯಾವುವು?',
      ml: 'സോളാർ സബ്സിഡിക്ക് എന്തൊക്കെ വേണം?',
      bn: 'সৌর বিদ্যুৎ ভর্তুকির নিয়ম কী?',
      mr: 'रूफटॉप सोलर सबसिडीचे नियम काय आहेत?',
      gu: 'સોલાર રૂફટોપ સબસિડીના નિયમો શું છે?',
    },
  },
  '/app/payments': {
    text: {
      en: 'Early bird 5% SAS rebate active on Property Tax. Download official digital receipt!',
      hi: 'संपत्ति कर पर 5% प्रारंभिक छूट सक्रिय है। आधिकारिक डिजिटल रसीद डाउनलोड करें!',
      te: 'ఆస్తి పన్నుపై 5% ప్రారంభ రాయితీ ఉంది. డిజిటల్ రసీదు డౌన్‌లోడ్ చేసుకోండి!',
      ta: 'சொத்து வரியில் 5% தள்ளுபடி சலுகை உள்ளது. ரசீதை பதிவிறக்கவும்!',
      kn: 'ಆಸ್ತಿ ತೆರಿಗೆಯ ಮೇಲೆ 5% ಆರಂಭಿಕ ರಿಯಾಯಿತಿ ಲಭ್ಯವಿದೆ.',
      ml: 'നികുതിയിൽ 5% ഇളവ് ലഭ്യമാണ്. രസീത് ഡൗൺലോഡ് ചെയ്യാം.',
      bn: 'ট্যাক্সে ৫% ছাড় সক্রিয় রয়েছে। ডিজিটাল রসিদ ডাউনলোড করুন!',
      mr: 'मालमत्ता करावर ५% सूट सुरू आहे. अधिकृत पावती डाउनलोड करा!',
      gu: 'પ્રોપર્ટી ટેક્સ પર 5% રિબેટ સક્રિય છે. ડિજિટલ રસીદ ડાઉનલોડ કરો!',
    },
    actionPrompt: {
      en: 'How do I download my official payment receipt?',
      hi: 'नागरिक कर रसीद कैसे डाउनलोड करें?',
      te: 'చెల్లించిన రసీదుని ఎలా డౌన్‌లోడ్ చేయాలి?',
      ta: 'ரசீதை எவ்வாறு பதிவிறக்குவது?',
      kn: 'ರಶೀದಿಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡುವುದು ಹೇಗೆ?',
      ml: 'രസീത് എങ്ങനെ ഡൗൺലോഡ് ചെയ്യാം?',
      bn: 'অফিসিয়াল রসিদ কীভাবে ডাউনলোড করব?',
      mr: 'अधिकृत पावती कशी डाउनलोड करावी?',
      gu: 'સત્તાવાર રસીદ કેવી રીતે ડાઉનલોડ કરવી?',
    },
  },
  '/app/support': {
    text: {
      en: 'Officer Vikramaditya Rao is online at the Nodal Redressal Desk. Instant wait time!',
      hi: 'वरिष्ठ जन शिकायत अधिकारी विक्रम राव ऑनलाइन हैं। तत्काल सहायता उपलब्ध है!',
      te: 'ఫిర్యాదుల పరిష్కార అధికారి విక్రమ్ రావు ఆన్‌లైన్‌లో అందుబాటులో ఉన్నారు!',
      ta: 'அதிகாரி விக்ரம் ஆன்லைனில் உள்ளார். உடனடி உதவி பெறலாம்!',
      kn: 'ನಾಗರಿಕ ಕುಂದುಕೊರತೆ ಅಧಿಕಾರಿ ವಿಕ್ರಮ್ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದಾರೆ!',
      ml: 'പരാതി പരിഹാര ഓഫീസർ വിക്രം ഓൺലൈനിലുണ്ട്!',
      bn: 'অভিযোগ কর্মকর্তা বিক্রম রাও লাইভ রয়েছেন।',
      mr: 'तक्रार निवारण अधिकारी विक्रम राव ऑनलाइन आहेत!',
      gu: 'ફરિયાદ નિવારણ અધિકારી વિક્રમ રાવ ઓનલાઈન છે!',
    },
    actionPrompt: {
      en: 'Connect with a live citizen care officer',
      hi: 'नागरिक सेवा अधिकारी से बात करें',
      te: 'హెల్ప్‌డెస్క్ అధికారితో మాట్లాడండి',
      ta: 'நேரடி சேவை அதிகாரியிடம் பேச',
      kn: 'ಲೈವ್ ಸಹಾಯವಾಣಿ ಅಧಿಕಾರಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ',
      ml: 'സഹായ ഉദ്യോഗസ്ഥനുമായി സംസാരിക്കുക',
      bn: 'লাইভ সহায়তা আধিকারিকের সাথে কথা বলুন',
      mr: 'नागरिक सेवा अधिकाऱ्याशी संपर्क साधा',
      gu: 'લાઈવ સિટિઝન કેર ઓફિસર સાથે વાત કરો',
    },
  },
}

export function ProactiveCivicBubble({
  language,
  onSelectPrompt,
  onSpeakText,
}: ProactiveCivicBubbleProps) {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const [currentTip, setCurrentTip] = useState<LocalizedTip | null>(null)

  useEffect(() => {
    const tip = ROUTE_TIPS[location.pathname]
    if (tip) {
      setCurrentTip(tip)
      setVisible(true)

      // Auto-hide after 9 seconds
      const timer = setTimeout(() => {
        setVisible(false)
      }, 9000)

      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [location.pathname])

  if (!visible || !currentTip) return null

  const tipText = currentTip.text[language] || currentTip.text.en
  const promptText = currentTip.actionPrompt[language] || currentTip.actionPrompt.en

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="absolute bottom-full right-0 mb-3 w-72 sm:w-80 p-3.5 rounded-2xl bg-card/95 backdrop-blur-xl border border-primary/30 shadow-2xl space-y-2 pointer-events-auto select-none"
      >
        {/* Bubble Header */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-primary">
            <Sparkles className="w-3.5 h-3.5 animate-spin [animation-duration:4s]" />
            <span>Civic Assistant Tip</span>
          </div>
          <div className="flex items-center gap-1">
            {onSpeakText && (
              <button
                type="button"
                onClick={() => onSpeakText(tipText)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Listen to tip"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Dismiss tip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tip Text */}
        <p className="text-xs text-foreground leading-relaxed font-medium">
          {tipText}
        </p>

        {/* Quick Action Prompt */}
        <button
          type="button"
          onClick={() => {
            onSelectPrompt(promptText)
            setVisible(false)
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 text-[11px] font-semibold transition-colors group cursor-pointer"
        >
          <span className="truncate">{promptText}</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
        </button>

        {/* Downward Pointer Notch */}
        <div className="absolute top-full right-6 -mt-1 w-3 h-3 bg-card border-r border-b border-primary/30 transform rotate-45" />
      </motion.div>
    </AnimatePresence>
  )
}
