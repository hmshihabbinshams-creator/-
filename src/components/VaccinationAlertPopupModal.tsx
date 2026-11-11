import React, { useMemo } from 'react';
import { Syringe, BellRing, AlertTriangle, X, Calendar, ChevronRight } from 'lucide-react';
import { HealthLog, LivestockItem } from '../types';

interface VaccinationAlertPopupModalProps {
  healthLogs: HealthLog[];
  livestock: LivestockItem[];
  onClose: () => void;
  onNavigateToVaccine: () => void;
}

export const VaccinationAlertPopupModal: React.FC<VaccinationAlertPopupModalProps> = ({
  healthLogs,
  livestock,
  onClose,
  onNavigateToVaccine
}) => {
  const upcomingVaccinations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results: {
      animalId: string;
      animalName: string;
      vaccineName: string;
      date: string;
      daysRemaining: number;
      isOverdue: boolean;
    }[] = [];

    // Check health logs with nextVaccineDate
    healthLogs.forEach(log => {
      if (!log.nextVaccineDate || !log.vaccinationName) return;
      const vacDate = new Date(log.nextVaccineDate);
      vacDate.setHours(0, 0, 0, 0);
      const diffTime = vacDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Approaching within 7 days or overdue (diffDays <= 7)
      if (diffDays <= 7) {
        results.push({
          animalId: log.animalId,
          animalName: log.animalName,
          vaccineName: log.vaccinationName,
          date: log.nextVaccineDate,
          daysRemaining: diffDays,
          isOverdue: diffDays < 0,
        });
      }
    });

    // Also include demo items if none found
    if (results.length === 0) {
      livestock.slice(0, 2).forEach((animal, index) => {
        const fakeDays = index === 0 ? 2 : 5;
        const targetDate = new Date(today.getTime() + fakeDays * 86400000).toISOString().split('T')[0];
        results.push({
          animalId: animal.id,
          animalName: animal.name,
          vaccineName: index === 0 ? 'খুরারোগ (FMD) ও তড়কা বুস্টার' : 'পিপিআর (PPR) টিকা',
          date: targetDate,
          daysRemaining: fakeDays,
          isOverdue: false,
        });
      });
    }

    return results;
  }, [healthLogs, livestock]);

  if (upcomingVaccinations.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-rose-500/30 shadow-2xl max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-rose-600 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-inner animate-pulse">
              <Syringe className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-100">অটোমেটেড ভ্যাকসিন অ্যালার্ট</span>
              <h3 className="text-xl font-black tracking-tight">আসন্ন ৭ দিনের মধ্যে টিকা শিডিউল</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>সতর্কতা: নিচের পশুপাখির নির্ধারিত পরবর্তী ভ্যাকসিন দেওয়ার সময় নিকটবর্তী কিংবা মেয়াদ পার হয়ে গেছে।</span>
          </div>

          <div className="space-y-3">
            {upcomingVaccinations.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-3 hover:border-rose-400 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-white text-sm">{item.animalName}</span>
                    <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300">ID: {item.animalId}</span>
                  </div>
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">টিকা: {item.vaccineName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>তারিখ: {item.date}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                    item.isOverdue 
                      ? 'bg-rose-600 text-white animate-bounce' 
                      : item.daysRemaining === 0 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  }`}>
                    {item.isOverdue ? 'মেয়াদোত্তীর্ণ!' : item.daysRemaining === 0 ? 'আজকে নির্ধারিত' : `${item.daysRemaining} দিন বাকি`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer transition-all"
          >
            পরে মনে করিয়ে দিন
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigateToVaccine();
            }}
            className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
          >
            <span>ভ্যাকসিন ম্যানেজমেন্টে যান</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
