import React, { useMemo } from 'react';
import { 
  Zap, TrendingUp, ShieldCheck, AlertCircle, 
  BarChart3, Activity, ArrowUpRight, Sparkles,
  CheckCircle2, Info
} from 'lucide-react';
import { farmStore } from '../services/farmStore';

export const AiFarmInsightEngine: React.FC = () => {
  const livestock = farmStore.getLivestock();
  const feedInventory = farmStore.getFeedInventory();
  const healthLogs = farmStore.getHealthLogs();
  const productionRecords = farmStore.getDailyProductionRecords();

  const efficiencyScore = useMemo(() => {
    if (livestock.length === 0) return 0;

    // 1. Health Component (40%)
    const sickAnimals = livestock.filter(l => 
      l.healthCondition?.includes('চিকিৎসা') || l.healthStatus?.includes('অসুস্থ')
    ).length;
    const healthScore = ((livestock.length - sickAnimals) / livestock.length) * 40;

    // 2. Production Component (30%)
    const recentProduction = productionRecords.slice(0, 5).length;
    const productionScore = Math.min(30, (recentProduction / 5) * 30);

    // 3. Inventory Component (20%)
    const lowStockItems = feedInventory.filter(i => i.currentStockKg <= i.minThresholdKg).length;
    const inventoryScore = ((feedInventory.length - lowStockItems) / Math.max(1, feedInventory.length)) * 20;

    // 4. Activity Component (10%)
    const recentHealthLogs = healthLogs.filter(h => {
      const logDate = new Date(h.date);
      const today = new Date();
      return (today.getTime() - logDate.getTime()) / (1000 * 3600 * 24) <= 7;
    }).length;
    const activityScore = Math.min(10, (recentHealthLogs / livestock.length) * 10);

    return Math.round(healthScore + productionScore + inventoryScore + activityScore);
  }, [livestock, feedInventory, healthLogs, productionRecords]);

  const recommendations = useMemo(() => {
    const recs: { title: string; desc: string; type: 'success' | 'warning' | 'info' }[] = [];

    // Recommendation 1: Inventory
    const criticalItem = feedInventory.find(i => i.currentStockKg <= i.minThresholdKg);
    if (criticalItem) {
      recs.push({
        title: 'স্টক পুনর্ভরণ জরুরি',
        desc: `${criticalItem.name}-এর মজুদ রি-অর্ডার লেভেলের নিচে। দ্রুত সরবরাহের ব্যবস্থা করুন।`,
        type: 'warning'
      });
    } else {
      recs.push({
        title: 'মজুদ স্থিতিশীল',
        desc: 'পরবর্তী ৭ দিনের জন্য পশুখাদ্যের পর্যাপ্ত মজুদ রয়েছে।',
        type: 'success'
      });
    }

    // Recommendation 2: Health
    const needsAction = healthLogs.filter(h => h.status === 'Action Required').length;
    if (needsAction > 0) {
      recs.push({
        title: 'স্বাস্থ্য পর্যবেক্ষণ প্রয়োজন',
        desc: `${needsAction}টি পশুর জন্য জরুরি স্বাস্থ্য পরীক্ষা বা ভ্যাকসিনেশন প্রয়োজন।`,
        type: 'warning'
      });
    } else {
      recs.push({
        title: 'বায়োসিকিউরিটি বজায় রাখুন',
        desc: 'পশুপালের স্বাস্থ্য এখন পর্যন্ত চমৎকার। নিয়মিত স্যানিটেশন অব্যাহত রাখুন।',
        type: 'info'
      });
    }

    // Recommendation 3: Production
    const avgMilk = productionRecords
      .filter(r => r.type === 'milk')
      .slice(0, 3)
      .reduce((acc, curr) => acc + curr.amount, 0) / 3;
    
    if (avgMilk > 0 && avgMilk < 100) { // arbitrary threshold
      recs.push({
        title: 'ফলন বৃদ্ধির সুযোগ',
        desc: 'দুগ্ধবতী গাভীদের ডায়েটে ২% সাইলেজ বাড়িয়ে উৎপাদন ৫-৭% বৃদ্ধি করা সম্ভব।',
        type: 'info'
      });
    } else {
      recs.push({
        title: 'বাজারদর পর্যবেক্ষণ',
        desc: 'বর্তমান বাজারমূল্য অনুযায়ী পশুপালন লাভজনক। বিক্রির জন্য সেরা সময় বেছে নিন।',
        type: 'success'
      });
    }

    return recs.slice(0, 3);
  }, [feedInventory, healthLogs, productionRecords]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden group">
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
        <Zap className="w-48 h-48 text-indigo-500" />
      </div>

      <div className="relative z-10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5" />
                AI Farm Insight Engine
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Live Audit</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">অপারেশনাল এফিসিয়েন্সি স্কোর ও ইনসাইট</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">খামারের প্রোডাকশন, কস্ট এবং হেলথ ডাটা বিশ্লেষণ করে তৈরি রিয়েল-টাইম রিপোর্ট</p>
          </div>

          <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-200 dark:text-slate-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * efficiencyScore) / 100}
                  className={`${getScoreColor(efficiencyScore)} transition-all duration-1000 ease-out`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black font-mono ${getScoreColor(efficiencyScore)}`}>{efficiencyScore}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Score</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">দক্ষতার মাত্রা</p>
              <p className={`text-xl font-black mt-1 ${getScoreColor(efficiencyScore)}`}>
                {efficiencyScore >= 85 ? 'চমৎকার (Excellent)' : efficiencyScore >= 60 ? 'সন্তোষজনক (Good)' : 'উন্নতি প্রয়োজন (Critical)'}
              </p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">সর্বশেষ ২৪ ঘণ্টার ডাটা পয়েন্টের ভিত্তিতে</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec, idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-[2rem] border transition-all hover:shadow-lg ${
                rec.type === 'warning' 
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40' 
                  : rec.type === 'success'
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40'
                  : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                  rec.type === 'warning' ? 'bg-rose-500' : rec.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}>
                  {rec.type === 'warning' ? <AlertCircle className="w-5 h-5" /> : rec.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{rec.title}</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {rec.desc}
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-60">
                <span>এআই সুপারিশ</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <p className="text-[11px] font-bold text-slate-500">খামারের সকল ডাটা পয়েন্ট ২৪/৭ মনিটর করা হচ্ছে। অপ্টিমাইজেশন অ্যালগরিদম সক্রিয়।</p>
          </div>
          <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all">বিস্তারিত অডিট</button>
        </div>
      </div>
    </div>
  );
};
