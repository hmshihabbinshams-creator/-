import React, { useMemo } from 'react';
import { farmStore } from '../services/farmStore';
import { LivestockItem } from '../types';
import { 
  TrendingUp, TrendingDown, DollarSign, Scale, 
  ShoppingBag, Utensils, ArrowUpRight, ArrowDownRight, 
  BarChart3, PieChart, Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, Cell, ComposedChart, Line, Area
} from 'recharts';
import { ExpenseSectorChart } from './ExpenseSectorChart';

export const AnimalProfitabilityDashboard: React.FC = () => {
  const livestock = farmStore.getLivestock();
  const activeAnimals = livestock.filter(l => l.status !== 'বিক্রিত (Sold)');

  const stats = useMemo(() => {
    return activeAnimals.map(animal => {
      const costStats = farmStore.getAnimalCostStats(animal.id);
      
      // Market value estimation logic
      let marketRatePerKg = 0;
      if (animal.type.includes('গরু')) marketRatePerKg = 550;
      else if (animal.type.includes('ছাগল')) marketRatePerKg = 900;
      else if (animal.type.includes('হাঁস')) marketRatePerKg = 400;
      else if (animal.type.includes('মুরগি')) marketRatePerKg = 280;
      else if (animal.type.includes('মাছ')) marketRatePerKg = 320;
      else marketRatePerKg = 500;

      const estimatedMarketValue = Math.round(animal.currentWeight * marketRatePerKg);
      const totalInvestment = animal.purchasePrice + costStats.totalFeedCost;
      const netProfit = estimatedMarketValue - totalInvestment;
      const profitMargin = ((netProfit / totalInvestment) * 100).toFixed(1);

      return {
        id: animal.id,
        name: animal.name,
        type: animal.type,
        purchasePrice: animal.purchasePrice,
        feedCost: costStats.totalFeedCost,
        totalInvestment,
        currentWeight: animal.currentWeight,
        estimatedMarketValue,
        netProfit,
        profitMargin: parseFloat(profitMargin),
        healthStatus: animal.healthStatus
      };
    });
  }, [activeAnimals]);

  const aggregateStats = useMemo(() => {
    const totalInvestment = stats.reduce((s, i) => s + i.totalInvestment, 0);
    const totalMarketValue = stats.reduce((s, i) => s + i.estimatedMarketValue, 0);
    const totalProfit = stats.reduce((s, i) => s + i.netProfit, 0);
    const avgMargin = stats.length > 0 ? (stats.reduce((s, i) => s + i.profitMargin, 0) / stats.length).toFixed(1) : 0;

    return { totalInvestment, totalMarketValue, totalProfit, avgMargin };
  }, [stats]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600 opacity-[0.03] rounded-full translate-x-8 translate-y-[-8px]" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">মোট ক্রয় ও খাদ্য ব্যয়</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">
            {aggregateStats.totalInvestment.toLocaleString('bn-BD')} <span className="text-xs font-bold opacity-40 text-slate-400">৳</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">সক্রিয় পশুর মোট খরচ (Purchase + Feed)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600 opacity-[0.03] rounded-full translate-x-8 translate-y-[-8px]" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <Scale className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">বর্তমান সম্ভাব্য বাজার দর</p>
          </div>
          <p className="text-3xl font-black text-emerald-600 font-mono tracking-tighter">
            {aggregateStats.totalMarketValue.toLocaleString('bn-BD')} <span className="text-xs font-bold opacity-40 text-emerald-400">৳</span>
          </p>
          <p className="text-[10px] text-emerald-500 mt-1">ওজন ভিত্তিক রিয়েল-টাইম মূল্যায়ন</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600 opacity-[0.03] rounded-full translate-x-8 translate-y-[-8px]" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">চলমান নিট লাভ</p>
          </div>
          <p className="text-3xl font-black text-indigo-600 font-mono tracking-tighter">
            {aggregateStats.totalProfit.toLocaleString('bn-BD')} <span className="text-xs font-bold opacity-40 text-indigo-400">৳</span>
          </p>
          <p className="text-[10px] text-indigo-500 mt-1">ব্যয় বাদে বর্তমানের সম্ভাব্য মুনাফা</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600 opacity-[0.03] rounded-full translate-x-8 translate-y-[-8px]" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">গড় প্রফিট মার্জিন</p>
          </div>
          <p className="text-3xl font-black text-amber-600 font-mono tracking-tighter">
            {aggregateStats.avgMargin} <span className="text-xl font-bold opacity-30">%</span>
          </p>
          <p className="text-[10px] text-amber-500 mt-1">বিনিয়োগের ওপর অর্জিত লাভ শতাংশে</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cost vs Value Comparison */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              ব্যয় বনাম বর্তমান বাজার দর (পশু ভিত্তিক)
            </h4>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <BarChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }}
                />
                <Legend />
                <Bar name="মোট বিনিয়োগ (৳)" dataKey="totalInvestment" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar name="বাজার দর (৳)" dataKey="estimatedMarketValue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Distribution by Category */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" />
              নিট মুনাফা প্রবৃদ্ধি ট্রেন্ড
            </h4>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <ComposedChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} />
                <Area name="খাদ্য ব্যয় (৳)" dataKey="feedCost" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" />
                <Bar name="নিট লাভ (৳)" dataKey="netProfit" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Line name="প্রফিট মার্জিন (%)" type="monotone" dataKey="profitMargin" stroke="#f59e0b" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Sector Visualization */}
        <ExpenseSectorChart />
      </div>

      {/* Per Animal Financial Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="text-lg font-black text-slate-900 dark:text-white">বিস্তারিত পশুবিত্তিক লাভ-ক্ষতি রিপোর্ট</h4>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 dark:border-slate-700">
            CSV এক্সপোর্ট করুন
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">পশুর নাম ও আইডি</th>
                <th className="px-8 py-5 text-right">ক্রয়মূল্য (৳)</th>
                <th className="px-8 py-5 text-right">খাদ্য ব্যয় (৳)</th>
                <th className="px-8 py-5 text-right">মোট বিনিয়োগ (৳)</th>
                <th className="px-8 py-5 text-right">বাজার দর (৳)</th>
                <th className="px-8 py-5 text-right">নিট লাভ (৳)</th>
                <th className="px-8 py-5 text-center">ROI (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 font-mono text-xs">
              {stats.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-sans font-black text-slate-900 dark:text-white">{item.name}</span>
                      <span className="text-[10px] text-slate-400">ID: {item.id} | {item.type}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right text-slate-600 dark:text-slate-400 font-bold tabular-nums">
                    {item.purchasePrice.toLocaleString('bn-BD')}
                  </td>
                  <td className="px-8 py-5 text-right text-blue-600 font-black tabular-nums">
                    {item.feedCost.toLocaleString('bn-BD')}
                  </td>
                  <td className="px-8 py-5 text-right text-slate-900 dark:text-white font-black tabular-nums">
                    {item.totalInvestment.toLocaleString('bn-BD')}
                  </td>
                  <td className="px-8 py-5 text-right text-emerald-600 font-black tabular-nums">
                    {item.estimatedMarketValue.toLocaleString('bn-BD')}
                  </td>
                  <td className="px-8 py-5 text-right font-black tabular-nums">
                    <span className={item.netProfit >= 0 ? 'text-indigo-600' : 'text-red-600'}>
                      {item.netProfit >= 0 ? '+' : ''}{item.netProfit.toLocaleString('bn-BD')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${
                      item.profitMargin > 20 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                      item.profitMargin > 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' :
                      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                    }`}>
                      {item.profitMargin > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {item.profitMargin}%
                    </div>
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
