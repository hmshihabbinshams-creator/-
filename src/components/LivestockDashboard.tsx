import React, { useState, useEffect, useMemo } from 'react';
import { LivestockItem, HealthLog } from '../types';
import { farmStore } from '../services/farmStore';
import { LivestockGrowthChart } from './LivestockGrowthChart';
import { FarmCalendar } from './FarmCalendar';
import { IndividualAnimalLedger } from './IndividualAnimalLedger';
import { DailyBudgetGauge } from './DailyBudgetGauge';
import { Farm3DViewer } from './Farm3DViewer';
import { downloadFarmPdfReport } from '../services/pdfReportGenerator';
import { DateRangeFilter, DateRangeState } from './DateRangeFilter';
import { 
  Activity, ShieldCheck, Heart, TrendingUp, Sparkles, Filter, 
  Search, Eye, Plus, ShoppingBag, CheckCircle2, AlertTriangle, 
  ChevronRight, ArrowUpRight, Award, Compass, Layers,
  Droplets, Thermometer, Calendar as CalendarIcon, AlertOctagon, RefreshCw,
  FileText, Printer, DollarSign, PieChart as PieChartIcon
} from 'lucide-react';
import { ExpenseSectorChart } from './ExpenseSectorChart';

interface LivestockDashboardProps {
  onTabChange?: (tab: 'home' | 'dashboard' | 'store' | 'admin') => void;
  onExploreShop?: () => void;
  onSelectAnimalForChart?: (animalId: string) => void;
  onOpenEasyEntry?: (category?: any) => void;
}

type SpeciesFilter = 'all' | 'cattle' | 'goat' | 'duck' | 'chicken' | 'birds' | 'fish';

