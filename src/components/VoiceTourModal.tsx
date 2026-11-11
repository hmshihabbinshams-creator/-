import React, { useState, useEffect } from 'react';
import { X, Mic, Sparkles, ArrowRight, Volume2 } from 'lucide-react';
import { useVoiceNarrator } from '../hooks/useVoiceNarrator';

interface VoiceTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceTourModal: React.FC<VoiceTourModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const { speakVoice, cancelVoice } = useVoiceNarrator();

  const tourSteps = [
    {
      title: 'স্বাগতম ভয়েস গাইডে',
      text: 'আসসালামু আলাইকুম। আর এস খামার অ্যাডমিন প্যানেলে আপনাকে স্বাগতম। আমি আপনার ভয়েস গাইড। আমি আপনাকে দেখাবো কীভাবে ভয়েস কমান্ডের মাধ্যমে খামার পরিচালনা করবেন।',
    },
    {
      title: 'ভয়েস কমান্ড ব্যবহার',
      text: '헤ডার বা ন্যাভবারে থাকা মাইক্রোফোন আইকনে ক্লিক করুন। তারপর আপনার কমান্ড বলুন, যেমন: "সব গাভী এখন কি করছে"।',
    },
    {
      title: 'চেইন কমান্ড বা জটিল কাজ',
      text: 'ভয়েস অ্যাসিস্ট্যান্টের মাধ্যমে চেইন কমান্ডও চালানো সম্ভব। যেমন, "রিপোর্ট তৈরি করে ইমেইল করো" বললে সিস্টেম স্বয়ংক্রিয়ভাবে পিডিএফ জেনারেট করে অ্যাডমিনের ইমেইলে পাঠিয়ে দিবে।',
    },
    {
      title: 'কাস্টম ফ্রেজ সেটআপ',
      text: 'অ্যাডমিন সেটিংস প্যানেল থেকে আপনি নিজের পছন্দমতো কমান্ড বা ফ্রেজ ম্যাপ করতে পারবেন।',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      speakVoice(tourSteps[0].text);
    } else {
      cancelVoice();
    }
  }, [isOpen]);

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      speakVoice(tourSteps[nextStep].text);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">খামার ভয়েস ট্যুর</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="h-40 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl p-6 text-center">
            <div className="space-y-3">
              <Sparkles className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-lg font-black text-slate-900 dark:text-white">{tourSteps[step].title}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">{tourSteps[step].text}</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>ধাপ {step + 1} / {tourSteps.length}</span>
            <button onClick={() => speakVoice(tourSteps[step].text)} className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700">
              <Volume2 className="w-4 h-4" /> পুনরায় শুনুন
            </button>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {step < tourSteps.length - 1 ? 'পরবর্তী ধাপ' : 'শুরু করুন'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
