import React, { useState, useMemo } from 'react';
import { Sprout, Calendar, TrendingUp, AlertTriangle, CheckCircle2, CloudRain, Sun, Wind, ShoppingCart, Leaf } from 'lucide-react';
import { LivestockItem, FodderCrop, CropPlan } from '../types';

interface CropPlannerProps {
  livestock: LivestockItem[];
}

export const CropPlanner: React.FC<CropPlannerProps> = ({ livestock }) => {
  const [crops, setCrops] = useState<FodderCrop[]>([
    {
      id: 'cr-1',
      name: 'Plot A - Napier',
      species: 'Napier Grass',
      plantingDate: '2026-03-15',
      expectedHarvestDate: '2026-05-20',
      plotSizeDecimal: 20,
      status: 'Growing',
      yieldKgPerDecimal: 40,
    },
    {
      id: 'cr-2',
      name: 'Plot B - Maize',
      species: 'Fodder Maize',
      plantingDate: '2026-04-01',
      expectedHarvestDate: '2026-07-15',
      plotSizeDecimal: 15,
      status: 'Growing',
      yieldKgPerDecimal: 60,
    }
  ]);

  const totalDailyFodderRequirement = useMemo(() => {
    return livestock.reduce((total, animal) => {
      const fodderItems = (animal.structuredFeedPlan || []).filter(item => 
        item.name.includes('ঘাস') || item.name.includes('Fodder') || item.name.includes('পাতা')
      );
      const fodderWeight = fodderItems.reduce((s, i) => s + (i.targetAmountKg || 0), 0);
      return total + (fodderWeight * (animal.quantity || 1));
    }, 0);
  }, [livestock]);

  const seasonalForecast = {
    currentSeason: 'গ্রীষ্মকাল (Summer)',
    nextSeason: 'বর্ষাকাল (Monsoon)',
    advice: 'বর্ষার আগে নেপিয়ার ঘাস রোপণ করার উপযুক্ত সময়। নিচু জমি থেকে পানি নিষ্কাশন নিশ্চিত করুন।',
    temperature: '৩২° - ৩৮° সে.',
    rainfall: 'স্বল্প (পূর্বাভাস অনুযায়ী বাড়ছে)'
  };

  const cropRecommendations = useMemo((): CropPlan[] => {
    const monthlyRequirement = totalDailyFodderRequirement * 30;
    
    return [
      {
        id: 'rec-1',
        cropType: 'নেপিয়ার ঘাস (Napier)',
        recommendedPlantingSeason: 'বর্ষার শুরু (জুন-জুলাই)',
        estimatedYieldKg: 800,
        dailyConsumptionRequiredKg: totalDailyFodderRequirement,
        surplusDeficitKg: 800 - monthlyRequirement,
        actionRecommendation: monthlyRequirement > 800 ? 'আরও ১০ শতাংশ জমি চাষ করা প্রয়োজন।' : 'বর্তমান মজুদ পর্যাপ্ত।'
      },
      {
        id: 'rec-2',
        cropType: 'ভুট্টা সাইলেজ (Maize Silage)',
        recommendedPlantingSeason: 'শীতকাল / বসন্তকাল',
        estimatedYieldKg: 1200,
        dailyConsumptionRequiredKg: totalDailyFodderRequirement,
        surplusDeficitKg: 1200 - monthlyRequirement,
        actionRecommendation: 'শুষ্ক মৌসুমের জন্য সাইলেজ তৈরি শুরু করুন।'
      }
    ];
  }, [totalDailyFodderRequirement]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-emerald-200 dark:border-emerald-900 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">দৈনিক ঘাসের চাহিদা</h4>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{totalDailyFodderRequirement.toFixed(1)} <span className="text-lg opacity-40">কেজি</span></p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">খামারের বর্তমান পশুপাল অনুযায়ী</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-blue-200 dark:border-blue-900 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <CloudRain className="w-5 h-5" />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">আবহাওয়ার পূর্বাভাস</h4>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">{seasonalForecast.currentSeason}</p>
          <p className="text-[10px] text-blue-600 font-bold mt-1">{seasonalForecast.advice}</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-amber-200 dark:border-amber-900 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
              <Sprout className="w-5 h-5" />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">রোপণযোগ্য জমি</h4>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">৩৫ <span className="text-lg opacity-40">শতাংশ</span></p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">মোট ৩টি প্লট প্রস্তুত আছে</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Crops Table */}
        <div className="glass-card p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">বর্তমান ফসল ও প্লট স্ট্যাটাস</h3>
            </div>
            <button className="text-[10px] font-black text-emerald-600 uppercase hover:underline">নতুন প্লট যোগ করুন</button>
          </div>

          <div className="space-y-4">
            {crops.map(crop => (
              <div key={crop.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg ${
                    crop.status === 'Growing' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-amber-500 shadow-amber-500/20'
                  }`}>
                    {crop.plotSizeDecimal}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm">{crop.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold">{crop.species} • বপন: {crop.plantingDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-[9px] font-black uppercase">
                    {crop.status}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">কাটা হবে: {crop.expectedHarvestDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass-card p-8 rounded-[2.5rem] border border-emerald-200 dark:border-emerald-900 shadow-xl bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">এআই কৃষি ও ঘাস চাষ পরামর্শ</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-60">Precision Planning Mode</p>
            </div>
          </div>

          <div className="space-y-6">
            {cropRecommendations.map(rec => (
              <div key={rec.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-emerald-700 dark:text-emerald-400">{rec.cropType}</h4>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">রেকমেন্ডেশন</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">বপনের সেরা সময়</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{rec.recommendedPlantingSeason}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">সম্ভাব্য ফলন</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{rec.estimatedYieldKg} কেজি</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    {rec.actionRecommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs font-black">পরবর্তী চাষের শিডিউল</p>
                <p className="text-[10px] opacity-60">জুন ১০, ২০২৬ - নেপিয়ার সিডলিং</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black transition-all">শিডিউল দেখুন</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Bot = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);
