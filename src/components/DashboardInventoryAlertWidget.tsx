import React, { useState, useEffect } from 'react';
import { 
  Box, AlertTriangle, CheckCircle2, Plus, ArrowUpRight, 
  RefreshCw, ShieldAlert, Pill, ShoppingCart, ChevronRight 
} from 'lucide-react';
import { farmStore } from '../services/farmStore';
import { FeedInventoryItem, AdminTab } from '../types';

interface DashboardInventoryAlertWidgetProps {
  onNavigateToInventory: () => void;
}

export const DashboardInventoryAlertWidget: React.FC<DashboardInventoryAlertWidgetProps> = ({
  onNavigateToInventory
}) => {
  const [items, setItems] = useState<FeedInventoryItem[]>(() => farmStore.getFeedInventory());
  const [showRefillModal, setShowRefillModal] = useState<FeedInventoryItem | null>(null);
  const [refillQty, setRefillQty] = useState(25);
  const [refillCost, setRefillCost] = useState(2000);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const lowStockItems = items.filter(i => i.currentStockKg <= i.minThresholdKg);

  const handleRefill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRefillModal) return;

    farmStore.updateFeedInventory(showRefillModal.id, refillQty, refillCost);
    setItems(farmStore.getFeedInventory());
    triggerToast(`✓ '${showRefillModal.name}' সফলভাবে ${refillQty} ${showRefillModal.unit || 'কেজি'} রিফিল করা হয়েছে!`);
    setShowRefillModal(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-black px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-600 font-black text-xl shadow-inner">
            📦
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">অটোমেটেড ইনভেন্টরি মনিটর</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">পশুখাদ্য ও ঔষধ স্টক অ্যালার্ট</h3>
          </div>
        </div>

        <button
          onClick={onNavigateToInventory}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>সম্পূর্ণ ইনভেন্টরি দেখুন</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Alert Banner if low stock exists */}
      {lowStockItems.length > 0 ? (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-rose-900 dark:text-rose-200">
                সতর্কতা: {lowStockItems.length}টি খাদ্য বা ঔষধের মজুদ নির্ধারিত সীমার নিচে নেমে গেছে!
              </h4>
              <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                অবিলম্বে রিফিল বা নতুন অর্ডার নিশ্চিত করুন যাতে খামারের কার্যক্রমে বিঘ্ন না ঘটে।
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>সকল পশুখাদ্য ও ঔষধের মজুদ নিরাপদ সীমার (Threshold) উপরে রয়েছে।</span>
        </div>
      )}

      {/* Grid of Inventory Statuses on Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(item => {
          const isLow = item.currentStockKg <= item.minThresholdKg;
          const isMedicine = item.category?.includes('ঔষধ') || item.category?.includes('Medicine');

          return (
            <div 
              key={item.id} 
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                isLow 
                  ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800' 
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{isMedicine ? '💉' : '🌾'}</span>
                  <div>
                    <h5 className="font-black text-xs text-slate-900 dark:text-white line-clamp-1">{item.name}</h5>
                    <span className="text-[10px] text-slate-500 font-bold">{item.category || 'খাদ্য'}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                  isLow ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {isLow ? 'স্টক কম ⚠️' : 'নিরাপদ'}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-[10px] font-bold text-slate-400">বর্তমান মজুদ</span>
                  <p className="text-base font-black font-mono text-slate-900 dark:text-white">
                    {item.currentStockKg} <span className="text-xs font-normal">{item.unit || 'কেজি'}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400">লিমিট (Threshold)</span>
                  <p className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400">
                    {item.minThresholdKg} {item.unit || 'কেজি'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowRefillModal(item);
                  setRefillQty(item.minThresholdKg * 2);
                  setRefillCost(item.minThresholdKg * 2 * (item.unitPrice || 50));
                }}
                className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  isLow 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md' 
                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>রিফিল করুন</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Refill Modal */}
      {showRefillModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRefill} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                মজুদ রিফিল করুন: {showRefillModal.name}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowRefillModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  পরিমাণ ({showRefillModal.unit || 'কেজি'}):
                </label>
                <input
                  type="number"
                  value={refillQty}
                  onChange={e => setRefillQty(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  মোট ক্রয়মূল্য (টাকা):
                </label>
                <input
                  type="number"
                  value={refillCost}
                  onChange={e => setRefillCost(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowRefillModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg"
              >
                রিফিল নিশ্চিত করুন
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
