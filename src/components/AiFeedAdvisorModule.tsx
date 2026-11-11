import React, { useState, useMemo } from 'react';
import { 
  Bot, Sparkles, Scale, Utensils, CheckCircle2, 
  Calculator, Zap, Layers, RefreshCcw, Info, Printer,
  AlertTriangle, Calendar, ChevronRight, Download
} from 'lucide-react';
import { farmStore } from '../services/farmStore';
import { LivestockItem, FeedInventoryItem } from '../types';

interface NutritionalRequirement {
  breed: string;
  species: string;
  dmPercentage: number; // Dry Matter % of body weight
  proteinPercentage: number; // Crude Protein % in ration
  recommendedItems: {
    name: string;
    ratio: number; // Percentage of total ration
    description: string;
  }[];
}

const BREED_KNOWLEDGE_BASE: NutritionalRequirement[] = [
  {
    breed: 'সাহীওয়াল',
    species: 'গরু',
    dmPercentage: 2.8,
    proteinPercentage: 14,
    recommendedItems: [
      { name: 'নেপিয়ার ঘাস', ratio: 70, description: 'উচ্চ পুষ্টি ও ফাইবারের জন্য' },
      { name: 'গমের ভুসি', ratio: 20, description: 'শক্তির জন্য দানাদার খাদ্য' },
      { name: 'খৈল', ratio: 10, description: 'প্রোটিন সাপ্লিমেন্ট' }
    ]
  },
  {
    breed: 'যমুনাপারি',
    species: 'ছাগল',
    dmPercentage: 3.5,
    proteinPercentage: 16,
    recommendedItems: [
      { name: 'নেপিয়ার ঘাস', ratio: 60, description: 'সবুজ খাদ্য' },
      { name: 'দানাদার ফিড', ratio: 30, description: 'পুষ্টির জন্য' },
      { name: 'খৈল', ratio: 10, description: 'প্রোটিন বৃদ্ধি' }
    ]
  },
  {
    breed: 'সোনালী',
    species: 'মুরগি',
    dmPercentage: 5,
    proteinPercentage: 18,
    recommendedItems: [
      { name: 'দানাদার ফিড', ratio: 100, description: 'সুষম লেয়ার ফিড' }
    ]
  },
  {
    breed: 'তেলাপিয়া',
    species: 'মাছ',
    dmPercentage: 2.5,
    proteinPercentage: 28,
    recommendedItems: [
      { name: 'দানাদার ফিড', ratio: 100, description: 'ভাসমান ফিশ ফিড' }
    ]
  }
];

