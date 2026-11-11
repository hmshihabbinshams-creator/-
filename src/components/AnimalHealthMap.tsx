import React, { useState, useMemo } from 'react';
import { LivestockItem, HealthLog } from '../types';
import { farmStore } from '../services/farmStore';
import { 
  Stethoscope, ShieldAlert, CheckCircle2, AlertTriangle, 
  Activity, Thermometer, Filter, Search, Eye, Sparkles, 
  HeartPulse, ShieldCheck, ArrowRight, X, PhoneCall, RefreshCw,
  Building2, Droplets
} from 'lucide-react';

interface AnimalHealthMapProps {
  livestock: LivestockItem[];
  onOpenAiDoctor?: () => void;
}

export const AnimalHealthMap: React.FC<AnimalHealthMapProps> = ({ 
  livestock, 
  onOpenAiDoctor 
}) => {
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'warning' | 'quarantine'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAnimal, setSelectedAnimal] = useState<LivestockItem | null>(null);
  const [treatmentNotes, setTreatmentNotes] = useState<string>('');

  // Local state for interactive stall status overrides
  const [customStatuses, setCustomStatuses] = useState<Record<string, 'healthy' | 'warning' | 'quarantine'>>({});
  const [customTemps, setCustomTemps] = useState<Record<string, number>>({});

  // Active animals excluding sold ones
  const activeAnimals = useMemo(() => {
    return (livestock || []).filter(item => item.status !== 'বিক্রিত (Sold)');
  }, [livestock]);

  // Compute status for an animal
  const getAnimalHealthInfo = (item: LivestockItem, index: number) => {
    // If overridden by user
    if (customStatuses[item.id]) {
      const st = customStatuses[item.id];
      const temp = customTemps[item.id] || (st === 'quarantine' ? 104.2 : st === 'warning' ? 102.5 : 101.4);
      return {
        status: st,
        temp,
        stallCode: `শেড-${Math.floor(index / 6) + 1} / স্টল-${(index % 6) + 1}`,
        quarantine: st === 'quarantine'
      };
    }

    // Heuristics based on health status or name
    const h = (item.healthStatus || '').toLowerCase();
    let status: 'healthy' | 'warning' | 'quarantine' = 'healthy';
    let temp = 101.5;

    if (h.includes('অসুস্থ') || h.includes('চিকিৎসা') || h.includes('জরুরি') || h.includes('sick')) {
      status = 'quarantine';
      temp = 104.1;
    } else if (h.includes('পর্যবেক্ষণ') || h.includes('নজরদারি') || h.includes('দুর্বল') || h.includes('সর্দি')) {
      status = 'warning';
      temp = 102.6;
    } else {
      // Natural deterministic distribution
      if (index === 2) {
        status = 'warning';
        temp = 102.8;
      } else if (index === 5) {
        status = 'quarantine';
        temp = 103.9;
      }
    }

    const t = item.type.toLowerCase();
    let stallPrefix = 'শেড';
    if (t.includes('মাছ')) stallPrefix = 'পুকুর';
    else if (t.includes('পাখি')) stallPrefix = 'অ্যাভিয়ারি';
    else if (t.includes('মুরগি') || t.includes('হাঁস')) stallPrefix = 'পোল্ট্রি ফ্লক';

    return {
      status,
      temp: customTemps[item.id] || temp,
      stallCode: `${stallPrefix}-${Math.floor(index / 4) + 1} / খাঁচা-${(index % 4) + 1}`,
      quarantine: status === 'quarantine'
    };
  };

  // Filtered animals
  const displayedAnimals = useMemo(() => {
    return activeAnimals.filter((animal, idx) => {
      // Species filter
      if (selectedSpecies !== 'all') {
        const t = animal.type.toLowerCase();
        if (selectedSpecies === 'cattle' && !t.includes('গরু') && !t.includes('cattle')) return false;
        if (selectedSpecies === 'goat' && !t.includes('ছাগল') && !t.includes('goat')) return false;
        if (selectedSpecies === 'duck' && !t.includes('হাঁস') && !t.includes('duck')) return false;
        if (selectedSpecies === 'chicken' && !t.includes('মুরগি') && !t.includes('chicken')) return false;
        if (selectedSpecies === 'birds' && !t.includes('পাখি') && !t.includes('birds')) return false;
        if (selectedSpecies === 'fish' && !t.includes('মাছ') && !t.includes('fish')) return false;
      }

      // Health status filter
      const info = getAnimalHealthInfo(animal, idx);
      if (statusFilter !== 'all' && info.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = (animal.tagId || animal.id || '').toLowerCase().includes(q);
        const matchName = (animal.name || '').toLowerCase().includes(q);
        const matchBreed = (animal.breed || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchBreed) return false;
      }

      return true;
    });
  }, [activeAnimals, selectedSpecies, statusFilter, searchQuery, customStatuses, customTemps]);

  // Overall Health KPI aggregates
  const stats = useMemo(() => {
    let healthy = 0;
    let warning = 0;
    let quarantine = 0;

    activeAnimals.forEach((item, idx) => {
      const info = getAnimalHealthInfo(item, idx);
      if (info.status === 'healthy') healthy++;
      else if (info.status === 'warning') warning++;
      else if (info.status === 'quarantine') quarantine++;
    });

    const total = activeAnimals.length;
    const healthRate = total > 0 ? Math.round((healthy / total) * 100) : 100;

    return { total, healthy, warning, quarantine, healthRate };
  }, [activeAnimals, customStatuses]);

  // Change animal status
  const handleUpdateStatus = (animalId: string, newStatus: 'healthy' | 'warning' | 'quarantine') => {
    setCustomStatuses(prev => ({ ...prev, [animalId]: newStatus }));
    const defaultTemp = newStatus === 'quarantine' ? 104.0 : newStatus === 'warning' ? 102.4 : 101.4;
    setCustomTemps(prev => ({ ...prev, [animalId]: defaultTemp }));

    // Add health log into farmStore
    if (selectedAnimal && selectedAnimal.id === animalId) {
      const statusBangla = newStatus === 'healthy' ? 'সুস্থ ও স্বাভাবিক' : newStatus === 'warning' ? 'বিশেষ পর্যবেক্ষণে' : 'জরুরি আইসোলেশন';
      farmStore.addHealthLog({
        animalId,
        date: new Date().toISOString().split('T')[0],
        checkupType: 'নিয়মিত ট্রায়াজ',
        healthStatus: statusBangla,
        temperatureF: defaultTemp,
        diagnosisNotes: treatmentNotes || `স্বাস্থ্য ম্যাপ থেকে দ্রুত ট্রায়াজ: স্ট্যাটাস পরিবর্তন করা হয়েছে ${statusBangla}`,
        vetName: 'ডাঃ মোস্তাফিজুর রহমান (ডিভিএম)'
      });
      setTreatmentNotes('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              লাইভ বায়ো-মনিটরিং ও স্টল ম্যাপ
            </span>
            <span className="text-xs font-bold text-slate-500">শেড ও খাঁচাভিত্তিক ডিজিটাল ট্রায়াজ</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2.5">
            <HeartPulse className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>খামারের পশুর স্বাস্থ্য ম্যাপ (Animal Health Grid)</span>
          </h3>
        </div>

        {/* Action Controls & AI Doctor Integration */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenAiDoctor && (
            <button
              onClick={onOpenAiDoctor}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI ভেটেরিনারি ডাক্তার</span>
            </button>
          )}

          <button
            onClick={() => {
              setCustomStatuses({});
              setCustomTemps({});
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="ম্যাপ রিফ্রেশ করুন"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>রিসেট</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 block">মোট সক্রিয় পশু</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{stats.total}</span>
            <span className="text-xs text-slate-500">টি</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'healthy' ? 'all' : 'healthy')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'healthy' 
              ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/30' 
              : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">সম্পূর্ণ সুস্থ 🟢</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">{stats.healthy}</span>
            <span className="text-xs text-emerald-600 font-bold">({stats.healthRate}%)</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'warning' ? 'all' : 'warning')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'warning' 
              ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 ring-2 ring-amber-500/30' 
              : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">নজরদারি/ফলোআপ 🟡</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">{stats.warning}</span>
            <span className="text-xs text-amber-600">টি</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'quarantine' ? 'all' : 'quarantine')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'quarantine' 
              ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 ring-2 ring-rose-500/30' 
              : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 hover:bg-rose-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">জরুরি আইসোলেশন 🔴</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">{stats.quarantine}</span>
            <span className="text-xs text-rose-600">টি</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500">বায়ো-সিকিউরিটি লেভেল</span>
          <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>লেভেল-৩ (DLS)</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="আইডি ট্যাগ (Tag ID), পশুর নাম বা জাত দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Species Selector */}
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">সকল প্রজাতি</option>
            <option value="cattle">গরু (Cattle)</option>
            <option value="goat">ছাগল (Goat)</option>
            <option value="duck">হাঁস (Duck)</option>
            <option value="chicken">মুরগি (Chicken)</option>
            <option value="birds">পাখি (Birds)</option>
            <option value="fish">মাছ (Fish)</option>
          </select>

          {/* Status Quick Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">সকল স্বাস্থ্য স্ট্যাটাস</option>
            <option value="healthy">সুস্থ (Healthy 🟢)</option>
            <option value="warning">নজরদারি (Monitor 🟡)</option>
            <option value="quarantine">আইসোলেশন (Quarantine 🔴)</option>
          </select>
        </div>
      </div>

      {/* Visual Stall Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedAnimals.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 space-y-2">
            <Stethoscope className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
            <p className="text-sm font-bold">কোনো প্রাণী খুঁজে পাওয়া যায়নি</p>
          </div>
        ) : (
          displayedAnimals.map((animal, idx) => {
            const health = getAnimalHealthInfo(animal, idx);

            const statusBg = health.status === 'healthy' 
              ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/20 hover:border-emerald-400' 
              : health.status === 'warning'
              ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 hover:border-amber-400'
              : 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20 hover:border-rose-400';

            const statusDot = health.status === 'healthy' ? 'bg-emerald-500' : health.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500 animate-ping';
            const statusLabel = health.status === 'healthy' ? 'সুস্থ' : health.status === 'warning' ? 'পর্যবেক্ষণ' : 'আইসোলেশন';
            const statusBadgeColor = health.status === 'healthy' ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950' : health.status === 'warning' ? 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950' : 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950';

            return (
              <div
                key={animal.id}
                onClick={() => setSelectedAnimal(animal)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative group flex flex-col justify-between space-y-3.5 shadow-sm hover:shadow-md ${statusBg}`}
              >
                {/* Stall Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {health.stallCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusDot}`} />
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${statusBadgeColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Animal Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {animal.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">#{animal.tagId || animal.id.slice(0, 5)}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{animal.breed || animal.type}</p>
                </div>

                {/* Vitals */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-mono font-bold">{health.temp}°F</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 justify-end">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-mono font-bold">{animal.currentWeight || 35} কেজি</span>
                  </div>
                </div>

                {/* Quick Triage Buttons */}
                <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(animal.id, 'healthy');
                    }}
                    className={`flex-1 py-1 rounded font-bold transition-all ${
                      health.status === 'healthy' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-emerald-50'
                    }`}
                  >
                    সুস্থ 🟢
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(animal.id, 'warning');
                    }}
                    className={`flex-1 py-1 rounded font-bold transition-all ${
                      health.status === 'warning' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-amber-50'
                    }`}
                  >
                    নজরদারি 🟡
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(animal.id, 'quarantine');
                    }}
                    className={`flex-1 py-1 rounded font-bold transition-all ${
                      health.status === 'quarantine' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-rose-50'
                    }`}
                  >
                    আইসোলেশন 🔴
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Animal Detail Modal */}
      {selectedAnimal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedAnimal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedAnimal.name}</h3>
                <p className="text-xs text-slate-500 font-bold">ট্যাগ: #{selectedAnimal.tagId || selectedAnimal.id} • {selectedAnimal.breed}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">বর্তমান ওজন</span>
                <span className="text-base font-black font-mono text-slate-900 dark:text-white">{selectedAnimal.currentWeight || 35} কেজি</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">শারীরিক তাপমাত্রা</span>
                <span className="text-base font-black font-mono text-amber-600">
                  {customTemps[selectedAnimal.id] || 101.5}°F
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">দৈনিক খাবার বরাদ্দ</span>
                <span className="text-base font-black font-mono text-emerald-600">৳ {selectedAnimal.dailyFeedBudget || 80}</span>
              </div>
            </div>

            {/* Change Status Controls */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">স্বাস্থ্য ট্রায়াজ স্ট্যাটাস আপডেট করুন:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedAnimal.id, 'healthy')}
                  className="py-2.5 rounded-xl text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer border border-emerald-300 dark:border-emerald-800"
                >
                  সুস্থ ও সক্রিয় 🟢
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAnimal.id, 'warning')}
                  className="py-2.5 rounded-xl text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-600 hover:text-white transition-all cursor-pointer border border-amber-300 dark:border-amber-800"
                >
                  বিশেষ নজরদারি 🟡
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAnimal.id, 'quarantine')}
                  className="py-2.5 rounded-xl text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 hover:bg-rose-600 hover:text-white transition-all cursor-pointer border border-rose-300 dark:border-rose-800"
                >
                  জরুরি আইসোলেশন 🔴
                </button>
              </div>
            </div>

            {/* Treatment / Diagnostic Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">চিকিৎসা বা পর্যবেক্ষণের নোট:</label>
              <textarea
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
                placeholder="যেমন: সকালে হালকা সর্দি লক্ষ্য করা গেছে, স্যালাইন ও ভিটামিন সি দেওয়া হয়েছে..."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {onOpenAiDoctor && (
                <button
                  onClick={() => {
                    setSelectedAnimal(null);
                    onOpenAiDoctor();
                  }}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI ডাক্তারকে জিজ্ঞেস করুন</span>
                </button>
              )}

              <button
                onClick={() => setSelectedAnimal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 cursor-pointer ml-auto"
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
