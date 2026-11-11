import React, { useState, useEffect, useMemo } from 'react';
import { LivestockItem, HealthLog } from '../types';
import { 
  Calendar as CalendarIcon, Bell, BellRing, CheckCircle2, 
  AlertTriangle, Clock, Syringe, ShieldCheck, Stethoscope, 
  ChevronLeft, ChevronRight, Plus, Search, Filter, Printer, 
  Check, X, RotateCcw, AlertOctagon, UserCheck, Flame, 
  Layers, HeartPulse, Send, Award, Sparkles, ChevronDown
} from 'lucide-react';

export interface AnimalVaccineSchedule {
  id: string;
  animalId: string;
  animalName: string;
  speciesType: string;
  breed: string;
  age: string;
  weightKg: number;
  vaccineName: string;
  targetDisease: string;
  doseAmount: string;
  route: string;
  dueDate: string; // YYYY-MM-DD
  status: 'overdue' | 'due_today' | 'upcoming_urgent' | 'upcoming_normal' | 'completed';
  completedAt?: string;
  administeredBy?: string;
  batchLotNo?: string;
  nextBoosterDate?: string;
  notes?: string;
}

interface VaccineHealthCalendarModuleProps {
  livestock: LivestockItem[];
  healthLogs?: HealthLog[];
}

