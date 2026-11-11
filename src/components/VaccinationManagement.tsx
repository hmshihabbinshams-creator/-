import React from 'react';
import { LivestockItem, HealthLog } from '../types';
import { Stethoscope, Calendar, AlertTriangle, Printer, CheckCircle2 } from 'lucide-react';

interface VaccinationManagementProps {
  livestock: LivestockItem[];
  healthLogs: HealthLog[];
}

export const VaccinationManagement: React.FC<VaccinationManagementProps> = ({ livestock, healthLogs }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Stethoscope className="w-6 h-6 text-rose-500" />
          <span>স্বাস্থ্য ও ভ্যাকসিনেশন ম্যানেজমেন্ট</span>
        </h3>
        <button 
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>প্রিন্ট রিপোর্ট</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {livestock.map(animal => {
          const animalLogs = healthLogs.filter(l => l.animalId === animal.id);
          return (
            <div key={animal.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                     {animal.type.includes('গরু') ? '🐄' : '🐐'}
                   </div>
                   <div>
                     <h4 className="font-black text-slate-900 dark:text-white">{animal.name}</h4>
                     <p className="text-xs text-slate-500 font-bold">{animal.type} · ID: {animal.id}</p>
                   </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">ভ্যাকসিনেশন স্ট্যাটাস</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white">নির্ধারিত</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                   <Calendar className="w-4 h-4" />
                   <span>পরবর্তী ভ্যাকসিন: পিপিআর (PPR) / তড়কা - ২০ নভেম্বর ২০২৬</span>
                 </div>
                 <button className="w-full px-5 py-2.5 rounded-xl bg-rose-600 text-white font-black text-xs hover:bg-rose-700 cursor-pointer transition-all">
                   ভ্যাকসিন প্রদান নিশ্চিত করুন
                 </button>
              </div>

              {animalLogs.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">সাম্প্রতিক স্বাস্থ্য রেকর্ড</p>
                  <div className="space-y-2">
                    {animalLogs.slice(0, 2).map(log => (
                      <div key={log.id} className="text-xs text-slate-600 dark:text-slate-400 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span className="font-bold">{log.date}:</span> {log.inspectionNotes}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
