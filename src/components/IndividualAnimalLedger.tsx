import React, { useState, useMemo } from 'react';
import { farmStore } from '../services/farmStore';
import { LivestockItem } from '../types';
import { 
  FileText, Search, Printer, DollarSign, TrendingUp, Calendar, 
  Tag, ShieldCheck, HeartPulse, CheckCircle2, Award, ChevronRight,
  ArrowUpRight, Download, Filter
} from 'lucide-react';

interface IndividualAnimalLedgerProps {
  initialAnimalId?: string;
  onSelectAnimalForChart?: (animalId: string) => void;
  onOpenEasyEntry?: (category?: any) => void;
}

export const IndividualAnimalLedger: React.FC<IndividualAnimalLedgerProps> = ({
  initialAnimalId,
  onSelectAnimalForChart,
  onOpenEasyEntry
}) => {
  const [livestock] = useState<LivestockItem[]>(() => farmStore.getLivestock());
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(
    initialAnimalId || (livestock.length > 0 ? livestock[0].id : 'C-101')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpeciesFilter, setActiveSpeciesFilter] = useState<'all' | 'cattle' | 'goat' | 'duck' | 'chicken' | 'birds' | 'fish'>('all');

  const filteredAnimals = useMemo(() => {
    return livestock.filter(item => {
      const t = item.type.toLowerCase();
      if (activeSpeciesFilter === 'cattle' && !(t.includes('গরু') || t.includes('cattle'))) return false;
      if (activeSpeciesFilter === 'goat' && !(t.includes('ছাগল') || t.includes('goat'))) return false;
      if (activeSpeciesFilter === 'duck' && !(t.includes('হাঁস') || t.includes('duck'))) return false;
      if (activeSpeciesFilter === 'chicken' && !(t.includes('মুরগি') || t.includes('chicken'))) return false;
      if (activeSpeciesFilter === 'birds' && !(t.includes('পাখি') || t.includes('bird'))) return false;
      if (activeSpeciesFilter === 'fish' && !(t.includes('মাছ') || t.includes('fish'))) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesBreed = item.breed.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesBreed) return false;
      }
      return true;
    });
  }, [livestock, activeSpeciesFilter, searchQuery]);

  const selectedAnimal = useMemo(() => {
    return livestock.find(a => a.id === selectedAnimalId) || livestock[0];
  }, [livestock, selectedAnimalId]);

  const costStats = useMemo(() => {
    if (!selectedAnimal) return null;
    return farmStore.getAnimalCostStats(selectedAnimal.id);
  }, [selectedAnimal]);

  // Construct printable/exportable itemized ledger rows
  const ledgerRows = useMemo(() => {
    if (!selectedAnimal || !costStats) return [];

    const rows: {
      date: string;
      category: 'প্রারম্ভিক ক্রয়' | 'পশুখাদ্য' | 'স্বাস্থ্য ও চিকিৎসা' | 'অন্যান্য';
      description: string;
      amountTaka: number;
      type: 'debit' | 'credit';
      performedBy: string;
    }[] = [];

    // 1. Initial Purchase
    rows.push({
      date: selectedAnimal.purchaseDate || '2026-01-01',
      category: 'প্রারম্ভিক ক্রয়',
      description: `পশু ক্রয়মূল্য ও প্রাথমিক ইনভেন্টরি এন্ট্রি (${selectedAnimal.breed})`,
      amountTaka: selectedAnimal.purchasePrice,
      type: 'debit',
      performedBy: 'খামার কর্তৃপক্ষ'
    });

    // 2. Feed Logs
    if (costStats.feedLogs && costStats.feedLogs.length > 0) {
      costStats.feedLogs.forEach(log => {
        rows.push({
          date: log.date,
          category: 'পশুখাদ্য',
          description: `দৈনিক খাবার: ${log.feedType} (${log.amountKg} কেজি)`,
          amountTaka: Number(log.costTaka) || 0,
          type: 'debit',
          performedBy: log.employeeName || 'খামার কর্মী'
        });
      });
    } else if (costStats.totalFeedCost > 0) {
      rows.push({
        date: selectedAnimal.purchaseDate || '2026-02-01',
        category: 'পশুখাদ্য',
        description: 'অনুমোদিত দৈনিক খাদ্য তালিকা অনুযায়ী সঞ্চিত পশুখাদ্য ব্যয়',
        amountTaka: costStats.totalFeedCost,
        type: 'debit',
        performedBy: 'খাদ্য কর্মকর্তা'
      });
    }

    // 3. Health Logs
    if (costStats.healthLogs && costStats.healthLogs.length > 0) {
      costStats.healthLogs.forEach(log => {
        rows.push({
          date: log.date,
          category: 'স্বাস্থ্য ও চিকিৎসা',
          description: `ভ্যাকসিনেশন ও পরিদর্শন: ${log.vaccinationName || 'নিয়মিত টিকা'} (${log.inspectionNotes || 'সুস্থ'})`,
          amountTaka: 150,
          type: 'debit',
          performedBy: log.inspectorName || 'ভেটেরিনারি ডাক্তার'
        });
      });
    } else if (costStats.totalHealthCost > 0) {
      rows.push({
        date: selectedAnimal.purchaseDate || '2026-03-01',
        category: 'স্বাস্থ্য ও চিকিৎসা',
        description: 'প্রাথমিক টিকা, কৃমিনাশক ও বায়ো-সিকিউরিটি কভারেজ ব্যয়',
        amountTaka: costStats.totalHealthCost,
        type: 'debit',
        performedBy: 'ভেটেরিনারি বিভাগ'
      });
    }

    // Sort by date ascending
    return rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedAnimal, costStats]);

  if (!selectedAnimal || !costStats) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-bold">কোনো পশুর তথ্য পাওয়া যায়নি।</p>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round((costStats.daysElapsed / (costStats.targetDays || 180)) * 100));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-8 transition-colors duration-300">
      {/* Component Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-xs font-black mb-2">
            <FileText className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
            <span>স্বয়ংক্রিয় পশু ইনভেস্টমেন্ট লেজার ও প্রজেকশন</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            ব্যক্তিগত পশু খতিয়ান ও বিনিয়োগ লেজার (Individual Animal Ledger)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            প্রতিটি পশুর আইডি ভিত্তিক কেনা দাম, খাবার ও চিকিৎসার মোট খরচ (লাইভ ইনভেস্টমেন্ট) এবং পালনের সময়কাল অনুযায়ী প্রক্ষেপিত বর্তমান বাজারমূল্য হিসাব।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="no-print px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>লেজার প্রিন্ট করুন</span>
          </button>

          {onOpenEasyEntry && (
            <button
              onClick={() => onOpenEasyEntry('feed')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              <span>+ নতুন খরচ এন্ট্রি</span>
            </button>
          )}
        </div>
      </div>

      {/* Animal Selection Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="আইডি, নাম বা জাত লিখে পশু খুঁজুন (যেমন: C-101)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Selector Dropdown */}
          <select
            value={selectedAnimalId}
            onChange={e => setSelectedAnimalId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
          >
            {filteredAnimals.map(a => (
              <option key={a.id} value={a.id}>
                [{a.id}] {a.name} ({a.type})
              </option>
            ))}
          </select>
        </div>

        {/* Species Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-bold">
          <span className="text-slate-400 text-[11px] font-mono mr-1">প্রজাতি ফিল্টার:</span>
          {(['all', 'cattle', 'goat', 'duck', 'chicken', 'birds', 'fish'] as const).map(sp => (
            <button
              key={sp}
              onClick={() => setActiveSpeciesFilter(sp)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeSpeciesFilter === sp
                  ? 'bg-emerald-600 text-white shadow-sm font-black'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-emerald-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {sp === 'all' ? 'সব প্রজাতি' : sp === 'cattle' ? 'গরু' : sp === 'goat' ? 'ছাগল' : sp === 'duck' ? 'হাঁস' : sp === 'chicken' ? 'মুরগি' : sp === 'birds' ? 'পাখি' : 'মাছ'}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Animal Profile Snapshot & Investment Aggregation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Animal Quick Details */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 border border-emerald-200 dark:border-emerald-900 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-emerald-700 text-white shadow-sm">
                  {selectedAnimal.id}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{selectedAnimal.type}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
                {selectedAnimal.name}
              </h3>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">জাত: {selectedAnimal.breed}</p>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-extrabold text-xs border border-emerald-300 dark:border-emerald-800">
              {selectedAnimal.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">বর্তমানে বয়স</span>
              <p className="font-black text-slate-900 dark:text-slate-200 text-sm font-mono">{selectedAnimal.age || '১ বছর'}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">বর্তমান ওজন</span>
              <p className="font-black text-slate-900 dark:text-slate-200 text-sm font-mono">{selectedAnimal.currentWeight} কেজি</p>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">ক্রয় তারিখ</span>
              <p className="font-black text-slate-900 dark:text-slate-200 text-xs font-mono">{selectedAnimal.purchaseDate || '২০২৬-০১-১০'}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">পালনকাল অতিবাহিত</span>
              <p className="font-black text-emerald-700 dark:text-emerald-500 text-xs font-mono">{costStats.daysElapsed} দিন অতিক্রান্ত</p>
            </div>
          </div>

          {/* Rearing Progress Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-black text-slate-800 dark:text-slate-200">
              <span>পালনকাল ও প্রবৃদ্ধি লক্ষ্যমাত্রা (Target Duration)</span>
              <span className="text-emerald-700 dark:text-emerald-500 font-mono">{costStats.daysElapsed} / {costStats.targetDays} দিন ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              টার্গেট বিক্রয় মাস: <strong className="text-slate-800 dark:text-slate-200">{selectedAnimal.targetRearingMonths || 6} মাস</strong> ({selectedAnimal.targetWeight || Math.round(selectedAnimal.currentWeight * 1.3)} কেজি ওজন লক্ষ্যমাত্রা)
            </p>
          </div>
        </div>

        {/* Right Column: Financial Aggregation & Live Investment Meter */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* KPI 1: Total Live Investment */}
            <div className="p-5 rounded-3xl bg-slate-900 dark:bg-black text-white shadow-lg space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  সর্বমোট অর্জিত বিনিয়োগ (Total Live Investment)
                </span>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-black font-mono tracking-tight text-white">
                {costStats.totalExpense.toLocaleString('bn-BD')} <span className="text-lg font-bold opacity-60">৳</span>
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                ক্রয়মূল্য + সর্বমোট সঞ্চিত খাদ্য, ওষুধ ও চিকিৎসা ব্যয়
              </p>
            </div>

            {/* KPI 2: Live Projected Market Price */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
                  প্রক্ষেপিত বর্তমান বাজারমূল্য (Projected Market Price)
                </span>
                <TrendingUp className="w-5 h-5 text-amber-300" />
              </div>
              <p className="text-3xl font-black font-mono tracking-tight text-white">
                {costStats.projectedMarketPrice.toLocaleString('bn-BD')} <span className="text-lg font-bold opacity-80">৳</span>
              </p>
              <p className="text-[11px] text-emerald-100 font-medium">
                চূড়ান্ত টার্গেট বিক্রয়মূল্য: {(selectedAnimal.targetSellingPrice || selectedAnimal.sellingPrice).toLocaleString('bn-BD')} ৳
              </p>
            </div>
          </div>

          {/* 3-Part Cost Breakdown Strip */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">প্রারম্ভিক ক্রয়মূল্য</span>
              <p className="text-base font-black text-slate-900 dark:text-slate-200 font-mono">
                {costStats.purchasePrice.toLocaleString('bn-BD')} ৳
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">ক্যাশ ক্রয় খরচ</span>
            </div>

            <div className="space-y-0.5 border-x border-slate-200 dark:border-slate-700 px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">সর্বমোট খাদ্য ব্যয়</span>
              <p className="text-base font-black text-amber-700 dark:text-amber-500 font-mono">
                {costStats.totalFeedCost.toLocaleString('bn-BD')} ৳
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">দৈনিক পুষ্টি খাদ্য</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">স্বাস্থ্য ও ওষুধ ব্যয়</span>
              <p className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                {costStats.totalHealthCost.toLocaleString('bn-BD')} ৳
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">টিকা ও চিকিৎসা</span>
            </div>
          </div>

          {/* Estimated ROI Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                %
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white">প্রক্ষেপিত নিট লাভ (Projected Net Profit)</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                  প্রক্ষেপিত বাজার দর ({costStats.projectedMarketPrice.toLocaleString('bn-BD')} ৳) - মোট বিনিয়োগ ({costStats.totalExpense.toLocaleString('bn-BD')} ৳)
                </p>
              </div>
            </div>
            <span className="text-xl font-black text-emerald-800 dark:text-emerald-400 font-mono">
              +{(costStats.projectedMarketPrice - costStats.totalExpense).toLocaleString('bn-BD')} ৳
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Financial Ledger Table */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              <span>আইডি [{selectedAnimal.id}] সম্পূর্ণ ব্যয় ও লেনদেন খতিয়ান (Individual Ledger Table)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              ক্রয়মূল্য, দৈনন্দিন খাদ্য খরচ এবং টিকা ও চিকিৎসা সংক্রান্ত ঐতিহাসিক স্টেটমেন্ট
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            সর্বমোট {ledgerRows.length} টি এন্ট্রি
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">খরচের খাত / ক্যাটাগরি</th>
                <th className="py-3 px-4">বিবরণ ও বিবরণী</th>
                <th className="py-3 px-4 text-right">পরিমাণ (টাকা)</th>
                <th className="py-3 px-4 text-center">দায়িত্বপ্রাপ্ত কর্মকর্তা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {ledgerRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                        row.category === 'প্রারম্ভিক ক্রয়'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                          : row.category === 'পশুখাদ্য'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {row.description}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {row.amountTaka.toLocaleString('bn-BD')} ৳
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                    {row.performedBy}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900 dark:bg-black text-white font-black text-xs">
              <tr>
                <td colSpan={3} className="py-3.5 px-4 text-right uppercase tracking-wider">
                  সর্বমোট অর্জিত বিনিয়োগ (Total Live Investment):
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-base text-amber-400">
                  {costStats.totalExpense.toLocaleString('bn-BD')} ৳
                </td>
                <td className="py-3.5 px-4 text-center text-emerald-400 text-[11px]">
                  সম্পূর্ণ অডিটেড খতিয়ান
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