export const AiFeedAdvisorModule: React.FC = () => {
  const livestock = farmStore.getLivestock();
  const inventory = farmStore.getFeedInventory();
  
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(livestock[0]?.id || '');
  const [targetDays, setTargetDays] = useState<number>(7);

  const selectedAnimal = useMemo(() => 
    livestock.find(a => a.id === selectedAnimalId), 
  [livestock, selectedAnimalId]);

  const breedInfo = useMemo(() => {
    if (!selectedAnimal) return null;
    return BREED_KNOWLEDGE_BASE.find(b => 
      selectedAnimal.breed.includes(b.breed) || selectedAnimal.type.includes(b.species)
    ) || BREED_KNOWLEDGE_BASE[0];
  }, [selectedAnimal]);

  const feedingPlan = useMemo(() => {
    if (!selectedAnimal || !breedInfo) return null;

    const weight = selectedAnimal.currentWeight || 100;
    const dailyDM = (weight * breedInfo.dmPercentage) / 100;
    const totalDailyFeed = dailyDM * 2.5; // Roughly estimating wet weight from DM

    const dailyItems = breedInfo.recommendedItems.map(item => {
      const amount = (totalDailyFeed * item.ratio) / 100;
      const invItem = inventory.find(i => i.name.includes(item.name) || item.name.includes(i.name));
      const hasStock = invItem ? invItem.currentStockKg >= (amount * targetDays) : false;
      
      return {
        ...item,
        dailyAmount: amount.toFixed(2),
        weeklyAmount: (amount * 7).toFixed(2),
        hasStock,
        currentStock: invItem?.currentStockKg || 0
      };
    });

    return {
      dailyDM: dailyDM.toFixed(2),
      totalDailyFeed: totalDailyFeed.toFixed(2),
      items: dailyItems
    };
  }, [selectedAnimal, breedInfo, inventory, targetDays]);

  const daysOfWeek = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Feed Intelligence</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-black animate-pulse">LIVE DATA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            এআই পশুখাদ্য পরামর্শক ও পুষ্টি পরিকল্পনা
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            জাতভিত্তিক পুষ্টির চাহিদা এবং বর্তমান মজুদের ওপর ভিত্তি করে সাপ্তাহিক খাবার পরিকল্পনা।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>সাপ্তাহিক প্ল্যান প্রিন্ট</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
            <Download className="w-4 h-4" />
            <span>ডাউনলোড PDF</span>
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Utensils className="w-3.5 h-3.5 text-indigo-500" />
            পশু নির্বাচন করুন
          </label>
          <select
            value={selectedAnimalId}
            onChange={(e) => setSelectedAnimalId(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          >
            <option value="" disabled>নির্বাচন করুন</option>
            {livestock.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.breed})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">পশুর ওজন</span>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{selectedAnimal?.currentWeight || 0} কেজি</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">প্রজাতি / জাত</span>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 truncate">{selectedAnimal?.breed || 'N/A'}</p>
          </div>
        </div>
      </div>

      {feedingPlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommendation Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <h3 className="text-lg font-black tracking-tight uppercase">পুষ্টি বিশ্লেষণ</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-white/20 text-xs">
                    <span className="opacity-80">দৈনিক ড্রাই ম্যাটার (DM)</span>
                    <span className="font-black font-mono">{feedingPlan.dailyDM} কেজি</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/20 text-xs">
                    <span className="opacity-80">মোট দৈনিক খাদ্য ওজন</span>
                    <span className="font-black font-mono">{feedingPlan.totalDailyFeed} কেজি</span>
                  </div>
                  <div className="flex items-center justify-between py-2 text-xs">
                    <span className="opacity-80">প্রোটিন লক্ষ্যমাত্রা</span>
                    <span className="font-black font-mono">{breedInfo?.proteinPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
                <Layers className="w-4 h-4 text-emerald-500" />
                মজুদ স্থিতি চেক
              </h4>
              <div className="space-y-3">
                {feedingPlan.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200">{item.name}</p>
                      <p className="text-[10px] text-slate-400">মজুদ: {item.currentStock} কেজি</p>
                    </div>
                    {item.hasStock ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Weekly Plan */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  সাপ্তাহিক র্যাশন গাইড (Weekly Ration Guide)
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actionable Plan</span>
              </div>

              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="p-6">বার</th>
                      <th className="p-6 text-center">সকাল (৬:০০ AM)</th>
                      <th className="p-6 text-center">দুপুর (১:০০ PM)</th>
                      <th className="p-6 text-center">বিকাল (৬:০০ PM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {daysOfWeek.map((day, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors group">
                        <td className="p-6">
                          <p className="font-black text-slate-900 dark:text-white text-sm">{day}</p>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Routine {idx + 1}</span>
                        </td>
                        <td className="p-6 text-center">
                          <div className="space-y-1">
                            {feedingPlan.items.slice(0, 2).map((it, i) => (
                              <p key={i} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {it.name}: {(parseFloat(it.dailyAmount) * 0.4).toFixed(1)} কেজি
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <div className="space-y-1">
                            {feedingPlan.items.slice(0, 1).map((it, i) => (
                              <p key={i} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {it.name}: {(parseFloat(it.dailyAmount) * 0.2).toFixed(1)} কেজি
                              </p>
                            ))}
                            <p className="text-[9px] text-indigo-500 font-black uppercase">প্লাস মিনারেল মিক্স</p>
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <div className="space-y-1">
                            {feedingPlan.items.map((it, i) => (
                              <p key={i} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {it.name}: {(parseFloat(it.dailyAmount) * 0.4).toFixed(1)} কেজি
                              </p>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 space-y-2">
              <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                <Info className="w-4 h-4" />
                এআই পরামর্শ
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300/80 leading-relaxed font-medium">
                আপনার গাভীটি বর্তমানে প্রজনন পর্যায়ে রয়েছে, তাই তার খাবারে পর্যাপ্ত ক্যালসিয়াম ও ফসফরাস নিশ্চিত করা জরুরি। উপরে দেওয়া তালিকায় সবুজ ঘাস এবং খৈলের অনুপাত ঠিক রাখা হয়েছে যাতে দুধ উৎপাদন এবং পশুর স্বাস্হ্য উভয়ই ঠিক থাকে। যদি মজুদ শেষ হয়ে যায়, তবে দ্রুত "সাপ্লাই চেইন" সেকশন থেকে অর্ডার করুন।
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 space-y-4">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <Utensils className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">কোন পরিকল্পনা পাওয়া যায়নি</h3>
            <p className="text-sm text-slate-500">পরিকল্পনা শুরু করতে উপরে একটি পশু নির্বাচন করুন।</p>
          </div>
        </div>
      )}
    </div>
  );
};