export const VaccineHealthCalendarModule: React.FC<VaccineHealthCalendarModuleProps> = ({
  livestock,
  healthLogs = []
}) => {
  // Reference date: November 10, 2026 (local project simulated timeline)
  const TODAY_STR = '2026-11-10';

  // State for active calendar month
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 0-indexed: 10 = November
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(TODAY_STR);
  
  // Views & Filters
  const [activeViewMode, setActiveViewMode] = useState<'calendar' | 'roster'>('calendar');
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'urgent_today' | 'next_7_days' | 'completed'>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(true);
  const [smsAlertSent, setSmsAlertSent] = useState<boolean>(false);

  // Modals
  const [completingItem, setCompletingItem] = useState<AnimalVaccineSchedule | null>(null);
  const [vetName, setVetName] = useState('ডাঃ মোস্তাফিজুর রহমান (উপজেলা ভেটেরিনারি সার্জন)');
  const [lotNumber, setLotNumber] = useState('BD-VAC-2026-981');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Schedule form
  const [newAnimalId, setNewAnimalId] = useState(livestock[0]?.id || 'C-101');
  const [newVaccineName, setNewVaccineName] = useState('পিপিআর (PPR) ভ্যাকসিন');
  const [newTargetDisease, setNewTargetDisease] = useState('পিপিআর রোগ প্রতিরোধক');
  const [newDoseAmount, setNewDoseAmount] = useState('১ মি.লি.');
  const [newRoute, setNewRoute] = useState('চামড়ার নিচে (Subcutaneous)');
  const [newDueDate, setNewDueDate] = useState('2026-11-15');
  const [newNotes, setNewNotes] = useState('রুটিন বুস্টার টিকা');

  // Seed default schedules based on farm livestock
  const initialSchedules: AnimalVaccineSchedule[] = useMemo(() => {
    const list: AnimalVaccineSchedule[] = [
      {
        id: 'vs-1',
        animalId: 'C-101',
        animalName: 'সাহীওয়াল প্রিন্সেস (Sahiwal Princess)',
        speciesType: 'গরু (Cattle)',
        breed: 'সাহীওয়াল প্রিমিয়াম',
        age: '৩ বছর',
        weightKg: 450,
        vaccineName: 'খুরারোগ (FMD) ট্রাইভ্যালেন্ট ভ্যাকসিন',
        targetDisease: 'খুরা রোগ (Foot and Mouth Disease)',
        doseAmount: '৩ মি.লি.',
        route: 'চামড়ার নিচে (Subcutaneous)',
        dueDate: '2026-11-10', // Due today
        status: 'due_today',
        notes: 'শরীরের তাপমাত্রা চেক করে ইনজেকশন দিতে হবে।'
      },
      {
        id: 'vs-2',
        animalId: 'G-201',
        animalName: 'যমুনাপারি সর্দার (Jamunapari Sardar)',
        speciesType: 'ছাগল (Goat)',
        breed: 'যমুনাপারি খাসি',
        age: '১.৫ বছর',
        weightKg: 46,
        vaccineName: 'পিপিআর (PPR) লাইভ অ্যাটেনুয়েটেড',
        targetDisease: 'গোট প্লেগ / পিপিআর ভাইরাস',
        doseAmount: '১ মি.লি.',
        route: 'চামড়ার নিচে (Subcutaneous)',
        dueDate: '2026-11-08', // Overdue by 2 days
        status: 'overdue',
        notes: 'গত দুই দিন পূর্বে শিডিউল ছিল, জরুরি ভিত্তিতে অবিলম্বে প্রদান করুন।'
      },
      {
        id: 'vs-3',
        animalId: 'C-102',
        animalName: 'সিন্ধি রাজ (Sindhi Raj)',
        speciesType: 'গরু (Cattle)',
        breed: 'রেড সিন্ধি ষাঁড়',
        age: '২.৫ বছর',
        weightKg: 480,
        vaccineName: 'তড়কা (Anthrax) স্পোর ভ্যাকসিন',
        targetDisease: 'অ্যানথ্রাক্স / তড়কা রোগ',
        doseAmount: '১ মি.লি.',
        route: 'চামড়ার নিচে (Subcutaneous)',
        dueDate: '2026-11-12', // 2 days from today
        status: 'upcoming_urgent',
        notes: 'বর্ষা ও শরৎ পরবর্তী সংক্রমণ প্রতিরোধে বাধ্যতামূলক।'
      },
      {
        id: 'vs-4',
        animalId: 'G-202',
        animalName: 'ব্ল্যাক বেঙ্গল সুন্দরী (Black Bengal)',
        speciesType: 'ছাগল (Goat)',
        breed: 'ব্ল্যাক বেঙ্গল খাঁটি জাত',
        age: '১ বছর',
        weightKg: 24,
        vaccineName: 'গোট পক্স (Goat Pox) ভ্যাকসিন',
        targetDisease: 'ছাগলের বসন্ত রোগ',
        doseAmount: '০.৫ মি.লি.',
        route: 'চামড়ার নিচে (Subcutaneous)',
        dueDate: '2026-11-14', // 4 days from today
        status: 'upcoming_urgent',
        notes: 'ছাগল পেনের সকল খাসির সাথে একসাথে দেওয়া হবে।'
      },
      {
        id: 'vs-5',
        animalId: 'P-301',
        animalName: 'সোনালী লেয়ার পাল-১ (Flock-A)',
        speciesType: 'মুরগি (Chicken)',
        breed: 'উন্নত সোনালী লেয়ার',
        age: '৬ মাস',
        weightKg: 1.6,
        vaccineName: 'রাণীক্ষেত ও গামবোরো বুস্টার (RDV+IBD)',
        targetDisease: 'নিউ ক্যাসেল ও গামবোরো রোগ',
        doseAmount: '১ ফোঁটা',
        route: 'চোখে ড্রপ (Eye Drop)',
        dueDate: '2026-11-16', // 6 days from today
        status: 'upcoming_urgent',
        notes: 'পানিতে ভিটামিন-সি ও ইলেকট্রোলাইট মিশিয়ে প্রস্তুত রাখতে হবে।'
      },
      {
        id: 'vs-6',
        animalId: 'C-103',
        animalName: 'হোলস্টেইন ফ্রিসিয়ান ডেইরি-১',
        speciesType: 'গরু (Cattle)',
        breed: 'এইচএফ সংকর গাভী',
        age: '৪ বছর',
        weightKg: 520,
        vaccineName: 'বাদলা (Black Quarter - BQ) ভ্যাকসিন',
        targetDisease: 'বাদলা রোগ (Clostridium chauvoei)',
        doseAmount: '২ মি.লি.',
        route: 'গলার চামড়ার নিচে',
        dueDate: '2026-11-22', // 12 days from today
        status: 'upcoming_normal',
        notes: 'গাভীর গর্ভকালীন সতর্কতা যাচাই করতে হবে।'
      },
      {
        id: 'vs-7',
        animalId: 'G-203',
        animalName: 'তোতাপুরী সুলতান',
        speciesType: 'ছাগল (Goat)',
        breed: 'তোতাপুরী ক্রস',
        age: '২ বছর',
        weightKg: 58,
        vaccineName: 'এন্টারোটক্সেমিয়া (Enterotoxemia / Pulpy Kidney)',
        targetDisease: 'এন্টারোটক্সেমিয়া বা বদহজম রোগ',
        dueDate: '2026-11-25',
        doseAmount: '২ মি.লি.',
        route: 'চামড়ার নিচে',
        status: 'upcoming_normal',
        notes: 'উচ্চ দানাদার খাদ্য প্রদানকারী খাসির জন্য সুরক্ষামূলক।'
      },
      {
        id: 'vs-8',
        animalId: 'C-104',
        animalName: 'ব্রাহমা বুল রকি',
        speciesType: 'গরু (Cattle)',
        breed: 'ব্রাহমা ষাঁড়',
        age: '২.৮ বছর',
        weightKg: 620,
        vaccineName: 'হেমোরেজিক সেপটিসেমিয়া (গলফুলা / HS)',
        targetDisease: 'গলফুলা রোগ (Pasteurellosis)',
        doseAmount: '৩ মি.লি.',
        route: 'মাংসপেশিতে (Intramuscular)',
        dueDate: '2026-11-05',
        status: 'completed',
        completedAt: '2026-11-05 (সকাল ১০:১৫)',
        administeredBy: 'ডাঃ মোস্তাফিজুর রহমান',
        batchLotNo: 'HS-BN-8820',
        nextBoosterDate: '2027-05-05',
        notes: 'সফলভাবে সম্পন্ন। কোনো পার্শ্বপ্রতিক্রিয়া দেখা যায়নি।'
      },
      {
        id: 'vs-9',
        animalId: 'G-204',
        animalName: 'বিটল প্রিন্স',
        speciesType: 'ছাগল (Goat)',
        breed: 'বিটল জাত',
        age: '১.২ বছর',
        weightKg: 38,
        vaccineName: 'ব্রড-স্পেকট্রাম কৃমিনাশক ডোজ (Albendazole/Ivermectin)',
        targetDisease: 'অন্তঃপরজীবী ও বহিঃপরজীবী কৃমি',
        doseAmount: '৫ মি.লি. ওরালি + ১ মি.লি. ইনজেকশন',
        route: 'মুখে খাওয়ানো ও চামড়ার নিচে',
        dueDate: '2026-11-04',
        status: 'completed',
        completedAt: '2026-11-04 (সকাল ০৯:৩০)',
        administeredBy: 'সফিকুল ইসলাম (প্যারাভেট)',
        batchLotNo: 'ALB-9021',
        nextBoosterDate: '2027-02-04',
        notes: 'খালি পেটে সফলভাবে খাওয়ানো হয়েছে।'
      }
    ];

    // If there are more animals in livestock not in default list, auto-schedule routine vaccines
    livestock.forEach(item => {
      const alreadyHas = list.some(l => l.animalId === item.id);
      if (!alreadyHas) {
        const isCattle = item.type.includes('গরু');
        list.push({
          id: `vs-auto-${item.id}`,
          animalId: item.id,
          animalName: item.name,
          speciesType: item.type,
          breed: item.breed || 'উন্নত জাত',
          age: item.age || '১.৫ বছর',
          weightKg: item.currentWeight || 45,
          vaccineName: isCattle ? 'খুরারোগ (FMD) নিয়মিত বুস্টার' : 'পিপিআর (PPR) রুটিন টিকা',
          targetDisease: isCattle ? 'খুরা রোগ' : 'পিপিআর ভাইরাস',
          doseAmount: isCattle ? '৩ মি.লি.' : '১ মি.লি.',
          route: 'চামড়ার নিচে (Subcutaneous)',
          dueDate: '2026-11-18',
          status: 'upcoming_urgent',
          notes: 'খামারের সাধারণ টিকাদান শিডিউল অন্তর্ভুক্ত।'
        });
      }
    });

    return list;
  }, [livestock]);

  // Persistent schedules state
  const [schedules, setSchedules] = useState<AnimalVaccineSchedule[]>(() => {
    try {
      const saved = localStorage.getItem('rs_farm_vaccine_schedules_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load vaccine schedules:', e);
    }
    return initialSchedules;
  });

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('rs_farm_vaccine_schedules_v1', JSON.stringify(schedules));
    } catch (e) {
      console.error('Failed to persist vaccine schedules:', e);
    }
  }, [schedules]);

  // Recalculate dynamic days remaining from TODAY_STR
  const calculateDaysRemaining = (dueDateStr: string): number => {
    const today = new Date(TODAY_STR).getTime();
    const due = new Date(dueDateStr).getTime();
    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Mark vaccination complete handler
  const handleConfirmComplete = () => {
    if (!completingItem) return;

    const completedTimeStr = `${TODAY_STR} (${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })})`;
    
    // Auto-calculate next booster date (+6 months for cattle, +1 year for goat/others)
    const dueDateObj = new Date(completingItem.dueDate);
    const monthsToAdd = completingItem.speciesType.includes('গরু') ? 6 : 12;
    dueDateObj.setMonth(dueDateObj.getMonth() + monthsToAdd);
    const nextBoosterStr = dueDateObj.toISOString().split('T')[0];

    setSchedules(prev => prev.map(s => {
      if (s.id === completingItem.id) {
        return {
          ...s,
          status: 'completed',
          completedAt: completedTimeStr,
          administeredBy: vetName,
          batchLotNo: lotNumber,
          nextBoosterDate: nextBoosterStr,
          notes: `${s.notes || ''} [${TODAY_STR} সফলভাবে টিকাদান সম্পন্ন]`
        };
      }
      return s;
    }));

    setCompletingItem(null);
  };

  // Add custom schedule handler
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAnimal = livestock.find(a => a.id === newAnimalId) || livestock[0];
    if (!targetAnimal) return;

    const daysRemaining = calculateDaysRemaining(newDueDate);
    let status: AnimalVaccineSchedule['status'] = 'upcoming_normal';
    if (daysRemaining < 0) status = 'overdue';
    else if (daysRemaining === 0) status = 'due_today';
    else if (daysRemaining <= 7) status = 'upcoming_urgent';

    const newItem: AnimalVaccineSchedule = {
      id: `vs-custom-${Date.now()}`,
      animalId: targetAnimal.id,
      animalName: targetAnimal.name,
      speciesType: targetAnimal.type,
      breed: targetAnimal.breed,
      age: targetAnimal.age,
      weightKg: targetAnimal.currentWeight,
      vaccineName: newVaccineName.trim(),
      targetDisease: newTargetDisease.trim(),
      doseAmount: newDoseAmount.trim(),
      route: newRoute,
      dueDate: newDueDate,
      status,
      notes: newNotes.trim()
    };

    setSchedules(prev => [newItem, ...prev]);
    setShowAddModal(false);
  };

  // Send SMS / Smart Alert notification handler
  const handleTriggerSmsNotification = () => {
    setSmsAlertSent(true);
    setTimeout(() => setSmsAlertSent(false), 5000);
  };

  // Filtered schedules for notifications
  const urgentNotifications = useMemo(() => {
    return schedules.filter(s => s.status === 'overdue' || s.status === 'due_today' || s.status === 'upcoming_urgent');
  }, [schedules]);

  const overdueCount = schedules.filter(s => s.status === 'overdue').length;
  const dueTodayCount = schedules.filter(s => s.status === 'due_today').length;
  const upcomingUrgentCount = schedules.filter(s => s.status === 'upcoming_urgent').length;
  const completedCount = schedules.filter(s => s.status === 'completed').length;
  const totalCount = schedules.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Species-based breakdown
  const cattleSchedules = schedules.filter(s => s.speciesType.includes('গরু'));
  const goatSchedules = schedules.filter(s => s.speciesType.includes('ছাগল'));
  const poultrySchedules = schedules.filter(s => s.speciesType.includes('হাঁস') || s.speciesType.includes('মুরগি') || s.speciesType.includes('পাখি'));

  const cattleCompleted = cattleSchedules.filter(s => s.status === 'completed').length;
  const goatCompleted = goatSchedules.filter(s => s.status === 'completed').length;
  const poultryCompleted = poultrySchedules.filter(s => s.status === 'completed').length;

  const cattleProgress = cattleSchedules.length > 0 ? Math.round((cattleCompleted / cattleSchedules.length) * 100) : 0;
  const goatProgress = goatSchedules.length > 0 ? Math.round((goatCompleted / goatSchedules.length) * 100) : 0;
  const poultryProgress = poultrySchedules.length > 0 ? Math.round((poultryCompleted / poultrySchedules.length) * 100) : 0;

  // Filtered list based on search and filters
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      // Notification filter
      if (notificationFilter === 'urgent_today') {
        if (s.status !== 'overdue' && s.status !== 'due_today') return false;
      } else if (notificationFilter === 'next_7_days') {
        if (s.status !== 'upcoming_urgent' && s.status !== 'due_today') return false;
      } else if (notificationFilter === 'completed') {
        if (s.status !== 'completed') return false;
      }

      // Species filter
      if (speciesFilter !== 'all' && !s.speciesType.includes(speciesFilter)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = s.animalName.toLowerCase().includes(query);
        const matchesId = s.animalId.toLowerCase().includes(query);
        const matchesVaccine = s.vaccineName.toLowerCase().includes(query);
        const matchesDisease = s.targetDisease.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesVaccine && !matchesDisease) return false;
      }

      return true;
    });
  }, [schedules, notificationFilter, speciesFilter, searchQuery]);

  // Calendar Days calculation for the active month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const pDay = prevMonthDays - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`,
        dayNum: pDay,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true
      });
    }

    // Next month padding to fill grid
    const remaining = 35 - days.length;
    if (remaining > 0) {
      for (let n = 1; n <= remaining; n++) {
        const m = currentMonth === 11 ? 1 : currentMonth + 2;
        const y = currentMonth === 11 ? currentYear + 1 : currentYear;
        days.push({
          dateStr: `${y}-${String(m).padStart(2, '0')}-${String(n).padStart(2, '0')}`,
          dayNum: n,
          isCurrentMonth: false
        });
      }
    }

    return days;
  }, [currentYear, currentMonth]);

  // Schedules grouped by date for the calendar
  const schedulesByDate = useMemo(() => {
    const map: Record<string, AnimalVaccineSchedule[]> = {};
    schedules.forEach(s => {
      if (!map[s.dueDate]) {
        map[s.dueDate] = [];
      }
      map[s.dueDate].push(s);
    });
    return map;
  }, [schedules]);

  const selectedDateSchedules = schedulesByDate[selectedCalendarDate] || [];

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & OVERVIEW */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-[11px] border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
                <Syringe className="w-3.5 h-3.5 text-rose-600" />
                <span>স্বাস্থ্য ও টিকাদান সুরক্ষা শিডিউলার</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                প্রাণিসম্পদ অধিদপ্তর (DLS) অনুমোদিত প্রটোকল
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                আজকের তারিখ: ১০ নভেম্বর ২০২৬ (মঙ্গলবার)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <CalendarIcon className="w-7 h-7 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>ভ্যাকসিন ও স্বাস্থ্য সুরক্ষা ক্যালেন্ডার ও নোটিফিকেশন সিস্টেম</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              খামারের প্রতিটি পশুর আসন্ন টিকা, বুস্টার ডোজ ও স্বাস্থ্য পরীক্ষার সময়সূচি ট্র্যাক করুন এবং স্বয়ংক্রিয় নোটিফিকেশনে অবহিত থাকুন।
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন টিকা শিডিউল</span>
            </button>

            <button
              onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                showNotificationDrawer 
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Bell className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>নোটিফিকেশন ({urgentNotifications.length})</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              title="ভ্যাকসিনেশন শিডিউল প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. DYNAMIC WORK PROGRESS & IMMUNITY TRACKER */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                খামার সামগ্রিক টিকাদান অগ্রগতি ও রোগ প্রতিরোধ সক্ষমতা
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {progressPercent}%
                </span>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  ({completedCount}/{totalCount} টি পশু সম্পূর্ণ টিকা-সুরক্ষিত)
                </span>
              </div>
            </div>

            {/* Safety Tier Status Badge */}
            <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                progressPercent >= 80 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                progressPercent >= 50 ? 'bg-amber-100 dark:bg-amber-950 text-amber-600' :
                'bg-rose-100 dark:bg-rose-950 text-rose-600'
              }`}>
                {progressPercent >= 80 ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  {progressPercent >= 80 ? 'হার্ড ইমিউনিটি সুরক্ষা নিশ্চিত (সন্তোষজনক)' :
                   progressPercent >= 50 ? 'মাঝারি প্রতিরোধ স্তর (আসন্ন টিকাগুলো বাকি)' :
                   'উচ্চ সংক্রমণ ঝুঁকি (জরুরি টিকাদান অভিযান প্রয়োজন)'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {overdueCount > 0 ? `${overdueCount} টি টিকার তারিখ অতিক্রান্ত হয়েছে!` : 'আসন্ন শিডিউল অনুযায়ী ব্যবস্থা নিন'}
                </p>
              </div>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-5 sm:h-6 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-1 shadow-inner relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                  progressPercent >= 80 
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600' 
                    : progressPercent >= 50 
                    ? 'bg-gradient-to-r from-amber-500 via-teal-500 to-emerald-500' 
                    : 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600'
                }`}
                style={{ width: `${Math.max(progressPercent, 4)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
              <span>০% টিকাদানহীন</span>
              <span>৫০% আংশিক ভ্যাকসিনেটেড</span>
              <span>১০০% শতভাগ রোগমুক্ত ও সুরক্ষিত</span>
            </div>
          </div>

          {/* Species-wise Progress Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Cattle */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🐄</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">গরু ও বাছুর</span>
                </div>
                <span className="text-xs font-mono font-black text-emerald-600">{cattleProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${cattleProgress}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 font-bold">
                {cattleCompleted}/{cattleSchedules.length} টি সম্পন্ন (খুরারোগ, তড়কা, বাদলা)
              </p>
            </div>

            {/* Goat */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🐐</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">ছাগল ও ভেড়া</span>
                </div>
                <span className="text-xs font-mono font-black text-teal-600">{goatProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${goatProgress}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 font-bold">
                {goatCompleted}/{goatSchedules.length} টি সম্পন্ন (পিপিআর, গোটপক্স, এন্টারোটক্সেমিয়া)
              </p>
            </div>

            {/* Poultry */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🐔</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">পোল্ট্রি ও হাঁস-মুরগি</span>
                </div>
                <span className="text-xs font-mono font-black text-rose-600">{poultryProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${poultryProgress}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 font-bold">
                {poultryCompleted}/{poultrySchedules.length} টি সম্পন্ন (রাণীক্ষেত, গামবোরো ড্রপ)
              </p>
            </div>
          </div>
        </div>

        {/* 3. SMART NOTIFICATION CENTER FOR UPCOMING VACCINES */}
        {showNotificationDrawer && (
          <div className="p-6 rounded-3xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20 animate-pulse">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>আসন্ন ও জরুরি টিকা নোটিফিকেশন সেন্টার</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-black">
                      {urgentNotifications.length} টি সতর্কবার্তা
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    প্রতিটি পশুর আসন্ন ভ্যাকসিনেশনের নির্ধারিত তারিখের ওপর ভিত্তি করে স্বয়ংক্রিয়ভাবে অ্যালার্ট তৈরি হয়েছে।
                  </p>
                </div>
              </div>

              {/* Action: Send SMS Alert to Vet & Staff */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleTriggerSmsNotification}
                  disabled={smsAlertSent}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    smsAlertSent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-100'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{smsAlertSent ? 'এসএমএস অ্যালার্ট পাঠানো হয়েছে ✓' : 'ডাক্তার ও কর্মীকে SMS রিমাইন্ডার পাঠান'}</span>
                </button>
              </div>
            </div>

            {/* Notification alert cards list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {urgentNotifications.map(item => {
                const daysRemaining = calculateDaysRemaining(item.dueDate);
                const isOverdue = daysRemaining < 0;
                const isToday = daysRemaining === 0;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isOverdue 
                        ? 'bg-rose-100/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800' 
                        : isToday 
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block">ID: {item.animalId}</span>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                            {item.animalName}
                          </h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                          isOverdue 
                            ? 'bg-rose-600 text-white animate-pulse' 
                            : isToday 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                        }`}>
                          {isOverdue ? `${Math.abs(daysRemaining)} দিন পার হয়েছে!` : isToday ? 'আজকে নির্ধারিত!' : `${daysRemaining} দিন বাকি`}
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-1 text-[11px]">
                        <p className="font-extrabold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                          <Syringe className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.vaccineName}</span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          প্রতিরোধ: <span className="font-bold text-slate-800 dark:text-slate-200">{item.targetDisease}</span>
                        </p>
                        <p className="text-slate-500 text-[10px]">
                          ডোজ: <b>{item.doseAmount}</b> ({item.route})
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400">তারিখ: {item.dueDate}</span>
                      <button
                        onClick={() => setCompletingItem(item)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>টিকা সম্পন্ন করুন</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. VIEW SELECTOR & FILTERS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Calendar vs Roster View buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveViewMode('calendar')}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeViewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-rose-500" />
              <span>মাসিক ক্যালেন্ডার ও টাইমলাইন</span>
            </button>
            <button
              onClick={() => setActiveViewMode('roster')}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeViewMode === 'roster'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-500" />
              <span>পশুবিত্তিক তালিকা ভিউ ({filteredSchedules.length})</span>
            </button>
          </div>

          {/* Search & Species filter */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 sm:justify-end">
            <div className="relative flex-1 sm:w-60 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="পশুর নাম, ID বা টিকার নাম..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <option value="all">সকল প্রজাতি (All Species)</option>
              <option value="গরু">গরু (Cattle)</option>
              <option value="ছাগল">ছাগল (Goat)</option>
              <option value="মুরগি">পোল্ট্রি / হাঁস-মুরগি</option>
            </select>

            <select
              value={notificationFilter}
              onChange={(e) => setNotificationFilter(e.target.value as any)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <option value="all">সকল স্ট্যাটাস</option>
              <option value="urgent_today">আজকে ও মেয়াদোত্তীর্ণ ({overdueCount + dueTodayCount})</option>
              <option value="next_7_days">আগামী ৭ দিনের জরুরি ({upcomingUrgentCount})</option>
              <option value="completed">সম্পন্ন টিকাসমূহ ({completedCount})</option>
            </select>
          </div>
        </div>

        {/* 5A. VIEW MODE 1: MONTHLY CALENDAR GRID & TIMELINE */}
        {activeViewMode === 'calendar' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Calendar Grid (8 cols) */}
              <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                {/* Month navigation */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {currentMonth === 10 ? 'নভেম্বর ২০২৬ (November 2026)' : `${currentMonth + 1} মাস ${currentYear}`}
                    </h3>
                    <span className="text-xs font-bold text-slate-500">
                      ({schedules.length} টি নির্ধারিত টিকা)
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (currentMonth === 0) {
                          setCurrentMonth(11);
                          setCurrentYear(y => y - 1);
                        } else {
                          setCurrentMonth(m => m - 1);
                        }
                      }}
                      className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentMonth(10);
                        setCurrentYear(2026);
                        setSelectedCalendarDate(TODAY_STR);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      বর্তমান মাস
                    </button>
                    <button
                      onClick={() => {
                        if (currentMonth === 11) {
                          setCurrentMonth(0);
                          setCurrentYear(y => y + 1);
                        } else {
                          setCurrentMonth(m => m + 1);
                        }
                      }}
                      className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day of Week headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black text-slate-400">
                  <span>রবি</span>
                  <span>সোম</span>
                  <span>মঙ্গল</span>
                  <span>বুধ</span>
                  <span>বৃহ</span>
                  <span>শুক্র</span>
                  <span>শনি</span>
                </div>

                {/* Calendar Days Cells */}
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((day, idx) => {
                    const dayEvents = schedulesByDate[day.dateStr] || [];
                    const isSelected = selectedCalendarDate === day.dateStr;
                    const isToday = day.dateStr === TODAY_STR;
                    const hasOverdue = dayEvents.some(e => e.status === 'overdue');
                    const hasToday = dayEvents.some(e => e.status === 'due_today');
                    const hasUrgent = dayEvents.some(e => e.status === 'upcoming_urgent');
                    const hasCompleted = dayEvents.some(e => e.status === 'completed');

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedCalendarDate(day.dateStr)}
                        className={`min-h-[64px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 ring-2 ring-rose-400/40 shadow-xs'
                            : isToday
                            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                            : day.isCurrentMonth
                            ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                            : 'bg-slate-100/50 dark:bg-slate-800/20 border-transparent opacity-40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-black ${
                            isSelected ? 'text-rose-600' : isToday ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {day.dayNum}
                          </span>
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="আজকের দিন" />
                          )}
                        </div>

                        {/* Vaccine Badge Dots */}
                        <div className="flex items-center gap-1 flex-wrap mt-1">
                          {dayEvents.slice(0, 3).map((ev, eIdx) => (
                            <span
                              key={eIdx}
                              title={`${ev.animalName}: ${ev.vaccineName}`}
                              className={`w-2 h-2 rounded-full ${
                                ev.status === 'completed'
                                  ? 'bg-emerald-500'
                                  : ev.status === 'overdue'
                                  ? 'bg-rose-600 animate-pulse'
                                  : ev.status === 'due_today'
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[9px] font-mono text-slate-400 font-bold">
                              +{dayEvents.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <span>মেয়াদোত্তীর্ণ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>আজকে নির্ধারিত</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>আসন্ন শিডিউল</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>টিকা সম্পন্ন</span>
                  </div>
                </div>
              </div>

              {/* Day Details Timeline (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">নির্বাচিত তারিখের শিডিউল</span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedCalendarDate} {selectedCalendarDate === TODAY_STR ? '(আজকের দিন)' : ''}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-300">
                    {selectedDateSchedules.length} টি টিকা
                  </span>
                </div>

                {/* Timeline items for selected date */}
                {selectedDateSchedules.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                    <Syringe className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-500">এই তারিখে কোনো টিকাদান নির্ধারিত নেই।</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-xs font-extrabold text-rose-600 hover:underline cursor-pointer"
                    >
                      + নতুন শিডিউল যোগ করুন
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {selectedDateSchedules.map(item => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 block">{item.animalId}</span>
                            <span className="font-black text-slate-900 dark:text-white">{item.animalName}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            item.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.status === 'overdue'
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.status === 'completed' ? 'সম্পন্ন ✓' : item.status === 'overdue' ? 'মেয়াদোত্তীর্ণ' : 'অপেক্ষমাণ'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="font-extrabold text-rose-600 dark:text-rose-400">{item.vaccineName}</p>
                          <p className="text-slate-500 text-[11px]">ডোজ: <b>{item.doseAmount}</b> ({item.route})</p>
                          {item.notes && <p className="text-slate-400 italic text-[11px]">"{item.notes}"</p>}
                        </div>

                        {item.status !== 'completed' ? (
                          <button
                            onClick={() => setCompletingItem(item)}
                            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>টিকা প্রদান নিশ্চিত করুন</span>
                          </button>
                        ) : (
                          <div className="text-[11px] font-bold text-emerald-600 pt-1 border-t border-slate-200 dark:border-slate-700">
                            ✓ {item.completedAt} সম্পন্ন হয়েছে ({item.administeredBy})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5B. VIEW MODE 2: ANIMAL ROSTER DETAILED TABLE/CARDS */}
        {activeViewMode === 'roster' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4">পশুর নাম ও পরিচিতি</th>
                    <th className="p-4">প্রজাতি ও বয়স</th>
                    <th className="p-4">টিকার নাম ও লক্ষ্যিত রোগ</th>
                    <th className="p-4">ডোজ ও প্রয়োগ পদ্ধতি</th>
                    <th className="p-4">নির্ধারিত তারিখ ও সময়</th>
                    <th className="p-4">স্ট্যাটাস</th>
                    <th className="p-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredSchedules.map(item => {
                    const daysRemaining = calculateDaysRemaining(item.dueDate);
                    const isOverdue = daysRemaining < 0 && item.status !== 'completed';
                    const isToday = daysRemaining === 0 && item.status !== 'completed';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm shrink-0">
                              {item.speciesType.includes('গরু') ? '🐄' : item.speciesType.includes('ছাগল') ? '🐐' : '🐔'}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white">{item.animalName}</p>
                              <span className="text-[10px] font-mono text-slate-400">ID: {item.animalId} · {item.breed}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.speciesType}</span>
                          <span className="text-[10px] text-slate-400">বয়স: {item.age} · {item.weightKg}kg</span>
                        </td>

                        <td className="p-4">
                          <p className="font-black text-rose-600 dark:text-rose-400">{item.vaccineName}</p>
                          <span className="text-[10px] text-slate-500 font-bold">{item.targetDisease}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.doseAmount}</span>
                          <span className="text-[10px] text-slate-500">{item.route}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-mono font-black text-slate-900 dark:text-white block">{item.dueDate}</span>
                          <span className={`text-[10px] font-bold ${
                            isOverdue ? 'text-rose-600 font-black' : isToday ? 'text-amber-600 font-black' : 'text-slate-400'
                          }`}>
                            {item.status === 'completed' ? 'সম্পন্ন' : isOverdue ? `${Math.abs(daysRemaining)} দিন পার হয়েছে!` : isToday ? 'আজকে নির্ধারিত!' : `${daysRemaining} দিন বাকি`}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                            item.status === 'completed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : isOverdue
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse'
                              : isToday
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}>
                            {item.status === 'completed' ? 'সম্পন্ন ✓' : isOverdue ? 'মেয়াদোত্তীর্ণ ⚠️' : isToday ? 'আজকে করণীয়' : 'আসন্ন'}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          {item.status !== 'completed' ? (
                            <button
                              onClick={() => setCompletingItem(item)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs inline-flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>টিকা দিন</span>
                            </button>
                          ) : (
                            <div className="text-[10px] text-slate-400 text-right">
                              <span className="text-emerald-600 font-bold block">রেকর্ড সংরক্ষিত</span>
                              <span>পরবর্তী বুস্টার: {item.nextBoosterDate || 'নির্ধারিত'}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRM COMPLETION MODAL */}
      {completingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setCompletingItem(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Syringe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">টিকা প্রদান নিশ্চিতকরণ</h3>
                <p className="text-xs text-slate-500">পশু: {completingItem.animalName} ({completingItem.animalId})</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">টিকার নাম:</span>
                <span className="font-black text-rose-600">{completingItem.vaccineName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">প্রতিরোধ:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{completingItem.targetDisease}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">নির্ধারিত ডোজ:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{completingItem.doseAmount} ({completingItem.route})</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">প্রদানকারী ভেটেরিনারি সার্জন / অফিসার:</label>
                <input
                  type="text"
                  value={vetName}
                  onChange={(e) => setVetName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ভ্যাকসিন ব্যাচ / লট নম্বর:</label>
                <input
                  type="text"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCompletingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md transition-all"
              >
                টিকা সফলভাবে সম্পন্ন করুন ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SCHEDULE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-600" />
              <span>নতুন টিকা ও স্বাস্থ্য পরীক্ষা শিডিউল নির্ধারণ</span>
            </h3>

            <form onSubmit={handleAddSchedule} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">পশু নির্বাচন করুন:</label>
                <select
                  value={newAnimalId}
                  onChange={(e) => setNewAnimalId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  {livestock.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type} · ID: {a.id} · {a.currentWeight}kg)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">টিকার নাম:</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: খুরারোগ (FMD) বা পিপিআর"
                    value={newVaccineName}
                    onChange={(e) => setNewVaccineName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">লক্ষ্যিত রোগ (Target Disease):</label>
                  <input
                    type="text"
                    placeholder="যেমন: খুরা রোগ বা অ্যানথ্রাক্স"
                    value={newTargetDisease}
                    onChange={(e) => setNewTargetDisease(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ডোজের পরিমাণ:</label>
                  <input
                    type="text"
                    placeholder="যেমন: ২ মি.লি. বা ১ ফোঁটা"
                    value={newDoseAmount}
                    onChange={(e) => setNewDoseAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">প্রয়োগের পদ্ধতি (Route):</label>
                  <select
                    value={newRoute}
                    onChange={(e) => setNewRoute(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="চামড়ার নিচে (Subcutaneous)">চামড়ার নিচে (Subcutaneous)</option>
                    <option value="মাংসপেশিতে (Intramuscular)">মাংসপেশিতে (Intramuscular)</option>
                    <option value="চোখে ড্রপ (Eye Drop)">চোখে ড্রপ (Eye Drop)</option>
                    <option value="মুখে খাওয়ানো (Oral)">মুখে খাওয়ানো (Oral)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">টিকা দেওয়ার নির্ধারিত তারিখ:</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">বিশেষ স্বাস্থ্য পর্যবেক্ষণ নোট:</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="যেমন: টিকা দেওয়ার আগে তাপমাত্রা চেক করতে হবে"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition-colors"
                >
                  শিডিউল সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
