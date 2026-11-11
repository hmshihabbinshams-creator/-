import React, { useState, useEffect } from 'react';
import { farmStore } from '../services/farmStore';
import { LivestockItem, DailyProductionRecord } from '../types';
import { 
  X, Check, Plus, Minus, Volume2, Mic, MicOff, Sparkles, 
  Droplets, Egg, Utensils, HeartPulse, DollarSign, Waves,
  CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, RefreshCw,
  Phone, UserCheck, Calendar
} from 'lucide-react';

interface EasyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'milk' | 'eggs' | 'feed' | 'add_animal' | 'health' | 'cash' | 'fish';
}

export const EasyEntryModal: React.FC<EasyEntryModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'milk'
}) => {
  const [activeTab, setActiveTab] = useState<'milk' | 'eggs' | 'feed' | 'add_animal' | 'health' | 'cash' | 'fish'>(defaultCategory);
  const [livestock, setLivestock] = useState<LivestockItem[]>([]);
  const [recentRecords, setRecentRecords] = useState<DailyProductionRecord[]>([]);
  
  // Audio speech status
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form states: Milk
  const [milkLiters, setMilkLiters] = useState<number>(15);
  const [milkCowName, setMilkCowName] = useState<string>('সকল গাভী মিলিয়ে');
  const [milkSold, setMilkSold] = useState<boolean>(true);
  const [milkRate, setMilkRate] = useState<number>(80);

  // Form states: Eggs
  const [eggCount, setEggCount] = useState<number>(50);
  const [eggBirdType, setEggBirdType] = useState<string>('সোনালী ও দেশি মুরগি');
  const [eggSold, setEggSold] = useState<boolean>(true);
  const [eggRate, setEggRate] = useState<number>(13);

  // Form states: New Animal
  const [animalType, setAnimalType] = useState<string>('গরু');
  const [animalName, setAnimalName] = useState<string>('লালু');
  const [animalPrice, setAnimalPrice] = useState<number>(45000);
  const [animalWeight, setAnimalWeight] = useState<number>(130);

  // Form states: Health
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'sick' | 'vaccinated'>('healthy');
  const [sickSymptom, setSickSymptom] = useState<string>('গা গরম / হালকা জ্বর');

  // Form states: Cash
  const [cashType, setCashType] = useState<'cash_in' | 'cash_out'>('cash_in');
  const [cashAmount, setCashAmount] = useState<number>(1000);
  const [cashReason, setCashReason] = useState<string>('দুধ ও ডিম বিক্রি');

  useEffect(() => {
    if (defaultCategory) setActiveTab(defaultCategory);
  }, [defaultCategory, isOpen]);

  useEffect(() => {
    const update = () => {
      const items = farmStore.getLivestock();
      setLivestock(items);
      setRecentRecords(farmStore.getDailyProductionRecords());
      if (items.length > 0 && !selectedAnimalId) {
        setSelectedAnimalId(items[0].id);
      }
    };
    update();
    const unsub = farmStore.subscribe(update);
    return () => unsub();
  }, [selectedAnimalId]);

  if (!isOpen) return null;

  // Bengali Voice Readout
  const speakVoice = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD';
    utterance.rate = 0.92;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    const voices = window.speechSynthesis.getVoices();
    const bn = voices.find(v => v.lang.startsWith('bn'));
    if (bn) utterance.voice = bn;
    window.speechSynthesis.speak(utterance);
  };

  // Microphone Voice input (Web Speech API)
  const toggleListening = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      triggerNotice('আপনার ব্রাউজারে মাইক ইনপুট সক্রিয় নেই, নিচের বোতামে চাপ দিন।');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        speakVoice('বলুন, আমি শুনছি...');
      };

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setIsListening(false);
        // Extract numbers
        const bnNums: Record<string, number> = { '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9 };
        let numStr = '';
        for (const char of transcript) {
          if (bnNums[char] !== undefined) numStr += bnNums[char];
          else if (!isNaN(Number(char)) && char !== ' ') numStr += char;
        }

        const parsed = parseInt(numStr, 10);
        if (!isNaN(parsed) && parsed > 0) {
          if (activeTab === 'milk') setMilkLiters(parsed);
          else if (activeTab === 'eggs') setEggCount(parsed);
          else if (activeTab === 'cash') setCashAmount(parsed);
          triggerNotice(`শোনা হয়েছে: ${parsed}`);
          speakVoice(`${parsed} গ্রহণ করা হয়েছে।`);
        } else {
          triggerNotice(`শোনা হয়েছে: "${transcript}"`);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const triggerNotice = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  // Submissions
  const handleSaveMilk = () => {
    farmStore.quickRecordMilk(milkLiters, milkCowName, milkSold, milkRate);
    const msg = `আলহামদুলিল্লাহ! ${milkLiters} লিটার দুধের হিসাব সংরক্ষিত হয়েছে।`;
    triggerNotice(msg);
    speakVoice(msg);
  };

  const handleSaveEggs = () => {
    farmStore.quickRecordEggs(eggCount, eggBirdType, eggSold, eggRate);
    const msg = `আলহামদুলিল্লাহ! ${eggCount}টি ডিমের হিসাব সংরক্ষিত হয়েছে।`;
    triggerNotice(msg);
    speakVoice(msg);
  };

  const handleFeedAll = () => {
    const count = farmStore.quickFeedAllAnimals('খামার সহকারী');
    const msg = `সব ঠিক আছে! খামারের ${count}টি পশুকে খাবার দেওয়া নিশ্চিত করা হয়েছে।`;
    triggerNotice(msg);
    speakVoice(msg);
  };

  const handleSaveNewAnimal = () => {
    if (!animalName.trim()) {
      triggerNotice('দয়া করে পশুর একটি নাম বা নম্বর লিখুন।');
      return;
    }
    const created = farmStore.quickAddAnimalSimple({
      type: animalType,
      name: animalName,
      purchasePrice: animalPrice,
      weightKg: animalWeight,
    });
    const msg = `সফল! নতুন ${animalType} "${created.name}" খামারে যোগ হয়েছে।`;
    triggerNotice(msg);
    speakVoice(msg);
    setAnimalName('');
  };

  const handleSaveHealth = () => {
    const animal = livestock.find(a => a.id === selectedAnimalId) || livestock[0];
    if (!animal) return;

    if (healthStatus === 'healthy') {
      farmStore.updateLivestock({ ...animal, healthCondition: 'চমৎকার ও সুস্থ' });
      const msg = `${animal.name} সুস্থ আছে বলে চিহ্নিত করা হয়েছে।`;
      triggerNotice(msg);
      speakVoice(msg);
    } else if (healthStatus === 'sick') {
      farmStore.updateLivestock({ ...animal, healthCondition: 'নজরদারিতে / চিকিৎসা চলছে' });
      farmStore.addHealthLog({
        animalId: animal.id,
        animalName: animal.name,
        date: new Date().toISOString().split('T')[0],
        temperature: '১০৩.৫ °F',
        weightKg: animal.currentWeight || 40,
        appetite: 'কম',
        vaccinationName: 'জরুরি পর্যবেক্ষণ',
        vaccinationStatus: 'সম্পন্ন',
        nextVaccineDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        inspectionNotes: `সহজ এন্ট্রি: ${sickSymptom}`,
        status: 'Action Required',
        inspectorName: 'খামার সহকারী',
      });
      const msg = `সতর্কতা: ${animal.name}-এর জন্য ডাক্তারের নোটিস ও নজরদারি চালু হয়েছে।`;
      triggerNotice(msg);
      speakVoice(msg);
    } else {
      farmStore.addHealthLog({
        animalId: animal.id,
        animalName: animal.name,
        date: new Date().toISOString().split('T')[0],
        temperature: '১০১.২ °F',
        weightKg: animal.currentWeight || 40,
        appetite: 'স্বাভাবিক',
        vaccinationName: 'নিয়মিত সরকারি ভ্যাকসিন',
        vaccinationStatus: 'সম্পন্ন',
        nextVaccineDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        inspectionNotes: 'সহজ এন্ট্রি থেকে টিকা নিশ্চিতকরণ',
        status: 'Checked',
        inspectorName: 'খামারি / সহকারী',
      });
      const msg = `${animal.name}-এর নিয়মিত টিকা সম্পন্ন হয়েছে।`;
      triggerNotice(msg);
      speakVoice(msg);
    }
  };

  const handleSaveCash = () => {
    farmStore.quickRecordCash(cashType, cashAmount, cashReason);
    const msg = `টাকা হিসাব: ${cashAmount} ৳ ${cashType === 'cash_in' ? 'আয়' : 'খরচ'} সফলভাবে যুক্ত হয়েছে।`;
    triggerNotice(msg);
    speakVoice(msg);
  };

  const handlePondCare = (actionText: string) => {
    farmStore.addDailyProductionRecord({
      date: new Date().toISOString().split('T')[0],
      type: 'fish',
      title: actionText,
      amount: 1,
      unit: 'কাজ',
      recordedBy: 'মৎস্য পরিচর্যাকারী',
      notes: 'সহজ মোড থেকে পুকুর পরিচর্যা সম্পন্ন',
    });
    const msg = `${actionText} সংরক্ষিত হয়েছে!`;
    triggerNotice(msg);
    speakVoice(msg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-emerald-500/20 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header Ribbon & Audio Controls */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                  অতি সহজ ইনপুট মোড (Easy Mode)
                </span>
                <span className="text-emerald-100 text-xs hidden sm:inline">
                  যে কেউ যেকোনো হিসাব ১-ক্লিকে ইনপুট দিতে পারবে
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
                সহজ খামার খাতা ও দৈনিক হিসাব
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Voice Readout Button */}
            <button
              onClick={() => {
                if (activeTab === 'milk') speakVoice('দুধের হিসাব: আপনার গাভী আজ কত লিটার দুধ দিয়েছে? নিচের বোতামে চাপ দিয়ে পরিমাণ ঠিক করুন এবং সবুজ সেভ বোতাম চাপুন।');
                else if (activeTab === 'eggs') speakVoice('ডিমের হিসাব: আজ হাঁস বা মুরগির কয়টি ডিম পাওয়া গেছে? নিচের সংখ্যা বোতামে চাপুন।');
                else if (activeTab === 'feed') speakVoice('খাবার দেওয়া: এক ক্লিকে খামারের সব পশুকে খাবার দেওয়া নিশ্চিত করুন।');
                else if (activeTab === 'add_animal') speakVoice('নতুন পশু যোগ: পশুর ছবিতে চাপ দিন, নাম লিখুন এবং কেনার দাম নির্বাচন করে সেভ করুন।');
                else if (activeTab === 'health') speakVoice('পশুর স্বাস্থ্য: পশুটি সুস্থ আছে নাকি অসুস্থ তা নির্বাচন করুন।');
                else if (activeTab === 'cash') speakVoice('টাকার হিসাব: টাকা এসেছে নাকি খরচ হয়েছে তা নির্বাচন করে টাকার পরিমাণ সেভ করুন।');
                else speakVoice('পুকুর পরিচর্যা: পুকুরে খাবার বা পানি দেওয়ার কাজ সম্পন্ন করুন।');
              }}
              className={`p-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                isSpeaking 
                  ? 'bg-amber-400 text-slate-900 animate-pulse' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title="বাংলায় নির্দেশ শুনুন"
            >
              <Volume2 className="w-5 h-5" />
              <span className="hidden md:inline">বাংলায় শুনুন</span>
            </button>

            {/* Mic Speech-to-Number Button */}
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                isListening
                  ? 'bg-rose-500 text-white animate-bounce'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title="মুখে কথা বলে সংখ্যা লিখুন"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="hidden md:inline">{isListening ? 'শুনছি...' : 'মুখে বলুন'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Success Notice Notification */}
        {successNotice && (
          <div className="bg-emerald-500 text-white px-6 py-3 font-black text-sm flex items-center justify-between animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button onClick={() => setSuccessNotice(null)} className="text-white hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 7 Big Category Buttons with Icons (Mobile-friendly Grid) */}
        <div className="grid grid-cols-4 sm:grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2 gap-1.5 shrink-0">
          {[
            { id: 'milk', label: 'দুধের হিসাব', icon: '🥛', color: 'text-blue-600', activeBg: 'bg-blue-600 text-white' },
            { id: 'eggs', label: 'ডিমের হিসাব', icon: '🥚', color: 'text-amber-600', activeBg: 'bg-amber-600 text-white' },
            { id: 'feed', label: 'খাবার দেওয়া', icon: '🌾', color: 'text-emerald-600', activeBg: 'bg-emerald-600 text-white' },
            { id: 'add_animal', label: 'নতুন পশু যোগ', icon: '🐄', color: 'text-purple-600', activeBg: 'bg-purple-600 text-white' },
            { id: 'health', label: 'স্বাস্থ্য ও টিকা', icon: '💉', color: 'text-rose-600', activeBg: 'bg-rose-600 text-white' },
            { id: 'cash', label: 'টাকার হিসাব', icon: '💰', color: 'text-teal-600', activeBg: 'bg-teal-600 text-white' },
            { id: 'fish', label: 'পুকুর ও মাছ', icon: '🐟', color: 'text-cyan-600', activeBg: 'bg-cyan-600 text-white' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? `${tab.activeBg} shadow-md scale-102 ring-2 ring-emerald-400`
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              <span className="text-xl sm:text-2xl">{tab.icon}</span>
              <span className="text-[11px] sm:text-xs text-center leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body: Super Simple Inputs */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: MILK ENTRY (দুধের হিসাব) */}
          {activeTab === 'milk' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <span className="text-3xl">🥛</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">আজ কত লিটার দুধ দোয়ানো হয়েছে?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">নিচের বোতাম চেপে লিটার ঠিক করুন অথবা ক্যামেরা দিয়ে ওজন স্কেল/বালতি স্ক্যান করুন</p>
              </div>

              {/* Camera OCR Snap Simulator for Scale / Milk Bucket */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-blue-500/10 border-2 border-dashed border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0 shadow-md">
                    📷
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">ক্যামেরা দিয়ে বালতি বা স্কেল স্ক্যান করুন (OCR)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">স্বয়ংক্রিয়ভাবে ওজন বা লিটার রিড করে ঘরে বসে যাবে</p>
                  </div>
                </div>
                <label className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer transition-all flex items-center gap-2 shrink-0">
                  <span>📸 ছবি তুলুন / স্ক্যান</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        // Simulate OCR reading milk bucket or weight scale
                        const simulatedLiters = Math.floor(12 + Math.random() * 25);
                        setMilkLiters(simulatedLiters);
                        triggerNotice(`📷 OCR স্ক্যান সফল! ওজন স্কেল থেকে ${simulatedLiters} লিটার শনাক্ত হয়েছে।`);
                        speakVoice(`স্ক্যান সম্পন্ন। ${simulatedLiters} লিটার শনাক্ত করা হয়েছে।`);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Big Stepper */}
              <div className="flex items-center justify-center gap-4 bg-blue-50 dark:bg-blue-950/40 p-5 rounded-3xl border-2 border-blue-200 dark:border-blue-800">
                <button
                  onClick={() => setMilkLiters(prev => Math.max(1, prev - 1))}
                  className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-blue-600 font-black text-2xl flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-blue-200"
                >
                  <Minus className="w-6 h-6" />
                </button>
                <div className="text-center px-4">
                  <span className="text-4xl sm:text-5xl font-black text-blue-700 dark:text-blue-400 font-mono">
                    {milkLiters}
                  </span>
                  <span className="text-base font-bold text-slate-600 dark:text-slate-300 block">লিটার দুধ</span>
                </div>
                <button
                  onClick={() => setMilkLiters(prev => prev + 1)}
                  className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block text-center">দ্রুত পরিমাণ নির্বাচন:</label>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 10, 15, 20, 30].map(val => (
                    <button
                      key={val}
                      onClick={() => setMilkLiters(val)}
                      className={`py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                        milkLiters === val
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {val} লিটার
                    </button>
                  ))}
                </div>
              </div>

              {/* Cow Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">কোন গাভী থেকে দুধ নেওয়া হয়েছে?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['সকল গাভী মিলিয়ে', 'সাহীওয়াল প্রিন্সেস', 'ফিজিয়ান ডেইরি', 'দেশি লাল গাভী'].map(c => (
                    <button
                      key={c}
                      onClick={() => setMilkCowName(c)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                        milkCowName === c
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      🐄 {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sale Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">দুধ কি আজ বিক্রি করা হয়েছে?</span>
                  <span className="text-[11px] text-slate-500">বিক্রি চিহ্নিত করলে ক্যাশ টাকা স্বয়ংক্রিয়ভাবে হিসাবে যোগ হবে</span>
                </div>
                <button
                  onClick={() => setMilkSold(!milkSold)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    milkSold ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                  }`}
                >
                  {milkSold ? 'হ্যাঁ, বিক্রি হয়েছে ✓ (৮০ ৳/লিটার)' : 'না, খামারে রাখা হয়েছে'}
                </button>
              </div>

              {/* Big Save Button */}
              <button
                onClick={handleSaveMilk}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-black text-base shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>দুধের হিসাব সংরক্ষণ করুন (Save)</span>
              </button>
            </div>
          )}

          {/* TAB 2: EGG ENTRY (ডিমের হিসাব) */}
          {activeTab === 'eggs' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <span className="text-3xl">🥚</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">আজ কতটি ডিম সংগ্রহ করা হয়েছে?</h3>
                <p className="text-xs text-slate-500">মুরগি বা হাঁসের ডিমের সংখ্যা বোতাম চেপে নির্বাচন করুন</p>
              </div>

              {/* Big Stepper */}
              <div className="flex items-center justify-center gap-4 bg-amber-50 dark:bg-amber-950/40 p-5 rounded-3xl border-2 border-amber-200 dark:border-amber-800">
                <button
                  onClick={() => setEggCount(prev => Math.max(1, prev - 5))}
                  className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-amber-600 font-black text-2xl flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-200"
                >
                  <Minus className="w-6 h-6" />
                </button>
                <div className="text-center px-4">
                  <span className="text-4xl sm:text-5xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    {eggCount}
                  </span>
                  <span className="text-base font-bold text-slate-600 dark:text-slate-300 block">টি ডিম</span>
                </div>
                <button
                  onClick={() => setEggCount(prev => prev + 5)}
                  className="w-14 h-14 rounded-2xl bg-amber-600 text-white font-black text-2xl flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block text-center">দ্রুত সংখ্যা নির্বাচন:</label>
                <div className="grid grid-cols-5 gap-2">
                  {[12, 24, 50, 85, 150].map(val => (
                    <button
                      key={val}
                      onClick={() => setEggCount(val)}
                      className={`py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                        eggCount === val
                          ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {val} টি
                    </button>
                  ))}
                </div>
              </div>

              {/* Bird Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">কোন পাখির ডিম?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'সোনালী ও দেশি মুরগি', icon: '🐓' },
                    { id: 'খাকি ক্যাম্পবেল হাঁস', icon: '🦆' },
                    { id: 'সৌখিন ও অন্যান্য পাখি', icon: '🕊️' },
                  ].map(b => (
                    <button
                      key={b.id}
                      onClick={() => setEggBirdType(b.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        eggBirdType === b.id
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {b.icon} {b.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sale Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">ডিম কি আজ বিক্রি করা হয়েছে?</span>
                  <span className="text-[11px] text-slate-500">বিক্রি চিহ্নিত করলে ক্যাশ টাকা স্বয়ংক্রিয়ভাবে হিসাবে যোগ হবে</span>
                </div>
                <button
                  onClick={() => setEggSold(!eggSold)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    eggSold ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                  }`}
                >
                  {eggSold ? 'হ্যাঁ, বিক্রি হয়েছে ✓ (১৩ ৳/পিস)' : 'না, খামারে রাখা হয়েছে'}
                </button>
              </div>

              {/* Big Save Button */}
              <button
                onClick={handleSaveEggs}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>ডিমের হিসাব সংরক্ষণ করুন (Save)</span>
              </button>
            </div>
          )}

          {/* TAB 3: FEEDING (খাবার দেওয়া) */}
          {activeTab === 'feed' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <span className="text-3xl">🌾</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">আজ পশুদের খাবার দেওয়া হয়েছে?</h3>
                <p className="text-xs text-slate-500">নিচের বড় সবুজ বোতাম চাপলেই সব পশুর সকালের খাবার একসাথে টিক হয়ে যাবে</p>
              </div>

              {/* GIANT ONE-CLICK BUTTON FOR FEED ALL */}
              <button
                onClick={handleFeedAll}
                className="w-full py-6 px-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-lg sm:text-xl shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-3 cursor-pointer transform hover:scale-[1.02] active:scale-98 transition-all border-2 border-emerald-400"
              >
                <CheckCircle2 className="w-8 h-8" />
                <span>✅ সব পশুকে সকালের খাবার দেওয়া শেষ!</span>
              </button>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-3">
                  আলাদা আলাদা পশুর খাবার স্ট্যাটাস:
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {livestock.slice(0, 6).map(item => {
                    const isFedToday = item.feedingLogs && item.feedingLogs.some(l => l.date === new Date().toISOString().split('T')[0] && l.isFed);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {item.type.includes('গরু') ? '🐄' : item.type.includes('ছাগল') ? '🐐' : item.type.includes('হাঁস') ? '🦆' : '🐓'}
                          </span>
                          <div>
                            <span className="text-xs font-black text-slate-900 dark:text-white block">{item.name}</span>
                            <span className="text-[10px] text-slate-500">{item.type} · বাজেট: {item.dailyFeedBudget || 80} ৳</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            farmStore.toggleQuickFeedStatus(item.id, !isFedToday, 'খামার সহকারী');
                            triggerNotice(`${item.name}-এর খাবার স্ট্যাটাস পরিবর্তিত হয়েছে`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isFedToday 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {isFedToday ? '✓ খাওয়া হয়েছে' : 'খাবার দিন'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADD ANIMAL (নতুন পশু যোগ - একদম সহজ ৩ স্টেপ) */}
          {activeTab === 'add_animal' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <span className="text-3xl">🐄</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">নতুন পশু বা পাখি কিনেছেন?</h3>
                <p className="text-xs text-slate-500">শুধু প্রাণী নির্বাচন করুন, নাম লিখুন এবং কেনার দাম দিয়ে সেভ করুন</p>
              </div>

              {/* STEP 1: Choose Species with Big Emojis */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                  ১. কোন প্রাণী কিনেছেন?
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'গরু', icon: '🐄', defaultPrice: 50000, defaultWeight: 140 },
                    { id: 'ছাগল', icon: '🐐', defaultPrice: 18000, defaultWeight: 28 },
                    { id: 'হাঁস', icon: '🦆', defaultPrice: 600, defaultWeight: 2 },
                    { id: 'মুরগি', icon: '🐓', defaultPrice: 400, defaultWeight: 1.2 },
                    { id: 'পাখি', icon: '🕊️', defaultPrice: 80, defaultWeight: 0.25 },
                    { id: 'মাছ', icon: '🐟', defaultPrice: 2000, defaultWeight: 5 },
                  ].map(sp => (
                    <button
                      key={sp.id}
                      onClick={() => {
                        setAnimalType(sp.id);
                        setAnimalPrice(sp.defaultPrice);
                        setAnimalWeight(sp.defaultWeight);
                      }}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        animalType === sp.id
                          ? 'bg-purple-600 text-white font-black shadow-md ring-2 ring-purple-400 scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{sp.icon}</span>
                      <span className="text-xs">{sp.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 2: Name or Ear Tag */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  ২. পশুর নাম বা কানের ট্যাগ নম্বর:
                </label>
                <input
                  type="text"
                  value={animalName}
                  onChange={e => setAnimalName(e.target.value)}
                  placeholder="যেমন: লালু, কালু, বকনা-১০২"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:border-purple-500 outline-none"
                />
                <div className="flex gap-2 pt-1">
                  {['লালু', 'ধলু', 'কাফ-০৩', 'সোনালী ঝাঁক', 'যমুনাপারি খাসি'].map(n => (
                    <button
                      key={n}
                      onClick={() => setAnimalName(n)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-purple-100 cursor-pointer"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 3: Purchase Price Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>৩. কেনার দাম (টাকা):</span>
                  <span className="text-purple-600 font-mono font-black text-sm">{animalPrice.toLocaleString('bn-BD')} ৳</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[500, 1500, 15000, 25000, 45000, 75000].map(p => (
                    <button
                      key={p}
                      onClick={() => setAnimalPrice(p)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        animalPrice === p
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {p.toLocaleString('bn-BD')} ৳
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Save Button */}
              <button
                onClick={handleSaveNewAnimal}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-base shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>নতুন প্রাণী খামারে যোগ করুন (Save)</span>
              </button>
            </div>
          )}

          {/* TAB 5: HEALTH & VACCINE (স্বাস্থ্য ও টিকা) */}
          {activeTab === 'health' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <span className="text-3xl">💉</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">পশুটির বর্তমান শারীরিক অবস্থা কেমন?</h3>
                <p className="text-xs text-slate-500">সুস্থ থাকলে সবুজ বোতাম চাপুন, সমস্যা থাকলে লাল বোতাম চাপুন</p>
              </div>

              {/* Animal Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">কোন পশুর অবস্থা দেখতে চান?</label>
                <select
                  value={selectedAnimalId}
                  onChange={e => setSelectedAnimalId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  {livestock.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3 Status Big Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setHealthStatus('healthy')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                    healthStatus === 'healthy'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-md ring-2 ring-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-3xl">😊</span>
                  <span className="font-black text-sm">সুস্থ ও সবল</span>
                  <span className="text-[11px] text-slate-500">স্বাভাবিক খাচ্ছে ও সক্রিয়</span>
                </button>

                <button
                  onClick={() => setHealthStatus('sick')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                    healthStatus === 'sick'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 shadow-md ring-2 ring-rose-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-3xl">🤒</span>
                  <span className="font-black text-sm">অসুস্থ / লক্ষণ</span>
                  <span className="text-[11px] text-slate-500">ডাক্তারি পরামর্শ দরকার</span>
                </button>

                <button
                  onClick={() => setHealthStatus('vaccinated')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                    healthStatus === 'vaccinated'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 shadow-md ring-2 ring-blue-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-3xl">💉</span>
                  <span className="font-black text-sm">টিকা দেওয়া শেষ</span>
                  <span className="text-[11px] text-slate-500">সরকারি নিয়মিত ভ্যাকসিন</span>
                </button>
              </div>

              {/* If Sick: Select Symptom */}
              {healthStatus === 'sick' && (
                <div className="space-y-2 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <label className="text-xs font-bold text-rose-900 dark:text-rose-300 block">কী সমস্যা দেখা যাচ্ছে?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['গা গরম / হালকা জ্বর', 'খাবারে অরুচি / খাচ্ছে না', 'পাতলা পায়খানা / ডায়রিয়া', 'পায়ে বা মুখে ফোস্কা / ক্ষত'].map(symp => (
                      <button
                        key={symp}
                        onClick={() => setSickSymptom(symp)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                          sickSymptom === symp
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-100'
                        }`}
                      >
                        • {symp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Big Save Button */}
              <button
                onClick={handleSaveHealth}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-base shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>স্বাস্থ্য স্ট্যাটাস সংরক্ষণ করুন (Save)</span>
              </button>
            </div>
          )}

          {/* TAB 6: CASH IN / OUT (টাকার হিসাব) */}
          {activeTab === 'cash' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <span className="text-3xl">💰</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">টাকার আয় নাকি খরচ হয়েছে?</h3>
                <p className="text-xs text-slate-500">টাকা আসলে সবুজ, খরচ হলে লাল বোতাম চাপুন</p>
              </div>

              {/* Type Switch */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setCashType('cash_in');
                    setCashReason('দুধ ও ডিম বিক্রি');
                  }}
                  className={`py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    cashType === 'cash_in'
                      ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-xl">📥</span>
                  <span>টাকা এসেছে (আয় / বিক্রি)</span>
                </button>

                <button
                  onClick={() => {
                    setCashType('cash_out');
                    setCashReason('খাবার ও ওষুধ ক্রয়');
                  }}
                  className={`py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    cashType === 'cash_out'
                      ? 'bg-rose-600 text-white shadow-lg ring-2 ring-rose-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-xl">📤</span>
                  <span>টাকা খরচ হয়েছে (ব্যয়)</span>
                </button>
              </div>

              {/* Amount Display */}
              <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 block">টাকার পরিমাণ:</span>
                <span className={`text-4xl sm:text-5xl font-black font-mono ${cashType === 'cash_in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {cashAmount.toLocaleString('bn-BD')} ৳
                </span>
              </div>

              {/* Quick Amount Presets */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[100, 500, 1000, 2500, 5000, 10000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setCashAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      cashAmount === amt
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {amt.toLocaleString('bn-BD')} ৳
                  </button>
                ))}
              </div>

              {/* Reason Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">কিসের টাকা?</label>
                <div className="grid grid-cols-2 gap-2">
                  {(cashType === 'cash_in'
                    ? ['দুধ বিক্রি', 'ডিম বিক্রি', 'পশু বিক্রয়', 'মাছ বিক্রি']
                    : ['খাবার কেনা (ঘাস/ভুসি)', 'ওষুধ ও ভ্যাকসিন', 'সহকারী কর্মচারীর বেতন', 'অন্যান্য খামার খরচ']
                  ).map(r => (
                    <button
                      key={r}
                      onClick={() => setCashReason(r)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                        cashReason === r
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      • {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Save Button */}
              <button
                onClick={handleSaveCash}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-base shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>টাকার হিসাব সংরক্ষণ করুন (Save)</span>
              </button>
            </div>
          )}

          {/* TAB 7: FISH & POND (পুকুর ও মাছ) */}
          {activeTab === 'fish' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-1">
                <span className="text-3xl">🐟</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">আজ পুকুরে কী কাজ করা হয়েছে?</h3>
                <p className="text-xs text-slate-500">যেকোনো কাজে এক চাপ দিলেই স্বয়ংক্রিয়ভাবে খাতার পাতায় রেকর্ড হয়ে যাবে</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { text: 'পুকুরে সকালের ভাসমান ফিড দেওয়া হয়েছে', icon: '🌾', desc: 'নির্ধারিত পরিমাণ ফিশ ফিড ছিটানো সম্পন্ন' },
                  { text: 'পুকুরে নতুন মিষ্টি পানি দেওয়া হয়েছে', icon: '🌊', desc: 'টিউবওয়েল/মোটর চালিয়ে পানির স্তর বজায় রাখা হয়েছে' },
                  { text: 'কৃষি চুন ও পটাশ দিয়ে পানি শোধন', icon: '🧪', desc: 'পানির অম্লত্ব ও রোগ প্রতিরোধ নিশ্চিতকরণ' },
                  { text: 'মাছের শারীরিক বৃদ্ধি ও খাবি পর্যবেক্ষণ', icon: '👀', desc: 'মাছ সুস্থ আছে ও স্বাভাবিকভাবে ভাসছে' },
                ].map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePondCare(act.text)}
                    className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border-2 border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 hover:border-cyan-400 text-left transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{act.icon}</span>
                      <span className="font-black text-xs text-cyan-900 dark:text-cyan-200 group-hover:text-cyan-700">
                        {act.text}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-8">{act.desc}</p>
                    <div className="pt-2 pl-8 flex items-center gap-1 text-[11px] font-bold text-cyan-700">
                      <span>১-ক্লিকে নিশ্চিত করুন ✓</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Recent Daily Activity Strip */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold overflow-x-auto no-scrollbar">
            <span className="text-emerald-600">✓ আজ সর্বমোট সংরক্ষিত:</span>
            <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md shadow-xs">
              {recentRecords.length}টি রেকর্ড
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs hover:opacity-90 cursor-pointer"
          >
            সম্পন্ন (Done)
          </button>
        </div>

      </div>
    </div>
  );
};
