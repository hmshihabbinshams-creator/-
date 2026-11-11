import React, { useState } from 'react';
import { farmStore } from '../../services/farmStore';
import { FeedInventoryItem } from '../../types';
import { 
  Box, Utensils, AlertTriangle, Scale, 
  TrendingDown, Plus, Sparkles, CheckCircle2 
} from 'lucide-react';
import { FeedInventoryTrackerModule } from '../FeedInventoryTrackerModule';
import { DailyFeedLogger } from '../DailyFeedLogger';
import { AiFeedAdvisorModule } from '../AiFeedAdvisorModule';

interface FeedSectorViewProps {
  onOpenEasyEntry?: (cat?: any) => void;
}

export const FeedSectorView: React.FC<FeedSectorViewProps> = ({ onOpenEasyEntry }) => {
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'daily_log' | 'advisor'>('inventory');
  const [feedItems, setFeedItems] = useState<FeedInventoryItem[]>(() => farmStore.getFeedInventory());

  React.useEffect(() => {
    return farmStore.subscribe(() => {
      setFeedItems(farmStore.getFeedInventory());
    });
  }, []);

  const totalStockKg = feedItems.reduce((acc, f) => acc + (f.currentStockKg || 0), 0);
  const lowStockCount = feedItems.filter(f => f.currentStockKg <= f.minThresholdKg).length;
  const totalStockValue = feedItems.reduce((acc, f) => acc + (f.currentStockKg * (f.unitCostTaka || 0)), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. খাদ্য ও পুষ্টি খাতের ডেডিকেটেড ড্যাশবোর্ড (Feed Sector Dashboard at Top) */}
      <div className="bg-gradient-to-br from-lime-900 via-emerald-950 to-slate-900 rounded-[2.5rem] text-white p-6 sm:p-8 border border-lime-700/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lime-500/20 border border-lime-400/30 flex items-center justify-center text-3xl shadow-inner">
                🌾
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-lime-400">খাতভিত্তিক ড্যাশবোর্ড</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">খাদ্য ও পুষ্টি খাত</h2>
                <p className="text-xs text-slate-300 mt-0.5">ভুট্টা সাইলেজ, নেপিয়ার ঘাস, দানাদার ফিড মজুদ ও খাদ্য রূপান্তর হার (FCR)</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onOpenEasyEntry?.('feed')}
                className="px-4 py-2.5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Utensils className="w-4 h-4" />
                <span>দৈনিক খাদ্য বিতরণ এন্ট্রি</span>
              </button>
            </div>
          </div>

          {/* 4 Core Feed Sector Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-lime-300 uppercase tracking-widest">মোট খাদ্য মজুদ</p>
              <p className="text-3xl font-black font-mono text-white">{totalStockKg.toLocaleString('bn-BD')} <span className="text-xs font-normal">কেজি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">ভুট্টা সাইলেজ, ভুষি ও দানাদার</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">কম মজুদের সতর্কতা</p>
              <p className="text-3xl font-black font-mono text-amber-300">{lowStockCount} <span className="text-xs font-normal">টি ফিড</span></p>
              <p className="text-[10px] text-slate-400 font-medium">{lowStockCount > 0 ? 'নতুন পারচেজ অর্ডার আবশ্যক' : 'মজুদ পর্যাপ্ত'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">খাদ্যের মোট সম্পদমূল্য</p>
              <p className="text-3xl font-black font-mono text-emerald-300">{(totalStockValue / 1000).toFixed(0)} <span className="text-xs font-normal">হাজার ৳</span></p>
              <p className="text-[10px] text-slate-400 font-medium">বর্তমান বাজার ক্র‍য়মূল্যের ভিত্তিতে</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">গড় খাদ্য রূপান্তর হার (FCR)</p>
              <p className="text-3xl font-black font-mono text-white">১.৩৮</p>
              <p className="text-[10px] text-slate-400 font-medium">উচ্চ সাশ্রয়ী খাদ্য দক্ষতা</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. খাদ্য খাতের অপশন ও মডিউলসমূহ (Below Dashboard) */}
      <div className="space-y-6">
        
        {/* Navigation Tabs for this sector */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {[
            { id: 'inventory', label: 'খাদ্য মজুদ ও স্টক ট্র্যাকার', icon: Box },
            { id: 'daily_log', label: 'দৈনিক খাদ্য বিতরণ এন্ট্রি', icon: Utensils },
            { id: 'advisor', label: 'এআই খাদ্য ও পুষ্টি পরামর্শক', icon: Sparkles },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-lime-700 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Selected Sector Submodule */}
        {activeSubTab === 'inventory' && <FeedInventoryTrackerModule />}
        {activeSubTab === 'daily_log' && <DailyFeedLogger />}
        {activeSubTab === 'advisor' && <AiFeedAdvisorModule />}

      </div>

    </div>
  );
};
