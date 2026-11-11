import React, { useState, useEffect } from 'react';
import { 
  Zap, Droplets, Thermometer, Sun, Activity, 
  CheckCircle2, AlertTriangle, TrendingDown, Gauge
} from 'lucide-react';

export const FarmOperationalDashboard: React.FC = () => {
  // Live simulated readings
  const [electricityKwh, setElectricityKwh] = useState<number>(42.8);
  const [solarGenerationKwh, setSolarGenerationKwh] = useState<number>(28.5);
  const [waterUsageLiters, setWaterUsageLiters] = useState<number>(1420);
  const [temperatureCelsius, setTemperatureCelsius] = useState<number>(28.4);
  const [humidityPercent, setHumidityPercent] = useState<number>(68);

  // Slight jitter for real-time live monitoring effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElectricityKwh(prev => Number((prev + (Math.random() * 0.4 - 0.2)).toFixed(1)));
      setWaterUsageLiters(prev => prev + Math.floor(Math.random() * 3));
      setTemperatureCelsius(prev => Number((28.0 + (Math.random() * 0.8)).toFixed(1)));
      setHumidityPercent(prev => Math.min(85, Math.max(50, prev + Math.floor(Math.random() * 3 - 1))));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <span className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-extrabold text-[11px] border border-cyan-200 dark:border-cyan-800 flex items-center gap-1.5 w-max">
            <Gauge className="w-3.5 h-3.5 text-cyan-600" />
            <span>খামার অপারেশনাল ড্যাশবোর্ড ও রিসোর্স মনিটর</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            বিদ্যুৎ খরচ, পানির ব্যবহার এবং রিয়েল-টাইম আবহাওয়া ও ক্লাইমেট ট্র্যাকার
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>লাইভ সেন্সর ডাটা স্ট্রিম</span>
        </div>
      </div>

      {/* 3 Main Operational Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Electricity & Solar Energy Widget */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 border border-amber-200 dark:border-amber-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-xs">
              <Zap className="w-4 h-4 fill-amber-500" />
              <span>বিদ্যুৎ খরচ ও সোলার জেনারেশন</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              ৬৬% সোলার পাওয়ার গ্রিড
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{electricityKwh}</span>
              <span className="text-xs text-slate-500 font-bold ml-1">kWh আজ</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-600 font-bold block">সোলার জেনারেশন:</span>
              <span className="text-sm font-black text-emerald-600 font-mono">+{solarGenerationKwh} kWh</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-amber-100 dark:border-amber-900/40">
            ইনভার্টার ও মিল্কিং পার্লার পাওয়ার স্বাভাবিক সীমার মধ্যে।
          </p>
        </div>

        {/* 2. Water Usage & Reservoir Level */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900 border border-blue-200 dark:border-blue-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-extrabold text-xs">
              <Droplets className="w-4 h-4 fill-blue-500" />
              <span>দৈনিক মোট পানির ব্যবহার</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              পাম্প প্রেশার ৪.২ Bar
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{waterUsageLiters}</span>
              <span className="text-xs text-slate-500 font-bold ml-1">লিটার</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-blue-600 font-bold block">রিজার্ভার লেভেল:</span>
              <span className="text-sm font-black text-blue-600 font-mono">৮৮% (৪,৪০০L)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-blue-100 dark:border-blue-900/40">
            গবাদিপশুর খাবার পানির বাটি ও অটো-ওয়াশার সচল।
          </p>
        </div>

        {/* 3. Ambient Temperature & Shed Climate */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-50/80 via-white to-teal-50/40 dark:from-teal-950/30 dark:via-slate-900 dark:to-slate-900 border border-teal-200 dark:border-teal-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-extrabold text-xs">
              <Thermometer className="w-4 h-4 text-teal-600" />
              <span>শেডের তাপমাত্রা ও আর্দ্রতা</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              আদর্শ ক্লাইমেট জোন
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{temperatureCelsius}°C</span>
              <span className="text-xs text-slate-500 font-bold ml-1">তাপমাত্রা</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-teal-600 font-bold block">আর্দ্রতা (Humidity):</span>
              <span className="text-sm font-black text-teal-600 font-mono">{humidityPercent}%</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-teal-100 dark:border-teal-900/40">
            একজস্ট ফ্যান ও ফগার কুলিং সিস্টেম অটোমেটিক মোডে সচল।
          </p>
        </div>
      </div>
    </div>
  );
};
