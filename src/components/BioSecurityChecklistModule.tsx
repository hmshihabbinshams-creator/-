import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, CheckCircle2, Clock, 
  Sparkles, AlertTriangle, Droplets, Check, Plus, 
  RotateCcw, Printer, Filter, Info, ChevronDown, 
  Trash2, Flame, HeartPulse, Stethoscope, CheckCheck,
  Calendar, Layers, Shield
} from 'lucide-react';

export interface BiosecurityTask {
  id: string;
  title: string;
  category: 'shed' | 'footbath' | 'feeder_water' | 'quarantine' | 'drainage' | 'staff_hygiene';
  categoryLabel: string;
  shift: 'morning' | 'noon' | 'evening';
  shiftLabel: string;
  chemical: string;
  dosage: string;
  targetArea: string;
  timeSlot: string;
  isCompleted: boolean;
  completedAt?: string;
  assignedStaff: string;
  isHighRisk?: boolean;
}

const INITIAL_TASKS: BiosecurityTask[] = [
  {
    id: 'bio-1',
    title: 'খামারের মূল ফটক ও ফুটবাথ ডিপের দ্রবণ পরিবর্তন ও রিফিল',
    category: 'footbath',
    categoryLabel: 'ফুটবাথ ও ভেহিকেল ডিপ',
    shift: 'morning',
    shiftLabel: 'সকাল',
    chemical: 'ব্লিচিং পাউডার + কস্টিক সোডা',
    dosage: '২% মিশ্রণ (১০০ লিটার পানিতে ২ কেজি ব্লিচিং ও ৫০০ গ্রাম কস্টিক)',
    targetArea: 'প্রধান গেট, শেড-১ ও শেড-২ এর প্রবেশদ্বার',
    timeSlot: 'সকাল ০৬:৩০ - ০৭:০০',
    isCompleted: true,
    completedAt: 'সকাল ০৬:৪৫ AM',
    assignedStaff: 'আব্দুল কাদের (গেটরক্ষী)',
    isHighRisk: true
  },
  {
    id: 'bio-2',
    title: 'ক্যাটেল ও ডেইরি শেডের মেঝে জীবাণুনাশক স্প্রে ও ফগিং',
    category: 'shed',
    categoryLabel: 'শেড স্যানিটেশন',
    shift: 'morning',
    shiftLabel: 'সকাল',
    chemical: 'ভাইরকন-এস (Virkon-S)',
    dosage: '১:১০০ অনুপাত (প্রতি ১০ লিটার পানিতে ১০০ গ্রাম)',
    targetArea: 'শেড-১ (গাভী ও ষাঁড় জোন)',
    timeSlot: 'সকাল ০৭:১৫ - ০৮:০০',
    isCompleted: true,
    completedAt: 'সকাল ০৭:৫০ AM',
    assignedStaff: 'করিম হোসেন (সিনিয়র শেড কিপার)'
  },
  {
    id: 'bio-3',
    title: 'পশুখাদ্যের গামলা ও পানির পাত্র (ফিডার ও ড্রিংকার) গরম পানি দিয়ে স্ক্রাবিং',
    category: 'feeder_water',
    categoryLabel: 'ফিডার ও ড্রিংকার',
    shift: 'morning',
    shiftLabel: 'সকাল',
    chemical: 'পটাশিয়াম পারম্যাঙ্গানেট হালকা দ্রবণ',
    dosage: 'হালকা বেগুনী/গোলাপী জল (০.১% দ্রবণ)',
    targetArea: 'সকল শেডের পানির নালা ও ফিডিং ট্রাফ',
    timeSlot: 'সকাল ০৮:০০ - ০৮:৪৫',
    isCompleted: true,
    completedAt: 'সকাল ০৮:৩০ AM',
    assignedStaff: 'সফিকুল ইসলাম'
  },
  {
    id: 'bio-4',
    title: 'ছাগল ও ভেড়া পেনের মাচা ও লিটার ব্লিচিং ডাস্টিং',
    category: 'shed',
    categoryLabel: 'শেড স্যানিটেশন',
    shift: 'morning',
    shiftLabel: 'সকাল',
    chemical: 'কৃষি চুন ও ব্লিচিং পাউডার মিশ্রণ',
    dosage: '৪:১ অনুপাত (শুকনো পাউডার ডাস্টিং)',
    targetArea: 'শেড-২ (ব্ল্যাক বেঙ্গল ও তোতাপুরী জোন)',
    timeSlot: 'সকাল ০৯:০০ - ০৯:৪৫',
    isCompleted: true,
    completedAt: 'সকাল ০৯:৪০ AM',
    assignedStaff: 'করিম হোসেন'
  },
  {
    id: 'bio-5',
    title: 'কোয়ারেন্টাইন জোন ও আইসোলেশন শেড কঠোর স্বাস্থ্যবিধি নিরীক্ষা',
    category: 'quarantine',
    categoryLabel: 'কোয়ারেন্টাইন ও আইসোলেশন',
    shift: 'noon',
    shiftLabel: 'দুপুর',
    chemical: 'গ্লুটারালডিহাইড বেসড বায়োসাইড',
    dosage: '১:২০০ ঘন অনুপাত',
    targetArea: 'নতুন আগত ও অসুস্থ পশুর পৃথকীকরণ শেড',
    timeSlot: 'দুপুর ১২:০০ - ১২:৪৫',
    isCompleted: false,
    assignedStaff: 'ডাঃ মোস্তাফিজুর রহমান (ভেটেরিনারি সার্জন)',
    isHighRisk: true
  },
  {
    id: 'bio-6',
    title: 'খামার কর্মীদের অ্যাপ্রন, গামবুট ও সুরক্ষা গিয়ার স্যানিটাইজিং অডিট',
    category: 'staff_hygiene',
    categoryLabel: 'স্টাফ ও পরিচ্ছন্নতা গিয়ার',
    shift: 'noon',
    shiftLabel: 'দুপুর',
    chemical: '৭৫% আইসোপ্রোপাইল অ্যালকোহল ও ক্লোরহেক্সিডিন স্প্রে',
    dosage: 'সরাসরি স্প্রে ও বুট ওয়াশ',
    targetArea: 'স্টাফ চেঞ্জিং রুম ও ডিসইনফেকশন চেম্বার',
    timeSlot: 'দুপুর ০১:০০ - ০১:৩০',
    isCompleted: false,
    assignedStaff: 'ফার্ম ইনচার্জ'
  },
  {
    id: 'bio-7',
    title: 'পোল্ট্রি হ্যাচারি ও লেয়ার শেডের লিটার উল্টানো ও অ্যারোসল স্প্রে',
    category: 'shed',
    categoryLabel: 'শেড স্যানিটেশন',
    shift: 'noon',
    shiftLabel: 'দুপুর',
    chemical: 'টিএইচফোর (TH4+) অথবা বায়োক্লিন স্প্রে',
    dosage: '১:২৫০ অনুপাত',
    targetArea: 'পোল্ট্রি শেড-৩ ও হ্যাচারি ইনকিউবেটর রুম',
    timeSlot: 'দুপুর ০২:০০ - ০২:৪৫',
    isCompleted: false,
    assignedStaff: 'সফিকুল ইসলাম'
  },
  {
    id: 'bio-8',
    title: 'মৎস্য হ্যাচারি ও পুকুর পাড়ের ড্রেনগুলোতে কৃষি চুন ছিটানো',
    category: 'drainage',
    categoryLabel: 'ড্রেনেজ ও বর্জ্য লাইন',
    shift: 'evening',
    shiftLabel: 'বিকাল/সন্ধ্যা',
    chemical: 'ক্যালসিয়াম কার্বনেট (কৃষি চুন)',
    dosage: '১ কেজি প্রতি ১০০ মিটার ড্রেন লাইনে',
    targetArea: 'পুকুর-১ ও পুকুর-২ এর সংযোগ ড্রেনেজ চ্যানেল',
    timeSlot: 'বিকাল ০৪:৩০ - ০৫:১৫',
    isCompleted: false,
    assignedStaff: 'আব্দুল কাদের'
  },
  {
    id: 'bio-9',
    title: 'দৈনিক বর্জ্য, গোবর ও মেস অপসারণ পরবর্তী ডাম্পিং পয়েন্ট জীবাণুমুক্তকরণ',
    category: 'drainage',
    categoryLabel: 'ড্রেনেজ ও বর্জ্য লাইন',
    shift: 'evening',
    shiftLabel: 'বিকাল/সন্ধ্যা',
    chemical: 'ফেনল ও ক্রিসল বেসড অ্যান্টিসেপটিক',
    dosage: '৫% গাঢ় দ্রবণ',
    targetArea: 'বায়োগ্যাস প্ল্যান্ট সংলগ্ন স্লারি পিট ও বর্জ্য কম্পোস্ট শেড',
    timeSlot: 'বিকাল ০৫:৩০ - ০৬:১৫',
    isCompleted: false,
    assignedStaff: 'সফিকুল ইসলাম',
    isHighRisk: true
  },
  {
    id: 'bio-10',
    title: 'রাত্রিকালীন শেড লক-ইন ও ওভারহেড ওয়াটার ট্যাংক পাইপলাইন ক্লোরিনেশন ফ্লাশ',
    category: 'feeder_water',
    categoryLabel: 'ফিডার ও ড্রিংকার',
    shift: 'evening',
    shiftLabel: 'বিকাল/সন্ধ্যা',
    chemical: 'সোডিয়াম হাইপোক্লোরাইট (লিকুইড ক্লোরিন)',
    dosage: '২ পিপিএম (PPM) নিরাপদ ফিল্টারড ওয়াটার ফ্লাশ',
    targetArea: 'মূল সরবরাহ পাইপলাইন ও ৫০০০ লিটার প্রধান রিজার্ভার',
    timeSlot: 'সন্ধ্যা ০৬:৩০ - ০৭:১৫',
    isCompleted: false,
    assignedStaff: 'ফার্ম ইনচার্জ'
  }
];

