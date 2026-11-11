import React, { useState, useMemo } from 'react';
import { LivestockItem, HealthLog } from '../types';
import { farmStore } from '../services/farmStore';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, 
  Clock, Stethoscope, HeartHandshake, Utensils, Droplets, Filter, 
  Printer, Plus, Search, Tag, AlertTriangle, Sparkles, Check, X,
  Layers, Compass, ShieldAlert, Award
} from 'lucide-react';

export type CalendarEventType = 'vaccination' | 'breeding' | 'feeding' | 'pond' | 'general';
export type CalendarViewMode = 'month' | 'week' | 'agenda';

export interface FarmCalendarEvent {
  id: string;
  title: string;
  animalId?: string;
  animalName?: string;
  speciesType: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD
  time?: string;
  priority: 'জরুরি' | 'সাধারণ' | 'নিয়মিত';
  status: 'অপেক্ষমাণ' | 'সম্পন্ন';
  description: string;
  actionRequired?: string;
}

interface FarmCalendarProps {
  livestock: LivestockItem[];
  healthLogs: HealthLog[];
  onSelectAnimal?: (animalId: string) => void;
}

export const FarmCalendar: React.FC<FarmCalendarProps> = ({
  livestock,
  healthLogs,
  onSelectAnimal
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedEventIds, setCompletedEventIds] = useState<Set<string>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<FarmCalendarEvent | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState<boolean>(false);
  const [customEvents, setCustomEvents] = useState<FarmCalendarEvent[]>([]);

  // Form for custom event
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarEventType>('vaccination');
  const [newSpecies, setNewSpecies] = useState('গরু (Cattle)');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('১০:০০ AM');
  const [newPriority, setNewPriority] = useState<'জরুরি' | 'সাধারণ' | 'নিয়মিত'>('সাধারণ');
  const [newDesc, setNewDesc] = useState('');

  // Generate Synced Events dynamically from live livestock and healthLogs
  const syncedEvents = useMemo(() => {
    const events: FarmCalendarEvent[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 1. Sync from Health Logs & Next Vaccine Dates
    healthLogs.forEach(log => {
      if (log.nextVaccineDate) {
        events.push({
          id: `vac-hl-${log.id}`,
          title: `ভ্যাকসিন বুস্টার: ${log.vaccinationName}`,
          animalId: log.animalId,
          animalName: log.animalName,
          speciesType: log.animalName.includes('গাভী') || log.animalName.includes('সাহীওয়াল') ? 'গরু (Cattle)' : 'ছাগল (Goat)',
          type: 'vaccination',
          date: log.nextVaccineDate,
          time: 'সকাল ০৯:০০ AM',
          priority: 'জরুরি',
          status: 'অপেক্ষমাণ',
          description: `নিয়মিত রুটিন টিকা প্রদান ও ভেটেরিনারি সার্জন দ্বারা স্বাস্থ্য পর্যবেক্ষণ। পরিদর্শক: ${log.inspectorName}`,
          actionRequired: 'টিকা দেওয়ার আগে শারীরিক তাপমাত্রা ও জাবর কাটার অবস্থা যাচাই করুন।'
        });
      }
    });

    // 2. Generate Scheduled Events per Animal based on species biology
    livestock.forEach(animal => {
      const type = animal.type.toLowerCase();
      const pMonthStr = String(month + 1).padStart(2, '0');
      const pYearStr = String(year);

      // 2.1 Vaccination Schedules based on species
      if (type.includes('গরু') || type.includes('cattle') || type.includes('cow')) {
        events.push({
          id: `vac-c-fmd-${animal.id}`,
          title: `খুরারোগ (FMD) প্রতিরোধক বুস্টার ডোজ`,
          animalId: animal.id,
          animalName: animal.name,
          speciesType: 'গরু (Cattle)',
          type: 'vaccination',
          date: `${pYearStr}-${pMonthStr}-12`,
          time: 'সকাল ১০:০০ AM',
          priority: 'জরুরি',
          status: 'অপেক্ষমাণ',
          description: `বাংলাদেশ প্রাণিসম্পদ গবেষণা প্রতিষ্ঠান (BLRI) সুপারিশকৃত FMD ট্রাইভ্যালেন্ট টিকা প্রয়োগ।`,
          actionRequired: 'ঠান্ডা চেইন (৪-৮°সে) বজায় রেখে টিকা সংরক্ষণ করুন।'
        });

        // Cattle Gestation / Breeding cycle
        events.push({
          id: `brd-c-${animal.id}`,
          title: `কৃত্রিম প্রজনন ও আল্ট্রাসনোগ্রাফি প্রেগন্যান্সি চেক`,
          animalId: animal.id,
          animalName: animal.name,
          speciesType: 'গরু (Cattle)',
          type: 'breeding',
          date: `${pYearStr}-${pMonthStr}-18`,
          time: 'সকাল ১১:৩০ AM',
          priority: 'সাধারণ',
          status: 'অপেক্ষমাণ',
          description: `সাহীওয়াল জাতের প্রজনন ক্ষমতা ও গর্ভকালীন ২৮৩ দিন মেয়াদের ৬০ দিন চেকআপ।`,
          actionRequired: 'ডিএলএস ভেট টেকনিশিয়ান কল করে আল্ট্রাসাউন্ড নিশ্চিত করুন।'
        });
      } else if (type.includes('ছাগল') || type.includes('goat')) {
        events.push({
          id: `vac-g-ppr-${animal.id}`,
          title: `পিপিআর (PPR) লাইভ ভ্যাক্সিন প্রয়োগ`,
          animalId: animal.id,
          animalName: animal.name,
          speciesType: 'ছাগল (Goat)',
          type: 'vaccination',
          date: `${pYearStr}-${pMonthStr}-15`,
          time: 'সকাল ০৯:৩০ AM',
          priority: 'জরুরি',
          status: 'অপেক্ষমাণ',
          description: `ছাগলের পিপিআর রোগ প্রতিরোধে সাবকিউটেনিয়াস ১ মিলি ইনজেকশন।`,
          actionRequired: 'টিকা দেওয়ার পর ২৪ ঘণ্টা নিবিড় পর্যবেক্ষণে রাখুন।'
        });

        // Goat Breeding
        events.push({
          id: `brd-g-${animal.id}`,
          title: `যমুনাপারি ব্রিডিং সাইকেল ও পাল সিলেকশন`,
          animalId: animal.id,
          animalName: animal.name,
          speciesType: 'ছাগল (Goat)',
          type: 'breeding',
          date: `${pYearStr}-${pMonthStr}-24`,
          time: 'বিকাল ০৩:৩০ PM',
          priority: 'সাধারণ',
          status: 'অপেক্ষমাণ',
          description: `১৫০ দিনের গর্ভধারণ সম্ভাব্যতা ও খাঁটি জাতের ক্রস ব্রিডিং রেকর্ড এন্ট্রি।`,
          actionRequired: 'ওজন ও ক্যালসিয়াম মিক্স খাদ্যের অনুপাত বৃদ্ধি করুন।'
        });
      } else if (type.includes('হাঁস') || type.includes('duck')) {
        events.push({
          id: `vac-d-plague-${animal.id}`,
          title: `ডাক প্লেগ ও ডাক কলেরা টিকাদান`,
          animalId: animal.id,
          animalName: animal.name,
          speciesType: 'হাঁস (Duck)',
          type: 'vaccination',
          date: `${pYearStr}-${pMonthStr}-08`,
          time: 'সকাল ০৮:০০ AM',
          priority: 'জরুরি',
          status: 'অপেক্ষমাণ',
          description: `খাকি ক্যাম্পবেল ও পেকিন হাঁস পালের জন্য ডাক প্লেগ লাইভ ভ্যাকসিন।`,
          actionRequired: 'টিকা প্রদানের দিন জলাশয়ে সাঁতার ২ ঘণ্টা স্থগিত রাখুন।'
        });

        // Duck Breeding / Hatching
        events.push({
          id: `brd-d-${animal.id}`,
          title: `২৮ দিনের ইনকিউবেটর ডিম হ্যাচিং শিডিউল`,
          animalId: animal.id,
          animalName: animal.name,
          speciesType: 'হাঁস (Duck)',
          type: 'breeding',
          date: `${pYearStr}-${pMonthStr}-22`,
          time: 'সকাল ১০:০০ AM',
          priority: 'জরুরি',
          status: 'অপেক্ষমাণ',
          description: `ইনকিউবেটরে ৩৭.৫°সে তাপমাত্রা ও ৬৫% আর্দ্রতায় ডিম ফুটে বাচ্চা বের হওয়া।`,
          actionRequired: 'ব্রুডার হাউজে হিটিং ল্যাম্প ও স্টার্টার ক্রাম্বল প্রস্তুত রাখুন।'
        });
      } else if (type.includes('মুরগি') || type.includes('chicken') || type.includes('poultry')) {
        events.push({
          id: `vac-p-rdv-${animal.id}`,
          title: `রানীক্ষেত (Ranikhet RDV) ও গামবোরো বুস্টার`,
          animalId: animal.id,
          animalName: animal.name,
          speciesType: 'মুরগি (Chicken)',
          type: 'vaccination',
          date: `${pYearStr}-${pMonthStr}-10`,
          time: 'সকাল ০৭:০০ AM',
          priority: 'জরুরি',
          status: 'অপেক্ষমাণ',
          description: `সোনালী প্যারেন্ট স্টকের জন্য চোখে ফোঁটা ও ড্রিংকিং ওয়াটার ভ্যাকসিনেশন।`,
          actionRequired: 'পানিতে ক্লোরিনমুক্ত দুধ বা স্টেবিলাইজার মিশিয়ে প্রয়োগ করুন।'
        });

        // Poultry 21-day incubation
        events.push({
          id: `brd-p-${animal.id}`,
          title: `২১ দিনের সোনালী ডিম ফুটানো ও ক্যান্ডলিং টেস্ট`,
          animalId: animal.id,
          animalName: animal.name,
          speciesType: 'মুরগি (Chicken)',
          type: 'breeding',
          date: `${pYearStr}-${pMonthStr}-20`,
          time: 'সকাল ১১:০০ AM',
          priority: 'সাধারণ',
          status: 'অপেক্ষমাণ',
          description: `১৪তম দিনে ডিমের রক্তনালী ক্যান্ডলিং টেস্ট ও ২১তম দিনে হ্যাচারি স্থানান্তর।`,
          actionRequired: 'অনুর্বর ডিম পৃথক করে স্যানিটাইজেশন নিশ্চিত করুন।'
        });
      } else if (type.includes('পাখি') || type.includes('bird')) {
        events.push({
          id: `brd-b-${animal.id}`,
          title: `১৭ দিনের দ্রুতগতির পাখির ডিম হ্যাচিং ও ব্রুডিং`,
          animalId: animal.id,
          animalName: animal.name,
          speciesType: 'পাখি (Birds)',
          type: 'breeding',
          date: `${pYearStr}-${pMonthStr}-14`,
          time: 'সকাল ০৯:০০ AM',
          priority: 'সাধারণ',
          status: 'অপেক্ষমাণ',
          description: `পাখি ব্রুডার প্যাকের নতুন লট হ্যাচিং এবং খাঁচায় স্থানান্তর।`,
          actionRequired: 'ছানাগুলোর জন্য অগভীর পাত্রে মিষ্টি পানির ব্যবস্থা রাখুন।'
        });
      } else if (type.includes('মাছ') || type.includes('fish')) {
        // Fish Pond Maintenance
        events.push({
          id: `pnd-f-lime-${animal.id}`,
          title: `পুকুরে কৃষি চুন ও জিওলাইট প্রয়োগ (pH ব্যালান্স)`,
          animalId: animal.id,
          animalName: animal.name,
          speciesType: 'মাছ (Fish)',
          type: 'pond',
          date: `${pYearStr}-${pMonthStr}-05`,
          time: 'সকাল ০৮:৩০ AM',
          priority: 'জরুরি',
          status: 'অপেক্ষমাণ',
          description: `পুকুরের তলার গ্যাস দূরীকরণ ও পানির অম্লত্ব কমাতে প্রতি শতকে ২৫০ গ্রাম কৃষি চুন প্রয়োগ।`,
          actionRequired: 'চুন আগে মাটির পাত্রে ভিজিয়ে ঠান্ডা করে সমানভাবে ছিটিয়ে দিন।'
        });

        events.push({
          id: `pnd-f-water-${animal.id}`,
          title: `পুকুরের পানি আংশিক নিষ্কাশন ও নতুন সেচ`,
          animalId: animal.id,
          animalName: animal.name,
          speciesType: 'মাছ (Fish)',
          type: 'pond',
          date: `${pYearStr}-${pMonthStr}-25`,
          time: 'সকাল ০৬:০০ AM',
          priority: 'সাধারণ',
          status: 'অপেক্ষমাণ',
          description: `গরমের মৌসুমে পানির তাপমাত্রা ৩০°সে নিচে রাখতে গভীর নলকূপ থেকে ঠান্ডা পানির সরবরাহ।`,
          actionRequired: 'অক্সিজেন লেভেল ও প্ল্যাঙ্কটন ঘনত্ব সেকচি ডিস্কে পরিমাপ করুন।'
        });

        // Fish Spawning / Hatching cycle
        events.push({
          id: `brd-f-spawn-${animal.id}`,
          title: `কার্প ও তেলাপিয়া কৃত্রিম প্রজনন ও রেনু পোনা উৎপাদন`,
          animalId: animal.id,
          animalName: animal.name,
          speciesType: 'মাছ (Fish)',
          type: 'breeding',
          date: `${pYearStr}-${pMonthStr}-16`,
          time: 'রাত ১১:০০ PM',
          priority: 'জরুরি',
          status: 'অপেক্ষমাণ',
          description: `হ্যাচারিতে ব্রিডার মাছের পিটুইটারি হরমোন ইনজেকশন ও কৃত্রিম সার্কুলার পুলে ডিম ফুটানো।`,
          actionRequired: 'সার্কুলার পুলে নিরবচ্ছিন্ন পানির ঘূর্ণন ও অক্সিজেন সচল রাখুন।'
        });
      }

      // 2.2 Routine Daily Feeding Slots for active days
      [3, 7, 13, 21, 28].forEach(day => {
        const dayStr = String(day).padStart(2, '0');
        events.push({
          id: `feed-auto-${animal.id}-${day}`,
          title: `সুষম দানাদার ও কাঁচা খাদ্য পরিবেশন: ${animal.name}`,
          animalId: animal.id,
          animalName: animal.name,
          speciesType: animal.type,
          type: 'feeding',
          date: `${pYearStr}-${pMonthStr}-${dayStr}`,
          time: 'সকাল ০৭:৩০ AM & দুপুর ০১:০০ PM',
          priority: 'নিয়মিত',
          status: 'অপেক্ষমাণ',
          description: `দৈনিক পুষ্টি চার্ট অনুযায়ী বরাদ্দ: ${animal.dailyDietPlan || 'সুষম খাদ্য'}`,
          actionRequired: 'ফিড ট্রে পরিষ্কার করে অবশিষ্ট খাবারের হিসাব এন্ট্রি করুন।'
        });
      });
    });

    return [...events, ...customEvents];
  }, [livestock, healthLogs, currentDate, customEvents]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return syncedEvents.filter(ev => {
      // Type Filter
      if (selectedTypeFilter !== 'all' && ev.type !== selectedTypeFilter) return false;

      // Species Filter
      if (selectedSpeciesFilter !== 'all') {
        const spec = ev.speciesType.toLowerCase();
        if (selectedSpeciesFilter === 'cattle' && !(spec.includes('গরু') || spec.includes('cattle'))) return false;
        if (selectedSpeciesFilter === 'goat' && !(spec.includes('ছাগল') || spec.includes('goat'))) return false;
        if (selectedSpeciesFilter === 'duck' && !(spec.includes('হাঁস') || spec.includes('duck'))) return false;
        if (selectedSpeciesFilter === 'chicken' && !(spec.includes('মুরগি') || spec.includes('chicken'))) return false;
        if (selectedSpeciesFilter === 'birds' && !(spec.includes('পাখি') || spec.includes('bird'))) return false;
        if (selectedSpeciesFilter === 'fish' && !(spec.includes('মাছ') || spec.includes('fish'))) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesAnimal = (ev.animalName || '').toLowerCase().includes(q);
        const matchesDesc = ev.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAnimal && !matchesDesc) return false;
      }

      return true;
    });
  }, [syncedEvents, selectedTypeFilter, selectedSpeciesFilter, searchQuery]);

  // Calendar Date Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const daysOfWeekBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Calendar cells matrix (6 rows x 7 days)
  const calendarCells = useMemo(() => {
    const cells = [];
    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = prevDate.toISOString().split('T')[0];
      cells.push({
        date: prevDate,
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        date: dateObj,
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding to fill grid
    const totalRemaining = 42 - cells.length;
    for (let d = 1; d <= totalRemaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = nextDate.toISOString().split('T')[0];
      cells.push({
        date: nextDate,
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return cells;
  }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth]);

  // Group events by date string
  const eventsByDate = useMemo(() => {
    const map: Record<string, FarmCalendarEvent[]> = {};
    filteredEvents.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [filteredEvents]);

  // Today's summary tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = useMemo(() => {
    return filteredEvents.filter(e => e.date === todayStr);
  }, [filteredEvents, todayStr]);

  const upcomingHighPriorityEvents = useMemo(() => {
    return filteredEvents
      .filter(e => e.priority === 'জরুরি' && !completedEventIds.has(e.id))
      .slice(0, 5);
  }, [filteredEvents, completedEventIds]);

  const handleToggleEventCompletion = (eventId: string) => {
    setCompletedEventIds(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const handleCreateCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEv: FarmCalendarEvent = {
      id: `custom-ev-${Date.now()}`,
      title: newTitle,
      speciesType: newSpecies,
      type: newType,
      date: newDate,
      time: newTime,
      priority: newPriority,
      status: 'অপেক্ষমাণ',
      description: newDesc || 'খামার ব্যবস্থাপক দ্বারা তৈরি ম্যানুয়াল টাস্ক।',
    };

    setCustomEvents(prev => [newEv, ...prev]);
    setShowAddEventModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  // Helper colors & icons for event types
  const getEventTypeMeta = (type: CalendarEventType) => {
    switch (type) {
      case 'vaccination':
        return {
          label: 'ভ্যাকসিনেশন ও টিকা',
          color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
          badgeColor: 'bg-rose-600 text-white',
          dotColor: 'bg-rose-500',
          icon: Stethoscope,
        };
      case 'breeding':
        return {
          label: 'প্রজনন ও হ্যাচিং চক্র',
          color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900',
          badgeColor: 'bg-purple-600 text-white',
          dotColor: 'bg-purple-500',
          icon: HeartHandshake,
        };
      case 'feeding':
        return {
          label: 'খাদ্য শিডিউল ও রুটিন',
          color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
          badgeColor: 'bg-amber-600 text-white',
          dotColor: 'bg-amber-500',
          icon: Utensils,
        };
      case 'pond':
        return {
          label: 'পুকুর ও মাছ পরিচর্যা',
          color: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900',
          badgeColor: 'bg-cyan-600 text-white',
          dotColor: 'bg-cyan-500',
          icon: Droplets,
        };
      default:
        return {
          label: 'সাধারণ খামার কাজ',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
          badgeColor: 'bg-emerald-600 text-white',
          dotColor: 'bg-emerald-500',
          icon: CalendarIcon,
        };
    }
  };

  return (
    <div className="space-y-8 print:p-0">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#006a4e] via-[#059669] to-[#047857] text-white shadow-xl relative overflow-hidden">
        {/* Subtle geometric pattern */}
        <div className="absolute right-0 top-0 w-80 h-80 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,0 100,50 50,100 0,50" />
            <polygon points="50,15 85,50 50,85 15,50" />
          </svg>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-400/30 text-xs font-bold tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>লাইভস্টক ড্যাশবোর্ড অটো-সিঙ্কড প্ল্যাটফর্ম</span>
              </span>
              <span className="text-xs text-emerald-100">·</span>
              <span className="text-xs text-emerald-100 font-semibold">৬টি প্রজাতি অন্তর্ভুক্ত</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
              <span>খামার যৌথ ক্যালেন্ডার ও শিডিউলার</span>
            </h2>

            <p className="text-sm text-emerald-50 leading-relaxed font-medium">
              গবাদিপশুর ভ্যাকসিনেশন ও বুস্টার ডোজ, প্রজনন ও হ্যাচিং সাইকেল, দৈনিক পুষ্টি খাদ্য রুটিন এবং
              মৎস্য হ্যাচারির পানির পরিচর্যা টাস্কের স্বয়ংক্রিয় সমন্বিত সময়সূচি।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
              title="ক্যালেন্ডার ও শিডিউল প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
              <span>শিডিউল প্রিন্ট</span>
            </button>

            <button
              onClick={() => setShowAddEventModal(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-black/10 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-900" />
              <span>নতুন শিডিউল যুক্ত করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's High Priority Urgent Tasks Banner */}
      {upcomingHighPriorityEvents.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-white to-rose-50 dark:from-rose-950/20 dark:via-slate-900 dark:to-rose-950/20 border border-rose-200 dark:border-rose-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-500 text-white shadow-sm">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>আসন্ন জরুরি ভ্যাকসিন ও পর্যবেক্ষণ অ্যালার্ট</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 text-[10px] font-black font-mono">
                    {upcomingHighPriorityEvents.length} টি
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  নির্ধারিত তারিখের মধ্যে সম্পন্ন নিশ্চিত করে চেকমার্ক দিন।
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 hidden sm:inline">
              উচ্চ অগ্রাধিকার (High Priority)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {upcomingHighPriorityEvents.map(ev => {
              const meta = getEventTypeMeta(ev.type);
              const isDone = completedEventIds.has(ev.id);
              return (
                <div
                  key={ev.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isDone 
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 opacity-60' 
                      : 'bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-900/50 shadow-sm hover:border-rose-300'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${meta.dotColor}`} />
                      <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-wider">
                        {ev.date} · {ev.time}
                      </span>
                    </div>
                    <h5 className={`font-bold text-xs text-slate-900 dark:text-white leading-snug ${isDone ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                      {ev.title}
                    </h5>
                    {ev.animalName && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                        প্রাণী: <span className="font-bold text-slate-800 dark:text-slate-200">{ev.animalName}</span>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleEventCompletion(ev.id)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      isDone 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-slate-50 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-400 dark:text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 border-slate-200 dark:border-slate-600'
                    }`}
                    title={isDone ? 'সম্পন্ন হয়েছে (ক্লিক করে বাতিল)' : 'সম্পন্ন করুন'}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar Controls & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Month Navigator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setCurrentDate(new Date(year, month - 1, 1));
                }}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="পূর্ববর্তী মাস"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentDate(new Date());
                }}
                className="px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                আজ
              </button>
              <button
                onClick={() => {
                  setCurrentDate(new Date(year, month + 1, 1));
                }}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="পরবর্তী মাস"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {monthNamesBn[month]} {year}
            </h3>
          </div>

          {/* View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'month' ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-sm font-black' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                মাসিক ভিউ (Month)
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'agenda' ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-sm font-black' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                অ্যাজেন্ডা তালিকা ({filteredEvents.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="টাস্ক বা পশু সার্চ..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 sm:w-52"
              />
            </div>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">ক্যাটাগরি:</span>
            {[
              { id: 'all', label: 'সব শিডিউল' },
              { id: 'vaccination', label: '💉 ভ্যাকসিনেশন' },
              { id: 'breeding', label: '🧬 প্রজনন ও হ্যাচিং' },
              { id: 'feeding', label: '🌾 খাদ্য রুটিন' },
              { id: 'pond', label: '🌊 পুকুর ও মাছ' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTypeFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedTypeFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Species Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">প্রজাতি:</span>
            {[
              { id: 'all', label: 'সকল প্রাণী' },
              { id: 'cattle', label: 'গরু' },
              { id: 'goat', label: 'ছাগল' },
              { id: 'duck', label: 'হাঁস' },
              { id: 'chicken', label: 'মুরগি' },
              { id: 'birds', label: 'পাখি' },
              { id: 'fish', label: 'মাছ' },
            ].map(sp => (
              <button
                key={sp.id}
                onClick={() => setSelectedSpeciesFilter(sp.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedSpeciesFilter === sp.id
                    ? 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main View: Month View or Agenda View */}
      {viewMode === 'month' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-3">
            {daysOfWeekBn.map((day, idx) => (
              <div 
                key={day} 
                className={`text-xs font-black tracking-wider uppercase ${
                  idx === 5 ? 'text-emerald-700' : idx === 6 ? 'text-amber-700' : 'text-slate-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {calendarCells.map((cell, idx) => {
              const dayEvents = eventsByDate[cell.dateStr] || [];
              return (
                <div
                  key={idx}
                  className={`min-h-[110px] sm:min-h-[135px] p-2 sm:p-2.5 transition-colors relative flex flex-col justify-between ${
                    cell.isCurrentMonth ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 opacity-40'
                  } ${cell.isToday ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-50/20' : ''}`}
                >
                  {/* Date Number Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs sm:text-sm font-black font-mono px-2 py-0.5 rounded-lg ${
                        cell.isToday
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {dayEvents.length} কাজ
                      </span>
                    )}
                  </div>

                  {/* Day's Event Badges (Up to 3 shown, rest in count) */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(ev => {
                      const meta = getEventTypeMeta(ev.type);
                      const isDone = completedEventIds.has(ev.id);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-1 sm:p-1.5 rounded-lg border text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer truncate flex items-center gap-1 ${
                            isDone 
                              ? 'bg-slate-100 text-slate-400 line-through border-slate-200' 
                              : meta.color
                          }`}
                          title={`${ev.title} (${ev.time || ''})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDone ? 'bg-slate-300' : meta.dotColor}`} />
                          <span className="truncate">{ev.title}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <button
                        onClick={() => {
                          const ev = dayEvents[2];
                          setSelectedEvent(ev);
                        }}
                        className="text-[10px] font-extrabold text-emerald-700 hover:underline px-1 block text-left"
                      >
                        + আরও {dayEvents.length - 2} টি টাস্ক
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda List View */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-black text-lg text-slate-900">শিডিউল অ্যাজেন্ডা বিস্তারিত তালিকা</h4>
              <p className="text-xs text-slate-500 font-medium">তারিখক্রম অনুযায়ী সকল আসন্ন কাজের সম্পূর্ণ বিবরণ</p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              মোট: {filteredEvents.length} টি
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredEvents.map(ev => {
              const meta = getEventTypeMeta(ev.type);
              const isDone = completedEventIds.has(ev.id);
              const IconComp = meta.icon;

              return (
                <div
                  key={ev.id}
                  className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isDone ? 'opacity-60 bg-slate-50/50 px-3 rounded-2xl' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className={`p-3 rounded-2xl shrink-0 ${meta.color} border`}>
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {ev.date}
                        </span>
                        {ev.time && (
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{ev.time}</span>
                          </span>
                        )}
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${meta.badgeColor}`}>
                          {meta.label}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-md bg-slate-100">
                          {ev.speciesType}
                        </span>
                      </div>

                      <h5 className={`font-black text-sm text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                        {ev.title}
                      </h5>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {ev.description}
                      </p>

                      {ev.actionRequired && (
                        <p className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block mt-1">
                          সতর্কতা/করণীয়: {ev.actionRequired}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {ev.animalId && onSelectAnimal && (
                      <button
                        onClick={() => onSelectAnimal(ev.animalId!)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        প্রোফাইল
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleEventCompletion(ev.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isDone ? 'সম্পন্ন ✓' : 'সম্পন্ন মার্ক করুন'}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredEvents.length === 0 && (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <span className="text-3xl">📅</span>
                <p className="font-bold text-sm">কোনো শিডিউল টাস্ক পাওয়া যায়নি</p>
                <p className="text-xs">ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {getEventTypeMeta(selectedEvent.type).label}
                </span>
                <h3 className="font-black text-xl text-slate-900 mt-2 leading-snug">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">তারিখ ও সময়:</span>
                <span className="font-bold text-slate-900 font-mono">{selectedEvent.date} · {selectedEvent.time || 'সারাদিন'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">প্রজাতি / প্রাণী:</span>
                <span className="font-bold text-slate-900">{selectedEvent.speciesType} {selectedEvent.animalName ? `(${selectedEvent.animalName})` : ''}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">অগ্রাধিকার:</span>
                <span className="font-bold text-rose-600">{selectedEvent.priority}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">বর্তমান স্ট্যাটাস:</span>
                <span className="font-bold text-emerald-700">
                  {completedEventIds.has(selectedEvent.id) ? 'সম্পন্ন সম্পন্ন হয়েছে ✓' : 'অপেক্ষমাণ (Pending)'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">টাস্ক বিবরণ:</span>
              <p className="text-xs text-slate-700 leading-relaxed p-3 bg-slate-50 rounded-xl">
                {selectedEvent.description}
              </p>
            </div>

            {selectedEvent.actionRequired && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                <span className="font-black">সতর্কতামূলক করণীয়: </span>
                {selectedEvent.actionRequired}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  handleToggleEventCompletion(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className={`flex-1 py-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  completedEventIds.has(selectedEvent.id)
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                }`}
              >
                {completedEventIds.has(selectedEvent.id) ? 'অপেক্ষমাণ হিসেবে চিহ্নিত করুন' : 'টাস্ক সম্পন্ন করুন ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Calendar Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-xl text-slate-900">নতুন খামার শিডিউল এন্ট্রি</h3>
                <p className="text-xs text-slate-500">ভ্যাকসিনেশন, প্রজনন বা খাদ্যের কাস্টম শিডিউল যুক্ত করুন</p>
              </div>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">শিডিউল বা কাজের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: খুরারোগ দ্বিতীয় বুস্টার ডোজ"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as CalendarEventType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="vaccination">ভ্যাকসিনেশন ও টিকা</option>
                    <option value="breeding">প্রজনন ও হ্যাচিং</option>
                    <option value="feeding">খাদ্য শিডিউল</option>
                    <option value="pond">পুকুর ও মাছ পরিচর্যা</option>
                    <option value="general">সাধারণ খামার কাজ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">প্রজাতি</label>
                  <select
                    value={newSpecies}
                    onChange={e => setNewSpecies(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="গরু (Cattle)">গরু (Cattle)</option>
                    <option value="ছাগল (Goat)">ছাগল (Goat)</option>
                    <option value="হাঁস (Duck)">হাঁস (Duck)</option>
                    <option value="মুরগি (Chicken)">মুরগি (Chicken)</option>
                    <option value="পাখি (Birds)">পাখি (Birds)</option>
                    <option value="মাছ (Fish)">মাছ (Fish)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                  </input>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">সময় / স্লট</label>
                  <input
                    type="text"
                    value={newTime}
                    placeholder="সকাল ১০:০০ AM"
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অগ্রাধিকার</label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="সাধারণ">সাধারণ</option>
                  <option value="জরুরি">জরুরি (High Priority)</option>
                  <option value="নিয়মিত">নিয়মিত রুটিন</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বিবরণ ও বিশেষ সতর্কতা</label>
                <textarea
                  rows={3}
                  placeholder="টিকা বা খাদ্য প্রয়োগের বিস্তারিত নির্দেশাবলী..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
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
