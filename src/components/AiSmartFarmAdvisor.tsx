import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CloudSun, CheckCircle2, RotateCcw, Bot, Lightbulb, ArrowRight } from 'lucide-react';
import { farmStore } from '../services/farmStore';
import { DailyProductionRecord, HealthLog, LivestockItem } from '../types';

export const AiSmartFarmAdvisor: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const productionHistory = farmStore.getDailyProductionRecords().slice(0, 10);
      const healthTrends = farmStore.getHealthLogs().slice(0, 5);
      const livestock = farmStore.getLivestock();
      const livestockSummary = livestock.map(l => `${l.name} (${l.type}): ${l.healthStatus}`).join(', ');
      
      // Mock weather forecast for grounding (could be replaced with real API)
      const weatherForecast = {
        temp: '৩২° - ৩৮° সে.',
        condition: 'অত্যধিক গরম ও আর্দ্রতা',
        risk: 'পশুর হিট স্ট্রোকের সম্ভাবনা'
      };

      const res = await fetch('/api/ai/farm-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productionHistory,
          healthTrends,
          weatherForecast,
          livestockSummary
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuggestions(data.suggestions);
        setLastUpdated(new Date().toLocaleTimeString('bn-BD'));
      }
    } catch (error) {
      console.error('Advisor fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div className="glass-card p-8 rounded-[2.5rem] border border-emerald-200 dark:border-emerald-900 shadow-xl bg-gradient-to-br from-emerald-50/50 via-white to-transparent dark:from-emerald-950/10 dark:via-slate-900 dark:to-transparent relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">এআই স্মার্ট খামার উপদেষ্টা</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">Active Insight</span>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-60 mt-0.5">Real-time Operations Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-[10px] font-bold text-slate-400">সর্বশেষ আপডেট: {lastUpdated}</span>
            )}
            <button
              onClick={fetchSuggestions}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black text-[10px] flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ ডাটা</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Suggestions Display */}
          <div className="lg:col-span-8 space-y-4">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
                ))}
              </div>
            ) : suggestions ? (
              <div className="prose prose-sm dark:prose-invert max-w-none bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30">
                <div className="space-y-6">
                  {suggestions.split('\n').filter(s => s.trim()).map((line, idx) => {
                    const isHeader = line.includes('১.') || line.includes('২.') || line.includes('৩.') || line.includes('৪.') || line.includes('৫.');
                    return (
                      <div key={idx} className={`flex items-start gap-3 ${isHeader ? 'mt-4' : ''}`}>
                        {isHeader ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-md shadow-emerald-500/20">
                            {line.split('.')[0]}
                          </div>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2 ml-2" />
                        )}
                        <p className={`text-slate-700 dark:text-slate-300 leading-relaxed ${isHeader ? 'font-black text-sm' : 'text-xs font-medium'}`}>
                          {isHeader ? line.split('.').slice(1).join('.').trim() : line.replace(/^[-*•]/, '').trim()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Bot className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold text-sm">নতুন কোনো ইনসাইট লোড করতে রিফ্রেশ বাটন চাপুন।</p>
              </div>
            )}
          </div>

          {/* Quick Metrics & Context Sidecar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 space-y-4">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-blue-600" />
                <h4 className="text-[11px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">আবহাওয়ার প্রভাব</h4>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">পূর্বাভাস</p>
                  <p className="text-sm font-black text-slate-800 dark:text-white">অত্যধিক তাপপ্রবাহ (৩৬°সে.)</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <p className="text-[10px] text-red-700 dark:text-red-300 leading-relaxed font-bold">
                    দুপুর ১২টা থেকে বিকাল ৪টা পর্যন্ত পশুকে সরাসরি রোদে রাখা থেকে বিরত থাকুন।
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <h4 className="text-[11px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">উৎপাদন অপ্টিমাইজেশন</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">দুধের ঘনত্ব বাড়াতে সাইলেজ বরাদ্দ বাড়ান।</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">মুরগির খাদ্য রূপান্তর অনুপাত (FCR) উন্নত করুন।</span>
                </li>
              </ul>
            </div>

            <button className="w-full group p-5 rounded-3xl bg-slate-900 text-white flex items-center justify-between hover:bg-black transition-all shadow-xl shadow-slate-900/20">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">বিস্তারিত অডিট রিপোর্ট</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
