import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, Sparkles, X, ArrowRight, 
  Database, ShoppingBag, Home, Activity, CheckCircle2, 
  Droplets, Egg, ShieldCheck, HeartPulse, RefreshCw
} from 'lucide-react';
import { NavTab } from '../types';
import { farmStore } from '../services/farmStore';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange: (tab: NavTab) => void;
  onOpenEasyEntry?: (category?: 'milk' | 'eggs' | 'feed' | 'add_animal' | 'health' | 'cash' | 'fish') => void;
  onSelectAdminTab?: (tabKey: string) => void;
  onListeningChange?: (listening: boolean) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onTabChange,
  onOpenEasyEntry,
  onSelectAdminTab,
  onListeningChange
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('আসসালামু আলাইকুম! আর এস খামার এআই ভয়েস অ্যাসিস্ট্যান্টে আপনাকে স্বাগতম। আপনি কী করতে চান বা কোন রিপোর্ট দেখতে চান বলুন।');
  const [recognizedCommand, setRecognizedCommand] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Bengali Voice Readout
  const speakVoice = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find(v => v.lang.startsWith('bn'));
    if (bnVoice) utterance.voice = bnVoice;

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    setTranscript('');
    setRecognizedCommand(null);

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      const msg = 'দুঃখিত, আপনার ব্রাউজারে ভয়েস রিকগনিশন সাপোর্ট করে না। দয়া করে নিচের বাটনগুলো ক্লিক করে কমান্ড টেস্ট করুন।';
      setAiResponse(msg);
      speakVoice(msg);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition: SpeechRecognition = new SpeechRec();
      recognition.lang = 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        if (onListeningChange) onListeningChange(true);
        setAiResponse('শুনছি... আপনার কমান্ড বলুন (যেমন: "আজকের দুধের উৎপাদন দেখাও" বা "অ্যাডমিনে যাও")');
      };

      recognition.onresult = (e: SpeechRecognitionEvent) => {
        let currentTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          currentTranscript += e.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        if (e.results[0].isFinal) {
          processVoiceCommand(currentTranscript);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        if (onListeningChange) onListeningChange(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (onListeningChange) onListeningChange(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Error starting speech recognition:', err);
      setIsListening(false);
      if (onListeningChange) onListeningChange(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (onListeningChange) onListeningChange(false);
  };

  const processVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();

    // 0. Check admin-configured custom Voice Phrase Mappings first!
    const activePhrases = farmStore.getVoicePhrases().filter(p => p.isActive);
    const matchedCustom = activePhrases.find(p => 
      text.includes(p.phrase.toLowerCase().trim()) || 
      p.phrase.toLowerCase().trim().includes(text)
    );

    if (matchedCustom) {
      setAiResponse(matchedCustom.responseText);
      setRecognizedCommand(matchedCustom.phrase);
      speakVoice(matchedCustom.responseText);

      // Execute action chain
      matchedCustom.actions.forEach(action => {
        if (action.type === 'livestock_status' || (action.targetTab === 'admin' && action.adminTabKey === 'dashboard')) {
          onTabChange('admin');
          if (onSelectAdminTab) onSelectAdminTab('dashboard');
        } else if (action.targetTab) {
          onTabChange(action.targetTab);
          if (action.adminTabKey && onSelectAdminTab) {
            onSelectAdminTab(action.adminTabKey);
          }
        } else if (action.type === 'query_milk' && onOpenEasyEntry) {
          onOpenEasyEntry('milk');
        } else if (action.type === 'query_eggs' && onOpenEasyEntry) {
          onOpenEasyEntry('eggs');
        } else if (action.type === 'query_feed' && onSelectAdminTab) {
          onTabChange('admin');
          onSelectAdminTab('feed');
        } else if (action.type === 'query_health' && onSelectAdminTab) {
          onTabChange('admin');
          onSelectAdminTab('vaccine');
        }
      });

      setTimeout(() => onClose(), 2200);
      return;
    }

    // 1. Navigation: Home
    if (text.includes('হোম') || text.includes('home') || text.includes('প্রধান পাতা')) {
      const res = 'হোম পেজে নিয়ে যাওয়া হচ্ছে।';
      setAiResponse(res);
      setRecognizedCommand('হোম পেজে নেভিগেশন');
      speakVoice(res);
      onTabChange('home');
      setTimeout(() => onClose(), 1500);
      return;
    }

    // 2. Navigation: Store
    if (text.includes('বিক্রি') || text.includes('পশু') || text.includes('স্টোর') || text.includes('শপ') || text.includes('ছাগল') || text.includes('গরু কিনব')) {
      const count = farmStore.getForSaleLivestock().length;
      const res = `বিক্রয়যোগ্য পশুর শপে নিয়ে যাওয়া হচ্ছে। বর্তমানে ${count}টি পশু বিক্রির জন্য প্রস্তুত রয়েছে।`;
      setAiResponse(res);
      setRecognizedCommand('বিক্রির পশুর স্টোরে নেভিগেশন');
      speakVoice(res);
      onTabChange('store');
      setTimeout(() => onClose(), 1500);
      return;
    }

    // 3. Navigation: Admin Panel
    if (text.includes('অ্যাডমিন') || text.includes('ড্যাশবোর্ড') || text.includes('ম্যানেজমেন্ট') || text.includes('admin')) {
      const res = 'খামার অ্যাডমিন ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।';
      setAiResponse(res);
      setRecognizedCommand('অ্যাডমিন ড্যাশবোর্ডে নেভিগেশন');
      speakVoice(res);
      onTabChange('admin');
      setTimeout(() => onClose(), 1500);
      return;
    }

    // 4. Report Query: Milk Output
    if (text.includes('দুধ') || text.includes('milk') || text.includes('দুধের')) {
      const res = 'আজকের খামারে মোট দুধের উৎপাদন ১৩০.৪ লিটার। গড় ফ্যাট ৪.৮%। দুধের ডাটা ইনপুট পেজ খোলা হচ্ছে।';
      setAiResponse(res);
      setRecognizedCommand('দুধের উৎপাদন রিপোর্ট ও এন্ট্রি');
      speakVoice(res);
      if (onOpenEasyEntry) onOpenEasyEntry('milk');
      return;
    }

    // 5. Report Query: Eggs Output
    if (text.includes('ডিম') || text.includes('egg') || text.includes('ডিমের')) {
      const res = 'আজকের খামারে মোট ডিম সংগ্রহ ৮৫৮টি (অর্গানিক কোয়ালিটি)। ডিমের ডাটা ইনপুট পেজ খোলা হচ্ছে।';
      setAiResponse(res);
      setRecognizedCommand('ডিমের হিসাব রিপোর্ট ও এন্ট্রি');
      speakVoice(res);
      if (onOpenEasyEntry) onOpenEasyEntry('eggs');
      return;
    }

    // 6. Report Query: Vaccines & Health
    if (text.includes('ভ্যাকসিন') || text.includes('টিকা') || text.includes('স্বাস্থ্য') || text.includes('রোগ')) {
      const res = 'আগামী ৭ দিনে ৩টি গাভীর এফএমডি ভ্যাকসিনের শিডিউল রয়েছে। বায়োসিকিউরিটি ১০০% নিরাপদ।';
      setAiResponse(res);
      setRecognizedCommand('ভ্যাকসিন শিডিউল ও স্বাস্থ্য রিপোর্ট');
      speakVoice(res);
      onTabChange('admin');
      if (onSelectAdminTab) onSelectAdminTab('vaccine');
      return;
    }

    // 7. Report Query: Feed Inventory
    if (text.includes('খাবার') || text.includes('ফিড') || text.includes('খাদ্য') || text.includes('স্টক')) {
      const res = 'খামারে বর্তমানে ভুট্টা সাইলেজ ২৪০ কেজি এবং নেপিয়ার ঘাস ৫০০ কেজি মজুদ আছে। ফুড স্টোরেজ অপটিমাল।';
      setAiResponse(res);
      setRecognizedCommand('খাদ্য ইনভেন্টরি ও ফিড রিপোর্ট');
      speakVoice(res);
      onTabChange('admin');
      if (onSelectAdminTab) onSelectAdminTab('feed');
      return;
    }

    // Default unrecognized command
    const defaultRes = `আপনি বলেছেন: "${rawText}"। এই কমান্ডটি শনাক্ত করা যায়নি। দয়া করে বলুন "সব গাভী এখন কি করছে", "দুধের উৎপাদন দেখাও" অথবা "অ্যাডমিনে যাও"।`;
    setAiResponse(defaultRes);
    speakVoice('কমান্ডটি বুঝতে পারিনি। নিচের প্রিসেট থেকে চেষ্টা করুন।');
  };

  useEffect(() => {
    if (isOpen) {
      const introMsg = 'আসসালামু আলাইকুম! আর এস খামার ভয়েস অ্যাসিস্ট্যান্ট চালু হয়েছে। আপনার প্রশ্ন বা কমান্ড বলুন।';
      setAiResponse(introMsg);
      speakVoice(introMsg);
    } else {
      stopListening();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-white relative overflow-hidden">
        
        {/* Glow background effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>এআই ভয়েস অ্যাসিস্ট্যান্ট</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v2.4 Hands-Free
                </span>
              </h3>
              <p className="text-xs text-slate-400">কথার মাধ্যমে খামারের ডাটা এন্ট্রি ও রিপোর্ট ট্র্যাকিং</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Animated Mic Orb */}
        <div className="flex flex-col items-center justify-center py-6 space-y-4 relative z-10">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
              isListening
                ? 'bg-gradient-to-r from-red-500 via-rose-600 to-amber-500 text-white shadow-2xl shadow-rose-500/50 scale-110 ring-8 ring-rose-500/30 animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-600/40 hover:scale-105 active:scale-95 ring-4 ring-emerald-500/20'
            }`}
          >
            {isListening ? (
              <Mic className="w-12 h-12 animate-bounce" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
            
            {/* Audio Wave Visualizer Bars when listening */}
            {isListening && (
              <div className="absolute -bottom-3 flex items-center gap-1">
                <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-6 bg-emerald-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-8 bg-amber-400 rounded-full animate-bounce" />
                <span className="w-1 h-6 bg-emerald-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            )}
          </button>

          <div className="text-center">
            <span className={`text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full ${
              isListening ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {isListening ? '● শুনছি (Listening...)' : 'মাইক্রোফোনে চাপ দিন'}
            </span>
          </div>
        </div>

        {/* Live Detected Speech & AI Response Box */}
        <div className="space-y-3 relative z-10">
          {transcript && (
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">আপনার পাওয়া ভয়েস:</span>
              <p className="font-mono text-emerald-300 font-bold text-sm">"{transcript}"</p>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-emerald-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-emerald-400' : 'text-slate-400'}`} />
                <span>এআই অ্যাসিস্ট্যান্ট উত্তর:</span>
              </span>
              {recognizedCommand && (
                <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800 text-emerald-300 font-mono">
                  ✓ {recognizedCommand}
                </span>
              )}
            </div>
            <p className="text-slate-200 leading-relaxed text-sm font-medium">
              {aiResponse}
            </p>
          </div>
        </div>

        {/* Clickable Voice Command Shortcuts */}
        <div className="space-y-2 relative z-10">
          <span className="text-[11px] font-bold text-slate-400 block">উদাহরণ হিসেবে যেকোনো বাটনে ক্লিক করেও টেস্ট করতে পারেন:</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'আজকের দুধের উৎপাদন দেখাও', icon: '🥛', cmd: 'আজকের দুধের উৎপাদন দেখাও' },
              { label: 'আজকের ডিমের হিসাব দেখাও', icon: '🥚', cmd: 'আজকের ডিমের হিসাব দেখাও' },
              { label: 'বিক্রির পশু দেখাও', icon: '🐄', cmd: 'বিক্রির পশু দেখাও' },
              { label: 'খাদ্যের স্টক দেখাও', icon: '🌾', cmd: 'খাদ্যের স্টক দেখাও' },
              { label: 'ভ্যাকসিন শিডিউল দেখাও', icon: '💉', cmd: 'ভ্যাকসিন শিডিউল দেখাও' },
              { label: 'অ্যাডমিন ড্যাশবোর্ডে যাও', icon: '📊', cmd: 'অ্যাডমিন ড্যাশবোর্ডে যাও' },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(item.cmd);
                  processVoiceCommand(item.cmd);
                }}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-emerald-950/60 border border-slate-700/80 hover:border-emerald-600/60 text-slate-200 hover:text-emerald-300 font-bold text-left text-[11px] transition-all flex items-center gap-2 cursor-pointer group"
              >
                <span className="text-sm group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
