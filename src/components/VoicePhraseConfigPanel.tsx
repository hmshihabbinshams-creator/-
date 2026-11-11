import React, { useState, useEffect } from 'react';
import { 
  Mic, Plus, Trash2, Edit3, Volume2, CheckCircle2, 
  Sparkles, RefreshCw, Zap, Sliders, ShieldCheck, Activity
} from 'lucide-react';
import { VoicePhraseMapping, NavTab } from '../types';
import { farmStore } from '../services/farmStore';

interface VoicePhraseConfigPanelProps {
  onTabChange?: (tab: NavTab) => void;
  onSelectAdminTab?: (adminTabKey: string) => void;
}

export const VoicePhraseConfigPanel: React.FC<VoicePhraseConfigPanelProps> = ({
  onTabChange,
  onSelectAdminTab
}) => {
  const [phrases, setPhrases] = useState<VoicePhraseMapping[]>([]);
  const [newPhrase, setNewPhrase] = useState('');
  const [newActionType, setNewActionType] = useState<VoicePhraseMapping['actionType']>('livestock_status');
  const [newResponseText, setNewResponseText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [testingPhraseId, setTestingPhraseId] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setPhrases(farmStore.getVoicePhrases());
    };
    update();
    const unsub = farmStore.subscribe(update);
    return () => unsub();
  }, []);

  const handleAddPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhrase.trim() || !newResponseText.trim()) return;

    let targetTab: NavTab = 'admin';
    let adminTabKey = 'dashboard';

    if (newActionType === 'tab_navigate') {
      targetTab = 'store';
      adminTabKey = '';
    } else if (newActionType === 'query_feed') {
      targetTab = 'admin';
      adminTabKey = 'feed';
    } else if (newActionType === 'query_health') {
      targetTab = 'admin';
      adminTabKey = 'vaccine';
    } else if (newActionType === 'livestock_status') {
      targetTab = 'admin';
      adminTabKey = 'dashboard';
    }

    farmStore.addVoicePhrase({
      phrase: newPhrase.trim(),
      actions: [{ type: newActionType, targetTab, adminTabKey }],
      responseText: newResponseText.trim(),
      isActive: true,
    });

    setNewPhrase('');
    setNewResponseText('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleToggleActive = (id: string, current: boolean) => {
    farmStore.updateVoicePhrase(id, { isActive: !current });
  };

  const handleDelete = (id: string) => {
    farmStore.deleteVoicePhrase(id);
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি পূর্বনির্ধারিত (Default) ভয়েস ফ্রেজগুলো রিস্টোর করতে চান?')) {
      farmStore.resetVoicePhrases();
    }
  };

  const speakTestResponse = (item: VoicePhraseMapping) => {
    setTestingPhraseId(item.id);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.responseText);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;
      utterance.onend = () => setTestingPhraseId(null);
      utterance.onerror = () => setTestingPhraseId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setTestingPhraseId(null), 1500);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-emerald-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>এআই ভয়েস ফ্রন্টেন্ড কনফিগারেশন</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              কাস্টম 'ভয়েস ফ্রেজ' (Voice Phrase) সেটিংস প্যানেল
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              অ্যাডমিন নিজের সুবিধামতো যেকোনো ভয়েস বাক্যাংশ (যেমন: <strong>"সব গাভী এখন কি করছে"</strong>) যুক্ত করতে পারবেন, যা ভয়েস ইনপুট দিলে নির্দিষ্ট লাইভস্টক ড্যাশবোর্ড বা রিপোর্ট স্বয়ংক্রিয়ভাবে সচল করবে।
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4 text-emerald-300" />
            <span>ডিফল্ট ফ্রেজ রিস্টোর</span>
          </button>
        </div>
      </div>

      {/* Add New Custom Voice Phrase Form */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-slate-800 shadow-lg space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">নতুন ভয়েস ফ্রেজ ম্যাপিং যোগ করুন</h3>
              <p className="text-xs text-slate-500">কথার সাথে রিপোর্ট বা নেভিগেশন একশন যুক্ত করুন</p>
            </div>
          </div>

          {isSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 animate-in fade-in">
              ✓ নতুন ফ্রেজ সফলভাবে যুক্ত করা হয়েছে!
            </span>
          )}
        </div>

        <form onSubmit={handleAddPhrase} className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              ভয়েস ফ্রেজ (Voice Phrase / কথা) *
            </label>
            <input
              type="text"
              placeholder='যেমন: "সব গাভী এখন কি করছে"'
              value={newPhrase}
              onChange={e => setNewPhrase(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <p className="text-[10px] text-slate-400">যে বাক্যাংশ বললে সিস্টেম একশন নিবে</p>
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              সংশ্লিষ্ট একশন / রিপোর্ট (Trigger Action) *
            </label>
            <select
              value={newActionType}
              onChange={e => setNewActionType(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="livestock_status">🐄 লাইভস্টক গাভীর বর্তমান স্ট্যাটাস ও ড্যাশবোর্ড</option>
              <option value="query_milk">🥛 দুধের উৎপাদন রিপোর্ট ও এন্ট্রি পোর্টাল</option>
              <option value="query_eggs">🥚 ডিমের হিসাব ও হ্যাচারি রিপোর্ট</option>
              <option value="query_feed">🌾 খাদ্যের স্টক ও ইনভেন্টরি ড্যাশবোর্ড</option>
              <option value="query_health">💉 ভ্যাকসিন শিডিউল ও স্বাস্থ্য রিপোর্ট</option>
              <option value="tab_navigate">🛍️ বিক্রয়যোগ্য পশুর শপ পেজ</option>
            </select>
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              এআই ভয়েস রেসপন্স (Voice Response in Bengali) *
            </label>
            <input
              type="text"
              placeholder='যেমন: "গাভীর লাইভস্টক স্ট্যাটাস ও হেলথ মনিটর খোলা হচ্ছে।"'
              value={newResponseText}
              onChange={e => setNewResponseText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="md:col-span-12 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>ফ্রেজ সেভ ও কনফিগার করুন</span>
            </button>
          </div>
        </form>
      </div>

      {/* Configured Voice Phrases List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>বর্তমানে কনফিগার করা কাস্টম ভয়েস ফ্রেজসমূহ</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              {phrases.length} টি
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phrases.map((item) => (
            <div
              key={item.id}
              className={`glass-card rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                item.isActive 
                  ? 'border-emerald-200 dark:border-emerald-800/60 shadow-md' 
                  : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-black">
                      ভয়েস ফ্রেজ (Voice Phrase)
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>"{item.phrase}"</span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleActive(item.id, item.isActive)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                        item.isActive 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.isActive ? '● সক্রিয়' : '○ নিষ্ক্রিয়'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-bold">ট্রিগারড একশনসমূহ:</span>
                    <div className="flex flex-col gap-1 items-end">
                      {item.actions.map((act, i) => (
                        <span key={i} className="font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md text-[10px]">
                          {act.type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    <span className="text-slate-400 font-normal">এআই ভয়েস রেসপন্স:</span> "{item.responseText}"
                  </p>
                </div>
              </div>

              {/* Action Buttons: Test Voice */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">আইডি: {item.id}</span>
                <button
                  onClick={() => speakTestResponse(item)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 hover:text-white border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${testingPhraseId === item.id ? 'animate-bounce text-amber-500' : ''}`} />
                  <span>{testingPhraseId === item.id ? 'প্লে হচ্ছে...' : 'ভয়েস টেস্ট করুন'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
