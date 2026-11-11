import React, { useState, useEffect } from 'react';
import { farmStore, getDefaultStructuredFeedPlan, getAutomatedFeedingSchedule } from '../services/farmStore';
import { LivestockItem, FeedLog, StructuredFeedItem, DailyFeedingRecord } from '../types';
import { 
  Utensils, Plus, Calendar, Clock, DollarSign, User, CheckCircle2, 
  XCircle, AlertCircle, ArrowUpRight, TrendingUp, ArrowLeft, Sparkles, 
  Check, ChevronDown, ChevronUp, Scale, RefreshCw, Mic, MicOff, Volume2, 
  Radio, MessageSquarePlus, Trash2
} from 'lucide-react';

interface DailyFeedLoggerProps {
  onBack?: () => void;
  hideHeader?: boolean;
}

export const DailyFeedLogger: React.FC<DailyFeedLoggerProps> = ({ onBack, hideHeader = false }) => {
  const [livestock, setLivestock] = useState<LivestockItem[]>([]);
  const [feedLogs, setFeedLogs] = useState<FeedLog[]>([]);
  const [activeTab, setActiveTab] = useState<'quick_tracker' | 'supervision_detail' | 'logs_history'>('quick_tracker');

  // Animal-specific expansion state for detailed supervision
  const [expandedAnimalId, setExpandedAnimalId] = useState<string | null>(null);
  
  // Custom Detailed Supervision Form state for expanded animal
  const [supervisionEatenMap, setSupervisionEatenMap] = useState<Record<string, Record<string, number>>>({}); // { animalId: { itemId: eatenKg } }
  const [employeeName, setEmployeeName] = useState('রহিম মিয়া (খামার সহকারী)');
  const [supervisionNotes, setSupervisionNotes] = useState('');
  
  // Voice-to-Text Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTarget, setRecordingTarget] = useState<'general' | { animalId: string; itemId?: string; type: 'eaten' | 'observation' } | null>(null);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [voiceHelperNotice, setVoiceHelperNotice] = useState<string | null>(null);

  // Toast notice state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Convert Bengali numerals to numbers
  const parseBanglaOrEnglishNumber = (text: string): number | null => {
    const bnNums: Record<string, string> = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
    const normalized = text.replace(/[০-৯]/g, m => bnNums[m] || m);
    const match = normalized.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  };

  // Web Speech API Voice-to-Text Handler in Bengali
  const startVoiceRecording = (target: 'general' | { animalId: string; itemId?: string; type: 'eaten' | 'observation' }) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerToast('ব্রাউজারে ভয়েস রিকগনিশন সাপোর্ট নেই। গুগল ক্রোম বা আধুনিক মোবাইল ব্রাউজার ব্যবহার করুন।');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setRecordingTarget(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingTarget(target);
        setSpeechTranscript('');
        setVoiceHelperNotice('🎙️ বাংলায় স্পষ্ট করে বলুন... (যেমন: "দুই দশমিক পাঁচ কেজি খেয়েছে" অথবা "পশুটি আজ স্বাভাবিক জাবর কাটছে")');
      };

      recognition.onresult = (e: any) => {
        let currentTranscript = '';
        for (let i = 0; i < e.results.length; i++) {
          currentTranscript += e.results[i][0].transcript;
        }
        setSpeechTranscript(currentTranscript);

        // Process final speech result
        if (e.results[0].isFinal) {
          const finalText = e.results[0][0].transcript.trim();
          handleVoiceTranscriptComplete(target, finalText);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech error:', err);
        setIsRecording(false);
        setRecordingTarget(null);
        setVoiceHelperNotice(null);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setRecordingTarget(null);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
      setRecordingTarget(null);
    }
  };

  const handleVoiceTranscriptComplete = (
    target: 'general' | { animalId: string; itemId?: string; type: 'eaten' | 'observation' },
    transcript: string
  ) => {
    if (target === 'general') {
      // General voice observation/feed logger
      setSupervisionNotes(prev => prev ? `${prev} । ${transcript}` : transcript);
      triggerToast(`ভয়েস রেকর্ড গ্রহণ করা হয়েছে: "${transcript}"`);
    } else if (target.type === 'eaten' && target.itemId) {
      // Numerical quantity extracted from voice
      const num = parseBanglaOrEnglishNumber(transcript);
      if (num !== null && !isNaN(num)) {
        setSupervisionEatenMap(prev => ({
          ...prev,
          [target.animalId]: {
            ...(prev[target.animalId] || {}),
            [target.itemId!]: num
          }
        }));
        triggerToast(`ভয়েস থেকে খাদ্যের পরিমাণ: ${num} কেজি সেট করা হয়েছে ✓`);
      } else {
        triggerToast(`রেকর্ডকৃত বার্তা: "${transcript}" (কোনো সংখ্যা পাওয়া যায়নি)`);
      }
    } else if (target.type === 'observation') {
      // Animal specific health or feed observation
      setSupervisionNotes(prev => prev ? `${prev} । ${transcript}` : transcript);
      triggerToast(`পর্যবেক্ষণ যুক্ত হয়েছে: "${transcript}"`);
    }
    setVoiceHelperNotice(null);
  };

  useEffect(() => {
    const update = () => {
      const live = farmStore.getLivestock();
      setLivestock(live);
      setFeedLogs(farmStore.getFeedLogs());
    };
    update();
    const unsubscribe = farmStore.subscribe(update);
    return () => unsubscribe();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const totalFeedCostAll = feedLogs.reduce((acc, l) => acc + (Number(l.costTaka) || 0), 0);
  const totalAmountKgAll = feedLogs.reduce((acc, l) => acc + (Number(l.amountKg) || 0), 0);

  // Quick toggle feeding status ("খাওয়ানো হয়েছে কিনা")
  const handleQuickToggleFeed = (animalId: string, currentStatus: boolean) => {
    farmStore.toggleQuickFeedStatus(animalId, !currentStatus, employeeName);
    triggerToast(!currentStatus ? 'খাবার প্রদান সফলভাবে নিশ্চিত করা হয়েছে ✓' : 'খাদ্য স্থিতি হালনাগাদ করা হয়েছে');
  };

  // Detailed Supervision Submit (কতটুকু খাইলো, কতটুকু বাঁচলো, বাজেট বিশ্লেষণ)
  const handleSaveSupervisionRecord = (animal: LivestockItem) => {
    const planItems = animal.structuredFeedPlan && animal.structuredFeedPlan.length > 0 
      ? animal.structuredFeedPlan 
      : getDefaultStructuredFeedPlan(animal.type).items;
    
    const eatenValues = supervisionEatenMap[animal.id] || {};

    const itemsServed = planItems.map(item => {
      const target = item.targetAmountKg;
      const eaten = eatenValues[item.id] !== undefined ? Number(eatenValues[item.id]) : target;
      const leftover = Math.max(0, Number((target - eaten).toFixed(2)));
      return {
        name: item.name,
        targetAmountKg: target,
        servedAmountKg: target,
        eatenAmountKg: eaten,
        leftoverAmountKg: leftover,
        unit: item.unit,
        costTaka: item.estimatedCostTaka,
      };
    });

    const totalCost = planItems.reduce((s, i) => s + i.estimatedCostTaka, 0);
    const budget = animal.dailyFeedBudget || totalCost;
    
    let budgetStatus: DailyFeedingRecord['budgetStatus'] = 'বাজেটের মধ্যে (Within Budget)';
    if (totalCost < budget * 0.95) budgetStatus = 'বাজেট সাশ্রয় (Saved)';
    else if (totalCost > budget * 1.05) budgetStatus = 'বাজেট অতিরিক্ত (Over Budget)';

    farmStore.recordDailyFeedingRecord({
      animalId: animal.id,
      animalName: animal.name,
      date: today,
      timeSlot: 'সকাল',
      isFed: true,
      fedBy: employeeName,
      feedItemsServed: itemsServed,
      totalCostTaka: totalCost,
      dailyBudgetTaka: budget,
      budgetStatus,
      notes: supervisionNotes || 'সঠিক পরিমাপে সুপারভিশন সম্পন্ন',
    });

    setExpandedAnimalId(null);
    triggerToast(`${animal.name}-এর খাবার ও অপচয় তদারকি সংরক্ষিত হয়েছে!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
       {toastMsg && (
         <div className="fixed top-6 right-6 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-6 h-6 text-white" />
            <span className="text-xs font-black">{toastMsg}</span>
         </div>
       )}

      {/* Back button */}
      {onBack && (
        <div className="flex items-center justify-start">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 transition-all shadow-sm group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-1 transition-transform" />
            <span>পেছনে ফিরে যান (Back)</span>
          </button>
        </div>
      )}

      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 rounded-full mb-2 border border-emerald-200/60">
              <Utensils className="w-4 h-4" />
              <span>দৈনিক খাদ্য তদারকি ও বাজেট ট্র্যাকার</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">খাবার প্রদান ও অপচয় তদারকি কেন্দ্র</h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs font-medium mt-1">
              প্রোফাইলে নির্ধারিত বাজেট ও খাদ্য উপাদান অনুযায়ী পশুকে সঠিক সময়ে খাওয়ানো হয়েছে কিনা এবং কতটুকু বেঁচে গেল তা তদারকি করুন।
            </p>
          </div>

          {/* Global Feed KPI Summary */}
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">মোট খাদ্য ব্যয়</p>
              <p className="text-2xl font-black text-emerald-600 font-mono">{totalFeedCostAll.toLocaleString('bn-BD')} <span className="text-xs font-bold">৳</span></p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">খাদ্য সরবরাহ</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white font-mono">{totalAmountKgAll.toLocaleString('bn-BD')} <span className="text-xs font-medium">কেজি</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/60 dark:bg-slate-800/60 p-1.5 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('quick_tracker')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'quick_tracker'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>দৈনিক খাওয়ানো তদারকি ("খাওয়ানো হয়েছে কিনা")</span>
        </button>
        <button
          onClick={() => setActiveTab('logs_history')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'logs_history'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>খাদ্য ব্যয় ও অপচয় লগ ইতিহাস ({feedLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Quick Feeding supervision Cards */}
      {activeTab === 'quick_tracker' && (
        <div className="space-y-6">
          <div className="bg-emerald-500/10 border border-emerald-300/40 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">আজকের খাদ্য তদারকি ও স্মার্ট ভয়েস লগ ({today})</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">খাবার দেওয়ার পর <span className="font-bold text-emerald-600">"খাওয়ানো হয়েছে ✓"</span> দিন অথবা মাইকে বাংলায় কথা বলে খাবারের কেজি ও মন্তব্য সরাসরি রেকর্ড করুন।</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              {/* Voice-to-Text General Observation Button */}
              <button
                onClick={() => startVoiceRecording('general')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                  isRecording && recordingTarget === 'general'
                    ? 'bg-rose-500 text-white animate-bounce ring-4 ring-rose-300'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                title="মাইকে বাংলায় কথা বলে খাদ্য বা পশুর পর্যবেক্ষণ রেকর্ড করুন"
              >
                {isRecording && recordingTarget === 'general' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecording && recordingTarget === 'general' ? 'ভয়েস শুনছি...' : '🎙️ বাংলায় মুখে বলুন'}</span>
              </button>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500">দায়িত্বপ্রাপ্ত:</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={e => setEmployeeName(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Voice Helper Feedback Banner */}
          {(isRecording || speechTranscript || voiceHelperNotice) && (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                    {voiceHelperNotice || 'ভয়েস-টু-টেক্সট সক্রিয়'}
                  </p>
                  {speechTranscript && (
                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 italic mt-0.5">
                      "{speechTranscript}"
                    </p>
                  )}
                </div>
              </div>

              {isRecording && (
                <button
                  onClick={() => setIsRecording(false)}
                  className="px-3 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-black cursor-pointer"
                >
                  রেকর্ড বন্ধ করুন
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {livestock.filter(a => a.status !== 'বিক্রিত (Sold)').map(animal => {
              const todayLog = animal.feedingLogs?.find(l => l.date === today);
              const isFedToday = Boolean(todayLog?.isFed);
              const isExpanded = expandedAnimalId === animal.id;
              const sched = getAutomatedFeedingSchedule(animal);

              const planItems = animal.structuredFeedPlan && animal.structuredFeedPlan.length > 0
                ? animal.structuredFeedPlan
                : getDefaultStructuredFeedPlan(animal.type).items;
              
              const totalDailyBudget = animal.dailyFeedBudget || planItems.reduce((s, i) => s + i.estimatedCostTaka, 0);

              return (
                <div
                  key={animal.id}
                  className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col overflow-hidden ${
                    isFedToday
                      ? 'border-emerald-300 dark:border-emerald-800/80 ring-4 ring-emerald-500/5'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Card Top Header */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase font-mono">
                            [{animal.id}] · {animal.type.split(' ')[0]}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[9px] font-black">
                            {sched.ageGroupLabel}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mt-1.5">
                          {animal.name}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">দৈনিক খাদ্য বাজেট</span>
                        <span className="text-lg font-black text-emerald-600 font-mono">{totalDailyBudget.toLocaleString('bn-BD')} ৳</span>
                      </div>
                    </div>

                    {/* Quick Toggle Button ("খাওয়ানো হয়েছে কিনা") */}
                    <button
                      onClick={() => handleQuickToggleFeed(animal.id, isFedToday)}
                      className={`w-full py-4 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md transform active:scale-95 ${
                        isFedToday
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                          : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                      }`}
                    >
                      {isFedToday ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-white" />
                          <span>আজকের খাবার প্রদান সম্পন্ন হয়েছে ✓</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 text-white animate-pulse" />
                          <span>খাওয়ানো হয়নি — টিক দিন (Fed Today)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Structured Feed Items List (আলাদা আলাদা খাবারের উপাদান ও পরিমাণ) */}
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">খাবারের উপাদানসমূহ (Feed Components)</span>
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">নির্ধারিত পরিমাণ</span>
                    </div>

                    <div className="space-y-2">
                      {planItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                          <div className="text-right">
                            <span className="font-black text-emerald-600 font-mono">{item.targetAmountKg} {item.unit}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">({item.estimatedCostTaka} ৳)</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Detailed Supervision Toggle */}
                    <button
                      onClick={() => setExpandedAnimalId(isExpanded ? null : animal.id)}
                      className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5 text-teal-600" />
                      <span>{isExpanded ? 'তদারকি প্যানেল গুটিয়ে নিন' : 'কতটুকু খাইলো ও কতটুকু বাঁচলো তদারকি'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Expanded Supervision Inputs (কতটুকু খাইলো, কতটুকু বাচলো, বাজেট সাশ্রয়) */}
                    {isExpanded && (
                      <div className="p-5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-teal-900 dark:text-teal-200 uppercase text-[10px] tracking-wider">খাওয়ার তদারকি ও অবশিষ্ট ওজন হিসেব</span>
                          <span className="text-[10px] font-bold text-teal-700">তারিখ: {today}</span>
                        </div>

                        <div className="space-y-3">
                          {planItems.map(item => {
                            const eatenVal = supervisionEatenMap[animal.id]?.[item.id] !== undefined
                              ? supervisionEatenMap[animal.id][item.id]
                              : item.targetAmountKg;
                            const leftoverVal = Math.max(0, Number((item.targetAmountKg - eatenVal).toFixed(2)));

                            return (
                              <div key={item.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-teal-100 dark:border-slate-800 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-slate-800 dark:text-white">{item.name}</span>
                                  <span className="text-[10px] text-slate-400 font-bold">বরাদ্দ: {item.targetAmountKg} {item.unit}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 items-center">
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="text-[9px] font-bold text-slate-400">কতটুকু খাইলো ({item.unit})</label>
                                      {/* Per-item Voice Dictation */}
                                      <button
                                        type="button"
                                        onClick={() => startVoiceRecording({ animalId: animal.id, itemId: item.id, type: 'eaten' })}
                                        className={`p-1 rounded-md transition-all cursor-pointer ${
                                          isRecording && recordingTarget && typeof recordingTarget === 'object' && recordingTarget.itemId === item.id
                                            ? 'bg-rose-500 text-white animate-bounce'
                                            : 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950'
                                        }`}
                                        title="মুখে বলে পরিমাণ লিখুন (যেমন: ২.৫ কেজি)"
                                      >
                                        <Mic className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <input
                                      type="number"
                                      step="0.05"
                                      value={eatenVal}
                                      onChange={e => {
                                        const val = Number(e.target.value);
                                        setSupervisionEatenMap(prev => ({
                                          ...prev,
                                          [animal.id]: {
                                            ...(prev[animal.id] || {}),
                                            [item.id]: val,
                                          }
                                        }));
                                      }}
                                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-emerald-600"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] font-bold text-slate-400 block mb-1">কতটুকু বাঁচলো / অবশিষ্ট</label>
                                    <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs font-black text-amber-700 font-mono">
                                      {leftoverVal} {item.unit}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-slate-500">তদারকি মন্তব্য / অপচয় ও পশুর স্বাস্থ্য পর্যবেক্ষণ</label>
                            {/* Observation Voice Dictation */}
                            <button
                              type="button"
                              onClick={() => startVoiceRecording({ animalId: animal.id, type: 'observation' })}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                                isRecording && recordingTarget && typeof recordingTarget === 'object' && recordingTarget.type === 'observation' && recordingTarget.animalId === animal.id
                                  ? 'bg-rose-500 text-white animate-bounce'
                                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                              title="মুখে বাংলায় পর্যবেক্ষণ রেকর্ড করুন"
                            >
                              <Mic className="w-3 h-3" />
                              <span>মুখে পর্যবেক্ষণ বলুন</span>
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="যেমন: খাবারের ১০% উচ্ছিষ্ট রয়েছে, গাভীটি সুস্থ ও চঞ্চল..."
                              value={supervisionNotes}
                              onChange={e => setSupervisionNotes(e.target.value)}
                              className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-slate-700 text-xs"
                            />
                            {supervisionNotes && (
                              <button
                                type="button"
                                onClick={() => setSupervisionNotes('')}
                                className="absolute right-2.5 top-2 text-slate-400 hover:text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleSaveSupervisionRecord(animal)}
                          className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                        >
                          তদারকি ডাটা সংরক্ষণ করুন
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Feeding Ledger History */}
      {activeTab === 'logs_history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">খাদ্য প্রদান ও অপচয় রেজিস্ট্রেশন ইতিহাস</h3>
              <p className="text-xs text-slate-500 font-medium">খামারের দৈনন্দিন খাদ্য ব্যয় ও তদারকি রিপোর্টের সময়ক্রম</p>
            </div>
            <Utensils className="w-6 h-6 text-emerald-600" />
          </div>

          <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4">তারিখ ও বেলা</th>
                  <th className="p-4">পশু / আইডি</th>
                  <th className="p-4">খাদ্য উপাদানসমূহ</th>
                  <th className="p-4 text-center">পরিমাণ</th>
                  <th className="p-4 text-right">খরচ (৳)</th>
                  <th className="p-4">দায়িত্বপ্রাপ্ত</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {feedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono">
                      <span className="font-bold text-slate-900 dark:text-white block">{log.date}</span>
                      <span className="text-[10px] text-emerald-600 font-sans font-bold">{log.timeSlot}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-slate-900 dark:text-white">{log.animalName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">[{log.animalId}]</span>
                    </td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                      {log.feedType}
                      {log.notes && <p className="text-[10px] text-slate-400 italic">"{log.notes}"</p>}
                    </td>
                    <td className="p-4 text-center font-black font-mono text-slate-800 dark:text-slate-200">
                      {log.amountKg} কেজি
                    </td>
                    <td className="p-4 text-right font-black font-mono text-emerald-600 text-sm">
                      {log.costTaka.toLocaleString('bn-BD')} ৳
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      {log.employeeName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
