import React, { useState } from 'react';
import { LivestockItem, HealthLog } from '../types';
import { farmStore } from '../services/farmStore';
import { 
  X, Printer, QrCode, Stethoscope, Heart, Calendar, 
  Scale, Utensils, TrendingUp, ShieldCheck, Award, 
  Droplets, Edit3, Save, CheckCircle2, AlertTriangle,
  Activity, Baby, Sparkles, Tag, ChevronRight, FileText
} from 'lucide-react';

interface AnimalProfileModalProps {
  animal: LivestockItem;
  onClose: () => void;
  onUpdateAnimal?: (updated: LivestockItem) => void;
}

export const AnimalProfileModal: React.FC<AnimalProfileModalProps> = ({ animal, onClose, onUpdateAnimal }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'breeding' | 'financial'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Form states for in-modal editing
  const [editCurrentWeight, setEditCurrentWeight] = useState(animal.currentWeight);
  const [editHealthStatus, setEditHealthStatus] = useState(animal.healthStatus);
  const [editSellingPrice, setEditSellingPrice] = useState(animal.sellingPrice);
  const [isPregnant, setIsPregnant] = useState(animal.breedingHistory?.isPregnant || false);
  const [matingDate, setMatingDate] = useState(animal.breedingHistory?.matingDate || '');
  const [expectedCalvingDate, setExpectedCalvingDate] = useState(animal.breedingHistory?.expectedCalvingDate || '');
  const [breedingType, setBreedingType] = useState(animal.breedingHistory?.breedingType || 'কৃত্রিম প্রজনন (AI)');
  const [sireBreed, setSireBreed] = useState(animal.breedingHistory?.sireBreed || 'উন্নত জাত');
  const [offspringCount, setOffspringCount] = useState(animal.breedingHistory?.offspringCount || 0);

  // Health log addition inside modal
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newTemp, setNewTemp] = useState('101.5 °F');
  const [newNotes, setNewNotes] = useState('');
  const [showAddHealth, setShowAddHealth] = useState(false);

  // Financial stats from store
  const stats = farmStore.getAnimalCostStats(animal.id);
  const healthLogs = farmStore.getHealthLogs().filter(h => h.animalId === animal.id);

  const handleSave = () => {
    const updated: LivestockItem = {
      ...animal,
      currentWeight: Number(editCurrentWeight),
      healthStatus: editHealthStatus,
      sellingPrice: Number(editSellingPrice),
      breedingHistory: {
        isPregnant,
        matingDate,
        expectedCalvingDate,
        breedingType,
        sireBreed,
        offspringCount: Number(offspringCount),
        notes: animal.breedingHistory?.notes
      }
    };
    farmStore.updateLivestock(updated);
    onUpdateAnimal?.(updated);
    setIsEditing(false);
  };

  const handleAddHealthRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccineName.trim()) return;

    const newLog: Omit<HealthLog, 'id'> = {
      animalId: animal.id,
      animalName: animal.name,
      date: new Date().toISOString().split('T')[0],
      temperature: newTemp,
      weightKg: editCurrentWeight,
      appetite: 'স্বাভাবিক',
      vaccinationName: newVaccineName,
      vaccinationStatus: 'সম্পন্ন',
      inspectionNotes: newNotes || 'স্বাভাবিক নিয়মিত স্বাস্থ্য তদারকি',
      status: 'Checked',
      inspectorName: 'ফার্ম ইনচার্জ'
    };

    farmStore.addHealthLog(newLog);
    setNewVaccineName('');
    setNewNotes('');
    setShowAddHealth(false);
  };

  const getEmojiForType = (type: string) => {
    if (type.includes('গরু')) return '🐄';
    if (type.includes('ছাগল')) return '🐐';
    if (type.includes('হাঁস')) return '🦆';
    if (type.includes('মুরগি')) return '🐔';
    if (type.includes('মাছ')) return '🐟';
    return '🕊️';
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white p-6 sm:p-8 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl sm:text-4xl shadow-inner border border-white/30 shrink-0">
                {animal.photoPlaceholder ? (
                  <img src={animal.photoPlaceholder} alt={animal.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  getEmojiForType(animal.type)
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-white/25 text-white font-mono text-[10px] font-black tracking-widest border border-white/20">
                    ID: {animal.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-900 text-[10px] font-black uppercase">
                    {animal.status}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                  {animal.name}
                </h3>
                <p className="text-xs text-emerald-100 font-medium">
                  {animal.type} · জাত: {animal.breed} · বয়স: {animal.age}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
                title="প্রাণীর পূর্ণাঙ্গ পাসপোর্ট প্রিন্ট"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">পাসপোর্ট প্রিন্ট</span>
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/20 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'মূল পরিচিতি ও স্বাস্থ্য', icon: Activity },
              { id: 'health', label: 'ভ্যাকসিন ও চিকিৎসা লগ', icon: Stethoscope },
              { id: 'breeding', label: 'প্রজনন ও বংশবৃদ্ধি', icon: Baby },
              { id: 'financial', label: 'একক লেজার ও বাজারদর', icon: TrendingUp },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body: Crisp White Theme with Colorful Accents */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-slate-50/50">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">বর্তমান ওজন</span>
                  <p className="text-2xl font-black font-mono text-emerald-600">
                    {animal.currentWeight} <span className="text-xs font-sans text-slate-500 font-bold">কেজি</span>
                  </p>
                  <span className="text-[10px] text-slate-400">শুরুর ওজন: {animal.initialWeight} কেজি</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">টার্গেট ওজন</span>
                  <p className="text-2xl font-black font-mono text-indigo-600">
                    {animal.targetWeight || Math.round(animal.currentWeight * 1.3)} <span className="text-xs font-sans text-slate-500 font-bold">কেজি</span>
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold">পালনকাল: {animal.targetRearingMonths || 6} মাস</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ক্রয়মূল্য</span>
                  <p className="text-2xl font-black font-mono text-slate-900">
                    {animal.purchasePrice.toLocaleString('bn-BD')} <span className="text-xs font-bold text-slate-400">৳</span>
                  </p>
                  <span className="text-[10px] text-slate-400">ক্রয় তারিখ: {animal.purchaseDate}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">টার্গেট বিক্রয়মূল্য</span>
                  <p className="text-2xl font-black font-mono text-amber-600">
                    {animal.sellingPrice.toLocaleString('bn-BD')} <span className="text-xs font-bold text-slate-400">৳</span>
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold">প্রত্যাশিত লাভ: {(animal.sellingPrice - animal.purchasePrice).toLocaleString('bn-BD')} ৳</span>
                </div>
              </div>

              {/* Editable Information Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-black text-sm text-slate-900">প্রাণীর তথ্য ও ব্যবস্থাপনা নিয়ন্ত্রণ</h4>
                  </div>
                  <button
                    onClick={() => {
                      if (isEditing) handleSave();
                      else setIsEditing(true);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      isEditing ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    <span>{isEditing ? 'সংরক্ষণ করুন' : 'সম্পাদনা করুন'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">বর্তমান ওজন (কেজি)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editCurrentWeight}
                        onChange={e => setEditCurrentWeight(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <p className="text-sm font-black text-slate-800">{animal.currentWeight} কেজি</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">স্বাস্থ্য অবস্থা</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editHealthStatus}
                        onChange={e => setEditHealthStatus(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <p className="text-sm font-black text-emerald-600">{animal.healthStatus}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">বিক্রয়মূল্য (৳)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editSellingPrice}
                        onChange={e => setEditSellingPrice(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <p className="text-sm font-black text-amber-600">{animal.sellingPrice.toLocaleString('bn-BD')} ৳</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">দৈনিক খাদ্য ও পুষ্টি পরিকল্পনা:</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl leading-relaxed">
                    {animal.dailyDietPlan}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HEALTH & VACCINE */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-base text-slate-900">স্বাস্থ্য ও ভ্যাকসিনেশন লগবুক</h4>
                  <p className="text-xs text-slate-500">রোগ প্রতিরোধ, তাপমাত্রা ও চিকিৎসকের নিয়মিত পর্যবেক্ষণ রিপোর্ট</p>
                </div>
                <button
                  onClick={() => setShowAddHealth(!showAddHealth)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>নতুন স্বাস্থ্য লগ যোগ</span>
                </button>
              </div>

              {/* Add Health Form */}
              {showAddHealth && (
                <form onSubmit={handleAddHealthRecord} className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-4 animate-in slide-in-from-top-2">
                  <h5 className="text-xs font-black text-emerald-800 uppercase tracking-wider">নতুন চিকিৎসা / ভ্যাকসিন রেকর্ড</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="টিকা বা ঔষধের নাম (যেমন: তড়কা/পিপিআর)"
                      value={newVaccineName}
                      onChange={e => setNewVaccineName(e.target.value)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                      required
                    />
                    <input
                      type="text"
                      placeholder="শরীরের তাপমাত্রা (যেমন: 101.5 °F)"
                      value={newTemp}
                      onChange={e => setNewTemp(e.target.value)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    />
                    <input
                      type="text"
                      placeholder="পর্যবেক্ষণ নোট / ডাক্তারের মন্তব্য"
                      value={newNotes}
                      onChange={e => setNewNotes(e.target.value)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddHealth(false)} className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">বাতিল</button>
                    <button type="submit" className="px-5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black cursor-pointer">সংরক্ষণ করুন</button>
                  </div>
                </form>
              )}

              {/* Health logs table / cards */}
              <div className="space-y-3">
                {healthLogs.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-bold text-slate-700">কোনো অসুস্থতার পূর্ব ইতিহাস নেই</p>
                    <p className="text-xs text-slate-400">পশুটি বর্তমানে শতভাগ সুস্থ ও সক্রিয় আছে</p>
                  </div>
                ) : (
                  healthLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                            {log.vaccinationName}
                          </span>
                          <span className="text-xs font-mono text-slate-400 font-bold">{log.date}</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium">{log.inspectionNotes}</p>
                      </div>
                      <div className="text-right sm:border-l sm:pl-4 border-slate-100 shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase font-black block">তাপমাত্রা ও ওজন</span>
                        <p className="text-xs font-black text-slate-800">{log.temperature} · {log.weightKg} কেজি</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BREEDING & REPRODUCTION */}
          {activeTab === 'breeding' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-3xl border border-rose-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
                      <Baby className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-base text-slate-900">প্রজনন ও বংশবৃদ্ধি অবস্থা (Breeding Status)</h4>
                      <p className="text-xs text-slate-500">গর্ভধারণ, প্রজনন চক্র ও বাছুর/বাচ্চা উৎপাদনের ট্র্যাকিং</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    isPregnant ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {isPregnant ? 'গর্ভবতী (Pregnant)' : 'স্বাভাবিক / নন-প্রেগন্যান্ট'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white border border-rose-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">প্রজননের ধরন</span>
                    <p className="text-sm font-black text-slate-800">{breedingType}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-rose-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">নিষেক / মিলনের তারিখ</span>
                    <p className="text-sm font-mono font-black text-slate-800">{matingDate || 'তথ্য নেই'}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-rose-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">সম্ভাব্য প্রসবের তারিখ</span>
                    <p className="text-sm font-mono font-black text-rose-600">{expectedCalvingDate || 'নির্ধারিত নয়'}</p>
                  </div>
                </div>
              </div>

              {/* Offspring / Progeny Record */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>বাছুর / বাচ্চার সংখ্যা ও পূর্ববর্তী প্রজনন রেকর্ড</span>
                </h4>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                  <span className="text-xs font-bold text-slate-600">খামারে জন্ম দেওয়া মোট সন্তান সংখ্যা:</span>
                  <span className="text-xl font-black font-mono text-emerald-600">{offspringCount} টি</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  * প্রতিটি সুস্থ বাছুর বা নতুন বাচ্চা খামারের সার্বিক অ্যাসেট ভ্যালু বাড়িয়ে তোলে।
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAL & INDIVIDUAL LEDGER */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">প্রারম্ভিক ক্রয়মূল্য</span>
                  <p className="text-2xl font-black font-mono text-slate-800">{stats.purchasePrice.toLocaleString('bn-BD')} ৳</p>
                  <span className="text-[10px] text-slate-400">মূলধন বিনিয়োগ</span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">আজ পর্যন্ত খাদ্য খরচ</span>
                  <p className="text-2xl font-black font-mono text-emerald-600">{stats.totalFeedCost.toLocaleString('bn-BD')} ৳</p>
                  <span className="text-[10px] text-slate-400">দৈনিক খাবার এন্ট্রি থেকে সংকলিত</span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">বর্তমান আনুমানিক বাজারদর</span>
                  <p className="text-2xl font-black font-mono text-indigo-600">{stats.currentSellingPrice.toLocaleString('bn-BD')} ৳</p>
                  <span className="text-[10px] text-emerald-600 font-bold">লাইভ ভ্যালুয়েশন</span>
                </div>
              </div>

              {/* Profit & ROI Projection */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider">প্রত্যাশিত নিট মুনাফা (Net Profit Margin)</span>
                    <p className="text-3xl font-black font-mono mt-1">
                      +{(animal.sellingPrice - stats.totalExpense).toLocaleString('bn-BD')} ৳
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                    📈
                  </div>
                </div>
                <div className="pt-3 border-t border-white/20 text-xs text-emerald-100 flex justify-between">
                  <span>সর্বমোট বিনিয়োগ খরচ: {stats.totalExpense.toLocaleString('bn-BD')} ৳</span>
                  <span className="font-bold text-white">ROI: {Math.round(((animal.sellingPrice - stats.totalExpense) / stats.totalExpense) * 100)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>ডিজিটাল বায়ো-ট্যাগ আইডি সংকলিত</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest cursor-pointer transition-all"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
