import React from 'react';
import { LivestockItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Utensils, Scale } from 'lucide-react';

interface FoodEfficiencyReportWidgetProps {
  livestock: LivestockItem[];
}

export const FoodEfficiencyReportWidget: React.FC<FoodEfficiencyReportWidgetProps> = ({ livestock }) => {
  if (!livestock || livestock.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <p className="text-slate-500 font-medium italic">কোনো খাদ্য দক্ষতা ডেটা পাওয়া যায়নি।</p>
      </div>
    );
  }

  const efficiencyData = livestock.reduce((acc, animal) => {
    const logs = animal.feedingLogs || [];
    const totals = logs.reduce((subAcc, log) => {
      log.feedItemsServed.forEach(item => {
        subAcc.estimated += item.targetAmountKg;
        subAcc.actual += item.eatenAmountKg;
      });
      return subAcc;
    }, { estimated: 0, actual: 0 });

    if (!acc[animal.type]) {
      acc[animal.type] = { type: animal.type, estimated: 0, actual: 0 };
    }
    acc[animal.type].estimated += totals.estimated;
    acc[animal.type].actual += totals.actual;
    return acc;
  }, {} as Record<string, { type: string; estimated: number; actual: number }>);

  const chartData = Object.values(efficiencyData).map(d => ({
    name: d.type.split(' ')[0], // Simplify category name
    'প্রাক্কলিত খাদ্য (কেজি)': parseFloat(d.estimated.toFixed(2)),
    'প্রকৃত খাদ্য (কেজি)': parseFloat(d.actual.toFixed(2)),
  }));

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
         <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
           <Utensils className="w-6 h-6" />
         </div>
         <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">খাদ্য দক্ষতা রিপোর্ট (Food Efficiency)</h3>
            <p className="text-xs text-slate-500 font-medium">প্রাক্কলিত খাদ্য বনাম প্রকৃত খাদ্য ব্যবহার (বিভাগ অনুযায়ী)</p>
         </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight="bold" />
            <YAxis stroke="#64748b" fontSize={11} fontWeight="bold" unit=" kg" />
            <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
            <Bar dataKey="প্রাক্কলিত খাদ্য (কেজি)" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            <Bar dataKey="প্রকৃত খাদ্য (কেজি)" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.values(efficiencyData).map(d => {
          const efficiency = d.estimated > 0 ? ((d.actual / d.estimated) * 100).toFixed(1) : '0';
          return (
            <div key={d.type} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">{d.type.split(' ')[0]}</span>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold block">দক্ষতা</span>
                <span className={`text-sm font-black ${Number(efficiency) > 100 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {efficiency}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
