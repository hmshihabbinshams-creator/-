import React from 'react';
import { X, Mic, Sparkles, ArrowRight, BarChart3, ShoppingBag, Utensils, Syringe } from 'lucide-react';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickStartModal: React.FC<QuickStartModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const commands = [
    { text: 'সব গাভী এখন কি করছে', desc: 'লাইভস্টক ড্যাশবোর্ড দেখাবে', icon: '🐄' },
    { text: 'আজকের দুধের উৎপাদন দেখাও', desc: 'দুধ সংগ্রহের রিপোর্ট', icon: '🥛' },
    { text: 'আজকের ডিমের হিসাব দেখাও', desc: 'ডিম সংগ্রহের রিপোর্ট', icon: '🥚' },
    { text: 'বিক্রির পশু দেখাও', desc: 'বিক্রয়যোগ্য পশুর শপ', icon: '🛍️' },
    { text: 'খাদ্যের স্টক দেখাও', desc: 'খাদ্য ইনভেন্টরি রিপোর্ট', icon: '🌾' },
    { text: 'ভ্যাকসিন শিডিউল দেখাও', desc: 'স্বাস্থ্য ও টিকা ক্যালেন্ডার', icon: '💉' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">ভয়েস কমান্ড গাইড</h3>
              <p className="text-xs text-slate-500">কথা বলে খামার পরিচালনা করুন</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-8">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
            <Sparkles className="w-4 h-4 inline mr-2 text-emerald-600" />
            প্রো টিপস: মাইক্রোফোন বাটনে ক্লিক করার পর স্পষ্টভাবে বলুন। সিস্টেমটি আপনার উচ্চারণ অনুযায়ী খামারের ডাটা এন্ট্রি ও রিপোর্ট সরাসরি দেখাতে সক্ষম।
          </div>

          <div className="grid grid-cols-1 gap-3">
            {commands.map((cmd, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                <span className="text-xl">{cmd.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white">"{cmd.text}"</p>
                  <p className="text-[10px] text-slate-500">{cmd.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-500" />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-all"
        >
          বুঝতে পেরেছি, শুরু করুন!
        </button>
      </div>
    </div>
  );
};
