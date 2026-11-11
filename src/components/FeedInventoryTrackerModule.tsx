import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, AlertTriangle, TrendingDown, ArrowUpRight, Plus, 
  RefreshCw, Calendar, ShoppingCart, CheckCircle2, ShieldAlert, 
  Search, Filter, Printer, Clock, Sparkles, Scale, Info
} from 'lucide-react';
import { farmStore } from '../services/farmStore';
import { FeedInventoryItem } from '../types';

export interface FeedForecastItem {
  id: string;
  name: string;
  category: string;
  currentStockKg: number;
  dailyConsumptionKg: number;
  reorderLevelKg: number;
  unitPriceTaka: number;
  unit: string;
  supplier: string;
}

export const FeedInventoryTrackerModule: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedInventoryItem[]>(() => {
    try {
      return farmStore.getFeedInventory();
    } catch (e) {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showRefillModal, setShowRefillModal] = useState<FeedInventoryItem | null>(null);
  const [refillQuantity, setRefillQuantity] = useState<number>(50);
  const [refillCost, setRefillCost] = useState<number>(3500);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync state
  const refreshInventory = () => {
    setFeedItems(farmStore.getFeedInventory());
  };

  // Calculate daily farm feed consumption based on livestock count
  const livestock = useMemo(() => farmStore.getLivestock(), []);
  
  // Daily total feed requirements
  const dailyTotalReqKg = useMemo(() => {
    let total = 0;
    livestock.forEach(item => {
      if (item.type.includes('গরু')) total += 21.5 * item.quantity;
      else if (item.type.includes('ছাগল')) total += 3.9 * item.quantity;
      else if (item.type.includes('হাঁস')) total += 0.45 * item.quantity;
      else if (item.type.includes('মুরগি')) total += 0.18 * item.quantity;
      else total += 2.5 * item.quantity;
    });
    return Math.round(total);
  }, [livestock]);

  // Feed items with calculated days left
  const enrichedItems = useMemo(() => {
    return feedItems.map(item => {
      // Estimated daily usage
      let dailyUse = 15;
      const name = item.name.toLowerCase();
      if (name.includes('ঘাস') || name.includes('নেপিয়ার')) dailyUse = Math.round(dailyTotalReqKg * 0.55);
      else if (name.includes('ভুসি') || name.includes('দানাদার')) dailyUse = Math.round(dailyTotalReqKg * 0.25);
      else if (name.includes('খড়') || name.includes('সাইলেজ')) dailyUse = Math.round(dailyTotalReqKg * 0.15);
      else dailyUse = Math.max(3, Math.round(dailyTotalReqKg * 0.05));

      const daysLeft = dailyUse > 0 ? Math.round(item.currentStock / dailyUse) : 99;
      const isLow = item.currentStock <= item.reorderLevel;

      return {
        ...item,
        dailyConsumptionKg: dailyUse,
        daysLeft,
        isLow
      };
    });
  }, [feedItems, dailyTotalReqKg]);

  const lowStockCount = enrichedItems.filter(i => i.isLow).length;
  const totalStockKg = enrichedItems.reduce((acc, i) => acc + i.currentStock, 0);
  const totalValuationTaka = enrichedItems.reduce((acc, i) => acc + (i.currentStock * i.unitPrice), 0);

  // Filtered
  const filteredItems = enrichedItems.filter(item => {
    if (filterCategory === 'low' && !item.isLow) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    }
    return true;
  });

  const handleRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRefillModal) return;

    farmStore.updateFeedInventory(showRefillModal.id, refillQuantity, refillCost);
    refreshInventory();
    triggerToast(`✓ ${showRefillModal.name} সফলভাবে ${refillQuantity} কেজি স্টক রিফিল করা হয়েছে!`);
    setShowRefillModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast confirmation */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-extrabold text-[11px] border border-orange-200 dark:border-orange-800 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-orange-600" />
                <span>পশুখাদ্য ও পুষ্টি ইনভেন্টরি ট্র্যাকার</span>
              </span>
              {lowStockCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-md bg-rose-500 text-white font-black text-[10px] animate-pulse">
                  ⚠️ {lowStockCount} টি খাদ্যের স্টক রি-অর্ডার লেভেলের নিচে!
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>পশুখাদ্য মজুদ, রি-অর্ডার লেভেল ও চাহিদার পূর্বাভাস</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              খামারের সবুজ ঘাস, দানাদার ভুষি, সাইলেজ ও ভিটামিন প্রিমিক্সের রিয়েল-টাইম স্টক লেভেল ও আগামী দিনের ব্যবহারের পূর্বাভাস।
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>স্টক রিপোর্ট প্রিন্ট</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">মোট পশুখাদ্য মজুদ</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalStockKg.toLocaleString('bn-BD')} <span className="text-sm">কেজি</span></p>
            <span className="text-[10px] text-slate-500 font-medium">মোট {feedItems.length} টি খাদ্যের আইটেম</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">দৈনিক মোট চাহিদা</span>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">~{dailyTotalReqKg.toLocaleString('bn-BD')} <span className="text-sm">কেজি/দিন</span></p>
            <span className="text-[10px] text-emerald-600 font-medium">সমগ্র পশুপালের আনুমানিক খাদ্য</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">গড় মজুদ স্থায়ীত্ব</span>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
              ~{Math.round(totalStockKg / Math.max(1, dailyTotalReqKg))} <span className="text-sm">দিন</span>
            </p>
            <span className="text-[10px] text-amber-600 font-medium">বর্তমান মজুদ চালুর পূর্বাভাস</span>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 space-y-1">
            <span className="text-[10px] font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider block">খাদ্য ইনভেন্টরি মূল্যায়ন</span>
            <p className="text-2xl font-black text-orange-700 dark:text-orange-400 font-mono">৳ {totalValuationTaka.toLocaleString('bn-BD')}</p>
            <span className="text-[10px] text-orange-600 font-medium">মজুদকৃত খাদ্যের আনুমানিক মূল্য</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="খাদ্যের নাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              সকল মজুদ ({feedItems.length})
            </button>
            <button
              onClick={() => setFilterCategory('low')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1 ${
                filterCategory === 'low'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>স্টক কম ({lowStockCount})</span>
            </button>
          </div>
        </div>

        {/* FEED INVENTORY TABLE */}
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">পশুখাদ্যের বিবরণ</th>
                <th className="p-4">বর্তমান মজুদ</th>
                <th className="p-4">রি-অর্ডার লেভেল</th>
                <th className="p-4">দৈনিক ব্যবহার</th>
                <th className="p-4">মজুদ থাকবে (পূর্বাভাস)</th>
                <th className="p-4">একক দর</th>
                <th className="p-4 text-right">স্টক আপডেট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredItems.map(item => {
                const stockPercent = Math.min(100, Math.round((item.currentStock / (item.reorderLevel * 2.5)) * 100));

                return (
                  <tr key={item.id} className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                    item.isLow ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                  }`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          item.isLow ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          🌾
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">{item.name}</p>
                          <span className="text-[10px] text-slate-400 font-bold">{item.category} · সরবরাহকারী: {item.supplier}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <span className={`font-mono font-black text-sm ${item.isLow ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                          {item.currentStock} {item.unit}
                        </span>
                        <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.isLow ? 'bg-rose-600' : 'bg-emerald-500'}`} style={{ width: `${stockPercent}%` }} />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                        {item.reorderLevel} {item.unit}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-mono font-bold text-emerald-600">
                        ~{item.dailyConsumptionKg} {item.unit}/দিন
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                        item.daysLeft <= 3 
                          ? 'bg-rose-100 text-rose-700 animate-pulse' 
                          : item.daysLeft <= 7 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>~{item.daysLeft} দিন চলবে</span>
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        ৳ {item.unitPrice} / {item.unit}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setShowRefillModal(item);
                          setRefillQuantity(50);
                          setRefillCost(item.unitPrice * 50);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>স্টক রিফিল</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REFILL MODAL */}
      {showRefillModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl relative">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              পশুখাদ্য রিফিল এন্ট্রি: {showRefillModal.name}
            </h3>

            <form onSubmit={handleRefillSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">নতুন যোগকৃত পরিমাণ (কেজি/একক):</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={refillQuantity}
                  onChange={(e) => {
                    const q = Number(e.target.value);
                    setRefillQuantity(q);
                    setRefillCost(q * showRefillModal.unitPrice);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">মোট ক্রয় খরচ (টাকা):</label>
                <input
                  type="number"
                  required
                  value={refillCost}
                  onChange={(e) => setRefillCost(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRefillModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black cursor-pointer"
                >
                  স্টক হালনাগাদ করুন ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
