import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Sparkles, Droplets, Egg, Calendar, 
  BarChart3, Scale, Layers, CheckCircle2, Info, Printer
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { farmStore } from '../services/farmStore';

export interface ProductionForecastPoint {
  monthName: string; // e.g. 'নভেম্বর ২০২৬'
  milkLitersActual?: number;
  milkLitersForecast: number;
  eggUnitsActual?: number;
  eggUnitsForecast: number;
  cattleMaturityFactor: number; // %
  poultryFlockPeakFactor: number; // %
  projectedRevenueTaka: number;
}

export const FutureProductionForecastingModule: React.FC = () => {
  const livestock = useMemo(() => farmStore.getLivestock(), []);
  const [forecastHorizonMonths, setForecastHorizonMonths] = useState<number>(6);
  const [selectedProductType, setSelectedProductType] = useState<'both' | 'milk' | 'eggs'>('both');

  // Count active milk producing cattle & egg laying poultry
  const cattleCount = useMemo(() => {
    return livestock.filter(i => i.type.includes('গরু')).reduce((a, b) => a + b.quantity, 0);
  }, [livestock]);

  const poultryCount = useMemo(() => {
    return livestock.filter(i => i.type.includes('মুরগি') || i.type.includes('হাঁস')).reduce((a, b) => a + b.quantity, 0);
  }, [livestock]);

  // Forecast Engine: Generates Month-by-Month Projected Milk & Egg cycles
  const forecastData: ProductionForecastPoint[] = useMemo(() => {
    const months = [
      'নভেম্বর ২০২৬', 'ডিসেম্বর ২০২৬', 'জানুয়ারি ২০২৭', 'ফেব্রুয়ারি ২০২৭', 
      'মার্চ ২০২৭', 'এপ্রিল ২০২৭', 'মে ২০২৭', 'জুন ২০২৭', 
      'জুলাই ২০২৭', 'আগস্ট ২০২৭', 'সেপ্টেম্বর ২০২৭', 'অক্টোবর ২০২৭'
    ];

    // Base current production: ~130 Liters/day milk, ~850 eggs/day
    const baseDailyMilk = 130;
    const baseDailyEggs = 850;

    return months.slice(0, forecastHorizonMonths).map((mName, idx) => {
      // Lactation cycle curve for cattle (peaks at month 2-4 after calving, slight drop in winter)
      let milkFactor = 1.0;
      if (idx === 0) milkFactor = 1.0;
      else if (idx === 1) milkFactor = 1.08; // Winter flush season increase
      else if (idx === 2) milkFactor = 1.15; // Peak lactation
      else if (idx === 3) milkFactor = 1.12;
      else if (idx === 4) milkFactor = 1.05;
      else milkFactor = 0.98;

      // Egg production curve (Sonali/Layer peak laying cycle at 28-36 weeks maturity)
      let eggFactor = 1.0;
      if (idx === 0) eggFactor = 1.0;
      else if (idx === 1) eggFactor = 1.06;
      else if (idx === 2) eggFactor = 1.12; // Peak flock maturity
      else if (idx === 3) eggFactor = 1.18;
      else if (idx === 4) eggFactor = 1.15;
      else eggFactor = 1.08;

      const monthlyMilk = Math.round(baseDailyMilk * 30 * milkFactor);
      const monthlyEggs = Math.round(baseDailyEggs * 30 * eggFactor);

      // Estimated Revenue: Milk @ ৳90/Liter, Eggs @ ৳13/Egg
      const projRev = (monthlyMilk * 90) + (monthlyEggs * 13);

      return {
        monthName: mName,
        milkLitersActual: idx === 0 ? 3900 : undefined,
        milkLitersForecast: monthlyMilk,
        eggUnitsActual: idx === 0 ? 25500 : undefined,
        eggUnitsForecast: monthlyEggs,
        cattleMaturityFactor: Math.round(milkFactor * 100),
        poultryFlockPeakFactor: Math.round(eggFactor * 100),
        projectedRevenueTaka: projRev
      };
    });
  }, [forecastHorizonMonths]);

  // Current vs Peak Summary
  const currentMonthMilk = forecastData[0]?.milkLitersForecast || 3900;
  const peakMonthMilk = Math.max(...forecastData.map(d => d.milkLitersForecast));
  const currentMonthEggs = forecastData[0]?.eggUnitsForecast || 25500;
  const peakMonthEggs = Math.max(...forecastData.map(d => d.eggUnitsForecast));
  const totalProjectedRev = forecastData.reduce((acc, d) => acc + d.projectedRevenueTaka, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[11px] border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 w-max">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>ভবিষ্যৎ দুধ ও ডিম উৎপাদন সাইকেল পূর্বাভাস</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            পশুর বয়স, ল্যাকটেশন চক্র ও প্রজনন পরিপক্কতার ভিত্তিতে উৎপাদন পূর্বাভাষ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            বর্তমান গাভীর দুগ্ধ প্রবৃত্তি ও সোনালী/লেয়ার মুরগির বয়স সাইকেলের হিসেব করে আগামী মাসের উৎপাদন ট্রেন্ডলাইন।
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => setForecastHorizonMonths(6)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                forecastHorizonMonths === 6
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              ৬ মাস
            </button>
            <button
              onClick={() => setForecastHorizonMonths(12)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                forecastHorizonMonths === 12
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              ১২ মাস
            </button>
          </div>

          <select
            value={selectedProductType}
            onChange={(e) => setSelectedProductType(e.target.value as any)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <option value="both">উভয় (দুধ ও ডিম)</option>
            <option value="milk">দুধ উৎপাদন (Liters)</option>
            <option value="eggs">ডিম উৎপাদন (Units)</option>
          </select>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-1">
          <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider block">পীক দুধ উৎপাদন পূর্বাভাস</span>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-400 font-mono">
            {peakMonthMilk.toLocaleString('bn-BD')} <span className="text-xs">লিটার/মাস</span>
          </p>
          <span className="text-[10px] text-blue-600 font-medium">বর্তমান: {currentMonthMilk.toLocaleString('bn-BD')} লিটার</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">পীক ডিম উৎপাদন পূর্বাভাস</span>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
            {peakMonthEggs.toLocaleString('bn-BD')} <span className="text-xs">টি/মাস</span>
          </p>
          <span className="text-[10px] text-amber-600 font-medium">বর্তমান: {currentMonthEggs.toLocaleString('bn-BD')} টি</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">প্রক্ষেপিত মোট বিক্রয় আয়</span>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            ৳ {totalProjectedRev.toLocaleString('bn-BD')}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">আগামী {forecastHorizonMonths} মাসের প্রক্ষেপণ</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-1">
          <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider block">ফ্লক ও পশুপাল কভারেজ</span>
          <p className="text-xl font-black text-indigo-700 dark:text-indigo-400 font-mono">
            {cattleCount} গাভী + {poultryCount} পোল্ট্রি
          </p>
          <span className="text-[10px] text-indigo-600 font-medium">প্রজনন চক্র অন্তর্ভুক্ত</span>
        </div>
      </div>

      {/* LINE CHART FORECAST DISPLAY */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>মাসিক উৎপাদন চক্র ট্রেন্ডলাইন (Monthly Production Projection Line Chart):</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-bold">ল্যাকটেশন ও ফ্লক সাইকেল কার্ভ</span>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="monthName" fontSize={10} stroke="#94a3b8" />
              <YAxis fontSize={10} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  backgroundColor: '#0f172a', 
                  color: '#fff',
                  fontSize: '11px' 
                }} 
              />
              <Legend iconType="circle" />

              {(selectedProductType === 'both' || selectedProductType === 'milk') && (
                <Line
                  type="monotone"
                  dataKey="milkLitersForecast"
                  name="দুধ উৎপাদন পূর্বাভাস (লিটার)"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#2563eb' }}
                />
              )}

              {(selectedProductType === 'both' || selectedProductType === 'eggs') && (
                <Line
                  type="monotone"
                  dataKey="eggUnitsForecast"
                  name="ডিম উৎপাদন পূর্বাভাস (টি)"
                  stroke="#d97706"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#d97706' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
