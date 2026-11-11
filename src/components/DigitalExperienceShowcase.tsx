import React, { useState, useEffect } from 'react';
import { 
  Cpu, Activity, CheckCircle2, ShieldCheck, 
  Sparkles, ShoppingBag, Zap, Droplets, Egg, 
  Award, TrendingUp, Flame, HeartPulse, Clock
} from 'lucide-react';

interface CustomerActivity {
  id: string;
  name: string;
  location: string;
  action: string;
  timeAgo: string;
  badge: string;
}

const LIVE_CUSTOMER_ACTIVITIES: CustomerActivity[] = [
  { id: 'act-1', name: 'জনাব রফিকুল আলম', location: 'ধানমণ্ডি, ঢাকা', action: 'সাহীওয়াল প্রিমিয়াম গাভীর অর্ডার নিশ্চিত করেছেন', timeAgo: '৩ মিনিট আগে', badge: 'বুকিং সম্পন্ন' },
  { id: 'act-2', name: 'ডাঃ মোর্শেদ হাসান', location: 'উত্তরা সেক্টর-৪, ঢাকা', action: '২ কেজি খাঁটি দানাদার ঘি ও ১ ডজন ডিম অর্ডার করেছেন', timeAgo: '৭ মিনিট আগে', badge: 'ডেলিভারি প্রসেসিং' },
  { id: 'act-3', name: 'তাহমিনা পারভীন', location: 'গুলশান-২, ঢাকা', action: 'খাঁটি সাহীওয়াল কাঁচা দুধ সাপ্তাহিক সাবস্ক্রিপশন চালু করেছেন', timeAgo: '১২ মিনিট আগে', badge: 'সাবস্ক্রিপশন সক্রিয়' },
  { id: 'act-4', name: 'কাজী শাহাদাত হোসেন', location: 'গাজীপুর চৌরাস্তা', action: 'ব্ল্যাক বেঙ্গল খাঁটি খাসি সরাসরি খামার থেকে বুক করেছেন', timeAgo: '১৮ মিনিট আগে', badge: 'খামার বুকিং' },
];

export const DigitalExperienceShowcase: React.FC = () => {
  const [activeActivityIdx, setActiveActivityIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveActivityIdx(prev => (prev + 1) % LIVE_CUSTOMER_ACTIVITIES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentAct = LIVE_CUSTOMER_ACTIVITIES[activeActivityIdx];

  return (
    <div className="space-y-4">
      {/* 1. DIGITAL LIVE TELEMETRY TICKER BAR */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-3.5 sm:p-4 rounded-2xl border border-emerald-800/80 shadow-xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Left Live Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono font-black uppercase text-emerald-400 tracking-wider text-[11px]">
              DIGITAL FARM LIVE TELEMETRY
            </span>
          </div>

          {/* Scrolling / Ticker Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar font-bold text-[11px] py-0.5">
            <div className="flex items-center gap-1.5 shrink-0 text-slate-200">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>দুধ: <b className="text-emerald-400 font-mono">১৩০.৪L</b> (ফ্যাট ৪.৮%)</span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1.5 shrink-0 text-slate-200">
              <Egg className="w-3.5 h-3.5 text-amber-400" />
              <span>ডিম: <b className="text-amber-400 font-mono">৮৫৮ টি</b> (অর্গানিক)</span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1.5 shrink-0 text-slate-200">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>IoT ক্লাইমেট: <b className="text-teal-400 font-mono">২৮.২°C</b></span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1.5 shrink-0 text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>বায়োসিকিউরিটি: <b className="text-emerald-400 font-mono">১০০%</b> (Grade-1)</span>
            </div>
          </div>

          {/* Right Digital Certificate Tag */}
          <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono text-emerald-300 shrink-0">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Govt Reg: DLS-2024/8892</span>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME CUSTOMER LIVE ACTIVITY TICKER */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
            🛍️
          </div>
          <p className="text-slate-800 dark:text-slate-200 truncate text-[11px] sm:text-xs">
            <b className="text-emerald-700 dark:text-emerald-400">{currentAct.name}</b> ({currentAct.location}) — {currentAct.action}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-slate-400">{currentAct.timeAgo}</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px]">
            {currentAct.badge}
          </span>
        </div>
      </div>
    </div>
  );
};
