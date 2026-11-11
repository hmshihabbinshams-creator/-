import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ComposedChart
} from 'recharts';
import { 
  Droplets, Egg, TrendingUp, Calendar, Filter, Sparkles, 
  ArrowUpRight, Award, CheckCircle2, Download, Printer, Activity, Scale
} from 'lucide-react';
import { farmStore } from '../services/farmStore';

export const ProductionMetricsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('30d');
  const [metricFilter, setMetricFilter] = useState<'all' | 'milk' | 'eggs'>('all');

  // Generate realistic 30-day daily production trends
  const productionData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const list = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
      
      // Natural variation based on seasonal curve
      const dayFactor = Math.sin((i / 5)) * 8;
      const milkLiters = Math.round(115 + dayFactor + (Math.sin(i) * 5));
      const eggsCount = Math.round(410 + (dayFactor * 3) + (Math.cos(i) * 15));
      const milkRevenue = milkLiters * 95; // 95 tk per liter
      const eggRevenue = eggsCount * 13.5; // 13.5 tk per egg

      list.push({
        day: dateStr,
        rawDate: d.toISOString().split('T')[0],
        milkLiters,
        eggsCount,
        totalRevenue: Math.round(milkRevenue + eggRevenue),
        milkRevenue,
        eggRevenue,
        averageYieldPerAnimal: (milkLiters / 8).toFixed(1), // 8 milking cows
        eggLayingPercentage: Math.round((eggsCount / 480) * 100)
      });
    }
    return list;
  }, [timeRange]);

  // Aggregate totals
  const totalMilk = productionData.reduce((acc, curr) => acc + curr.milkLiters, 0);
  const totalEggs = productionData.reduce((acc, curr) => acc + curr.eggsCount, 0);
  const totalRev = productionData.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const avgMilk = (totalMilk / productionData.length).toFixed(1);
  const avgEggs = Math.round(totalEggs / productionData.length);
  const peakMilk = Math.max(...productionData.map(d => d.milkLiters));
  const peakEggs = Math.max(...productionData.map(d => d.eggsCount));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Recharts অ্যানালিটিক্স ইঞ্জিন
            </span>
            <span className="text-xs text-slate-400 font-bold hidden sm:inline">·</span>
            <span className="text-xs font-bold text-slate-500">দৈনিক দুধ ও ডিম ফলন ট্র্যাকার</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            গত ৩০ দিনের খামার উৎপাদন মেট্রিক্স ড্যাশবোর্ড
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            প্রতিটি গাভী ও পোল্ট্রি ফ্লকের সংগৃহীত দুধ (লিটার) ও ডিমের (টি) পুঙ্খানুপুঙ্খ ট্রেন্ড ও রাজস্ব পর্যালোচনা
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            {(['7d', '14d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range === '7d' ? 'গত ৭ দিন' : range === '14d' ? 'গত ১৪ দিন' : 'গত ৩০ দিন'}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            title="প্রিন্ট করুন"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Milk KPI */}
        <div className="bg-gradient-to-br from-blue-500/10 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 p-6 rounded-3xl border border-blue-200 dark:border-blue-900/40 shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1">
                মোট দুধ সংগ্রহ ({timeRange === '7d' ? '৭ দিন' : timeRange === '14d' ? '১৪ দিন' : '৩০ দিন'})
              </span>
              <p className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {totalMilk.toLocaleString('bn-BD')} <span className="text-sm font-bold text-slate-500 font-sans">লিটার</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-bold text-slate-500">গড় দৈনিক:</span>
                <span className="text-[11px] font-black font-mono text-blue-600">{avgMilk} লিটার/দিন</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Droplets className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>সর্বোচ্চ এক দিনে: {peakMilk} লিটার</span>
            <span className="text-emerald-600 font-bold">+৪.২% প্রবৃদ্ধি</span>
          </div>
        </div>

        {/* Eggs KPI */}
        <div className="bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 p-6 rounded-3xl border border-amber-200 dark:border-amber-900/40 shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1">
                মোট ডিম সংগ্রহ ({timeRange === '7d' ? '৭ দিন' : timeRange === '14d' ? '১৪ দিন' : '৩০ দিন'})
              </span>
              <p className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {totalEggs.toLocaleString('bn-BD')} <span className="text-sm font-bold text-slate-500 font-sans">টি</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-bold text-slate-500">গড় দৈনিক:</span>
                <span className="text-[11px] font-black font-mono text-amber-600">{avgEggs.toLocaleString('bn-BD')} টি/দিন</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Egg className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>সর্বোচ্চ এক দিনে: {peakEggs} টি</span>
            <span className="text-amber-600 font-bold">৮৭% লেইং রেট</span>
          </div>
        </div>

        {/* Total Production Revenue */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 p-6 rounded-3xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
                আনুমানিক ফলন রাজস্ব
              </span>
              <p className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {totalRev.toLocaleString('bn-BD')} <span className="text-sm font-bold text-slate-500 font-sans">৳</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-bold text-slate-500">দুধ + ডিম সমন্বিত</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>দুধ: ৯৫৳/লি · ডিম: ১৩.৫৳/টি</span>
            <span className="text-emerald-600 font-bold">লাভজনক খাত</span>
          </div>
        </div>

        {/* Production Efficiency Ratio */}
        <div className="bg-gradient-to-br from-indigo-500/10 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-900/40 shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">
                খাদ্য রূপান্তর ও ফলন দক্ষতা
              </span>
              <p className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                ৯৪.৮<span className="text-sm font-bold text-slate-500 font-sans">%</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-bold text-slate-500">BAU স্ট্যান্ডার্ড অনুপালিত</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <Scale className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>পুষ্টি ঘাটতি: ০%</span>
            <span className="text-emerald-600 font-bold">এ-গ্রেড উৎপাদন</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Milk Production Area Chart (7 Columns) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  দৈনিক দুধ সংগ্রহ ট্রেন্ড (Liters)
                </h3>
                <p className="text-xs text-slate-500">তারিখভিত্তিক খাঁটি দুধ সংগ্রহের অগ্রগতি</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold">
              গড়: {avgMilk} L/দিন
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionData}>
                <defs>
                  <linearGradient id="milkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val} লিটার`, 'দুধ সংগ্রহ']}
                />
                <Area 
                  type="monotone" 
                  dataKey="milkLiters" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#milkGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Eggs Output Bar/Area Chart (6 Columns) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                <Egg className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  দৈনিক ডিম সংগ্রহ ট্রেন্ড (Pieces)
                </h3>
                <p className="text-xs text-slate-500">হাঁস ও সোনালী মুরগির ডিমের দৈনিক পরিসংখ্যান</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-mono font-bold">
              গড়: {avgEggs} টি/দিন
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionData}>
                <defs>
                  <linearGradient id="eggGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 30', 'dataMax + 30']} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val} টি ডিম`, 'সংগ্রহ']}
                />
                <Area 
                  type="monotone" 
                  dataKey="eggsCount" 
                  stroke="#d97706" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#eggGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Composed Chart: Combined Daily Revenue vs Yield */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              দুধ ও ডিম উৎপাদন রাজস্ব বনাম সমন্বিত সূচক (Composed Trend)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              উভয় পণ্যের সম্মিলিত আর্থিক মূল্য ও খামারের দৈনিক ক্যাশ ফ্লো
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> দুধ (L)
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> ডিম (টি)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> রাজস্ব (৳)
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
              <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Bar yAxisId="left" dataKey="milkLiters" fill="#3b82f6" radius={[4, 4, 0, 0]} name="দুধ (L)" />
              <Bar yAxisId="left" dataKey="eggsCount" fill="#f59e0b" radius={[4, 4, 0, 0]} name="ডিম (টি)" />
              <Line yAxisId="right" type="monotone" dataKey="totalRevenue" stroke="#10b981" strokeWidth={3} dot={{ r: 3, fill: '#10b981' }} name="দৈনিক রাজস্ব (৳)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
