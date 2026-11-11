import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import { LivestockItem, HealthLog } from '../types';
import { farmStore } from '../services/farmStore';
import { DateRangeFilter, DateRangeState } from './DateRangeFilter';
import { 
  Activity, ShieldCheck, HeartPulse, Stethoscope, TrendingUp, 
  Droplets, Award, CheckCircle2, AlertTriangle, Sparkles, 
  Layers, ArrowUpRight, Calendar, Info, ChevronRight, Eye,
  Thermometer, FileText
} from 'lucide-react';

interface DashboardWidgetProps {
  onNavigateToDashboard?: () => void;
  onNavigateToStore?: () => void;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  onNavigateToDashboard,
  onNavigateToStore
}) => {
  const [livestock] = useState<LivestockItem[]>(() => farmStore.getLivestock());
  const [healthLogs] = useState<HealthLog[]>(() => farmStore.getHealthLogs());
  const [productionMetricFilter, setProductionMetricFilter] = useState<'all' | 'milk' | 'eggs' | 'biomass' | 'fish'>('all');
  const [activeDiseaseModal, setActiveDiseaseModal] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<DateRangeState>({
    startDate: '2025-12-01',
    endDate: '2026-05-09',
    preset: '6m',
    labelBn: 'গত ৬ মাস (অর্ধবার্ষিক)'
  });

  // Compute live species health stats
  const speciesHealthSummary = useMemo(() => {
    const stats = farmStore.getLivestockStats();
    return stats.map(cat => ({
      name: cat.name.split(' ')[0], // 'গরু', 'ছাগল', etc.
      fullName: cat.name,
      totalCount: cat.totalCount,
      healthyCount: cat.healthyCount,
      healthRate: cat.healthRate,
      icon: cat.icon,
      color: 
        cat.key === 'cattle' ? '#059669' :
        cat.key === 'goat' ? '#0d9488' :
        cat.key === 'duck' ? '#0284c7' :
        cat.key === 'chicken' ? '#d97706' :
        cat.key === 'quail' ? '#9333ea' : '#0891b2'
    }));
  }, [livestock]);

  // Overall Health Percentage
  const overallHealthPercentage = useMemo(() => {
    if (livestock.length === 0) return 98;
    const totalAnimals = livestock.reduce((acc, i) => acc + (i.quantity || 1), 0);
    const healthyAnimals = livestock
      .filter(i => (i.healthCondition || 'চমৎকার ও সুস্থ') === 'চমৎকার ও সুস্থ')
      .reduce((acc, i) => acc + (i.quantity || 1), 0);
    return totalAnimals > 0 ? Math.round((healthyAnimals / totalAnimals) * 100) : 98;
  }, [livestock]);

  // Dynamic Production Trend Data tailored to active date range
  const dynamicProductionTrends = useMemo(() => {
    const { preset } = dateRange;

    if (preset === '7d') {
      return [
        { month: '০৩ মে', milkLiters: 147, eggsPcs: 865, meatGainKg: 17.5, fishKg: 16.8, totalScore: 94 },
        { month: '০৪ মে', milkLiters: 149, eggsPcs: 870, meatGainKg: 17.8, fishKg: 17.2, totalScore: 95 },
        { month: '০৫ মে', milkLiters: 148, eggsPcs: 878, meatGainKg: 18.0, fishKg: 17.5, totalScore: 96 },
        { month: '০৬ মে', milkLiters: 153, eggsPcs: 885, meatGainKg: 18.3, fishKg: 18.0, totalScore: 98 },
        { month: '০৭ মে', milkLiters: 151, eggsPcs: 882, meatGainKg: 18.1, fishKg: 17.9, totalScore: 97 },
        { month: '০৮ মে', milkLiters: 152, eggsPcs: 890, meatGainKg: 18.5, fishKg: 18.5, totalScore: 99 },
        { month: '০৯ মে (আজ)', milkLiters: 155, eggsPcs: 910, meatGainKg: 19.0, fishKg: 19.2, totalScore: 100 },
      ];
    }

    if (preset === '30d') {
      return [
        { month: 'সপ্তাহ ১', milkLiters: 142, eggsPcs: 820, meatGainKg: 110, fishKg: 95, totalScore: 91 },
        { month: 'সপ্তাহ ২', milkLiters: 146, eggsPcs: 850, meatGainKg: 125, fishKg: 110, totalScore: 94 },
        { month: 'সপ্তাহ ৩', milkLiters: 150, eggsPcs: 875, meatGainKg: 135, fishKg: 125, totalScore: 97 },
        { month: 'সপ্তাহ ৪ (চলতি)', milkLiters: 154, eggsPcs: 900, meatGainKg: 145, fishKg: 138, totalScore: 100 },
      ];
    }

    if (preset === '3m') {
      return [
        { month: 'মার্চ', milkLiters: 138, eggsPcs: 790, meatGainKg: 410, fishKg: 380, totalScore: 94 },
        { month: 'এপ্রিল', milkLiters: 144, eggsPcs: 850, meatGainKg: 460, fishKg: 450, totalScore: 97 },
        { month: 'মে (বর্তমান)', milkLiters: 152, eggsPcs: 890, meatGainKg: 510, fishKg: 530, totalScore: 99 },
      ];
    }

    if (preset === 'ytd') {
      return [
        { month: 'জানুয়ারি', milkLiters: 124, eggsPcs: 620, meatGainKg: 320, fishKg: 250, totalScore: 86 },
        { month: 'ফেব্রুয়ারি', milkLiters: 130, eggsPcs: 710, meatGainKg: 360, fishKg: 310, totalScore: 90 },
        { month: 'মার্চ', milkLiters: 138, eggsPcs: 790, meatGainKg: 410, fishKg: 380, totalScore: 94 },
        { month: 'এপ্রিল', milkLiters: 144, eggsPcs: 850, meatGainKg: 460, fishKg: 450, totalScore: 97 },
        { month: 'মে (চলতি)', milkLiters: 152, eggsPcs: 890, meatGainKg: 510, fishKg: 530, totalScore: 99 },
      ];
    }

    if (preset === 'custom') {
      return [
        { month: 'পর্ব ১ (সূচনা)', milkLiters: 128, eggsPcs: 680, meatGainKg: 330, fishKg: 270, totalScore: 88 },
        { month: 'পর্ব ২ (মধ্যবর্তী)', milkLiters: 140, eggsPcs: 810, meatGainKg: 420, fishKg: 390, totalScore: 95 },
        { month: 'পর্ব ৩ (সমাপনী)', milkLiters: 152, eggsPcs: 890, meatGainKg: 510, fishKg: 530, totalScore: 99 },
      ];
    }

    // Default '6m'
    return [
      { month: 'ডিসেম্বর', milkLiters: 112, eggsPcs: 540, meatGainKg: 280, fishKg: 190, totalScore: 82 },
      { month: 'জানুয়ারি', milkLiters: 124, eggsPcs: 620, meatGainKg: 320, fishKg: 250, totalScore: 86 },
      { month: 'ফেব্রুয়ারি', milkLiters: 130, eggsPcs: 710, meatGainKg: 360, fishKg: 310, totalScore: 90 },
      { month: 'মার্চ', milkLiters: 138, eggsPcs: 790, meatGainKg: 410, fishKg: 380, totalScore: 94 },
      { month: 'এপ্রিল', milkLiters: 144, eggsPcs: 850, meatGainKg: 460, fishKg: 450, totalScore: 97 },
      { month: 'মে (বর্তমান)', milkLiters: 152, eggsPcs: 890, meatGainKg: 510, fishKg: 530, totalScore: 99 },
    ];
  }, [dateRange]);

  // Pie chart data for disease prevention coverage
  const vaccinationAdherenceData = [
    { name: 'পূর্ণাঙ্গ ভ্যাকসিনেটেড', value: 92, color: '#059669' },
    { name: 'বুস্টার ডোজ অপেক্ষমাণ', value: 6, color: '#eab308' },
    { name: 'নজরদারিতে', value: 2, color: '#38bdf8' },
  ];

  // BAU & DLS Disease Surveillance Knowledge Base (from user's screenshots)
  const diseaseProfiles: Record<string, {
    title: string;
    species: string;
    cause: string;
    symptoms: string[];
    prevention: string;
    treatmentGuidance: string;
    vaccineName: string;
    severity: 'উচ্চ সতর্কতা' | 'নিয়মিত টিকা' | 'ঋতুভিত্তিক';
  }> = {
    lsd: {
      title: 'লাম্পি স্কিন ডিজিজ (LSD - Lumpy Skin Disease)',
      species: 'গরু ও বাছুর (Cattle)',
      cause: 'ক্যাপ্রিপক্স ভাইরাস (Capripoxvirus) দ্বারা বাহিত তীব্র সংক্রামক চর্মরোগ। মশা ও মাছি দ্বারা ছড়ায়।',
      symptoms: [
        'প্রথম পর্যায়ে আক্রান্ত প্রাণীর তীব্র জ্বর (১০৪° - ১০৬° ফারেনহাইট) ও খাবারে তীব্র অরুচি।',
        'শরীরের বিভিন্ন স্থানে চামড়ার নিচে ২-৫ সেমি শক্ত গোলাকার গুটি বা ফোস্কা প্রকাশ।',
        'পায়ে এবং শরীরের নিম্নাংশে পানি জমে অস্বাভাবিক ফুলে যায় ও প্রাণী খুঁড়িয়ে হাঁটে।',
        'পরবর্তী ধাপে গুটি বা ফোস্কা ফেটে গিয়ে গভীর ক্ষতের সৃষ্টি হয়।'
      ],
      prevention: 'খামার চত্বর সার্বক্ষণিক মশামাছিমুক্ত রাখা, জীবাণুনাশক স্প্রে এবং বার্ষিক গোটপক্স বা এলএসডি ভ্যাক্সিন প্রয়োগ।',
      treatmentGuidance: 'যেহেতু ভাইরাসঘটিত, অ্যান্টিবায়োটিক সরাসরি ভাইরাসে কাজ করে না; সেকেন্ডারি ব্যাকটেরিয়াল ইনফেকশন রোধে প্যারাসিটামল, অ্যান্টিহিস্টামিন ও ক্ষত স্থানে পোভিডন আয়োডিন ব্যবহার করুন।',
      vaccineName: 'LSD লাইভ অ্যাটেনুয়েটেড / গোটপক্স ভ্যাকসিন',
      severity: 'উচ্চ সতর্কতা'
    },
    fmd: {
      title: 'ক্ষুরারোগ (FMD - Foot and Mouth Disease)',
      species: 'গরু ও ছাগল (Cattle & Goat)',
      cause: 'অ্যাথোভাইরাস (Aphthovirus) দ্বারা সৃষ্ট অত্যন্ত দ্রুত সংক্রামক রোগ।',
      symptoms: [
        'মুখ দিয়ে ক্রমাগত আঠালো লালা ঝরা ও জাবর কাটা বন্ধ হয়ে যাওয়া।',
        'খুরার খাঁজে, মাড়িতে ও ওলানে ফোস্কা ও ঘা সৃষ্টি হওয়া।',
        'তীব্র ব্যথায় পা তুলে দাঁড়ানো বা খুঁড়িয়ে চলা।'
      ],
      prevention: 'প্রতি ৪-৬ মাস অন্তর ট্রাইভ্যালেন্ট FMD ভ্যাক্সিনেশন এবং খামারের প্রবেশপথে পটাশ মিশ্রিত ফুটবাথ নিশ্চিতকরণ।',
      treatmentGuidance: 'মুখের ঘা ফিটকিরি বা বোরিক অ্যাসিড পানি দিয়ে এবং পায়ের ঘা পটাশ পারম্যাঙ্গানেট দিয়ে ধুয়ে অ্যান্টিসেপটিক মলম প্রয়োগ।',
      vaccineName: 'FMD ট্রাইভ্যালেন্ট ভ্যাক্সিন (O, A, Asia-1)',
      severity: 'উচ্চ সতর্কতা'
    },
    ppr: {
      title: 'পিপিআর রোগ (Peste des Petits Ruminants - PPR)',
      species: 'ছাগল ও ভেড়া (Goat & Sheep)',
      cause: 'মরবিলিভাইরাস (Morbillivirus) দ্বারা ছাগল-ভেড়ার মহামারী রোগ।',
      symptoms: [
        'উচ্চ জ্বর (১০৫° - ১০৭° ফারেনহাইট), চোখ-মুখ দিয়ে সর্দি ও পানি ঝরা।',
        'মুখে দুর্গন্ধযুক্ত ঘা এবং মারাত্মক পানির মতো পাতলা ডায়রিয়া ও ডিহাইড্রেশন।',
        'শ্বাসকষ্ট ও দ্রুত নিউমোনিয়ায় রূপ নেওয়া।'
      ],
      prevention: '৩ মাস বয়সের পর সকল ছাগল-ভেড়াকে সরকারি পিপিআর ভ্যাক্সিন ১ মিলি সাবকিউটেনিয়াস প্রয়োগ (৩ বছরের জন্য রোগ প্রতিরোধক্ষম)।',
      treatmentGuidance: 'আইসোলেশনে রেখে স্যালাইন, জিংক ও ভিটামিন সি প্রয়োগ। সেকেন্ডারি নিউমোনিয়ার জন্য ভেটেরিনারি প্রেসক্রিপশন অনুযায়ী চিকিৎসা।',
      vaccineName: 'PPR ভ্যাক্সিন (লাইভ)',
      severity: 'উচ্চ সতর্কতা'
    },
    ranikhet: {
      title: 'রানীক্ষেত রোগ (Newcastle Disease - RDV)',
      species: 'মুরগি ও পোল্ট্রি (Poultry)',
      cause: 'প্যারামিক্সোভাইরাস-১ (Paramyxovirus) দ্বারা সৃষ্ট পোল্ট্রির প্রধান মারণব্যাধি।',
      symptoms: [
        'হাঁচি, কাশি, শ্বাসকষ্ট ও ঘাড় বাঁকা হয়ে যাওয়া (প্যারালাইসিস লক্ষণ)।',
        'সবুজ বা সাদা রঙের ডায়রিয়া হওয়া এবং ডিম উৎপাদন হঠাৎ বন্ধ হওয়া।'
      ],
      prevention: 'বাচ্চা বয়সে চোখে বিসিআরডিভি (BCRDV) ফোঁটা এবং ২১ ও ৬০ দিনে আরডিভি (RDV) ইনজেকশন নিশ্চিতকরণ।',
      treatmentGuidance: 'আক্রান্ত পাখিকে আলাদা করা, গরম পানির ভাপ ও লিটার সর্বদা শুকনো রাখা।',
      vaccineName: 'BCRDV (চোখের ড্রপ) ও RDV (ইনজেকশন)',
      severity: 'উচ্চ সতর্কতা'
    },
    aquatic: {
      title: 'মৎস্য পরজীবী ও পানির অম্লত্ব/ক্ষারত্ব ভারসাম্যহীনতা',
      species: 'মাছ ও একুয়াকালচার (Fish)',
      cause: 'পানির pH মাত্রা ৬.৫ এর নিচে বা ৮.৫ এর উপরে যাওয়া, অক্সিজেন ঘাটতি ও আর্গুলুস (মাছের উকুন)।',
      symptoms: [
        'মাছ পানির উপরিভাগে এসে খাবি খাওয়া ও বাতাস নেওয়ার চেষ্টা।',
        'শরীরে অতিরিক্ত পিচ্ছিল শ্লেষ্মা বা লালচে ছোপ দাগ দেখা যাওয়া।',
        'মাছের বৃদ্ধি হঠাৎ থমকে যাওয়া ও খাদ্য গ্রহণ না করা।'
      ],
      prevention: 'প্রতি মাসে শতকে ২৫০ গ্রাম কৃষি চুন প্রয়োগ, পানিতে সঠিক এয়ারেশন ও তাপমাত্রা ২৪-৩২°সে বজায় রাখা।',
      treatmentGuidance: 'পটাশ পারম্যাঙ্গানেট বা লবণ স্নান (Dip treatment) এবং জরুরি ভিত্তিতে গভীর নলকূপের ঠান্ডা পানি চালনা।',
      vaccineName: 'কৃষি চুন, ডলোমাইট ও ওয়াটার কন্ডিশনার',
      severity: 'ঋতুভিত্তিক'
    }
  };

  return (
    <div className="space-y-8">
      {/* Widget Header Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-black">
            <Activity className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
            <span>লাইভ অ্যানালিটিক্স ও স্বাস্থ্য ড্যাশবোর্ড উইজেট</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            প্রাণী স্বাস্থ্য পরিসংখ্যান ও উৎপাদন প্রবৃদ্ধি ট্রেন্ড
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-2xl mt-1">
            Recharts ভিজ্যুয়ালাইজেশনের মাধ্যমে আর এস খামারের ৬টি প্রজাতির দৈনন্দিন পুষ্টি ফলন, 
            ভ্যাকসিন কভারেজ এবং বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (BAU) স্বীকৃত রোগ প্রতিরোধ ট্র্যাকিং।
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>পূর্ণাঙ্গ ড্যাশবোর্ড দেখুন</span>
            </button>
          )}
          {onNavigateToStore && (
            <button
              onClick={onNavigateToStore}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>পণ্য শপ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Quick Health & Biosecurity Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
              সামগ্রিক সুস্থতার হার
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <HeartPulse className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {overallHealthPercentage}%
            </p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
              +২.৪% সুস্থতা বৃদ্ধি
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            ৬টি প্রজাতির সকল পশু ও পাল নিয়মিত ভেটেরিনারি চিকিৎসকের পর্যবেক্ষণে
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-teal-800 dark:text-teal-400 uppercase tracking-widest">
              ভ্যাকসিনেশন কভারেজ
            </span>
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
              <Stethoscope className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              ১০০%
            </p>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md">
              বুস্টার সিঙ্কড
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            FMD, LSD, PPR, রানীক্ষেত ও ডাক প্লেগ প্রতিষেধক সম্পূর্ণ হালনাগাদ
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest">
              দৈনিক উৎপাদন ভলিউম
            </span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Droplets className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              ১৫২+ লি.
            </p>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
              দুধ + ৮৯০ ডিম/দিন
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            শতভাগ রাসায়নিক ও হরমোনমুক্ত প্রাকৃতিক খাদ্য থেকে সংগৃহীত
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">
              বায়ো-সিকিউরিটি রেটিং
            </span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Award className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              লেভেল ৩
            </p>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">
              ডিএলএস ও বিএলআরআই
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            জীবাণুমুক্ত ফুটবাথ, স্বয়ংক্রিয় স্প্রেয়ার ও প্রবেশ নিয়ন্ত্রণ ব্যবস্থা
          </p>
        </div>
      </div>

      {/* Dynamic Date-Range Picker Filter Component */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              সময়কাল ফিল্টার (Date Range Filter)
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            যেকোনো নির্দিষ্ট সময় বা কাস্টম তারিখ সীমা নির্বাচন করুন
          </span>
        </div>
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          className="shadow-sm border border-slate-200 dark:border-slate-800"
        />
      </div>

      {/* Main Visual Charts Grid (AreaChart + BarChart + PieChart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Production & Yield Growth Trends AreaChart */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>উৎপাদন প্রবৃদ্ধি ও ফলন ট্রেন্ড — {dateRange.labelBn}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                সময়কাল: <strong className="text-emerald-700 dark:text-emerald-400">{dateRange.startDate}</strong> হতে <strong className="text-emerald-700 dark:text-emerald-400">{dateRange.endDate}</strong> পর্যন্ত খাঁটি দুধ, ডিম, মাংস বৃদ্ধি ও মৎস্য ফলন
              </p>
            </div>

            {/* Metric Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              {[
                { id: 'all', label: 'সব ফলন' },
                { id: 'milk', label: 'দুধ (লিটার)' },
                { id: 'eggs', label: 'ডিম (টি)' },
                { id: 'biomass', label: 'মাংস বৃদ্ধি (কেজি)' },
                { id: 'fish', label: 'মাছ ফলন (কেজি)' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProductionMetricFilter(tab.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    productionMetricFilter === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm font-black'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts AreaChart Container */}
          <div className="w-full h-72 sm:h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicProductionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="milkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="eggsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="meatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fishGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'milkLiters') return [`${value} লিটার/দিন`, 'দুগ্ধ উৎপাদন'];
                    if (name === 'eggsPcs') return [`${value} টি/দিন`, 'ডিম উৎপাদন'];
                    if (name === 'meatGainKg') return [`${value} কেজি/মাস`, 'দৈহিক বৃদ্ধি'];
                    if (name === 'fishKg') return [`${value} কেজি/মাস`, 'মাছের ওজন বৃদ্ধি'];
                    return [value, name];
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(val) => {
                    if (val === 'milkLiters') return 'দুগ্ধ উৎপাদন (লি.)';
                    if (val === 'eggsPcs') return 'ডিম সংগ্রহ (টি)';
                    if (val === 'meatGainKg') return 'মাংস বৃদ্ধি (কেজি)';
                    if (val === 'fishKg') return 'মৎস্য উৎপাদন (কেজি)';
                    return val;
                  }}
                />
                {(productionMetricFilter === 'all' || productionMetricFilter === 'milk') && (
                  <Area
                    type="monotone"
                    dataKey="milkLiters"
                    name="milkLiters"
                    stroke="#059669"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#milkGrad)"
                  />
                )}
                {(productionMetricFilter === 'all' || productionMetricFilter === 'eggs') && (
                  <Area
                    type="monotone"
                    dataKey="eggsPcs"
                    name="eggsPcs"
                    stroke="#d97706"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#eggsGrad)"
                  />
                )}
                {(productionMetricFilter === 'all' || productionMetricFilter === 'biomass') && (
                  <Area
                    type="monotone"
                    dataKey="meatGainKg"
                    name="meatGainKg"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#meatGrad)"
                  />
                )}
                {(productionMetricFilter === 'all' || productionMetricFilter === 'fish') && (
                  <Area
                    type="monotone"
                    dataKey="fishKg"
                    name="fishKg"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#fishGrad)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5 font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>প্রতি মাসে গড়ে ১২.৮% ধারাবাহিক ফলন বৃদ্ধি বজায় রয়েছে</span>
            </span>
            <span>উৎস: আর এস খামার কেন্দ্রীয় এআই ও পরিমাপক রেজিস্ট্রি</span>
          </div>
        </div>

        {/* Right Column: Species-wise Health BarChart + Adherence Pie */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-teal-600" />
                <span>প্রজাতিভিত্তিক স্বাস্থ্য সূচক</span>
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ৯৮% নিরাপদ
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              ৬টি প্রধান ক্যাটাগরির পশু-পাখির শতকরা সুস্থতা স্কোর
            </p>

            {/* Recharts BarChart */}
            <div className="w-full h-44 pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speciesHealthSummary} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
                  <XAxis type="number" domain={[80, 100]} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                    formatter={(val: any) => [`${val}% সুস্থ ও কার্যকর`, 'সুস্থতার হার']}
                  />
                  <Bar dataKey="healthRate" radius={[0, 8, 8, 0]}>
                    {speciesHealthSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Adherence Mini Strip */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
              <span>টিকা কভারেজ বণ্টন</span>
              <span className="text-emerald-600 font-mono">৯৮/১০০ পয়েন্ট</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
              <div style={{ width: '92%' }} className="h-full bg-emerald-500" title="সম্পন্ন ৯২%" />
              <div style={{ width: '6%' }} className="h-full bg-amber-400" title="বুস্টার অপেক্ষমাণ ৬%" />
              <div style={{ width: '2%' }} className="h-full bg-blue-400" title="পর্যবেক্ষণে ২%" />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 pt-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> সম্পন্ন (৯২%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> বুস্টার (৬%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> মনিটরিং (২%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disease Surveillance & Veterinary Advisory Cards (Directly inspired by the BAU / ICT Division screenshots) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-rose-600 uppercase tracking-widest">
                রোগ প্রতিরোধ ও সেবা নির্দেশিকা
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-bold text-slate-500">
                বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (BAU) প্যারাসাইটোলজি বিভাগ নির্দেশিত
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              খামারের সক্রিয় রোগ প্রতিরোধ ও নজরদারি প্রটোকল
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            যেকোনো কার্ডে ক্লিক করে লক্ষণ ও সরকারি চিকিৎসা গাইডলাইন পড়ুন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              id: 'lsd',
              name: 'গরুর লাম্পি স্কিন ডিজিজ',
              tag: 'LSD ভাইরাস',
              species: 'গরু (Cattle)',
              icon: '🐄',
              badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
              preview: '১০৪°-১০৬° জ্বর, গায়ে গোল গুটি ও পায়ে পানি জমা প্রতিরোধে ভ্যাকসিনেশন।'
            },
            {
              id: 'fmd',
              name: 'ক্ষুরারোগ প্রতিরোধ',
              tag: 'FMD ভাইরাস',
              species: 'গরু ও ছাগল',
              icon: '🛡️',
              badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
              preview: 'মুখ দিয়ে লালা ঝরা ও খুরে ঘা রোধে প্রতি ৬ মাস পর পর ট্রাইভ্যালেন্ট টিকা।'
            },
            {
              id: 'ppr',
              name: 'ছাগলের পিপিআর রোগ',
              tag: 'PPR ভ্যাকসিন',
              species: 'ছাগল ও ভেড়া',
              icon: '🐐',
              badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              preview: 'তীব্র জ্বর ও ডায়রিয়া রোধে ৩ বছর মেয়াদী সরকারি পিপিআর লাইভ টিকা।'
            },
            {
              id: 'ranikhet',
              name: 'মুরগির রানীক্ষেত ও গামবোরো',
              tag: 'RDV ও IBD',
              species: 'সোনালী ও দেশি মুরগি',
              icon: '🐓',
              badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
              preview: 'ঘাড় বাঁকা ও শ্বাসকষ্ট রোধে নির্ধারিত বয়সে চোখের ড্রপ ও আরডিভি ইনজেকশন।'
            },
            {
              id: 'aquatic',
              name: 'মৎস্য পরজীবী ও pH ভারসাম্য',
              tag: 'একুয়াকালচার',
              species: 'মাছ ও পুকুর',
              icon: '🐟',
              badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
              preview: 'পানির অম্লত্ব নিয়ন্ত্রণে নিয়মিত কৃষি চুন প্রয়োগ ও অক্সিজেন স্তর পর্যবেক্ষণ।'
            },
          ].map(item => (
            <div
              key={item.id}
              onClick={() => setActiveDiseaseModal(item.id)}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.tag}
                  </span>
                </div>

                <h4 className="font-black text-sm text-slate-900 dark:text-white leading-snug">
                  {item.name}
                </h4>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                  প্রজাতি: {item.species}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed line-clamp-3">
                  {item.preview}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-black text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                <span>লক্ষণ ও চিকিৎসা দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disease Detail Modal */}
      {activeDiseaseModal && diseaseProfiles[activeDiseaseModal] && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-widest">
                  {diseaseProfiles[activeDiseaseModal].severity}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2 leading-snug">
                  {diseaseProfiles[activeDiseaseModal].title}
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  আক্রান্ত প্রজাতি: {diseaseProfiles[activeDiseaseModal].species}
                </p>
              </div>
              <button
                onClick={() => setActiveDiseaseModal(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 space-y-1">
                <span className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">রোগের কারণ:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {diseaseProfiles[activeDiseaseModal].cause}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>প্রধান লক্ষণসমূহ:</span>
                </span>
                <ul className="space-y-1.5 pl-2">
                  {diseaseProfiles[activeDiseaseModal].symptoms.map((symp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <span>{symp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider text-[11px]">প্রতিরোধ ও ভ্যাকসিনেশন:</span>
                <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  {diseaseProfiles[activeDiseaseModal].prevention}
                </p>
                <div className="pt-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                  নির্ধারিত ভ্যাকসিন: {diseaseProfiles[activeDiseaseModal].vaccineName}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                <span className="font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[11px]">চিকিৎসা (ডাক্তারের পরামর্শ অনুযায়ী):</span>
                <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                  {diseaseProfiles[activeDiseaseModal].treatmentGuidance}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setActiveDiseaseModal(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
