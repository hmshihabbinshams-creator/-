import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line 
} from 'recharts';
import { farmStore } from '../services/farmStore';
import { 
  PieChart as PieChartIcon, BarChart3, AlertTriangle, TrendingDown, 
  Sparkles, DollarSign, Calendar, Zap, Lightbulb, ShieldAlert, Award
} from 'lucide-react';

export const ExpenseSectorChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  // Multiplier based on timeframe
  const timeframeMultiplier = timeframe === 'weekly' ? 0.25 : timeframe === 'yearly' ? 12 : 1;
  const timeframeLabel = timeframe === 'weekly' ? 'সাপ্তাহিক' : timeframe === 'yearly' ? 'বাৎসরিক' : 'মাসিক';

  // Base sector expenses data
  const sectorData = useMemo(() => {
    const feedLogs = farmStore.getFeedLogs();
    const financial = farmStore.getFinancialReport();

    const feedTotal = Math.round((feedLogs.reduce((sum, log) => sum + log.costTaka, 0) || 45000) * timeframeMultiplier);
    const medicalTotal = Math.round(8500 * timeframeMultiplier);
    const electricityTotal = Math.round(6200 * timeframeMultiplier);
    const salaryTotal = Math.round((financial.totalSalaryExpense || 28000) * timeframeMultiplier);
    const maintenanceTotal = Math.round(4500 * timeframeMultiplier);

    const totalExpense = feedTotal + medicalTotal + electricityTotal + salaryTotal + maintenanceTotal;
    const targetBudget = Math.round(95000 * timeframeMultiplier);
    const budgetUsagePercent = Math.round((totalExpense / targetBudget) * 100);

    const items = [
      { name: 'পশুখাদ্য ও পুষ্টি (Feed)', value: feedTotal, color: '#10b981', percent: Math.round((feedTotal / totalExpense) * 100) },
      { name: 'চিকিৎসা ও ভ্যাকসিন (Medicine)', value: medicalTotal, color: '#0d9488', percent: Math.round((medicalTotal / totalExpense) * 100) },
      { name: 'বিদ্যুৎ ও মোটর সেচ (Electricity)', value: electricityTotal, color: '#f59e0b', percent: Math.round((electricityTotal / totalExpense) * 100) },
      { name: 'শ্রমিক বেতন (Staff Salary)', value: salaryTotal, color: '#6366f1', percent: Math.round((salaryTotal / totalExpense) * 100) },
      { name: 'রক্ষণাবেক্ষণ ও বায়োসিকিউরিটি (Maintenance)', value: maintenanceTotal, color: '#ec4899', percent: Math.round((maintenanceTotal / totalExpense) * 100) },
    ];

    return {
      items,
      totalExpense,
      targetBudget,
      budgetUsagePercent,
      isBudgetAlert: budgetUsagePercent >= 90
    };
  }, [timeframeMultiplier]);

  // 1-Month expense trend forecast data
  const forecastTrend = useMemo(() => {
    return [
      { period: 'সপ্তাহ ১', feed: 11000, medicine: 2100, electricity: 1500 },
      { period: 'সপ্তাহ ২', feed: 11500, medicine: 1800, electricity: 1600 },
      { period: 'সপ্তাহ ৩', feed: 10800, medicine: 2400, electricity: 1550 },
      { period: 'সপ্তাহ ৪ (চলতি)', feed: 11200, medicine: 2200, electricity: 1550 },
      { period: 'পরবর্তী মাস (পূর্বাভাস)', feed: 10200, medicine: 1900, electricity: 1450 },
    ];
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Top Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              আর্থিক ব্যয় বিশ্লেষণ ও নিয়ন্ত্রণ
            </span>
            <span className="text-xs font-bold text-slate-500">{timeframeLabel} চিত্র</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>খামারের খাতভিত্তিক ব্যয় (খাদ্য, চিকিৎসা, বিদ্যুৎ)</span>
          </h3>
        </div>

        {/* Toolbar: Timeframe & Chart Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Dropdown */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="weekly">📅 সাপ্তাহিক (Weekly)</option>
            <option value="monthly">📆 মাসিক (Monthly)</option>
            <option value="yearly">🗓️ বাৎসরিক (Yearly)</option>
          </select>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                chartType === 'pie' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-black shadow-sm' : 'text-slate-500'
              }`}
            >
              পাই চার্ট
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-black shadow-sm' : 'text-slate-500'
              }`}
            >
              বার চার্ট
            </button>
          </div>
        </div>
      </div>

      {/* 90% Budget Alert Warning Banner */}
      {sectorData.isBudgetAlert ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500 text-amber-900 dark:text-amber-200 flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <p className="font-black text-sm text-amber-800 dark:text-amber-300">
              ⚠️ আর্থিক সতর্কতা: {timeframeLabel} বাজেটের {sectorData.budgetUsagePercent}% ব্যয় হয়ে গেছে!
            </p>
            <p className="text-amber-700 dark:text-amber-300/90 font-medium">
              মোট ব্যয়: {sectorData.totalExpense.toLocaleString('bn-BD')} ৳ (টার্গেট সীমা: {sectorData.targetBudget.toLocaleString('bn-BD')} ৳)। অপ্রয়োজনীয় বিদ্যুৎ ও খাদ্য অপচয় রোধ করুন।
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>বাজেট ব্যবহারের স্থিতি: {sectorData.budgetUsagePercent}% (নিরাপদ সীমার মধ্যে রয়েছে)</span>
          </div>
          <span className="font-mono">{sectorData.totalExpense.toLocaleString('bn-BD')} ৳ / {sectorData.targetBudget.toLocaleString('bn-BD')} ৳</span>
        </div>
      )}

      {/* Chart Section: Pie or Bar */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={sectorData.items}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={4}
                dataKey="value"
              >
                {sectorData.items.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  backgroundColor: '#0f172a', 
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                formatter={(val: any) => [`৳ ${val.toLocaleString('bn-BD')}`, 'খরচ']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
            </PieChart>
          ) : (
            <BarChart data={sectorData.items} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" unit=" ৳" />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  backgroundColor: '#0f172a', 
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                formatter={(val: any) => [`৳ ${val.toLocaleString('bn-BD')}`, 'মোট ব্যয়']}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {sectorData.items.map((entry, index) => (
                  <Cell key={`cell-bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Sector Breakdown Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
        {sectorData.items.map(s => (
          <div key={s.name} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate block">{s.name.split(' ')[0]}</span>
            <p className="text-sm font-black font-mono text-slate-900 dark:text-white">{s.value.toLocaleString('bn-BD')} ৳</p>
            <span className="text-[10px] font-bold text-emerald-600 block">{s.percent}% অবদান</span>
          </div>
        ))}
      </div>

      {/* Cost Optimization & AI Savings Advice Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-200 dark:border-amber-800/50 space-y-2">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-xs">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
          <span>খরচ অপ্টিমাইজেশন পরামর্শক (Cost-Saving Actionable Advice):</span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
          খামারের মোট খরচের প্রায় <span className="font-bold text-emerald-600">{sectorData.items[0].percent}% খাদ্য খাতে</span> ব্যয় হচ্ছে। সাইলেজ ও দেশি ঘাসের মাত্রা বাড়ালে খাদ্যের পেছনে মাসিক প্রায় <span className="font-bold text-emerald-600">৮,০০০–১০,০০০ টাকা সাশ্রয়</span> করা সম্ভব। এছাড়াও রাতে অতিরিক্ত শেড লাইট বন্ধ রেখে বিদ্যুৎ খরচ ২০% কমানো যাবে।
        </p>
      </div>

      {/* 1-Month Forecast Trend Line Chart */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>আগামী ১ মাসের খরচের প্রবণতা ও পূর্বাভাস (Trend Forecast)</span>
          </h4>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
            প্রক্ষেপিত সাশ্রয় -৮%
          </span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastTrend} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
              <XAxis dataKey="period" stroke="#64748b" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" unit=" ৳" />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '14px', 
                  border: 'none', 
                  backgroundColor: '#0f172a', 
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              <Line type="monotone" name="খাদ্য ব্যয়" dataKey="feed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" name="চিকিৎসা" dataKey="medicine" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" name="বিদ্যুৎ" dataKey="electricity" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
