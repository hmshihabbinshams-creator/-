import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, BarChart3, 
  CheckCircle2, AlertTriangle, Sparkles, Calendar, Layers 
} from 'lucide-react';
import { farmStore } from '../services/farmStore';

export const MonthlyProfitLossSummaryCard: React.FC = () => {
  const [yearFilter, setYearFilter] = useState<string>('২০২৬');

  // Realistic monthly income, expense, and net profit/loss data in Bengali
  const monthlyData = useMemo(() => {
    return [
      { month: 'জানুয়ারি', income: 145000, expense: 98000, net: 47000, isProfit: true },
      { month: 'ফেব্রুয়ারি', income: 160000, expense: 102000, net: 58000, isProfit: true },
      { month: 'মার্চ', income: 185000, expense: 115000, net: 70000, isProfit: true },
      { month: 'এপ্রিল', income: 130000, expense: 142000, net: -12000, isProfit: false }, // Loss month for demonstration
      { month: 'মে', income: 195000, expense: 110000, net: 85000, isProfit: true },
      { month: 'জুন', income: 210000, expense: 125000, net: 85000, isProfit: true },
      { month: 'জুলাই', income: 175000, expense: 108000, net: 67000, isProfit: true },
      { month: 'আগস্ট', income: 190000, expense: 112000, net: 78000, isProfit: true },
      { month: 'সেপ্টেম্বর', income: 220000, expense: 120000, net: 100000, isProfit: true },
      { month: 'অক্টোবর', income: 205000, expense: 118000, net: 87000, isProfit: true },
      { month: 'নভেম্বর (চলতি)', income: 240000, expense: 132000, net: 108000, isProfit: true },
      { month: 'ডিসেম্বর (প্রাক.)', income: 230000, expense: 125000, net: 105000, isProfit: true },
    ];
  }, [yearFilter]);

  // Aggregate KPI calculations
  const totalIncome = useMemo(() => monthlyData.reduce((sum, d) => sum + d.income, 0), [monthlyData]);
  const totalExpense = useMemo(() => monthlyData.reduce((sum, d) => sum + d.expense, 0), [monthlyData]);
  const totalNetProfit = useMemo(() => monthlyData.reduce((sum, d) => sum + d.net, 0), [monthlyData]);
  const profitableMonthsCount = useMemo(() => monthlyData.filter(d => d.isProfit).length, [monthlyData]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              আর্থিক ভারসাম্য ও লাভ-ক্ষতি
            </span>
            <span className="text-xs font-bold text-slate-500">বার্ষিক তুলনামূলক প্রতিবেদন</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>মাসিক লাভ-ক্ষতির সারাংশ (Monthly P&L Summary)</span>
          </h3>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="২০২৬">📅 ২০২৬ সাল</option>
            <option value="২০২৫">📅 ২০২৫ সাল</option>
          </select>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1">
          <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-wider block">
            মোট বার্ষিক আয় (Total Revenue)
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-300 tabular-nums">
            ৳ {totalIncome.toLocaleString('bn-BD')}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
            দুধ, ডিম, পশু ও মৎস্য বিক্রয় থেকে
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-1">
          <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400 tracking-wider block">
            মোট বার্ষিক খরচ (Total Expense)
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-amber-700 dark:text-amber-300 tabular-nums">
            ৳ {totalExpense.toLocaleString('bn-BD')}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
            খাদ্য, চিকিৎসা, বিদ্যুৎ ও বেতন বাবদ
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 space-y-1">
          <span className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-400 tracking-wider block">
            নিট লাভ / উদ্বৃত্ত (Net Profit)
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-blue-700 dark:text-blue-300 tabular-nums">
            ৳ {totalNetProfit.toLocaleString('bn-BD')}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
            {profitableMonthsCount} মাস লাভজনক ও ১ মাস লোকসানি
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider block">
            লাভের হার (Profit Margin)
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {Math.round((totalNetProfit / totalIncome) * 100)}%
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
            স্বাভাবিক খামার স্ট্যান্ডার্ড মানদণ্ড
          </p>
        </div>
      </div>

      {/* Bar Chart Section (Income vs Expense with Green Profit / Red Loss indicators) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>মাসের আয় ও খরচের তুলনামূলক বার চার্ট</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              সবুজ বার আয় (Income) এবং অ্যাম্বার বার খরচ (Expense) নির্দেশ করে। নীচের নিট লাভ সবুজ রঙে এবং লোকসান লাল রঙে হাইলাইট করা হয়েছে।
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-slate-700 dark:text-slate-300">মাসিক আয়</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
              <span className="text-slate-700 dark:text-slate-300">মাসিক খরচ</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} fontWeight="bold" />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                fontWeight="bold" 
                unit=" ৳"
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '1rem', 
                  color: '#fff', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  padding: '12px'
                }}
                formatter={(val: any, name: any) => {
                  return [`৳ ${val.toLocaleString('bn-BD')}`, name];
                }}
                labelStyle={{ color: '#38bdf8', fontWeight: 'black', marginBottom: '4px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
              
              <Bar 
                dataKey="income" 
                name="মাসিক আয় (Income)" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]} 
                barSize={20} 
              />
              <Bar 
                dataKey="expense" 
                name="মাসিক খরচ (Expense)" 
                fill="#f59e0b" 
                radius={[6, 6, 0, 0]} 
                barSize={20} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Net Profit / Loss Table with Green & Red color coding */}
      <div className="space-y-4">
        <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>মাসের নিট লাভ (সবুজ) ও লোকসান (লাল) সারসংক্ষেপ তালিকা</span>
        </h4>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">মাসের নাম</th>
                <th className="p-3.5">মোট আয় (৳)</th>
                <th className="p-3.5">মোট খরচ (৳)</th>
                <th className="p-3.5">নিট লাভ / (লোকসান)</th>
                <th className="p-3.5 text-center">আর্থিক অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {monthlyData.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {row.month}
                  </td>
                  <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ৳ {row.income.toLocaleString('bn-BD')}
                  </td>
                  <td className="p-3.5 font-mono text-amber-600 dark:text-amber-400 font-bold">
                    ৳ {row.expense.toLocaleString('bn-BD')}
                  </td>
                  <td className="p-3.5 font-mono font-black">
                    <span className={row.isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {row.isProfit ? `+ ৳ ${row.net.toLocaleString('bn-BD')}` : `- ৳ ${Math.abs(row.net).toLocaleString('bn-BD')}`}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                      row.isProfit 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 animate-pulse'
                    }`}>
                      {row.isProfit ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-rose-600" />}
                      <span>{row.isProfit ? 'লাভজনক (Profit)' : 'লোকসান (Loss)'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
