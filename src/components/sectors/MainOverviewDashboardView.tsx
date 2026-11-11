import React, { useState } from 'react';
import { farmStore } from '../../services/farmStore';
import { LivestockItem } from '../../types';
import { 
  LayoutDashboard, TrendingUp, Sparkles, ShieldCheck, 
  Droplets, Egg, Wallet, Award, Activity, ChevronRight,
  ArrowRight, Users, Box, Stethoscope, AlertTriangle
} from 'lucide-react';
import { InteractiveLiveDashboard } from '../InteractiveLiveDashboard';
import { LocalWeatherWidget } from '../LocalWeatherWidget';
import { RealtimeFarmStatusWidget } from '../RealtimeFarmStatusWidget';
import { DashboardInventoryAlertWidget } from '../DashboardInventoryAlertWidget';
import { AdminTab } from '../AdminPanel';

interface MainOverviewDashboardViewProps {
  onSelectTab: (tab: AdminTab) => void;
  onOpenEasyEntry?: (cat?: any) => void;
}

export const MainOverviewDashboardView: React.FC<MainOverviewDashboardViewProps> = ({
  onSelectTab,
  onOpenEasyEntry
}) => {
  const [financial] = useState(() => farmStore.getFinancialOverview());
  const [livestock] = useState<LivestockItem[]>(() => farmStore.getLivestock());

  const cattleCount = livestock.filter(l => l.type.includes('গরু') || l.type.includes('গাভী') || l.type.includes('বলদ')).length;
  const goatCount = livestock.filter(l => l.type.includes('ছাগল') || l.type.includes('খাসি')).length;
  const poultryCount = livestock.filter(l => l.type.includes('হাঁস') || l.type.includes('মুরগি')).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. সার্বিক খামার এক্সিকিউটিভ ড্যাশবোর্ড হেডার */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-[2.5rem] text-white p-6 sm:p-8 border border-emerald-700/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-3xl shadow-inner">
                🌾
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">খামার অপারেশনাল সেন্টার</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">সার্বিক খামার একজিকিউটিভ ড্যাশবোর্ড</h2>
                <p className="text-xs text-slate-300 mt-0.5">৮টি খাতের সম্মিলিত উৎপাদন, স্বাস্থ্য, আর্থিক অবস্থান ও রিয়েল-টাইম মনিটর</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenEasyEntry?.()}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <span>+ কুইক ডাটা এন্ট্রি</span>
              </button>
            </div>
          </div>

          {/* Core Multi-Sector KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                <Droplets className="w-3.5 h-3.5" />
                <span>আজকের দুধ সংগ্রহ</span>
              </div>
              <p className="text-3xl font-black font-mono text-white">১৩০.৪ <span className="text-xs font-normal">L</span></p>
              <p className="text-[10px] text-slate-400 font-medium">{cattleCount} টি ডেইরি পশু সক্রিয়</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                <Egg className="w-3.5 h-3.5" />
                <span>আজকের ডিম উৎপাদন</span>
              </div>
              <p className="text-3xl font-black font-mono text-amber-300">৮৫৮ <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">হাঁস ও সোনালী পোল্ট্রি ফ্লক</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>বায়োসিকিউরিটি ও স্বাস্থ্য</span>
              </div>
              <p className="text-3xl font-black font-mono text-emerald-400">১০০%</p>
              <p className="text-[10px] text-slate-400 font-medium">সকল পশু রোগমুক্ত ও সুস্থ</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                <Wallet className="w-3.5 h-3.5" />
                <span>বন্টনযোগ্য নিট মুনাফা</span>
              </div>
              <p className="text-3xl font-black font-mono text-white">{(financial.withdrawableProfit / 1000).toFixed(0)} <span className="text-xs font-normal">হাজার ৳</span></p>
              <p className="text-[10px] text-slate-400 font-medium">পরিচালন ক্যাশ: {financial.businessCash.toLocaleString('bn-BD')} ৳</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. প্রত্যেকটা খাতের সরাসরি কুইক অ্যাক্সেস কার্ডস (Sectors Quick Switcher) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            খাতভিত্তিক পৃথক পোর্টাল (Sector Portals)
          </h3>
          <span className="text-xs text-slate-500">যেকোনো খাতে ক্লিক করে তার নির্দিষ্ট ড্যাশবোর্ড ও রেকর্ড দেখুন</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'sector_cattle', title: 'ডেইরি ও গরু খাত', icon: '🐄', desc: `${cattleCount} টি গরু ও গাভী · ১৩০.৪L দুধ`, color: 'hover:border-emerald-500' },
            { id: 'sector_goat', title: 'ছাগল ও খাসি খাত', icon: '🐐', desc: `${goatCount} টি ছাগল ও খাসি · ব্ল্যাক বেঙ্গল`, color: 'hover:border-amber-500' },
            { id: 'sector_poultry', title: 'পোল্ট্রি ও হাঁস-মুরগি খাত', icon: '🦆', desc: `৮৫৮ টি দৈনিক ডিম · খাকি ক্যাম্পবেল`, color: 'hover:border-yellow-500' },
            { id: 'sector_fishery', title: 'মৎস্য হ্যাচারি ও পুকুর খাত', icon: '🐟', desc: `৩টি পুকুর · ৮৫০ কেজি মাছ মজুদ`, color: 'hover:border-cyan-500' },
            { id: 'sector_feed', title: 'খাদ্য ও পুষ্টি খাত', icon: '🌾', desc: `২,৪৫০ কেজি মজুদ · FCR ১.৩৮`, color: 'hover:border-lime-500' },
            { id: 'sector_health', title: 'স্বাস্থ্য ও চিকিৎসা খাত', icon: '🩺', desc: `১০০% সুস্থ · আগামী ৭ দিনে ২ টিকা`, color: 'hover:border-teal-500' },
            { id: 'sector_production_sales', title: 'উৎপাদন ও সেলস খাত', icon: '📊', desc: `৩০ দিনের চার্ট · কাস্টমার অর্ডার`, color: 'hover:border-blue-500' },
            { id: 'sector_finance', title: 'অর্থ ও লেজার খাত', icon: '💰', desc: `পরিচালন ক্যাশ ও লভ্যাংশ লেজার`, color: 'hover:border-indigo-500' },
          ].map(sec => (
            <button
              key={sec.id}
              onClick={() => onSelectTab(sec.id as AdminTab)}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all text-left flex items-start gap-3.5 group cursor-pointer ${sec.color} hover:shadow-md transform hover:-translate-y-0.5`}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                {sec.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{sec.title}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 truncate">{sec.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Automated Feed & Medicine Inventory Alert Widget */}
      <DashboardInventoryAlertWidget onNavigateToInventory={() => onSelectTab('sector_feed')} />

      {/* 3. লাইভ ইন্টারঅ্যাক্টিভ ম্যাপ ও আবহাওয়া চেকলিস্ট */}
      <InteractiveLiveDashboard onExploreShop={() => {}} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LocalWeatherWidget />
        <RealtimeFarmStatusWidget />
      </div>

    </div>
  );
};
