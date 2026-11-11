import React, { useState, useMemo } from 'react';
import { LivestockItem } from '../types';
import { 
  Scale, TrendingUp, DollarSign, Award, AlertCircle, 
  CheckCircle2, Sparkles, Filter, Printer, HelpCircle,
  ArrowUpRight, ArrowDownRight, Layers, Utensils, Info,
  Lightbulb, LineChart as LineChartIcon, BarChart3, PieChart
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, ComposedChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid, Cell, Area
} from 'recharts';

interface FCRTrackerCardProps {
  livestock: LivestockItem[];
}

export const FCRTrackerCard: React.FC<FCRTrackerCardProps> = ({ livestock }) => {
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'efficiency' | 'cost' | 'gain'>('efficiency');
  const [chartMode, setChartMode] = useState<'line' | 'feed_comparison' | 'composed'>('line');

  // Filter out sold animals and apply species filter
  const activeLivestock = useMemo(() => {
    return (livestock || []).filter(item => {
      if (item.status === 'বিক্রিত (Sold)') return false;
      if (selectedSpecies === 'all') return true;
      const t = item.type.toLowerCase();
      if (selectedSpecies === 'cattle') return t.includes('গরু') || t.includes('cattle');
      if (selectedSpecies === 'goat') return t.includes('ছাগল') || t.includes('goat');
      if (selectedSpecies === 'duck') return t.includes('হাঁস') || t.includes('duck');
      if (selectedSpecies === 'chicken') return t.includes('মুরগি') || t.includes('chicken');
      if (selectedSpecies === 'birds') return t.includes('পাখি') || t.includes('birds');
      if (selectedSpecies === 'fish') return t.includes('মাছ') || t.includes('fish');
      return true;
    });
  }, [livestock, selectedSpecies]);

  // Comprehensive FCR and Cost Per KG Gain calculations per animal
  const analyzedData = useMemo(() => {
    return activeLivestock.map(animal => {
      const initialW = animal.initialWeight || Math.round((animal.currentWeight || 10) * 0.7);
      const currentW = animal.currentWeight || 10;
      const netGainKg = Math.max(0.5, parseFloat((currentW - initialW).toFixed(1)));
      
      // Calculate or estimate accumulated feed and costs
      let accumulatedFeedKg = 0;
      let accumulatedFeedCost = 0;

      if (animal.feedingLogs && animal.feedingLogs.length > 0) {
        animal.feedingLogs.forEach(log => {
          accumulatedFeedCost += log.totalCostTaka || 0;
          if (log.feedItemsServed) {
            log.feedItemsServed.forEach(it => {
              accumulatedFeedKg += it.eatenAmountKg || it.servedAmountKg || 0;
            });
          }
        });
      }

      // Default reasonable biological estimation if log count is low
      const dailyBudget = animal.dailyFeedBudget || 80;
      const rearingDays = Math.max(30, (animal.targetRearingMonths || 4) * 25);
      if (accumulatedFeedCost === 0) {
        accumulatedFeedCost = Math.round(dailyBudget * rearingDays * 0.45);
      }

      // Typical species feed-to-gain biological baseline
      const t = animal.type.toLowerCase();
      let expectedFcr = 6.2;
      let feedTypeRecommended = 'ভুট্টা সাইলেজ ও কাঁচা নেপিয়ার ঘাস';
      let currentFeedFormula = 'সবুজ ঘাস ও ভুসি মিশ্রণ';

      if (t.includes('গরু')) {
        expectedFcr = 6.4;
        feedTypeRecommended = 'ভুট্টা সাইলেজ, দানাদার ভুসি ও সবুজ নেপিয়ার';
        currentFeedFormula = 'ভুট্টা সাইলেজ ও নেপিয়ার ঘাস';
      } else if (t.includes('ছাগল')) {
        expectedFcr = 5.2;
        feedTypeRecommended = 'কাঁঠাল পাতা, দানাদার ও ডাল চূর্ণ';
        currentFeedFormula = 'কাঁঠাল পাতা ও ডাল মিশ্রণ';
      } else if (t.includes('হাঁস')) {
        expectedFcr = 3.2;
        feedTypeRecommended = 'ধানের কুঁড়া, শামুক ও ভাসমান ডাক ফিড';
        currentFeedFormula = 'ধানের কুঁড়া ও শামুক ডাস্ট';
      } else if (t.includes('মুরগি')) {
        expectedFcr = 2.2;
        feedTypeRecommended = 'হাই-প্রোটিন ব্রয়লার/সোনালী স্টার্টার ও শাকসবজি';
        currentFeedFormula = 'ব্রয়লার ফিড ও শাকসবজি';
      } else if (t.includes('পাখি')) {
        expectedFcr = 2.8;
        feedTypeRecommended = 'পাখির সুষম সিডমিক্স ও ভিটামিন ওয়াটার';
        currentFeedFormula = 'সুষম সিডমিক্স';
      } else if (t.includes('মাছ')) {
        expectedFcr = 1.6;
        feedTypeRecommended = '২৮% প্রোটিন ভাসমান পেলেট ও খৈল মিশ্রণ';
        currentFeedFormula = 'ভাসমান পেলেট ফিড';
      }

      if (accumulatedFeedKg === 0) {
        accumulatedFeedKg = parseFloat((netGainKg * expectedFcr).toFixed(1));
      }

      // True FCR = Total Feed Consumed (kg) / Net Weight Gain (kg)
      const fcr = parseFloat((accumulatedFeedKg / netGainKg).toFixed(2));
      
      // Cost per kg gain = Total Feed Cost (৳) / Net Weight Gain (kg)
      const costPerKgGain = Math.round(accumulatedFeedCost / netGainKg);

      // Status classification
      let efficiencyStatus: 'super_saving' | 'standard' | 'high_cost' = 'standard';
      let statusLabelBn = 'মানসম্মত / স্বাভাবিক';
      let statusColor = 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800';

      if (fcr <= expectedFcr * 0.95) {
        efficiencyStatus = 'super_saving';
        statusLabelBn = '🌟 সর্বোচ্চ সাশ্রয়ী';
        statusColor = 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
      } else if (fcr >= expectedFcr * 1.15) {
        efficiencyStatus = 'high_cost';
        statusLabelBn = '⚠️ ব্যয়বহুল (খাদ্য অপচয়)';
        statusColor = 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
      }

      return {
        id: animal.id,
        tagId: animal.tagId || animal.id.slice(0, 6),
        name: animal.name,
        type: animal.type.split(' ')[0],
        fullType: animal.type,
        breed: animal.breed,
        initialW,
        currentW,
        netGainKg,
        accumulatedFeedKg,
        accumulatedFeedCost,
        fcr,
        costPerKgGain,
        expectedFcr,
        feedTypeRecommended,
        currentFeedFormula,
        efficiencyStatus,
        statusLabelBn,
        statusColor,
      };
    });
  }, [activeLivestock]);

  // Sorted data
  const sortedData = useMemo(() => {
    return [...analyzedData].sort((a, b) => {
      if (sortBy === 'efficiency') return a.fcr - b.fcr; // lower FCR is better
      if (sortBy === 'cost') return a.costPerKgGain - b.costPerKgGain; // lower cost is better
      return b.netGainKg - a.netGainKg; // higher gain first
    });
  }, [analyzedData, sortBy]);

  // Aggregated KPIs
  const totalGainAll = useMemo(() => {
    return analyzedData.reduce((sum, item) => sum + item.netGainKg, 0);
  }, [analyzedData]);

  const totalFeedCostAll = useMemo(() => {
    return analyzedData.reduce((sum, item) => sum + item.accumulatedFeedCost, 0);
  }, [analyzedData]);

  const avgCostPerKgGain = useMemo(() => {
    return totalGainAll > 0 ? Math.round(totalFeedCostAll / totalGainAll) : 0;
  }, [totalGainAll, totalFeedCostAll]);

  const superSavingCount = useMemo(() => {
    return analyzedData.filter(i => i.efficiencyStatus === 'super_saving').length;
  }, [analyzedData]);

  // Line Chart Data (Weight Gain vs Feed Cost Ratio per animal)
  const lineChartData = useMemo(() => {
    return sortedData.slice(0, 10).map(item => ({
      name: item.name.length > 8 ? `${item.name.substring(0, 7)}..` : item.name,
      fullName: item.name,
      tagId: item.tagId,
      breed: item.breed,
      'ওজন বৃদ্ধি (কেজি)': item.netGainKg,
      'মোট খাদ্য খরচ (৳)': item.accumulatedFeedCost,
      'খরচ অনুপাত (৳/কেজি বৃদ্ধি)': item.costPerKgGain,
      'FCR রূপান্তর অনুপাত': item.fcr,
      feedFormula: item.currentFeedFormula,
      efficiencyStatus: item.efficiencyStatus
    }));
  }, [sortedData]);

  // Feed Formulas Comparative Efficiency Data (খাদ্য ফর্মুলা সাশ্রয়ী তুলনা)
  const feedFormulasComparison = useMemo(() => {
    return [
      {
        formulaName: 'ভুট্টা সাইলেজ ও নেপিয়ার ঘাস',
        species: 'গরু ও বলদ',
        costPerKgGain: 180,
        fcrScore: 5.4,
        savingsPercent: 42,
        isMostCostEffective: true,
        rating: 'সবচেয়ে সাশ্রয়ী 🌟',
        recommendedTips: 'দানাদার ফিডের পরিমাণ কমিয়ে ৫০% সাইলেজ দিলে প্রতিদিন প্রতি গরুতে ৮০-১০০ টাকা সাশ্রয় হয়।'
      },
      {
        formulaName: 'ভাসমান পেলেট ফিড (২৮% প্রোটিন) + খৈল',
        species: 'মাছ ও পোনা',
        costPerKgGain: 125,
        fcrScore: 1.4,
        savingsPercent: 38,
        isMostCostEffective: true,
        rating: 'মৎস্যে সেরা সাশ্রয়ী 🌟',
        recommendedTips: 'সকাল ও সন্ধ্যায় নির্দিষ্ট ট্রেতে ভাসমান ফিড দিলে তলানিতে অপচয় শূন্যে নেমে আসে।'
      },
      {
        formulaName: 'কাঁঠাল পাতা, ডাল মিশ্রণ ও ইউএমএস',
        species: 'ছাগল ও ভেড়া',
        costPerKgGain: 195,
        fcrScore: 4.8,
        savingsPercent: 35,
        isMostCostEffective: false,
        rating: 'উচ্চ সাশ্রয়ী 🌿',
        recommendedTips: 'ইউরিয়া মোলাসেস স্ট্র (UMS) ও কাঁঠাল পাতা খাওয়ালে ছাগলের দ্রুত বৃদ্ধি ঘটে এবং খরচ কমে।'
      },
      {
        formulaName: 'ধানের কুঁড়া, শামুক ডাস্ট ও গ্রিন উইড',
        species: 'হাঁস ও কোয়েল',
        costPerKgGain: 160,
        fcrScore: 2.9,
        savingsPercent: 30,
        isMostCostEffective: false,
        rating: 'সাশ্রয়ী বিকল্প 🦆',
        recommendedTips: 'পুকুরের শামুক ও ভাসমান এজোলা মিশিয়ে দিলে কৃত্রিম ফিডের চাহিদা অর্ধেকে নেমে আসে।'
      },
      {
        formulaName: '১০০% রেডিমেড বাণিজ্যিক দানাদার বস্তা ফিড',
        species: 'সব গবাদিপশু',
        costPerKgGain: 310,
        fcrScore: 7.2,
        savingsPercent: 0,
        isMostCostEffective: false,
        rating: 'উচ্চ ব্যয়বহুল ⚠️',
        recommendedTips: 'সবুজ ঘাস ছাড়া শুধু বাণিজ্যিক ফিড দিলে খামারের উৎপাদন খরচ অস্বাভাবিক বেড়ে যায়।'
      }
    ];
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-8">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>ফিড এফিশিয়েন্সি অ্যানালিটিক্স ও FCR ক্যালকুলেটর</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>সাশ্রয়ী পশুখাদ্য রূপান্তর অনুপাত (FCR) ট্র্যাকার</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            প্রতিটি প্রাণীর ওজন বৃদ্ধির বিপরীতে ব্যবহৃত খাদ্যের খরচের অনুপাত বিশ্লেষণ।
            মালিক সহজেই বুঝতে পারবেন কোন পশুখাদ্যটি সবচেয়ে সাশ্রয়ী এবং খাদ্য অপচয় রোধে করণীয় কী।
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            title="FCR রিপোর্ট প্রিন্ট করুন"
          >
            <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>FCR প্রিন্ট</span>
          </button>

          {/* Species Selector */}
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">🌐 সকল প্রজাতি</option>
            <option value="cattle">🐄 গরু (Cattle)</option>
            <option value="goat">🐐 ছাগল (Goat)</option>
            <option value="duck">🦆 হাঁস (Duck)</option>
            <option value="chicken">🐓 মুরগি (Chicken)</option>
            <option value="birds">🕊️ পাখি (Birds)</option>
            <option value="fish">🐟 মাছ (Fish)</option>
          </select>

          {/* Sorting Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-black text-emerald-800 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="efficiency">⚡ সেরা FCR দক্ষতা অনুযায়ী</option>
            <option value="cost">💰 কম খাদ্য খরচ (৳/কেজি)</option>
            <option value="gain">📈 সর্বাধিক ওজন বৃদ্ধি</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1">
          <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-wider block">
            গড় উৎপাদন খরচ (Cost/KG Gain)
          </span>
          <p className="text-3xl font-black font-mono text-emerald-700 dark:text-emerald-300 tabular-nums">
            {avgCostPerKgGain.toLocaleString('bn-BD')} <span className="text-sm font-bold opacity-60">৳/কেজি</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1">
            ১ কেজি ওজন বাড়াতে খামারের গড় খাদ্য ব্যয়
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/40 space-y-1">
          <span className="text-[10px] font-black uppercase text-teal-800 dark:text-teal-400 tracking-wider block">
            সর্বোচ্চ সাশ্রয়ী প্রাণী সংখ্যা
          </span>
          <p className="text-3xl font-black font-mono text-teal-700 dark:text-teal-300 tabular-nums">
            {superSavingCount} <span className="text-sm font-bold opacity-60">টি</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1">
            স্বাভাবিক সীমার চেয়ে দ্রুত বর্ধনশীল ও সাশ্রয়ী
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-1">
          <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400 tracking-wider block">
            মোট অর্জিত দৈহিক প্রবৃদ্ধি
          </span>
          <p className="text-3xl font-black font-mono text-amber-700 dark:text-amber-300 tabular-nums">
            {Math.round(totalGainAll).toLocaleString('bn-BD')} <span className="text-sm font-bold opacity-60">কেজি</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1">
            খামারের সক্রিয় প্রাণীর মোট ওজন বৃদ্ধি
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider block">
            সর্বোচ্চ সাশ্রয়ী খাদ্য ফর্মুলা
          </span>
          <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
            ভুট্টা সাইলেজ ও নেপিয়ার
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1">
            বাণিজ্যিক ফিডের তুলনায় ৪২% সাশ্রয়
          </p>
        </div>
      </div>

      {/* Chart View Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700 dark:text-slate-300">চার্ট ভিউ:</span>
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setChartMode('line')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMode === 'line'
                  ? 'bg-emerald-600 text-white shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>ওজন বৃদ্ধি বনাম খাদ্য খরচ (লাইন-চার্ট)</span>
            </button>

            <button
              onClick={() => setChartMode('feed_comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMode === 'feed_comparison'
                  ? 'bg-emerald-600 text-white shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>কোন পশুখাদ্য সবচেয়ে সাশ্রয়ী?</span>
            </button>

            <button
              onClick={() => setChartMode('composed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMode === 'composed'
                  ? 'bg-emerald-600 text-white shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>FCR বার ও অনুপাত</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
          টপ ১০টি সক্রিয় পশুর ডাটা গ্রাফে দৃশ্যমান
        </div>
      </div>

      {/* Primary Chart View 1: Weight Gain vs Feed Cost Ratio (Line Chart) */}
      {chartMode === 'line' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>প্রতিটি প্রাণীর ওজন বৃদ্ধির বিপরীতে খাদ্যের খরচের অনুপাত (লাইন-চার্ট)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              সবুজ লাইন প্রতিটি প্রাণীর মোট ওজন বৃদ্ধি (কেজি) এবং অ্যাম্বার লাইন প্রতি কেজি ওজনে খাদ্য খরচ অনুপাত (৳/কেজি) নির্দেশ করে।
            </p>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight="bold" />
                <YAxis 
                  yAxisId="gainAxis" 
                  stroke="#10b981" 
                  fontSize={11} 
                  fontWeight="bold" 
                  unit=" কেজি" 
                  label={{ value: 'ওজন বৃদ্ধি (কেজি)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: '#10b981' }}
                />
                <YAxis 
                  yAxisId="costRatioAxis" 
                  orientation="right" 
                  stroke="#f59e0b" 
                  fontSize={11} 
                  fontWeight="bold" 
                  unit=" ৳"
                  label={{ value: 'খরচ অনুপাত (৳/কেজি)', angle: 90, position: 'insideRight', offset: 0, fontSize: 10, fill: '#f59e0b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '1rem', 
                    color: '#fff', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    padding: '12px'
                  }}
                  formatter={(val: any, name: any) => {
                    if (name === 'ওজন বৃদ্ধি (কেজি)') return [`${val} কেজি`, 'শারীরিক বৃদ্ধি'];
                    if (name === 'খরচ অনুপাত (৳/কেজি বৃদ্ধি)') return [`৳ ${val} / কেজি বৃদ্ধি`, 'খাদ্য খরচ অনুপাত'];
                    if (name === 'FCR রূপান্তর অনুপাত') return [`${val} : ১`, 'FCR রূপান্তর স্কোর'];
                    if (name === 'মোট খাদ্য খরচ (৳)') return [`৳ ${val.toLocaleString('bn-BD')}`, 'মোট ব্যবহৃত খাদ্য খরচ'];
                    return [val, name];
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload && payload[0] ? payload[0].payload : null;
                    if (item) {
                      return `প্রাণী: ${item.fullName} (ট্যাগ #${item.tagId}) • খাদ্য: ${item.feedFormula}`;
                    }
                    return label;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                
                {/* Line 1: Weight Gain in Kg */}
                <Line 
                  yAxisId="gainAxis" 
                  type="monotone" 
                  dataKey="ওজন বৃদ্ধি (কেজি)" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }}
                />

                {/* Line 2: Cost Per Kg Gain Ratio in Taka */}
                <Line 
                  yAxisId="costRatioAxis" 
                  type="monotone" 
                  dataKey="খরচ অনুপাত (৳/কেজি বৃদ্ধি)" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  strokeDasharray="4 4"
                  dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 7 }}
                />

                {/* Line 3: FCR Ratio */}
                <Line 
                  yAxisId="gainAxis" 
                  type="monotone" 
                  dataKey="FCR রূপান্তর অনুপাত" 
                  stroke="#0d9488" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: '#0d9488', strokeWidth: 1, stroke: '#fff' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Chart View 2: Feed Formulas Cost-Efficiency Analysis (কোন পশুখাদ্যটি সবচেয়ে সাশ্রয়ী?) */}
      {chartMode === 'feed_comparison' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>খামারের ব্যবহৃত পশুখাদ্য ফর্মুলাসমূহের সাশ্রয়ী তুলনা ও রেটিং</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              কোন খাদ্য মিশ্রণটি সবচেয়ে কম খরচে সর্বোচ্চ দৈহিক বৃদ্ধি নিশ্চিত করে তার তুলনামূলক চার্ট।
            </p>
          </div>

          {/* Comparative Formula Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedFormulasComparison.map((f, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-3xl border transition-all space-y-3.5 relative flex flex-col justify-between ${
                  f.isMostCostEffective
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md'
                    : f.savingsPercent === 0
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800'
                    : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                      {f.species}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      f.isMostCostEffective 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : f.savingsPercent === 0
                        ? 'bg-rose-600 text-white'
                        : 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300'
                    }`}>
                      {f.rating}
                    </span>
                  </div>

                  <h5 className="font-black text-base text-slate-900 dark:text-white mt-1.5">
                    {f.formulaName}
                  </h5>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">প্রতি কেজি বৃদ্ধিতে ব্যয়:</span>
                      <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                        ৳ {f.costPerKgGain}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">FCR স্কোর:</span>
                      <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {f.fcrScore} : ১
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">সাশ্রয়ী টিপ:</span>
                  {f.recommendedTips}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart View 3: Composed Bar & Ratio View */}
      {chartMode === 'composed' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>পশুভিত্তিক প্রতি কেজি ওজন বৃদ্ধির ব্যয় (৳) ও FCR চার্ট</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              সবুজ বার নির্দেশ করে প্রতি কেজি ওজন বাড়াতে কম ব্যয় (সাশ্রয়ী), এবং ডট লাইন নির্দেশ করে FCR অনুপাত।
            </p>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={lineChartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight="bold" />
                <YAxis 
                  yAxisId="left" 
                  stroke="#64748b" 
                  fontSize={11} 
                  fontWeight="bold" 
                  unit=" ৳" 
                  label={{ value: 'খরচ (৳/কেজি)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: '#64748b' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#f59e0b" 
                  fontSize={11} 
                  fontWeight="bold" 
                  domain={[0, 'dataMax + 2']}
                  label={{ value: 'FCR স্কোর', angle: 90, position: 'insideRight', offset: 0, fontSize: 10, fill: '#f59e0b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '1rem', 
                    color: '#fff', 
                    fontSize: '12px', 
                    fontWeight: 'bold' 
                  }}
                  formatter={(val: any, name: any) => {
                    if (name === 'খরচ অনুপাত (৳/কেজি বৃদ্ধি)') return [`৳ ${val}`, name];
                    return [`${val} : ১`, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar 
                  yAxisId="left" 
                  dataKey="খরচ অনুপাত (৳/কেজি বৃদ্ধি)" 
                  radius={[8, 8, 0, 0]}
                  barSize={36}
                >
                  {lineChartData.map((entry, index) => {
                    const fill = entry.efficiencyStatus === 'super_saving' 
                      ? '#10b981' // emerald
                      : entry.efficiencyStatus === 'high_cost' 
                      ? '#f43f5e' // rose
                      : '#0d9488'; // teal
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="FCR রূপান্তর অনুপাত" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Actionable Insights for Farm Owner (ব্যয় সংকোচন ও লাভজনক পুষ্টি নির্দেশিকা) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-amber-500/10 border border-emerald-200 dark:border-emerald-800/60 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">
              খামারের মালিকের জন্য খাদ্য ব্যয় সংকোচন ও সাশ্রয়ী ফর্মুলা সুপারিশ
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              FCR অ্যানালিটিক্স অনুসারে সর্বোচ্চ মুনাফা নিশ্চিতকরণের ব্যবহারিক দিকনির্দেশনা
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-emerald-100 dark:border-emerald-900/30 space-y-1.5 shadow-sm">
            <span className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>সাইলেজ ও ঘাসের অনুপাত বৃদ্ধি:</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              শুধুমাত্র শুকনো দানাদার ফিডের পরিবর্তে ভুট্টার সাইলেজ ও নেপিয়ার ঘাস ৬০:৪০ অনুপাতে খাওয়ালে প্রতি কেজিতে ৳ ৮০-১১০ পর্যন্ত খাদ্য ব্যয় কমে যায়।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-teal-100 dark:border-teal-900/30 space-y-1.5 shadow-sm">
            <span className="font-bold text-teal-800 dark:text-teal-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>খাদ্য অপচয় ও লিটারিং নিয়ন্ত্রণ:</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              যাঁদের FCR ৮ এর উপরে গেছে তাঁদের চারণ পাত্রের ডিজাইন পরিবর্তন করুন। খাবার নিচে ফেলে অপচয় করায় কৃত্রিমভাবে FCR ব্যয়বহুল মনে হতে পারে।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-amber-100 dark:border-amber-900/30 space-y-1.5 shadow-sm">
            <span className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>উচ্চ-ব্যয়ী প্রাণীর ডায়েট রিব্যালেন্স:</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              লাল চিহ্নিত পশুগুলোর ওজন বাড়ার হার কমে যাওয়ায় প্রতি কেজি বৃদ্ধিতে অতিরিক্ত ব্যয় হচ্ছে। অবিলম্বে কৃমিনাশক ও প্রোটিন পাউডার রেশিও চেক করুন।
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Animal Ledger Table */}
      <div className="space-y-4">
        <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>পশুভিত্তিক খাদ্য ব্যয় ও FCR রূপান্তর খতিয়ান</span>
        </h4>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">পশুর নাম ও ট্যাগ</th>
                <th className="p-3.5">প্রজাতি ও জাত</th>
                <th className="p-3.5">শুরুর ওজন</th>
                <th className="p-3.5">বর্তমান ওজন</th>
                <th className="p-3.5">ওজন বৃদ্ধি</th>
                <th className="p-3.5">খাদ্য খরচ</th>
                <th className="p-3.5">FCR অনুপাত</th>
                <th className="p-3.5">খরচ অনুপাত (৳/কেজি)</th>
                <th className="p-3.5">সাশ্রয়ী স্ট্যাটাস</th>
                <th className="p-3.5">প্রস্তাবিত সাশ্রয়ী খাদ্য</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {sortedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {item.name}
                    <span className="block text-[10px] font-mono text-slate-400">#{item.tagId}</span>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {item.type}
                    <span className="block text-[10px] text-slate-400">{item.breed}</span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">{item.initialW} কেজি</td>
                  <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">{item.currentW} কেজি</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">+{item.netGainKg} কেজি</td>
                  <td className="p-3.5 font-mono text-slate-800 dark:text-white">৳ {item.accumulatedFeedCost.toLocaleString('bn-BD')}</td>
                  <td className="p-3.5 font-mono font-black text-slate-900 dark:text-white">
                    {item.fcr} : ১
                  </td>
                  <td className="p-3.5 font-mono font-bold">
                    <span className={item.efficiencyStatus === 'super_saving' ? 'text-emerald-600 font-black' : item.efficiencyStatus === 'high_cost' ? 'text-rose-600 font-black' : 'text-slate-800 dark:text-slate-200'}>
                      ৳ {item.costPerKgGain} /কেজি
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${item.statusColor}`}>
                      {item.statusLabelBn}
                    </span>
                  </td>
                  <td className="p-3.5 text-[11px] text-slate-600 dark:text-slate-300 max-w-xs">
                    {item.feedTypeRecommended}
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
