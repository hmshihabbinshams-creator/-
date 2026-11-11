import React, { useState } from 'react';
import { farmStore } from '../../services/farmStore';
import { LivestockItem, HealthLog } from '../../types';
import { 
  Stethoscope, Syringe, ShieldCheck, Bot, 
  AlertCircle, CheckCircle2, Calendar, Sparkles, Activity
} from 'lucide-react';
import { VaccineHealthCalendarModule } from '../VaccineHealthCalendarModule';
import { BioSecurityChecklistModule } from '../BioSecurityChecklistModule';
import { AiDoctorChat } from '../AiDoctorChat';

export const HealthSectorView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'vaccines' | 'biosecurity' | 'aidoctor'>('vaccines');
  const [livestock, setLivestock] = useState<LivestockItem[]>(() => farmStore.getLivestock());
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>(() => farmStore.getHealthLogs());

  React.useEffect(() => {
    return farmStore.subscribe(() => {
      setLivestock(farmStore.getLivestock());
      setHealthLogs(farmStore.getHealthLogs());
    });
  }, []);

  const totalAnimals = livestock.length;
  const vaccinatedCount = livestock.filter(l => l.vaccinationStatus === 'সম্পূর্ণ (Fully Vaccinated)').length;
  const underTreatmentCount = livestock.filter(l => l.status === 'অসুস্থ (Sick)' || l.treatmentStatus === 'চিকিৎসাধীন').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. স্বাস্থ্য ও বায়োসিকিউরিটি খাতের ডেডিকেটেড ড্যাশবোর্ড (Health Dashboard at Top) */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 rounded-[2.5rem] text-white p-6 sm:p-8 border border-emerald-700/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-3xl shadow-inner">
                🩺
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">খাতভিত্তিক ড্যাশবোর্ড</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">স্বাস্থ্য, টিকা ও ভেটেরিনারি খাত</h2>
                <p className="text-xs text-slate-300 mt-0.5">টিকা সময়সূচি, বায়োসিকিউরিটি স্ট্যান্ডার্ড ও এআই ভেটেরিনারি পরামর্শক</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>বায়োসিকিউরিটি: Grade-1 সার্টিফাইড</span>
              </span>
            </div>
          </div>

          {/* 4 Core Health Sector Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">টিকা সুরক্ষার হার</p>
              <p className="text-3xl font-black font-mono text-white">
                {totalAnimals > 0 ? Math.round((vaccinatedCount / totalAnimals) * 100) : 100}%
              </p>
              <p className="text-[10px] text-slate-400 font-medium">{vaccinatedCount} টি পশু সম্পূর্ণ ডোজ সম্পন্ন</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">চিকিৎসাধীন রোগী</p>
              <p className="text-3xl font-black font-mono text-amber-300">{underTreatmentCount} <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">{underTreatmentCount === 0 ? 'খামারে কোনো অসুস্থ পশু নেই ✓' : 'আইসোলেশন শেডে পরিচর্যাচলমান'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">আগামী ৭ দিনের টিকা</p>
              <p className="text-3xl font-black font-mono text-blue-300">২ <span className="text-xs font-normal">টি ব্যাচ</span></p>
              <p className="text-[10px] text-slate-400 font-medium">FMD ও PPR বুস্টার ডোজ শিডিউল্ড</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">বায়োসিকিউরিটি স্কোর</p>
              <p className="text-3xl font-black font-mono text-emerald-400">১০০%</p>
              <p className="text-[10px] text-slate-400 font-medium">দৈনিক ফুটবাথ ও শেড স্প্রে কার্যকর</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. স্বাস্থ্য খাতের অপশন ও মডিউলসমূহ (Below Dashboard) */}
      <div className="space-y-6">
        
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {[
            { id: 'vaccines', label: 'টিকা ও স্বাস্থ্য সুরক্ষা ক্যালেন্ডার', icon: Syringe },
            { id: 'biosecurity', label: 'বায়োসিকিউরিটি অডিট ও স্যানিটেশন', icon: ShieldCheck },
            { id: 'aidoctor', label: 'এআই পশু ডাক্তার ও ডায়াগনস্টিকস', icon: Bot },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeSubTab === 'vaccines' && (
          <VaccineHealthCalendarModule livestock={livestock} healthLogs={healthLogs} />
        )}
        {activeSubTab === 'biosecurity' && (
          <BioSecurityChecklistModule />
        )}
        {activeSubTab === 'aidoctor' && (
          <AiDoctorChat />
        )}

      </div>

    </div>
  );
};
