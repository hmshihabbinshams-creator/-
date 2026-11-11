import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { farmStore } from '../services/farmStore';
import { 
  AlertTriangle, CheckCircle2, Sparkles, DollarSign, 
  TrendingDown, TrendingUp, Award, Layers 
} from 'lucide-react';

interface DailyBudgetGaugeProps {
  className?: string;
}

export const DailyBudgetGauge: React.FC<DailyBudgetGaugeProps> = ({ className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categoryPerformance = farmStore.getCategoryBudgetPerformanceSummary();

  // Compute metrics based on selection
  let totalTargetBudget = 0;
  let totalActualExpense = 0;
  let titleLabel = 'সমগ্র খামারের দৈনিক বাজেট মিটার';

  if (selectedCategory === 'all') {
    totalTargetBudget = categoryPerformance.reduce((sum, item) => sum + item.targetTargetBudget, 0) || categoryPerformance.reduce((sum, item) => sum + item.targetDailyBudget, 0);
    totalActualExpense = categoryPerformance.reduce((sum, item) => sum + item.actualDailyExpense, 0);
  } else {
    const cat = categoryPerformance.find(c => c.categoryKey === selectedCategory);
    if (cat) {
      totalTargetBudget = cat.targetDailyBudget;
      totalActualExpense = cat.actualDailyExpense;
      titleLabel = `${cat.categoryName} দৈনিক বাজেট মিটার`;
    }
  }

  // Fallback to avoid division by 0
  const safeBudget = Math.max(1, totalTargetBudget);
  const ratio = totalActualExpense / safeBudget;
  const percentage = Math.round(ratio * 100);

  const isExceeded = totalActualExpense > totalTargetBudget;
  const isSignificantlyUnder = totalActualExpense <= totalTargetBudget * 0.90; // <= 90%

  // Recharts Gauge Colors
  // Exceeded -> Amber (#f59e0b)
  // Significantly under -> Emerald (#10b981)
  // Normal -> Teal (#0d9488)
  let mainGaugeColor = '#0d9488'; // teal
  let trackColor = '#e2e8f0'; // slate-200

  if (isExceeded) {
    mainGaugeColor = '#f59e0b'; // Amber
  } else if (isSignificantlyUnder) {
    mainGaugeColor = '#10b981'; // Emerald
  }

  // Semi-circle gauge data
  // Gauge spans 180 degrees (from 180 to 0)
  // Fill amount capped visually at 100% for arc, but percentage display shows true number
  const gaugeFillValue = Math.min(100, percentage);
  const gaugeRemainingValue = Math.max(0, 100 - gaugeFillValue);

  const chartData = [
    { name: 'Spending', value: gaugeFillValue },
    { name: 'Remaining', value: gaugeRemainingValue },
  ];

  const COLORS = [mainGaugeColor, trackColor];

  return (
    <div className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-emerald-400 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-400" />
              <span>রিচার্টস ভিজ্যুয়াল গেজ মিটার (Recharts Gauge)</span>
            </span>
            <span className="text-xs font-bold text-slate-500">বাজেট বনাম প্রকৃত খরচ</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <span>{titleLabel}</span>
          </h3>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 hidden sm:inline">ফিল্টার:</label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">🌐 সমগ্র খামার (সকল প্রজাতি)</option>
            <option value="cattle">🐄 গরু (Cattle)</option>
            <option value="goat">🐐 ছাগল (Goat)</option>
            <option value="duck">🦆 হাঁস (Duck)</option>
            <option value="chicken">🐓 মুরগি (Chicken)</option>
            <option value="birds">🕊️ পাখি (Birds)</option>
            <option value="fish">🐟 মাছ (Fish)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left/Top: Visual Recharts Semi-Circle Gauge */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative pt-4">
          <div className="w-full h-48 sm:h-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="80%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius="65%"
                  outerRadius="90%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Gauge Text & Meter Value */}
            <div className="absolute inset-x-0 bottom-4 flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {percentage}%
              </span>
              <span className="text-xs font-extrabold text-slate-500 mt-0.5">
                বাজেট ব্যবহারের হার
              </span>
            </div>
          </div>

          {/* Scale Labels */}
          <div className="w-full max-w-xs flex justify-between px-6 -mt-2 text-[11px] font-black text-slate-400 font-mono">
            <span>০ ৳</span>
            <span>৫০%</span>
            <span>১০০% (বাজেট সীমা)</span>
          </div>
        </div>

        {/* Right/Bottom: Budget Metrics & Condition Feedback */}
        <div className="lg:col-span-6 space-y-4">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                দৈনিক টার্গেট বাজেট সীমা
              </span>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
                {totalTargetBudget.toLocaleString('bn-BD')} ৳
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              isExceeded 
                ? 'bg-amber-50/80 border-amber-200' 
                : isSignificantlyUnder 
                  ? 'bg-emerald-50/80 border-emerald-200' 
                  : 'bg-teal-50/80 border-teal-200'
            }`}>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                বর্তমান দৈনিক খরচ
              </span>
              <p className={`text-lg sm:text-xl font-black font-mono ${
                isExceeded ? 'text-amber-800' : isSignificantlyUnder ? 'text-emerald-700' : 'text-teal-800'
              }`}>
                {totalActualExpense.toLocaleString('bn-BD')} ৳
              </p>
            </div>
          </div>

          {/* Condition Feedback Box */}
          {isExceeded ? (
            /* Amber Gauge Alert Box when budget is exceeded */
            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500 text-amber-900 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="font-black text-sm text-amber-800">
                  ⚠ সতর্কতা: দৈনিক খরচ বাজেট সীমা অতিক্রম করেছে! (Amber Alert)
                </span>
              </div>
              <p className="text-xs text-amber-800 font-medium leading-relaxed pl-7">
                আপনার বর্তমান দৈনিক খরচ টার্গেট বাজেটের চেয়ে{' '}
                <span className="font-black text-amber-900 font-mono">
                  +{(totalActualExpense - totalTargetBudget).toLocaleString('bn-BD')} ৳ ({percentage - 100}%)
                </span>{' '}
                বেশি হয়েছে। খাদ্য অপচয় রোধ করতে এবং দানাদার খাদ্যের সঠিক মিশ্রণ পুনর্বিন্যাস করতে নির্দেশনা দেওয়া হচ্ছে।
              </p>
            </div>
          ) : isSignificantlyUnder ? (
            /* Emerald Congratulatory Box when significantly under budget */
            <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500 text-emerald-950 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-black text-sm text-emerald-900">
                  🎉 অভিনন্দন! দারুণ সাশ্রয়ী ও সুনিয়ন্ত্রিত খামার পরিচালনা!
                </span>
              </div>
              <p className="text-xs text-emerald-900 font-semibold leading-relaxed pl-7">
                আপনার বর্তমান দৈনিক খরচ নির্ধারিত বাজেট সীমার চেয়ে{' '}
                <span className="font-black text-emerald-800 font-mono">
                  {(totalTargetBudget - totalActualExpense).toLocaleString('bn-BD')} ৳ (সাশ্রয় {100 - percentage}%)
                </span>{' '}
                কম এবং অত্যন্ত লাভজনক! সঠিক পুষ্টি বজায় রেখে কম খরচে খামার পরিচালনার এই সুনিয়ন্ত্রিত ধারা বজায় রাখুন।
              </p>
            </div>
          ) : (
            /* Standard On Target Box */
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 space-y-1">
              <div className="flex items-center gap-2 font-black text-xs text-teal-800">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>✓ দৈনিক খরচ নির্ধারিত বাজেট সীমার মধ্যে রয়েছে</span>
              </div>
              <p className="text-xs text-teal-700 font-medium pl-6">
                দৈনিক বাজেট সাশ্রয়: {(totalTargetBudget - totalActualExpense).toLocaleString('bn-BD')} ৳। খরচের হার আদর্শ সীমায় বিদ্যমান।
              </p>
            </div>
          )}

          {/* Species Budget Progress bar overview */}
          <div className="pt-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
              <span>বাজেট ব্যবহারের স্থিতি</span>
              <span>
                {isExceeded ? 'ওভার বাজেট' : isSignificantlyUnder ? 'সাশ্রয়ী' : 'স্বাভাবিক'}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isExceeded ? 'bg-amber-500' : isSignificantlyUnder ? 'bg-emerald-500' : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