export const LivestockDashboard: React.FC<LivestockDashboardProps> = ({
  onTabChange,
  onExploreShop,
  onOpenEasyEntry,
}) => {
  const [livestock, setLivestock] = useState<LivestockItem[]>(farmStore.getLivestock());
  const [institutionProfile, setInstitutionProfile] = useState(farmStore.getInstitutionProfile());
  const [activeSpecies, setActiveSpecies] = useState<SpeciesFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChartAnimalId, setSelectedChartAnimalId] = useState<string>('C-101');
  const [healthFilter, setHealthFilter] = useState<'all' | 'healthy' | 'monitoring'>('all');
  const [mainView, setMainView] = useState<'dashboard' | 'ledger' | 'calendar'>('dashboard');
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>(farmStore.getHealthLogs());
  const [chartDateRange, setChartDateRange] = useState<DateRangeState>({
    startDate: '2025-12-01',
    endDate: '2026-05-09',
    preset: '6m',
    labelBn: 'গত ৬ মাস (অর্ধবার্ষিক)'
  });

  useEffect(() => {
    const update = () => {
      setLivestock(farmStore.getLivestock());
      setInstitutionProfile(farmStore.getInstitutionProfile());
      setHealthLogs(farmStore.getHealthLogs());
    };
    update();
    const unsub = farmStore.subscribe(update);
    return () => unsub();
  }, []);

  // Performance Summary: Budget vs Actual Daily Expense
  const categoryPerformance = useMemo(() => {
    return farmStore.getCategoryBudgetPerformanceSummary();
  }, [livestock]);

  // Species Summary Metrics
  const speciesMetrics = useMemo(() => {
    return farmStore.getSpeciesSummaryMetrics();
  }, [livestock]);

  // Automated Fish Water Quality & Temp Alerts
  const fishAlerts = useMemo(() => {
    return livestock
      .filter(item => {
        if (!item.type.includes('মাছ')) return false;
        const ph = item.waterPH ?? 7.2;
        const temp = item.waterTemperature ?? 28.0;
        return ph < 6.5 || ph > 8.5 || temp < 24 || temp > 33;
      })
      .map(item => {
        const ph = item.waterPH ?? 7.2;
        const temp = item.waterTemperature ?? 28.0;
        const alerts: { issue: string; remedy: string; level: 'critical' | 'warning' }[] = [];
        if (ph < 6.5) {
          alerts.push({
            issue: `pH মাত্রা ${ph} (বিপজ্জনকভাবে অম্লীয়)`,
            remedy: 'শতকে ২৫০ গ্রাম কৃষি চুন বা ডলোমাইট প্রয়োগ করে pH বৃদ্ধি করুন।',
            level: 'critical'
          });
        } else if (ph > 8.5) {
          alerts.push({
            issue: `pH মাত্রা ${ph} (অতিরিক্ত ক্ষারীয়)`,
            remedy: 'চুন দেওয়া সাময়িক বন্ধ রাখুন এবং তেঁতুলের জল বা ফিটকিরি মৃদু মাত্রায় প্রয়োগ করুন।',
            level: 'warning'
          });
        }
        if (temp < 24) {
          alerts.push({
            issue: `পানির তাপমাত্রা ${temp}°সে (স্বাভাবিকের নিচে)`,
            remedy: 'অগভীর পানি রোধে গভীরতা বৃদ্ধি করুন এবং পরিমিত খাবার দিন।',
            level: 'warning'
          });
        } else if (temp > 33) {
          alerts.push({
            issue: `পানির তাপমাত্রা ${temp}°সে (অতিরিক্ত উত্তপ্ত ও অক্সিজেন ঘাটতি ঝুঁকি)`,
            remedy: 'গভীর নলকূপের ঠান্ডা পানি চালনা করুন এবং এয়ারেশন মেশিন চালু রাখুন।',
            level: 'critical'
          });
        }
        return {
          ...item,
          alerts
        };
      });
  }, [livestock]);

  // Aggregate KPIs
  const totalHeadcount = useMemo(() => {
    return livestock.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [livestock]);

  const totalFarmValuation = useMemo(() => {
    return livestock.reduce((acc, item) => acc + (item.sellingPrice || (item.purchasePrice * 1.3)), 0);
  }, [livestock]);

  const totalTargetValuation = useMemo(() => {
    return livestock.reduce((acc, item) => acc + (item.targetSellingPrice || item.sellingPrice), 0);
  }, [livestock]);

  const overallHealthRate = useMemo(() => {
    if (livestock.length === 0) return 100;
    const healthyCount = livestock.filter(i => (i.healthCondition || 'চমৎকার ও সুস্থ') === 'চমৎকার ও সুস্থ').length;
    return Math.round((healthyCount / livestock.length) * 100);
  }, [livestock]);

  // Filtered Livestock List
  const filteredLivestock = useMemo(() => {
    return livestock.filter(item => {
      // Species match
      const t = item.type.toLowerCase();
      if (activeSpecies === 'cattle' && !(t.includes('গরু') || t.includes('cattle') || t.includes('cow'))) return false;
      if (activeSpecies === 'goat' && !(t.includes('ছাগল') || t.includes('goat'))) return false;
      if (activeSpecies === 'duck' && !(t.includes('হাঁস') || t.includes('duck'))) return false;
      if (activeSpecies === 'chicken' && !(t.includes('মুরগি') || t.includes('chicken') || t.includes('poultry'))) return false;
      if (activeSpecies === 'birds' && !(t.includes('পাখি') || t.includes('birds'))) return false;
      if (activeSpecies === 'fish' && !(t.includes('মাছ') || t.includes('fish'))) return false;

      // Health match
      if (healthFilter === 'healthy' && (item.healthCondition || 'চমৎকার ও সুস্থ') !== 'চমৎকার ও সুস্থ') return false;
      if (healthFilter === 'monitoring' && (item.healthCondition || 'চমৎকার ও সুস্থ') === 'চমৎকার ও সুস্থ') return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesBreed = item.breed.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesBreed) return false;
      }

      return true;
    });
  }, [livestock, activeSpecies, healthFilter, searchQuery]);

  const renderMainContent = () => {
    if (mainView === 'calendar') {
      return (
        <FarmCalendar
          livestock={livestock}
          healthLogs={healthLogs}
          onSelectAnimal={id => {
            setSelectedChartAnimalId(id);
            setMainView('dashboard');
          }}
        />
      );
    }

    if (mainView === 'ledger') {
      return (
        <IndividualAnimalLedger
          initialAnimalId={selectedChartAnimalId}
          onOpenEasyEntry={onOpenEasyEntry}
        />
      );
    }

    return (
      <div className="space-y-10">
        {/* Interactive 3D Farm Map */}
        <Farm3DViewer 
          onSelectAnimal={(id) => {
            setSelectedChartAnimalId(id);
            setMainView('ledger');
            window.scrollTo({ top: 350, behavior: 'smooth' });
          }}
        />

        {/* Recharts Visual Gauge Chart for Daily Budget vs Spending */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-7">
             <DailyBudgetGauge />
           </div>
           <div className="lg:col-span-5">
             <ExpenseSectorChart />
           </div>
        </div>

        {/* PERFORMANCE SUMMARY */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white px-2 py-0.5 rounded-md">
                  পারফরম্যান্স সামারি (Performance Summary)
                </span>
                <span className="text-xs font-bold text-slate-500">বাজেট বনাম প্রকৃত দৈনিক খরচ বিশ্লেষণ</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                প্রজাতিভিত্তিক দৈনিক খাদ্য বাজেট ও সাশ্রয় সমীকরণ
              </h3>
            </div>
            <button
              onClick={() => downloadFarmPdfReport()}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm self-start sm:self-center"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>PDF রিপোর্টে পারফরম্যান্স প্রিন্ট</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {categoryPerformance.map(item => (
              <div
                key={item.categoryKey}
                className={`p-4 rounded-2xl border transition-all space-y-2 bg-white dark:bg-slate-900 shadow-2xs ${
                  item.isWithinBudget ? 'border-emerald-200 dark:border-emerald-900 hover:border-emerald-400' : 'border-rose-200 dark:border-rose-900 hover:border-rose-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">{item.icon}</span>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      item.isWithinBudget
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                    }`}
                  >
                    {item.isWithinBudget ? '✓ বাজেট সাশ্রয়ী' : '⚠ ওভার বাজেট'}
                  </span>
                </div>

                <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">{item.categoryName}</h4>

                <div className="space-y-1 text-[11px] font-medium text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">টার্গেট বাজেট:</span>
                    <span className="font-black font-mono text-slate-800 dark:text-slate-200">{item.targetDailyBudget} ৳</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">প্রকৃত খরচ:</span>
                    <span className={`font-black font-mono ${item.isWithinBudget ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {item.actualDailyExpense} ৳
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
                    <span className="text-slate-500">পার্থক্য:</span>
                    <span className={item.isWithinBudget ? 'text-emerald-700' : 'text-rose-600'}>
                      {item.isWithinBudget ? `+${item.variance} ৳ সাশ্রয়` : `-${Math.abs(item.variance)} ৳ বেশি`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Dedicated Species Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Layers className="w-6 h-6 text-emerald-700 dark:text-emerald-500" />
                <span>প্রজাতিভিত্তিক মেট্রিক্স ও উৎপাদন সারসংক্ষেপ</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                প্রতিটি প্রাণী ক্যাটাগরির নিজস্ব স্বাস্থ্য ও দৈনন্দিন উৎপাদন পরিসংখ্যান
              </p>
            </div>
            <span className="text-xs font-black text-emerald-700 hidden sm:inline">
              সর্বশেষ আপডেট: আজ সকাল ০৮:০০
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {speciesMetrics.map(spec => {
              const isSelected = activeSpecies === spec.key;
              return (
                <div
                  key={spec.key}
                  onClick={() => setActiveSpecies(isSelected ? 'all' : (spec.key as SpeciesFilter))}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 shadow-lg scale-[1.02]'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                      {spec.icon}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        spec.healthRate >= 90
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {spec.healthRate}% সুস্থ
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 dark:text-white">{spec.name}</h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400 font-medium">মোট সংখ্যা:</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-200 font-mono text-sm">
                        {spec.totalCount.toLocaleString('bn-BD')} {spec.unit}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400 font-medium">দৈনিক ফলন:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px] truncate max-w-[120px]">
                        {spec.productionSummary}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-medium">টার্গেট মূল্য:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {spec.totalTargetValuation.toLocaleString('bn-BD')} ৳
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] font-black text-emerald-700 group-hover:translate-x-1 transition-transform">
                    <span>{isSelected ? 'নির্বাচিত ✓' : 'ক্লিক করে ফিল্টার'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date Range Picker Filter above D3 Growth Chart */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                গ্রোথ ও স্বাস্থ্য পর্যবেক্ষণ সময়কাল (Date Range Filter)
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              লাইভস্টক গ্রোথ ও উৎপাদন ট্রেন্ডের সময়সীমা নির্ধারণ করুন
            </span>
          </div>
          <DateRangeFilter
            value={chartDateRange}
            onChange={setChartDateRange}
            className="shadow-sm border border-slate-200 dark:border-slate-800"
          />
        </div>

        {/* Feature D3 Visualization Component */}
        <div className="pt-2">
          <LivestockGrowthChart
            livestock={livestock}
            selectedAnimalId={selectedChartAnimalId}
            onSelectAnimal={id => setSelectedChartAnimalId(id)}
            dateRange={chartDateRange}
          />
        </div>

        {/* Livestock Individual Tracking Section */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Compass className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                <span>ব্যক্তিগত ও পালভিত্তিক ট্র্যাকিং রেকর্ড (Individual Tracking)</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                আইডি, প্রজাতি, জাত, ওজন বৃদ্ধি, স্বাস্থ্য অবস্থা ও বিক্রয় প্রস্তুতি
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="নাম বা আইডি খুঁজুন..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setActiveSpecies('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeSpecies === 'all' ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  সব ({livestock.length})
                </button>
                <button
                  onClick={() => setActiveSpecies('cattle')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeSpecies === 'cattle' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  গরু
                </button>
                <button
                  onClick={() => setActiveSpecies('goat')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeSpecies === 'goat' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  ছাগল
                </button>
                <button
                  onClick={() => setActiveSpecies('duck')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeSpecies === 'duck' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  হাঁস
                </button>
                <button
                  onClick={() => setActiveSpecies('chicken')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeSpecies === 'chicken' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  মুরগি
                </button>
                <button
                  onClick={() => setActiveSpecies('birds')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeSpecies === 'birds' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  পাখি
                </button>
                <button
                  onClick={() => setActiveSpecies('fish')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeSpecies === 'fish' ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  মাছ
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid for Individual Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLivestock.map(animal => {
              const isChartActive = animal.id === selectedChartAnimalId;
              const hasGrowthPoints = animal.growthHistory && animal.growthHistory.length > 0;

              return (
                <div
                  key={animal.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all space-y-4 hover:shadow-xl relative ${
                    isChartActive
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-200'
                  }`}
                >
                  {/* Top Bar on Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {animal.id}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">{animal.type}</span>
                      </div>
                      <h4 className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-snug">
                        {animal.name}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                          animal.status === 'বিক্রির জন্য প্রস্তুত'
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                            : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {animal.status}
                      </span>
                    </div>
                  </div>

                  {/* Weight and Age KPI Strip */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">বর্তমান ওজন</span>
                      <p className="text-sm font-black text-slate-900 dark:text-slate-200 font-mono mt-0.5">
                        {animal.currentWeight} কেজি
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">টার্গেট ওজন</span>
                      <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                        {animal.targetWeight || Math.round(animal.currentWeight * 1.2)} কেজি
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">টার্গেট মাস</span>
                      <p className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                        {animal.targetRearingMonths || 6} মাস
                      </p>
                    </div>
                  </div>

                  {/* Production & Diet Notes */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">জাত/প্রজাতি:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{animal.breed}</span>
                    </div>

                    {animal.dailyProduction && (
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400">{animal.dailyProduction.type}:</span>
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                          {animal.dailyProduction.amount}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">স্বাস্থ্য অবস্থা:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{animal.healthStatus}</span>
                      </span>
                    </div>

                    {animal.type.includes('মাছ') && (
                      <div className="py-2 space-y-2 border-b border-slate-100">
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`p-2 rounded-xl border text-center ${
                            (animal.waterPH ?? 7.0) < 6.5 || (animal.waterPH ?? 7.0) > 8.5
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : 'bg-blue-50 border-blue-100 text-blue-700'
                          }`}>
                            <span className="text-[10px] font-bold block text-slate-500">পানির pH</span>
                            <span className="font-mono font-black text-xs flex items-center justify-center gap-1">
                              <Droplets className="w-3 h-3" />
                              {animal.waterPH ?? 7.2} pH
                            </span>
                          </div>

                          <div className={`p-2 rounded-xl border text-center ${
                            (animal.waterTemperature ?? 28) < 24 || (animal.waterTemperature ?? 28) > 33
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : 'bg-amber-50 border-amber-100 text-amber-700'
                          }`}>
                            <span className="text-[10px] font-bold block text-slate-500">তাপমাত্রা</span>
                            <span className="font-mono font-black text-xs flex items-center justify-center gap-1">
                              <Thermometer className="w-3 h-3" />
                              {animal.waterTemperature ?? 28}°C
                            </span>
                          </div>
                        </div>

                        {((animal.waterPH ?? 7.0) < 6.5 || (animal.waterPH ?? 7.0) > 8.5 || (animal.waterTemperature ?? 28) < 24 || (animal.waterTemperature ?? 28) > 33) && (
                          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-[10px] text-rose-800 dark:text-rose-300 font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>সতর্কতা: প্যারামিটার আদর্শ সীমার বাইরে! জরুরি ব্যবস্থা নিন।</span>
                          </div>
                        )}
                      </div>
                    )}

                    {animal.type.includes('মাছ') && animal.pondMaintenanceLogs && animal.pondMaintenanceLogs.length > 0 && (
                      <div className="py-2 space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">পুকুর রক্ষণাবেক্ষণ ইতিহাস:</span>
                        <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                          {animal.pondMaintenanceLogs.slice(0, 3).map(log => (
                            <div key={log.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[10px]">
                              <div className="flex justify-between font-bold text-slate-800">
                                <span>{log.action}</span>
                                <span className="text-slate-400">{log.date}</span>
                              </div>
                              {log.notes && <p className="text-slate-500 mt-0.5 line-clamp-1">{log.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 font-mono">
                      <span className="text-slate-400 font-sans">টার্গেট বিক্রয়মূল্য:</span>
                      <span className="text-base font-black text-emerald-800 dark:text-emerald-400">
                        {(animal.targetSellingPrice || animal.sellingPrice).toLocaleString('bn-BD')} ৳
                      </span>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedChartAnimalId(animal.id);
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isChartActive
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{isChartActive ? 'D3 গ্রাফে সক্রিয়' : 'D3 গ্রোথ চার্ট'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedChartAnimalId(animal.id);
                        setMainView('ledger');
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
                      title="ব্যক্তিগত লেজার ও ইনভেস্টমেন্ট হিসাব দেখুন"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>লেজার</span>
                    </button>

                    {animal.isForSale && onExploreShop && (
                      <button
                        onClick={onExploreShop}
                        className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
                        title="পাবলিক শপে কিনুন"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>শপ</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLivestock.length === 0 && (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
              <span className="text-4xl">🔍</span>
              <h4 className="text-lg font-bold text-slate-800">কোনো পশু বা পালের রেকর্ড খুঁজে পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-500">
                অনুগ্রহ করে সার্চ বা ফিল্টারের ধরন পরিবর্তন করে পুনরায় চেষ্টা করুন।
              </p>
              <button
                onClick={() => {
                  setActiveSpecies('all');
                  setSearchQuery('');
                  setHealthFilter('all');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase cursor-pointer"
              >
                সব ফিল্টার রিসেট করুন
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#090d16] text-slate-900 dark:text-slate-100 pb-24 selection:bg-emerald-500 selection:text-white">
      {/* Top Ribbon */}
      <div className="bg-slate-900 dark:bg-black text-slate-300 py-2.5 px-4 text-xs font-bold border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white">আর এস খামার লাইভস্টক ট্র্যাকিং ও স্মার্ট ম্যানেজমেন্ট হাব</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-600">
              বায়ো-সিকিউরিটি লেভেল ৩
            </span>
            <span>লাইভ ডেটাবেজ সিঙ্ক্রোনাইজড</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Main Dashboard Hero Banner */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#f8faf9] via-white to-[#f0fdf4] dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-emerald-900/10 dark:border-emerald-500/20 shadow-xl overflow-hidden">
          {/* Subtle Decorative Jamdani Geometric SVG Motif in background */}
          <svg
            className="absolute right-0 top-0 w-96 h-96 opacity-[0.035] pointer-events-none transform translate-x-20 -translate-y-20 text-emerald-900 dark:text-emerald-400"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <polygon points="50,0 100,50 50,100 0,50" />
            <polygon points="50,15 85,50 50,85 15,50" />
            <circle cx="50" cy="50" r="10" />
          </svg>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800 shadow-sm flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
                  <span>জাতীয় মানসম্মত আধুনিক দেশীয় খামার কমপ্লেক্স</span>
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-bold text-slate-500">
                  {institutionProfile.district || 'রংপুর / বগুড়া'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                লাইভস্টক ডিজিটাল ড্যাশবোর্ড
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                গরু, ছাগল, হাঁস, মুরগি, পাখি ও মাছ — ৬টি প্রধান প্রজাতির হেডকাউন্ট, দৈনিক পুষ্টি উৎপাদন,
                স্বাস্থ্য মনিটরিং এবং D3 লক্ষ্যমাত্রা পালনকাল বনাম ওজন বৃদ্ধি বিশ্লেষণ।
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => downloadFarmPdfReport()}
                className="w-full p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-md space-y-1 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                    অফিশিয়াল রিপোর্ট
                  </span>
                  <p className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>ডাউনলোড PDF রিপোর্ট</span>
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
                  মোট প্রাণী হেডকাউন্ট
                </span>
                <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tight">
                  {totalHeadcount.toLocaleString('bn-BD')} টি
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                  ৬টি পৃথক প্রজাতিতে বিন্যস্ত
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">
                  প্রজেক্টেড বাজার পোর্টফোলিও
                </span>
                <p className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono tracking-tight">
                  {totalTargetValuation.toLocaleString('bn-BD')} ৳
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                  বর্তমান মূল্য: {totalFarmValuation.toLocaleString('bn-BD')} ৳
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ultra-Easy Quick Entry Bar for Farmhands and Beginners */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-amber-950/20 border-2 border-emerald-300 dark:border-emerald-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-xl shadow-md shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                  সহজ খামার খাতা
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  ১-ক্লিকে যেকোনো হিসাব ইনপুট দিন (দুধ, ডিম, খাবার, পশু যোগ)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                যে কোনো কর্মী বা সহকারী খুব সহজে তথ্য এন্ট্রি করতে নিচের বোতামে চাপুন
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => onOpenEasyEntry?.('milk')}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-sm flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <span>🥛 দুধ এন্ট্রি</span>
            </button>
            <button
              onClick={() => onOpenEasyEntry?.('eggs')}
              className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-sm flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <span>🥚 ডিম এন্ট্রি</span>
            </button>
            <button
              onClick={() => onOpenEasyEntry?.('feed')}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <span>🌾 খাবার দেওয়া ✓</span>
            </button>
            <button
              onClick={() => onOpenEasyEntry?.('add_animal')}
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <span>➕ নতুন পশু</span>
            </button>
            <button
              onClick={() => onOpenEasyEntry?.('health')}
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <span>💉 স্বাস্থ্য ও টিকা</span>
            </button>
            <button
              onClick={() => onOpenEasyEntry?.('cash')}
              className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-sm flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <span>💰 টাকার হিসাব</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher: Dashboard vs Animal Ledger vs Calendar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-slate-100 rounded-2xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl shadow-sm border border-slate-200 text-xs font-black">
            <button
              onClick={() => setMainView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                mainView === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>লাইভস্টক প্রজাতি মেট্রিক্স ও ট্র্যাকিং</span>
            </button>
            <button
              onClick={() => setMainView('ledger')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                mainView === 'ledger'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>ব্যক্তিগত পশু লেজার (Individual Animal Ledger)</span>
            </button>
            <button
              onClick={() => setMainView('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                mainView === 'calendar'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>খামার ক্যালেন্ডার ও যৌথ শিডিউলার</span>
            </button>
          </div>

          <div className="flex items-center gap-3 px-3 text-xs font-bold text-slate-600">
            {fishAlerts.length > 0 && (
              <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 font-extrabold animate-pulse">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>মৎস্য অ্যালার্ট ({fishAlerts.length})</span>
              </span>
            )}
            <button
              onClick={() => downloadFarmPdfReport()}
              className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-extrabold hover:bg-emerald-100 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-700" />
              <span>PDF রিপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Automated Alerts System in Fish Section */}
        {fishAlerts.length > 0 && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-50 via-white to-amber-50/50 border border-rose-200 shadow-md space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>মৎস্য হ্যাচারি অটোমেটেড কোয়ালিটি ও তাপমাত্রা অ্যালার্ট</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse">
                      জরুরি সতর্কতা ({fishAlerts.length})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    পুকুরের পানির pH মাত্রা (আদর্শ ৬.৫ - ৮.৫) অথবা তাপমাত্রা (আদর্শ ২৪°সে - ৩৩°সে) বিপজ্জনক সীমায় চলে গেছে।
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveSpecies('fish');
                  setMainView('dashboard');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-sm cursor-pointer self-start sm:self-center"
              >
                পুকুর রেকর্ড চেক করুন
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {fishAlerts.map(fish => (
                <div key={fish.id} className="p-4 rounded-2xl bg-white border border-rose-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {fish.id}
                        </span>
                        <h4 className="font-black text-sm text-slate-900">{fish.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">লোকেশন: {fish.batchOrFlock}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-black text-blue-700">
                        <Droplets className="w-3.5 h-3.5" />
                        <span>{fish.waterPH ?? 7.0} pH</span>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-black text-amber-700">
                        <Thermometer className="w-3.5 h-3.5" />
                        <span>{fish.waterTemperature ?? 28}°C</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    {fish.alerts.map((al, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-100 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-black text-rose-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{al.issue}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 pl-5">
                          <span className="font-bold text-emerald-800">প্রস্তাবিত জরুরি সমাধান: </span>
                          {al.remedy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Switch Routing */}
        {renderMainContent()}
      </div>
    </div>
  );
};