export const BioSecurityChecklistModule: React.FC = () => {
  const [tasks, setTasks] = useState<BiosecurityTask[]>(() => {
    try {
      const saved = localStorage.getItem('rs_farm_biosecurity_tasks_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load biosecurity tasks:', e);
    }
    return INITIAL_TASKS;
  });

  const [activeShiftFilter, setActiveShiftFilter] = useState<'all' | 'morning' | 'noon' | 'evening' | 'high_risk'>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showChemicalGuide, setShowChemicalGuide] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<BiosecurityTask['category']>('shed');
  const [newShift, setNewShift] = useState<BiosecurityTask['shift']>('morning');
  const [newChemical, setNewChemical] = useState('ভাইরকন-এস (Virkon-S)');
  const [newDosage, setNewDosage] = useState('১:১০০ অনুপাত');
  const [newTargetArea, setNewTargetArea] = useState('শেড-১ ক্যাটেল জোন');
  const [newTimeSlot, setNewTimeSlot] = useState('সকাল ০৭:০০ - ০৭:৩০');
  const [newAssignedStaff, setNewAssignedStaff] = useState('করিম হোসেন');
  const [newIsHighRisk, setNewIsHighRisk] = useState(false);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('rs_farm_biosecurity_tasks_v1', JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to persist tasks:', e);
    }
  }, [tasks]);

  // Toggle completion of a task
  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.isCompleted;
        const nowBengali = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        return {
          ...t,
          isCompleted: nextState,
          completedAt: nextState ? nowBengali : undefined
        };
      }
      return t;
    }));
  };

  // Mark all completed
  const handleMarkAllDone = () => {
    const nowBengali = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    setTasks(prev => prev.map(t => ({
      ...t,
      isCompleted: true,
      completedAt: t.completedAt || nowBengali
    })));
  };

  // Reset checklist for new day
  const handleResetAll = () => {
    if (window.confirm('আপনি কি আজকের বায়োসিকিউরিটি চেকলিস্ট নতুন দিনের জন্য রিসেট করতে চান?')) {
      setTasks(INITIAL_TASKS.map(t => ({
        ...t,
        isCompleted: false,
        completedAt: undefined
      })));
    }
  };

  // Delete custom task
  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Add custom task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const catLabels: Record<string, string> = {
      shed: 'শেড স্যানিটেশন',
      footbath: 'ফুটবাথ ও ভেহিকেল ডিপ',
      feeder_water: 'ফিডার ও ড্রিংকার',
      quarantine: 'কোয়ারেন্টাইন ও আইসোলেশন',
      drainage: 'ড্রেনেজ ও বর্জ্য লাইন',
      staff_hygiene: 'স্টাফ ও পরিচ্ছন্নতা গিয়ার'
    };

    const shiftLabels: Record<string, string> = {
      morning: 'সকাল',
      noon: 'দুপুর',
      evening: 'বিকাল/সন্ধ্যা'
    };

    const newTaskItem: BiosecurityTask = {
      id: `bio-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      categoryLabel: catLabels[newCategory] || 'সাধারণ',
      shift: newShift,
      shiftLabel: shiftLabels[newShift] || 'সকাল',
      chemical: newChemical.trim() || 'নির্ধারিত জীবাণুনাশক',
      dosage: newDosage.trim() || 'প্রয়োজনানুযায়ী',
      targetArea: newTargetArea.trim() || 'খামার প্রাঙ্গণ',
      timeSlot: newTimeSlot.trim() || 'সকাল ০৯:০০',
      isCompleted: false,
      assignedStaff: newAssignedStaff.trim() || 'ডিউটি অফিসার',
      isHighRisk: newIsHighRisk
    };

    setTasks(prev => [newTaskItem, ...prev]);
    setNewTitle('');
    setShowAddTaskModal(false);
  };

  // Filter calculations
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const highRiskCount = tasks.filter(t => t.isHighRisk).length;
  const highRiskCompleted = tasks.filter(t => t.isHighRisk && t.isCompleted).length;

  const filteredTasks = tasks.filter(t => {
    if (activeShiftFilter === 'high_risk') {
      if (!t.isHighRisk) return false;
    } else if (activeShiftFilter !== 'all' && t.shift !== activeShiftFilter) {
      return false;
    }
    if (activeCategoryFilter !== 'all' && t.category !== activeCategoryFilter) {
      return false;
    }
    return true;
  });

  // Dynamic progress status theme
  const getProgressTheme = () => {
    if (progressPercent === 100) {
      return {
        bgGradient: 'from-emerald-500 to-teal-600',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700',
        statusLabel: 'শতভাগ সুরক্ষিত ও জীবাণুমুক্ত (DLS গ্রেড-১ মানদণ্ড বাস্তবায়িত)',
        subLabel: 'অভিনন্দন! আজকের সকল স্যানিটেশন প্রটোকল সফলভাবে সম্পন্ন হয়েছে।',
      };
    }
    if (progressPercent >= 70) {
      return {
        bgGradient: 'from-teal-500 to-emerald-500',
        textColor: 'text-teal-700 dark:text-teal-300',
        badgeBg: 'bg-teal-100 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700',
        statusLabel: 'উচ্চ সন্তোষজনক সুরক্ষা (স্যানিটেশন প্রায় সমাপ্তির পথে)',
        subLabel: 'বাকি থাকা কয়েকটি কাজ শেষ করে শতভাগ সংক্রমণ-সুরক্ষা নিশ্চিত করুন।',
      };
    }
    if (progressPercent >= 40) {
      return {
        bgGradient: 'from-amber-500 to-teal-500',
        textColor: 'text-amber-700 dark:text-amber-300',
        badgeBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700',
        statusLabel: 'চলমান রুটিন (মাঝারি সুরক্ষা স্তর)',
        subLabel: 'দিনের রুটিনের কিছু অংশ সম্পন্ন হয়েছে, পরবর্তী শিফট দ্রুত শুরু করুন।',
      };
    }
    return {
      bgGradient: 'from-rose-500 to-amber-500',
      textColor: 'text-rose-700 dark:text-rose-300',
      badgeBg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700',
      statusLabel: 'সতর্কতা: প্রাথমিক স্তর (অসম্পূর্ণ স্যানিটেশন)',
      subLabel: 'খামারে জীবাণু ঝুঁকি প্রতিরোধে ফুটবাথ ও শেড স্প্রে দ্রুত সম্পন্ন করুন।',
    };
  };

  const theme = getProgressTheme();

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>দৈনিক রোগ প্রতিরোধ ও বায়োসিকিউরিটি প্রটোকল</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-[10px] border border-teal-200 dark:border-teal-800">
                সরকারি DLS গ্রেড-১ স্ট্যান্ডার্ড
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                তারিখ: {new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Shield className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>বায়োসিকিউরিটি ও দৈনিক জীবাণুমুক্তকরণ চেকলিস্ট ট্র্যাকার</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              খামারের শেড, ফুটবাথ, ফিডার, ড্রেনেজ ও কোয়ারেন্টাইন জোনে নিয়মিত জীবাণুনাশক স্প্রে ট্র্যাক করুন এবং খামারকে ১০০% রোগমুক্ত রাখুন।
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowChemicalGuide(!showChemicalGuide)}
              className="px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 text-teal-800 dark:text-teal-300 font-black text-xs flex items-center gap-2 border border-teal-200 dark:border-teal-800 cursor-pointer transition-all"
              title="কেমিক্যাল মিশ্রণ ও মাত্রা নির্দেশিকা"
            >
              <Droplets className="w-4 h-4 text-teal-600" />
              <span>কেমিক্যাল গাইড</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showChemicalGuide ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন টাস্ক যোগ করুন</span>
            </button>

            <button
              onClick={handleMarkAllDone}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
              title="সব টাস্ক সম্পন্ন হিসেবে চিহ্নিত করুন"
            >
              <CheckCheck className="w-4 h-4" />
              <span>সব সম্পন্ন চিহ্নিত করুন</span>
            </button>

            <button
              onClick={handleResetAll}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              title="নতুন দিনের জন্য রিসেট করুন"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              title="চেকলিস্ট প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* HERO PROGRESS BAR SECTION */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                আজকের স্যানিটেশন ও স্বাস্থ্যবিধি অগ্রগতি (Overall Progress)
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {progressPercent}%
                </span>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  ({completedCount}/{totalCount} টি কাজ সম্পন্ন)
                </span>
              </div>
            </div>

            {/* Dynamic Status Badge */}
            <div className={`px-4 py-2.5 rounded-2xl border ${theme.badgeBg} flex items-center gap-2.5`}>
              {progressPercent === 100 ? (
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-bounce shrink-0" />
              ) : progressPercent >= 70 ? (
                <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <div>
                <p className={`text-xs font-black ${theme.textColor}`}>
                  {theme.statusLabel}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {theme.subLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Large Animated Visual Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-5 sm:h-6 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-1 shadow-inner relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${theme.bgGradient} relative overflow-hidden`}
                style={{ width: `${Math.max(progressPercent, 3)}%` }}
              >
                {/* Subtle animated highlight shimmer */}
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
              <span>০% প্রারম্ভিক স্তর</span>
              <span>৫০% মধ্যবর্তী স্তর</span>
              <span>১০০% পূর্ণাঙ্গ সংক্রমণ-সুরক্ষিত</span>
            </div>
          </div>

          {/* 4 Quick Stat Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">মোট নির্ধারিত টাস্ক</span>
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">{totalCount} টি</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">সম্পন্ন হয়েছে</span>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">{completedCount} টি</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">বাকি রয়েছে</span>
              <p className="text-xl font-black text-amber-700 dark:text-amber-400 font-mono mt-0.5">{pendingCount} টি</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider block">উচ্চ-ঝুঁকি কমপ্লায়েন্স</span>
              <p className="text-xl font-black text-rose-700 dark:text-rose-400 font-mono mt-0.5">
                {highRiskCompleted}/{highRiskCount} সম্পন্ন
              </p>
            </div>
          </div>
        </div>

        {/* Collapsible Chemical & Dosage Guide */}
        {showChemicalGuide && (
          <div className="p-6 rounded-3xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-teal-900 dark:text-teal-200 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-teal-600" />
                <span>জীবাণুনাশক কেমিক্যাল ও বৈজ্ঞানিক মিশ্রণ অনুপাত গাইড (Disinfection Standards)</span>
              </h3>
              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold">বাংলাদেশ প্রাণিসম্পদ অধিদপ্তর নির্দেশিকা</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 space-y-1">
                <span className="font-black text-slate-900 dark:text-white block">১. ভাইরকন-এস (Virkon-S)</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  <b className="text-emerald-600 font-mono">১:১০০ অনুপাত</b> (১০ গ্রাম প্রতি ১ লিটার পানিতে)। শেড মেঝে, দেয়াল ও যন্ত্রপাতি স্প্রে করার জন্য আদর্শ।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 space-y-1">
                <span className="font-black text-slate-900 dark:text-white block">২. পটাশিয়াম পারম্যাঙ্গানেট</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  <b className="text-purple-600 font-mono">০.১% হালকা দ্রবণ</b> (হালকা বেগুনী বর্ণ)। পানির পাত্র, ফিডার ধৌতকরণ ও পশুর পা পরিষ্কারের জন্য নিরাপদ।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 space-y-1">
                <span className="font-black text-slate-900 dark:text-white block">৩. ব্লিচিং পাউডার + কস্টিক সোডা</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  <b className="text-teal-600 font-mono">২% মিশ্রণ</b> (প্রতি ১০০ লিটারে ২ কেজি ব্লিচিং + ৫০০ গ্রাম কস্টিক সোডা)। মূল গেট ও ফুটবাথ ড্রপে ব্যবহৃত হয়।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 space-y-1">
                <span className="font-black text-slate-900 dark:text-white block">৪. কৃষি চুন (Calcium Carbonate)</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  <b className="text-amber-600 font-mono">শুকনো ডাস্টিং</b> (১ কেজি প্রতি শতক জমি বা ১০০ মিটার ড্রেন)। ড্রেন, পুকুর পাড় ও স্যাঁতসেঁতে কোণায় আর্দ্রতা ও অম্লতা রোধে কার্যকর।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters Bar: Shifts & Categories */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Shift filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {[
              { id: 'all', label: 'সকল কাজ', count: tasks.length },
              { id: 'morning', label: 'সকাল', count: tasks.filter(t => t.shift === 'morning').length },
              { id: 'noon', label: 'দুপুর', count: tasks.filter(t => t.shift === 'noon').length },
              { id: 'evening', label: 'বিকাল/সন্ধ্যা', count: tasks.filter(t => t.shift === 'evening').length },
              { id: 'high_risk', label: 'উচ্চ ঝুঁকি (Critical)', count: highRiskCount, isAlert: true }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveShiftFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeShiftFilter === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  tab.isAlert 
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 font-black' 
                    : activeShiftFilter === tab.id 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' 
                    : 'bg-slate-200 dark:bg-slate-700/60 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Category dropdown filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">বিভাগ:</span>
            <select
              value={activeCategoryFilter}
              onChange={(e) => setActiveCategoryFilter(e.target.value)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="all">সকল বিভাগ (All Zones)</option>
              <option value="shed">শেড স্যানিটেশন (Shed)</option>
              <option value="footbath">ফুটবাথ ও ভেহিকেল ডিপ (Footbath)</option>
              <option value="feeder_water">ফিডার ও ড্রিংকার (Feeder/Water)</option>
              <option value="quarantine">কোয়ারেন্টাইন জোন (Quarantine)</option>
              <option value="drainage">ড্রেনেজ ও বর্জ্য (Drainage/Waste)</option>
              <option value="staff_hygiene">স্টাফ হাইজিন (Staff Hygiene)</option>
            </select>
          </div>
        </div>

        {/* TASK CHECKLIST ITEMS */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-500">এই ফিল্টারে কোনো স্যানিটেশন টাস্ক পাওয়া যায়নি।</p>
              <button
                onClick={() => { setActiveShiftFilter('all'); setActiveCategoryFilter('all'); }}
                className="text-xs font-extrabold text-emerald-600 underline cursor-pointer"
              >
                সব টাস্ক প্রদর্শন করুন
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  task.isCompleted
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-700 shadow-sm'
                }`}
              >
                {/* Left checkmark + text */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {/* Custom Checkbox Button */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                      task.isCompleted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                        : 'border-2 border-slate-300 dark:border-slate-600 text-transparent group-hover:border-emerald-500'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs sm:text-sm font-black transition-colors ${
                        task.isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {task.title}
                      </span>

                      {task.isHighRisk && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-[10px] font-black border border-rose-200 dark:border-rose-900/60 flex items-center gap-1 shrink-0">
                          <Flame className="w-3 h-3" />
                          <span>উচ্চ ঝুঁকি</span>
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold shrink-0">
                        {task.categoryLabel}
                      </span>

                      <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-[10px] font-bold shrink-0">
                        {task.shiftLabel} শিফট
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      <span>স্থান: <b className="text-slate-700 dark:text-slate-300">{task.targetArea}</b></span>
                      <span>•</span>
                      <span>কেমিক্যাল: <b className="text-emerald-700 dark:text-emerald-400">{task.chemical}</b> ({task.dosage})</span>
                    </div>
                  </div>
                </div>

                {/* Right Metadata & Staff info */}
                <div className="flex items-center justify-between sm:justify-end gap-3 text-right text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <div className="flex items-center sm:justify-end gap-1.5 text-slate-500 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{task.timeSlot}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      দায়িত্বে: {task.assignedStaff}
                    </p>
                    {task.isCompleted && task.completedAt && (
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 block">
                        ✓ সম্পন্ন ({task.completedAt})
                      </span>
                    )}
                  </div>

                  {/* Delete button if custom task */}
                  {task.id.startsWith('bio-1') || task.id.startsWith('bio-2') || task.id.startsWith('bio-3') || task.id.startsWith('bio-4') || task.id.startsWith('bio-5') || task.id.startsWith('bio-6') || task.id.startsWith('bio-7') || task.id.startsWith('bio-8') || task.id.startsWith('bio-9') || task.id.startsWith('bio-10') ? null : (
                    <button
                      onClick={(e) => handleDeleteTask(task.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="টাস্ক মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Emergency Assistance Callout */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                রোগ সংক্রমণ সন্দেহ বা জরুরি বায়োসিকিউরিটি ব্রেচ দেখা দিলে?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                অবিলম্বে আক্রান্ত পশুকে আইসোলেশন জোনে স্থানান্তর করুন এবং উপজেলা ভেটেরিনারি হাসপাতালে যোগাযোগ করুন।
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700">
              হটলাইন: ১৬১২৩
            </span>
          </div>
        </div>
      </div>

      {/* ADD CUSTOM TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>নতুন বায়োসিকিউরিটি ও স্যানিটেশন টাস্ক তৈরি</span>
            </h3>

            <form onSubmit={handleAddTask} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">টাস্কের বিবরণ:</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মিল্কিং পার্লারের মেঝে ভাইরকন-এস দিয়ে জীবাণুমুক্তকরণ"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">বিভাগ (Category):</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="shed">শেড স্যানিটেশন</option>
                    <option value="footbath">ফুটবাথ ও ভেহিকেল ডিপ</option>
                    <option value="feeder_water">ফিডার ও ড্রিংকার</option>
                    <option value="quarantine">কোয়ারেন্টাইন ও আইসোলেশন</option>
                    <option value="drainage">ড্রেনেজ ও বর্জ্য লাইন</option>
                    <option value="staff_hygiene">স্টাফ ও পরিচ্ছন্নতা গিয়ার</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">শিফট (Shift):</label>
                  <select
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="morning">সকালের রুটিন</option>
                    <option value="noon">দুপুরের রুটিন</option>
                    <option value="evening">বিকাল/সন্ধ্যার রুটিন</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">জীবাণুনাশক কেমিক্যাল:</label>
                  <input
                    type="text"
                    placeholder="যেমন: ভাইরকন-এস / ব্লিচিং / পটাশ"
                    value={newChemical}
                    onChange={(e) => setNewChemical(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">মিশ্রণের ডোজ/মাত্রা:</label>
                  <input
                    type="text"
                    placeholder="যেমন: ১:১০০ অনুপাত (১%)"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">নির্দিষ্ট স্থান/জোন:</label>
                  <input
                    type="text"
                    placeholder="যেমন: শেড-১ ডেইরি সেকশন"
                    value={newTargetArea}
                    onChange={(e) => setNewTargetArea(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">সময় স্লট:</label>
                  <input
                    type="text"
                    placeholder="যেমন: সকাল ০৭:৩০ - ০৮:০০"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">দায়িত্বপ্রাপ্ত কর্মী:</label>
                <input
                  type="text"
                  placeholder="যেমন: করিম হোসেন (শেড কিপার)"
                  value={newAssignedStaff}
                  onChange={(e) => setNewAssignedStaff(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="highRiskCheck"
                  checked={newIsHighRisk}
                  onChange={(e) => setNewIsHighRisk(e.target.checked)}
                  className="rounded text-rose-600 accent-rose-600 cursor-pointer"
                />
                <label htmlFor="highRiskCheck" className="text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
                  এটি একটি উচ্চ-ঝুঁকিপূর্ণ / বাধ্যতামূলক কমপ্লায়েন্স টাস্ক (Critical Hazard)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
                >
                  টাস্ক সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
