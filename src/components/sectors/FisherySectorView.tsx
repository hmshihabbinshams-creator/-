import React, { useState } from 'react';
import { farmStore } from '../../services/farmStore';
import { SectorFinancialModal } from '../SectorFinancialModal';
import { 
  Droplets, Thermometer, AlertOctagon, CheckCircle2, 
  Sparkles, Plus, Fish, Activity, Waves, Printer
} from 'lucide-react';

export const FisherySectorView: React.FC = () => {
  const [profile] = useState(farmStore.getInstitutionProfile());
  const [showSectorFinancialModal, setShowSectorFinancialModal] = useState(false);
  const fishItems = farmStore.getLivestock().filter(i => i.type.includes('মাছ'));

  const ponds = [
    {
      id: 'pond-1',
      name: 'প্রধান ডেইরি পুকুর (Pond-1)',
      species: 'মনোসেক্স তেলাপিয়া ও কার্প',
      stockKg: 450,
      ph: 7.4,
      temp: 27.8,
      ammonia: '0.02 ppm (নিরাপদ)',
      waterQuality: 'উৎকৃষ্ট (Grade-A)',
      status: 'স্বাভাবিক'
    },
    {
      id: 'pond-2',
      name: 'উত্তর পদ্মপুকুর (Pond-2)',
      species: 'রুই, কাতলা ও মৃগেল মিশ্র',
      stockKg: 280,
      ph: 7.6,
      temp: 28.1,
      ammonia: '0.03 ppm (নিরাপদ)',
      waterQuality: 'স্বাভাবিক',
      status: 'স্বাভাবিক'
    },
    {
      id: 'pond-3',
      name: 'হ্যাচারি নার্সারি পুকুর (Pond-3)',
      species: 'মাছের পোনা ও ফিঙ্গারলিং',
      stockKg: 120,
      ph: 7.2,
      temp: 27.2,
      ammonia: '0.01 ppm (নিরাপদ)',
      waterQuality: 'উচ্চ যত্ন প্রয়োজন',
      status: 'পোনা বৃদ্ধি সক্রিয়'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. মৎস্য খাতের ডেডিকেটেড ড্যাশবোর্ড (Fishery Sector Dashboard at Top) */}
      <div className="bg-gradient-to-br from-cyan-900 via-blue-950 to-slate-900 rounded-[2.5rem] text-white p-6 sm:p-8 border border-cyan-700/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-3xl shadow-inner">
                🐟
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">খাতভিত্তিক ড্যাশবোর্ড</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">মৎস্য হ্যাচারি ও পুকুর খাত</h2>
                <p className="text-xs text-slate-300 mt-0.5">পরিষ্কার পানির প্রাকৃতিক পুকুরে বৈজ্ঞানিক মৎস্য চাষ ও পানির কোয়ালিটি</p>
              </div>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                onClick={() => setShowSectorFinancialModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>আলাদা খাতের হিসাব ও প্রিন্ট</span>
              </button>

              <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>IoT সেন্সর লাইভ সংযুক্ত</span>
              </span>
            </div>
          </div>

          {/* 4 Core Fishery Sector Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">মোট সক্রিয় পুকুর</p>
              <p className="text-3xl font-black font-mono text-white">৩ <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">ডেইরি, পদ্ম ও হ্যাচারি পুকুর</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">পানির গড় pH</p>
              <p className="text-3xl font-black font-mono text-blue-300">৭.৪</p>
              <p className="text-[10px] text-slate-400 font-medium">আদর্শ মাত্রা (৬.৫ - ৮.৫)</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">পানির গড় তাপমাত্রা</p>
              <p className="text-3xl font-black font-mono text-amber-300">২৭.৭°C</p>
              <p className="text-[10px] text-slate-400 font-medium">স্বাভাবিক বৃদ্ধির তাপমাত্রা</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">আনুমানিক মাছ মজুদ</p>
              <p className="text-3xl font-black font-mono text-emerald-300">৮৫০ <span className="text-xs font-normal">কেজি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">তেলাপিয়া, রুই ও কার্প মাছ</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. পুকুরভিত্তিক লাইভ অবস্থা ও বিস্তারিত প্যারামিটার */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">খামারের ৩টি পুকুরের পানির বর্তমান লাইভ প্যারামিটার:</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ponds.map(pond => (
            <div
              key={pond.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 bg-cyan-50 dark:bg-cyan-950 px-2.5 py-0.5 rounded-md">
                    {pond.id.toUpperCase()}
                  </span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">{pond.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">মাছের প্রজাতি: {pond.species}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center text-xl">
                  🐟
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Droplets className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase">পানির pH</span>
                  </div>
                  <p className="text-lg font-black font-mono text-slate-900 dark:text-white">{pond.ph}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase">তাপমাত্রা</span>
                  </div>
                  <p className="text-lg font-black font-mono text-slate-900 dark:text-white">{pond.temp}°C</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span>অ্যামোনিয়া (Ammonia):</span>
                  <strong className="text-emerald-600 font-mono">{pond.ammonia}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span>মাছের বর্তমান মজুদ:</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{pond.stockKg} কেজি</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>পানির গুণগত মান:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{pond.waterQuality}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sector Financial Report Modal */}
      <SectorFinancialModal
        isOpen={showSectorFinancialModal}
        onClose={() => setShowSectorFinancialModal(false)}
        sectorKey="fishery"
        sectorTitle="মৎস্য হ্যাচারি ও পুকুর খাত"
        sectorIcon="🐟"
        items={fishItems}
      />

    </div>
  );
};
