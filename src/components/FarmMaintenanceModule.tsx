import React, { useState, useEffect, useMemo } from 'react';
import { authService } from '../services/authService';
import { 
  Wrench, Plus, Search, Filter, AlertTriangle, CheckCircle2, 
  Clock, Calendar, User, ShieldCheck, AlertCircle, RefreshCw, 
  Trash2, Edit3, Sparkles, Droplets, Zap, Shield, ChevronRight, Check
} from 'lucide-react';

export interface MaintenanceTask {
  id: string;
  title: string;
  category: 'shed_cleaning' | 'fence_repair' | 'machinery_service' | 'water_sanitation' | 'electrical_safety' | 'other';
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

const STORAGE_KEY = 'rs_farm_maintenance_tasks';

const INITIAL_TASKS: MaintenanceTask[] = [
  {
    id: 'MNT-101',
    title: 'গাভী শেডের বায়ো-সিকিউরিটি জীবানুনাশক স্প্রে (Barn Disinfection)',
    category: 'shed_cleaning',
    assignedTo: 'রহিম মিয়া (খামার সহকারী)',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    recurrence: 'weekly',
    notes: 'শেডের মেঝে, ফিডার ট্রে ও ড্রেনেজ লাইনে পটাশ ও ফিটকিরি দ্রবণ স্প্রে করতে হবে।',
    createdAt: '2026-11-01'
  },
  {
    id: 'MNT-102',
    title: 'পুকুরের ওয়াটার এয়ারেটর ও অটো মিল্কিং মেশিন সার্ভিসিং',
    category: 'machinery_service',
    assignedTo: 'কামরুল টেকনিশিয়ান',
    priority: 'urgent',
    dueDate: '2026-11-09', // Overdue date
    status: 'overdue',
    recurrence: 'monthly',
    notes: 'মোটরের গিয়ার অয়েল ফিল্টার চেঞ্জ এবং বেয়ারিং গ্রিজিং সম্পন্ন করতে হবে।',
    createdAt: '2026-10-25'
  },
  {
    id: 'MNT-103',
    title: 'পশ্চিম সীমানা ও ব্ল্যাক বেঙ্গল ছাগলের শেড বেড়া মেরামত',
    category: 'fence_repair',
    assignedTo: 'জব্বার মিয়া',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'in_progress',
    recurrence: 'none',
    notes: 'তারের বেড়া কিছুটা আলগা হয়ে গেছে। নতুন বাঁশের খুঁটি ও জিআই তার বসানো হচ্ছে।',
    createdAt: '2026-11-05'
  },
  {
    id: 'MNT-104',
    title: 'পোল্ট্রি ও হাঁস শেড ড্রিংকিং ওয়াটার পাইপ ফিল্টার ক্লিনিং',
    category: 'water_sanitation',
    assignedTo: 'তানভীর হাসান',
    priority: 'high',
    dueDate: '2026-11-10',
    status: 'completed',
    recurrence: 'daily',
    notes: 'পানি সরবরাহের অটোমেটেড নিপল ড্রিংকার পাইপলাইন প্রেশার ওয়াশ করা হয়েছে।',
    completedAt: '2026-11-10T16:30:00',
    createdAt: '2026-11-08'
  },
  {
    id: 'MNT-105',
    title: 'সোলার প্যানেল ইনভার্টার ও প্রধান বৈদ্যুতিক ওয়্যারিং চেকআপ',
    category: 'electrical_safety',
    assignedTo: 'বিদ্যুৎ লাইনম্যান (বহিরাগত)',
    priority: 'low',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    status: 'pending',
    recurrence: 'monthly',
    notes: 'ব্যাটারি ওয়াটার লেভেল চেক এবং মেন ডিসকানেক্ট সুইচের লুজ কানেকশন ফিক্স করতে হবে।',
    createdAt: '2026-11-02'
  }
];

export const FarmMaintenanceModule: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_TASKS;
  });

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New task form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<MaintenanceTask['category']>('shed_cleaning');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [newPriority, setNewPriority] = useState<MaintenanceTask['priority']>('medium');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRecurrence, setNewRecurrence] = useState<MaintenanceTask['recurrence']>('none');
  const [newNotes, setNewNotes] = useState('');

  const currentUser = authService.getCurrentUser();
  const isReadOnly = authService.isReadOnly(currentUser);

  // Auto update localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks]);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Automated Reminder calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const dueTodayOrOverdueTasks = useMemo(() => {
    return tasks.filter(t => t.status !== 'completed' && (t.dueDate <= todayStr || t.status === 'overdue'));
  }, [tasks, todayStr]);

  const categoryLabels: Record<MaintenanceTask['category'], { label: string; icon: string; bg: string }> = {
    shed_cleaning: { label: 'শেড জীবানুনাশ ও পরিচ্ছন্নতা', icon: '🧹', bg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
    fence_repair: { label: 'সীমানা ও বেড়া মেরামত', icon: '🧱', bg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
    machinery_service: { label: 'যন্ত্রপাতি ও মোটর সার্ভিস', icon: '⚙️', bg: 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
    water_sanitation: { label: 'পানি ওয়াশ ও পাইপলাইন', icon: '🚰', bg: 'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300' },
    electrical_safety: { label: 'সোলার ও বিদ্যুৎ লাইন', icon: '⚡', bg: 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
    other: { label: 'অন্যান্য মেরামত কাজ', icon: '🛠️', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
  };

  const priorityLabels: Record<MaintenanceTask['priority'], { label: string; badge: string }> = {
    low: { label: 'কম জরুরি (Low)', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    medium: { label: 'সাধারণ (Medium)', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    high: { label: 'উচ্চ অগ্রাধিকার (High)', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    urgent: { label: 'জরুরি রিমাইন্ডার (Urgent)', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse' },
  };

  const statusLabels: Record<MaintenanceTask['status'], { label: string; color: string }> = {
    pending: { label: 'অপেক্ষমান (Pending)', color: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300' },
    in_progress: { label: 'চলমান (In Progress)', color: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' },
    completed: { label: 'সম্পন্ন (Completed)', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' },
    overdue: { label: 'মেয়াদোত্তীর্ণ (Overdue)', color: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300' },
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                            t.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
                            t.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchesCat = filterCategory === 'all' || t.category === filterCategory;
      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [tasks, search, filterStatus, filterCategory]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      alert('আপনার অ্যাকাউন্টের জন্য Read-Only (শুধুমাত্র দেখা) পারমিশন নির্ধারিত রয়েছে।');
      return;
    }
    if (!newTitle.trim() || !newAssignedTo.trim()) return;

    const newTask: MaintenanceTask = {
      id: `MNT-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle.trim(),
      category: newCategory,
      assignedTo: newAssignedTo.trim(),
      priority: newPriority,
      dueDate: newDueDate,
      status: newDueDate < todayStr ? 'overdue' : 'pending',
      recurrence: newRecurrence,
      notes: newNotes.trim(),
      createdAt: todayStr
    };

    setTasks(prev => [newTask, ...prev]);
    setShowAddModal(false);
    setNewTitle('');
    setNewAssignedTo('');
    setNewNotes('');
    triggerToast(`সফলভাবে নতুন মেইনটেন্যান্স টাস্ক "${newTask.id}" যোগ করা হয়েছে!`);
  };

  const handleUpdateStatus = (id: string, newStatus: MaintenanceTask['status']) => {
    if (isReadOnly) {
      alert('আপনার অ্যাকাউন্টের জন্য Read-Only (শুধুমাত্র দেখা) পারমিশন নির্ধারিত রয়েছে।');
      return;
    }
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return t;
    }));
    triggerToast(`টাস্ক স্ট্যাটাস আপডেট করা হয়েছে!`);
  };

  const handleDeleteTask = (id: string) => {
    if (isReadOnly) {
      alert('আপনার অ্যাকাউন্টের জন্য Read-Only পারমিশন নির্ধারিত রয়েছে।');
      return;
    }
    if (window.confirm('আপনি কি নিশ্চিতভাবে এই মেইনটেন্যান্স টাস্কটি মুছে ফেলতে চান?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      triggerToast('টাস্ক মুছে ফেলা হয়েছে।');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 rounded-[2.5rem] text-white p-6 sm:p-8 border border-teal-800/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-3xl shadow-inner">
                🛠️
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">খামার সুবিধা ও ফেসিলেটি সার্ভিসিং</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">খামার মেরামত ও রুটিন রক্ষণাবেক্ষণ (Farm Maintenance)</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  শেড ক্লিনিং, ড্রেনেজ স্প্রে, তারের বেড়া মেরামত, পানি ও সোলার মেইনটেন্যান্স কাজের রিমাইন্ডার ও ট্র্যাক ট্র্যাকিং।
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (isReadOnly) {
                  alert('আপনার অ্যাকাউন্টের জন্য Read-Only (শুধুমাত্র দেখা) পারমিশন নির্ধারিত রয়েছে।');
                  return;
                }
                setShowAddModal(true);
              }}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-xl cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন মেইনটেন্যান্স কাজ যোগ করুন</span>
            </button>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">মোট মেইনটেন্যান্স টাস্ক</p>
              <p className="text-3xl font-black font-mono text-white">{tasks.length} <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">নিয়মিত শিডিউলড</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">চলমান ও অপেক্ষমান</p>
              <p className="text-3xl font-black font-mono text-amber-300">{tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length} <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">অ্যাকশন প্রয়োজন</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">জরুরি রিমাইন্ডার / ওভারডিউ</p>
              <p className="text-3xl font-black font-mono text-rose-300">{dueTodayOrOverdueTasks.length} <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">মেয়াদের বাইরে বা আজ প্রাপ্য</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">সম্পন্ন কাজ</p>
              <p className="text-3xl font-black font-mono text-emerald-300">{tasks.filter(t => t.status === 'completed').length} <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">যাচাইকৃত সার্ভিসিং</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 2. Automated Reminders Alert Box */}
      {dueTodayOrOverdueTasks.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 space-y-3 shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
              <h3 className="text-sm font-black uppercase tracking-wider">
                স্বয়ংক্রিয় মেইনটেন্যান্স রিমাইন্ডার সসংকেত ({dueTodayOrOverdueTasks.length} টি কাজ)
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 text-[10px] font-black uppercase">
              Urgent Attention
            </span>
          </div>

          <p className="text-xs font-medium text-rose-800 dark:text-rose-300">
            নিচের ফেসিলেটি সার্ভিসগুলোর মেয়াদ শেষ হয়ে গেছে বা আজই সম্পন্ন করার কথা। অনুগ্রহ করে নির্ধারিত কর্মচারীকে তাগিদ দিন:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {dueTodayOrOverdueTasks.map(t => (
              <div key={t.id} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950 flex items-start justify-between gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono font-bold text-rose-600 block">{t.id} · Due: {t.dueDate}</span>
                  <p className="font-black text-slate-900 dark:text-white line-clamp-1">{t.title}</p>
                  <p className="text-[10px] text-slate-500 font-medium">দায়িত্বপ্রাপ্ত: {t.assignedTo}</p>
                </div>
                <button
                  onClick={() => handleUpdateStatus(t.id, 'completed')}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black shrink-0 hover:bg-emerald-700 cursor-pointer"
                >
                  সম্পন্ন করুন
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['all', 'pending', 'in_progress', 'completed', 'overdue'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'সকল স্ট্যাটাস' : statusLabels[st as MaintenanceTask['status']].label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            <option value="shed_cleaning">🧹 শেড জীবানুনাশ</option>
            <option value="fence_repair">🧱 বেড়া মেরামত</option>
            <option value="machinery_service">⚙️ মোটর ও যন্ত্র</option>
            <option value="water_sanitation">🚰 পানি ওয়াশ</option>
            <option value="electrical_safety">⚡ সোলার ও বিদ্যুৎ</option>
            <option value="other">🛠️ অন্যান্য</option>
          </select>

          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="টাস্ক আইডি বা নাম খুঁজুন..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Maintenance Tasks List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-black uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 sm:p-5">আইডি ও শিরোনাম</th>
                <th className="p-4 sm:p-5">ক্যাটাগরি</th>
                <th className="p-4 sm:p-5">দায়িত্বপ্রাপ্ত কর্মকর্তা</th>
                <th className="p-4 sm:p-5">অগ্রাধিকার ও মেয়াদ</th>
                <th className="p-4 sm:p-5">স্ট্যাটাস</th>
                <th className="p-4 sm:p-5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                    কোনো মেইনটেন্যান্স টাস্ক পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredTasks.map(t => {
                  const cat = categoryLabels[t.category];
                  const pri = priorityLabels[t.priority];
                  const st = statusLabels[t.status];

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 sm:p-5 max-w-xs">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">{t.id}</span>
                          <p className="font-black text-slate-900 dark:text-white leading-snug">{t.title}</p>
                          {t.notes && <p className="text-[10px] text-slate-500 dark:text-slate-400 italic line-clamp-1">"{t.notes}"</p>}
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black ${cat.bg}`}>
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300 font-bold">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t.assignedTo}</span>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${pri.badge}`}>
                            {pri.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 font-bold block flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Due: {t.dueDate}</span>
                          </span>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <select
                          value={t.status}
                          onChange={e => handleUpdateStatus(t.id, e.target.value as MaintenanceTask['status'])}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer focus:outline-none ${st.color}`}
                        >
                          <option value="pending">⏳ Pending (অপেক্ষমান)</option>
                          <option value="in_progress">⚙️ In Progress (চলমান)</option>
                          <option value="completed">✓ Completed (সম্পন্ন)</option>
                          <option value="overdue">⚠️ Overdue (মেয়াদোত্তীর্ণ)</option>
                        </select>
                      </td>

                      <td className="p-4 sm:p-5 text-right">
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="টাস্ক মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Maintenance Task */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">নতুন মেইনটেন্যান্স টাস্ক এন্ট্রি</h3>
                <p className="text-xs text-slate-500 mt-0.5">খামারের রুটিন মেরামত বা সার্ভিসিং কাজ শিডিউল করুন</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">কাজের শিরোনাম / বিবরণ *</label>
                <input
                  type="text"
                  placeholder="যেমন: ডেইরি শেডের জীবাণুনাশক স্প্রে করা"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ক্যাটাগরি</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                  >
                    <option value="shed_cleaning">🧹 শেড ক্লিনিং</option>
                    <option value="fence_repair">🧱 বেড়া মেরামত</option>
                    <option value="machinery_service">⚙️ মোটর/যন্ত্রপাতি</option>
                    <option value="water_sanitation">🚰 পানি পাইপলাইন</option>
                    <option value="electrical_safety">⚡ সোলার/বিদ্যুৎ</option>
                    <option value="other">🛠️ অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">অগ্রাধিকার (Priority)</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                  >
                    <option value="low">🟢 Low (কম জরুরি)</option>
                    <option value="medium">🟡 Medium (সাধারণ)</option>
                    <option value="high">🔴 High (উচ্চ অগ্রাধিকার)</option>
                    <option value="urgent">🚨 Urgent (জরুরি রিমাইন্ডার)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">দায়িত্বপ্রাপ্ত কর্মী/টেকনিশিয়ান *</label>
                  <input
                    type="text"
                    placeholder="যেমন: রহিম মিয়া"
                    value={newAssignedTo}
                    onChange={e => setNewAssignedTo(e.target.value)}
                    className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">সম্পন্ন করার শেষ তারিখ (Due Date)</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">পুনরাবৃত্তি চক্র (Recurrence)</label>
                <select
                  value={newRecurrence}
                  onChange={e => setNewRecurrence(e.target.value as any)}
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                >
                  <option value="none">একবারই (Once)</option>
                  <option value="daily">দৈনিক (Daily)</option>
                  <option value="weekly">সাপ্তাহিক (Weekly)</option>
                  <option value="monthly">মাসিক (Monthly)</option>
                  <option value="quarterly">ত্রৈমাসিক (Quarterly)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">অতিরিক্ত নোট (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  placeholder="কোনো বিশেষ সতর্কতা বা ইনস্ট্রাকশন..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer"
                >
                  টাস্ক সেভ ও রিমাইন্ডার সেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FarmMaintenanceModule;
