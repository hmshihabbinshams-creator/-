import React from 'react';
import { 
  Building2, Cpu, CheckCircle2, AlertTriangle, 
  Activity, Zap, Droplets, RefreshCw, ShieldCheck
} from 'lucide-react';
import { farmStore } from '../services/farmStore';

export const RealtimeFarmStatusWidget: React.FC = () => {
  const livestock = farmStore.getLivestock();

  // Occupancy metrics
  const pens = [
    { name: 'শেড-১ (সাহীওয়াল ডেইরি গবাদিপশু)', totalCapacity: 20, currentOccupancy: 14, icon: '🐄' },
    { name: 'শেড-২ (যমুনাপারি ও তোতাপুরী ছাগল)', totalCapacity: 50, currentOccupancy: 38, icon: '🐐' },
    { name: 'শেড-৩ (সোনালী ও লেয়ার পোল্ট্রি)', totalCapacity: 1000, currentOccupancy: 850, icon: '🐔' },
    { name: 'পুকুর-১ ও ২ (মৎস্য হ্যাচারি চ্যানেল)', totalCapacity: 2000, currentOccupancy: 1800, icon: '🐟' },
  ];

  // Automatic Feeders State
  const automaticFeeders = [
    { id: 'FDR-01', name: 'অটোমেটিক দানাদার ফিডার - ডেইরি শেড', status: 'সক্রিয় (Active ⚡)', lastDispensed: '১০ মিনিট আগে (৩.৫ কেজি)' },
    { id: 'FDR-02', name: 'স্বয়ংক্রিয় ওয়াটার ড্রিংকার লাইন - ছাগল পেন', status: 'সক্রিয় (Active ⚡)', lastDispensed: 'স্বয়ংক্রিয় ওয়াটার সেন্সর রিফিল' },
    { id: 'FDR-03', name: 'পোল্ট্রি অটোক্লিন ফিড লাইন', status: 'পরিচ্ছন্নতা মোড (Cleaning 🧼)', lastDispensed: 'প্রতি ২ ঘণ্টায় সাইকেল' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-extrabold text-[11px] border border-teal-200 dark:border-teal-800 flex items-center gap-1.5 w-max">
            <Activity className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>রিয়েল-টাইম খামার স্ট্যাটাস ও ক্যাপাসিটি</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            পেন অকুপেন্সি, অটো-ফিডার ও সিস্টেম হেলথ স্ট্যাটাস
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-4 h-4" />
          <span>সকল সিস্টেম অনলাইন</span>
        </div>
      </div>

      {/* Grid: Pen Occupancy vs Auto Feeders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pen Occupancy Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <span className="text-xs font-black text-slate-900 dark:text-white block">
            ১. শেড ও পেন সমূহের ধারণক্ষমতা ও ক্যাপাসিটি (Pen Occupancy):
          </span>

          <div className="space-y-3">
            {pens.map((pen, idx) => {
              const percent = Math.round((pen.currentOccupancy / pen.totalCapacity) * 100);
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                      <span>{pen.icon}</span>
                      <span>{pen.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {pen.currentOccupancy} / {pen.totalCapacity} ({percent}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percent > 90 ? 'bg-rose-500' : percent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Automatic Feeders & System Health (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-black text-slate-900 dark:text-white block">
            ২. অটোমেটিক ফিডার ও আইওটি নোড স্ট্যাটাস:
          </span>

          <div className="space-y-3">
            {automaticFeeders.map((fdr) => (
              <div key={fdr.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 dark:text-white">{fdr.name}</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">{fdr.status}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{fdr.lastDispensed}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
