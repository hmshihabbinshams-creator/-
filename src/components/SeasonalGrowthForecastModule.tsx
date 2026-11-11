import React, { useState } from 'react';
import { LivestockItem } from '../types';
import { 
  TrendingUp, Calendar, Scale, DollarSign, FileSpreadsheet, Printer,
  Sparkles, Sun, CloudRain, Snowflake, Leaf, ShieldCheck, ArrowUpRight, BarChart3
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface SeasonalGrowthForecastModuleProps {
  livestock: LivestockItem[];
  farmProfileName?: string;
}

export type SeasonKey = 'winter' | 'spring' | 'summer' | 'monsoon';

interface SeasonMeta {
  key: SeasonKey;
  label: string;
  icon: any;
  tempRange: string;
  efficiencyMultiplier: number; // e.g., 1.12 for winter
  fcrLabel: string;
  advice: string;
}

const SEASONS: SeasonMeta[] = [
  {
    key: 'winter',
    label: 'শীতকাল (নভেম্বর - ফেব্রুয়ারি)',
    icon: Snowflake,
    tempRange: '১২°C - ২৫°C',
    efficiencyMultiplier: 1.12,
    fcrLabel: 'সর্বোত্তম FCR (৫.৮ : ১)',
    advice: 'তাপমাত্রার সহনীয় অবস্থা ও শীতকালীন সাইলেজ ব্যবহারে সর্বোচ্চ প্রবৃদ্ধি অর্জিত হয়। রাতে হালকা শেড কভারের ব্যবস্থা করুন।',
  },
  {
    key: 'spring',
    label: 'বসন্ত / শরৎ (মার্চ - এপ্রিল)',
    icon: Leaf,
    tempRange: '২০°C - ৩০°C',
    efficiencyMultiplier: 1.08,
    fcrLabel: 'উচ্চ পুষ্টি রূপান্তর (৬.১ : ১)',
    advice: 'কচি ঘাস ও উন্মুক্ত চারণভূমিতে প্রাকৃতিক পুষ্টি পাওয়া যায়। কৃমিনাশক ও বুস্টার ভ্যাকসিনেশন সম্পূর্ণ রাখুন।',
  },
  {
    key: 'summer',
    label: 'গ্রীষ্মকাল (মে - জুলাই)',
    icon: Sun,
    tempRange: '২৮°C - ৩৮°C',
    efficiencyMultiplier: 0.92,
    fcrLabel: 'হিট স্ট্রেস FCR (৬.৯ : ১)',
    advice: 'তাপদাহে খাওয়ার পরিমাণ হ্রাস পেতে পারে। দুপুর ১২টা-৩টা স্যালাইন ও ভিটামিন-সি সমৃদ্ধ ঠান্ডা পানীয় প্রদান করুন।',
  },
  {
    key: 'monsoon',
    label: 'বর্ষাকাল (আগস্ট - অক্টোবর)',
    icon: CloudRain,
    tempRange: '২৫°C - ৩৪°C',
    efficiencyMultiplier: 0.90,
    fcrLabel: 'আর্দ্রতাজনিত FCR (৭.১ : ১)',
    advice: 'স্যাঁতসেঁতে মেঝে থেকে ক্ষুরের পচন রোধে শুকনা খড় বিছিয়ে দিন এবং দানাদার খাবার আর্দ্রতামুক্ত স্থানে রাখুন।',
  },
];

export const SeasonalGrowthForecastModule: React.FC<SeasonalGrowthForecastModuleProps> = ({
  livestock,
  farmProfileName = 'আর এস সৌখিন খামার'
}) => {
  const [selectedSeasonKey, setSelectedSeasonKey] = useState<SeasonKey>('winter');

  const selectedSeason = SEASONS.find(s => s.key === selectedSeasonKey) || SEASONS[0];
  const activeLivestock = livestock.filter(a => a.status !== 'বিক্রিত (Sold)');

  // Species-specific base ADG (Average Daily Gain in kg/day) and average market price per kg
  const getSpeciesGrowthProfile = (speciesType: string) => {
    const t = speciesType.toLowerCase();
    if (t.includes('গরু') || t.includes('cattle') || t.includes('cow')) {
      return { baseAdg: 0.90, marketPricePerKg: 550, fcr: 6.2 };
    }
    if (t.includes('ছাগল') || t.includes('goat')) {
      return { baseAdg: 0.18, marketPricePerKg: 950, fcr: 5.5 };
    }
    if (t.includes('হাঁস') || t.includes('duck')) {
      return { baseAdg: 0.035, marketPricePerKg: 380, fcr: 3.2 };
    }
    if (t.includes('মুরগি') || t.includes('chicken') || t.includes('poultry')) {
      return { baseAdg: 0.025, marketPricePerKg: 280, fcr: 2.1 };
    }
    if (t.includes('পাখি') || t.includes('birds')) {
      return { baseAdg: 0.003, marketPricePerKg: 1200, fcr: 2.8 };
    }
    return { baseAdg: 0.50, marketPricePerKg: 450, fcr: 5.0 };
  };

  // Forecast per animal
  const forecastItems = activeLivestock.map(animal => {
    const prof = getSpeciesGrowthProfile(animal.type);
    const effectiveAdg = prof.baseAdg * selectedSeason.efficiencyMultiplier;

    const curWeight = animal.currentWeight || 10;
    const m1Weight = parseFloat((curWeight + effectiveAdg * 30).toFixed(1));
    const m2Weight = parseFloat((curWeight + effectiveAdg * 60).toFixed(1));
    const m3Weight = parseFloat((curWeight + effectiveAdg * 90).toFixed(1));

    const totalGain90Days = parseFloat((m3Weight - curWeight).toFixed(1));
    const dailyFeedBudget = animal.dailyFeedBudget || 80;
    const projectedFeedCost90Days = dailyFeedBudget * 90;

    const currentMarketVal = Math.round(curWeight * prof.marketPricePerKg);
    const projectedMarketVal90Days = Math.round(m3Weight * prof.marketPricePerKg);
    const projectedGrossProfit = projectedMarketVal90Days - (animal.purchasePrice + projectedFeedCost90Days);

    return {
      animal,
      effectiveAdg: parseFloat(effectiveAdg.toFixed(3)),
      fcr: prof.fcr,
      marketPricePerKg: prof.marketPricePerKg,
      curWeight,
      m1Weight,
      m2Weight,
      m3Weight,
      totalGain90Days,
      projectedFeedCost90Days,
      currentMarketVal,
      projectedMarketVal90Days,
      projectedGrossProfit,
    };
  });

  // Global Totals
  const totalCurWeight = forecastItems.reduce((s, i) => s + i.curWeight, 0);
  const totalM1Weight = forecastItems.reduce((s, i) => s + i.m1Weight, 0);
  const totalM2Weight = forecastItems.reduce((s, i) => s + i.m2Weight, 0);
  const totalM3Weight = forecastItems.reduce((s, i) => s + i.m3Weight, 0);
  
  const totalNetGainKg = Math.round(totalM3Weight - totalCurWeight);
  const totalGainPercent = totalCurWeight > 0 ? ((totalNetGainKg / totalCurWeight) * 100).toFixed(1) : '0';

  const totalProjectedFeedCost = forecastItems.reduce((s, i) => s + i.projectedFeedCost90Days, 0);
  const totalCurrentMarketValue = forecastItems.reduce((s, i) => s + i.currentMarketVal, 0);
  const totalProjectedMarketValue = forecastItems.reduce((s, i) => s + i.projectedMarketVal90Days, 0);
  const totalProjectedNetProfit = forecastItems.reduce((s, i) => s + i.projectedGrossProfit, 0);

  // Time Chart Data (0, 30, 60, 90 days)
  const chartData = [
    { period: 'বর্তমান (Month 0)', weight: totalCurWeight, revenue: totalCurrentMarketValue },
    { period: 'মাস ১ (+30 Days)', weight: Math.round(totalM1Weight), revenue: Math.round(totalCurrentMarketValue + (totalProjectedMarketValue - totalCurrentMarketValue) * 0.33) },
    { period: 'মাস ২ (+60 Days)', weight: Math.round(totalM2Weight), revenue: Math.round(totalCurrentMarketValue + (totalProjectedMarketValue - totalCurrentMarketValue) * 0.66) },
    { period: 'মাস ৩ (+90 Days)', weight: Math.round(totalM3Weight), revenue: totalProjectedMarketValue },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white p-8 rounded-[3rem] border border-teal-500/30 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-black uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Predictive Feed Efficiency & Seasonal Growth Analytics</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              ঋতুভিত্তিক গবাদিপশু প্রবৃদ্ধি ও বাজার দর পূর্বাভাস
            </h2>
            <p className="text-xs text-teal-200/80 mt-1 max-w-2xl font-medium">
              ঐতিহাসিক খাদ্য রূপান্তর হার (FCR), দৈনিক গড় ওজন বৃদ্ধি (ADG) এবং মৌসুমী আবহাওয়া প্রভাব ব্যবহার করে আগামী ৩ মাসের (কোয়ার্টার) মোট ওজন ও রাজস্ব পূর্বাভাস।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-xs shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-slate-200 dark:border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>রিপোর্ট প্রিন্ট করুন</span>
            </button>
          </div>
        </div>

        {/* Season Selector Tabs */}
        <div className="space-y-3 relative z-10">
          <label className="text-[10px] font-black uppercase tracking-widest text-teal-300">মৌসুমী কোয়ার্টার নির্বাচন করুন:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SEASONS.map(s => {
              const IconComp = s.icon;
              const isSelected = s.key === selectedSeasonKey;
              return (
                <button
                  key={s.key}
                  onClick={() => setSelectedSeasonKey(s.key)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-400 ring-2 ring-teal-400 shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 text-teal-100 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black">{s.label}</span>
                    <IconComp className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-[10px] opacity-80 flex items-center justify-between font-mono">
                    <span>{s.tempRange}</span>
                    <span className="font-bold">{s.efficiencyMultiplier}x দক্ষতা</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Season Advice Banner */}
        <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex items-start gap-3 relative z-10 text-xs text-teal-100 font-medium">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white uppercase text-[10px] tracking-wider block mb-0.5">
              {selectedSeason.label} — {selectedSeason.fcrLabel}
            </span>
            <p className="text-[11px] text-teal-100/90">{selectedSeason.advice}</p>
          </div>
        </div>
      </div>

      {/* Global Forecast KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <span>বর্তমান মোট ওজন</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalCurWeight} <span className="text-sm font-bold opacity-60">কেজি</span></p>
          <p className="text-[10px] font-bold text-slate-500">মোট সক্রিয় পশু: {activeLivestock.length} টি</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest">
            <span>আগামী ৩ মাসের টার্গেট ওজন</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600 font-mono">{Math.round(totalM3Weight)} <span className="text-sm font-bold opacity-60">কেজি</span></p>
          <p className="text-[10px] font-bold text-emerald-600">+{totalNetGainKg} কেজি প্রবৃদ্ধি (+{totalGainPercent}%)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-amber-600 text-[10px] font-black uppercase tracking-widest">
            <span>কোয়ার্টার খাদ্য ব্যয়</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600 font-mono">{totalProjectedFeedCost.toLocaleString('bn-BD')} <span className="text-sm font-bold opacity-60">৳</span></p>
          <p className="text-[10px] font-bold text-slate-500">পরবর্তী ৯০ দিনের খাদ্য বাজেট</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-xl shadow-emerald-600/20 space-y-2">
          <div className="flex justify-between items-center text-emerald-100 text-[10px] font-black uppercase tracking-widest">
            <span>প্রাক্কলিত কোয়ার্টার নিট লাভ</span>
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>
          <p className="text-3xl font-black font-mono">{totalProjectedNetProfit.toLocaleString('bn-BD')} <span className="text-sm font-bold opacity-80">৳</span></p>
          <p className="text-[10px] font-bold text-emerald-100">প্রত্যাশিত মোট বাজার মূল্যায়ন: {totalProjectedMarketValue.toLocaleString('bn-BD')} ৳</p>
        </div>
      </div>

      {/* Visual Chart: 90-Day Projected Weight Progression */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              <span>আগামী ৯০ দিনের শারীরিক প্রবৃদ্ধি ও সম্ভাব্য বাজার মূল্য গতিপথ</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              মৌসুমী আবহাওয়া অনুযায়ী প্রতি ৩০ দিনের ব্যবধানে শারীরিক ওজন বৃদ্ধি (কেজি)
            </p>
          </div>
          <span className="text-xs font-black text-teal-600 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-xl border border-teal-200">
            {selectedSeason.label}
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
              <XAxis dataKey="period" stroke="#64748b" fontSize={11} fontWeight="bold" />
              <YAxis stroke="#64748b" fontSize={11} fontWeight="bold" unit=" kg" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(val: any) => [`${val} কেজি`, 'মোট প্রজেক্টেড ওজন']}
              />
              <Area type="monotone" dataKey="weight" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Per-Animal Forecast Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">স্বতন্ত্র পশুভিত্তিক প্রবৃদ্ধি ও বাজার দর পূর্বাভাস তালিকা</h3>
            <p className="text-xs text-slate-500 font-medium">প্রতিটি পশুর প্রজাতি ও বয়স অনুযায়ী পরবর্তী ১, ২ এবং ৩ মাসের কাঙ্ক্ষিত ওজন ও মুনাফা</p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>রিপোর্ট প্রিন্ট করুন</span>
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="p-4">পশু ও আইডি</th>
                <th className="p-4">ধরন ও বয়স</th>
                <th className="p-4 text-center">বর্তমান ওজন</th>
                <th className="p-4 text-center text-teal-600">মাস ১ (+৩০ দিন)</th>
                <th className="p-4 text-center text-teal-600">মাস ২ (+৬০ দিন)</th>
                <th className="p-4 text-center text-emerald-600 font-black">মাস ৩ (কোয়ার্টার ওজন)</th>
                <th className="p-4 text-right">সম্ভাব্য খাদ্য খরচ</th>
                <th className="p-4 text-right text-emerald-600 font-black">সম্ভাব্য বাজার দর</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {forecastItems.map(({ animal, curWeight, m1Weight, m2Weight, m3Weight, totalGain90Days, projectedFeedCost90Days, projectedMarketVal90Days }) => (
                <tr key={animal.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-sans">
                    <p className="font-black text-slate-900 dark:text-white">{animal.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">[{animal.id}]</span>
                  </td>
                  <td className="p-4 font-sans">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">{animal.type.split(' ')[0]}</span>
                    <span className="text-[10px] text-teal-600 font-bold">{animal.age}</span>
                  </td>
                  <td className="p-4 text-center font-bold text-slate-800 dark:text-slate-200">
                    {curWeight} কেজি
                  </td>
                  <td className="p-4 text-center font-bold text-teal-600">
                    {m1Weight} কেজি
                  </td>
                  <td className="p-4 text-center font-bold text-teal-600">
                    {m2Weight} কেজি
                  </td>
                  <td className="p-4 text-center font-black text-emerald-600 text-sm">
                    {m3Weight} কেজি
                    <span className="text-[9px] block text-emerald-500 font-normal">(+{totalGain90Days} কেজি)</span>
                  </td>
                  <td className="p-4 text-right text-amber-600 font-bold">
                    -{projectedFeedCost90Days.toLocaleString('bn-BD')} ৳
                  </td>
                  <td className="p-4 text-right font-black text-emerald-600 text-sm">
                    {projectedMarketVal90Days.toLocaleString('bn-BD')} ৳
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
