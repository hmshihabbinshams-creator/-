import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronDown, Check, RotateCcw, Filter, Sparkles } from 'lucide-react';

export type DateRangePreset = '7d' | '30d' | '3m' | '6m' | 'ytd' | 'custom';

export interface DateRangeState {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  preset: DateRangePreset;
  labelBn: string;
}

interface DateRangeFilterProps {
  value: DateRangeState;
  onChange: (newRange: DateRangeState) => void;
  className?: string;
  showCustomInputsInline?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  className = '',
  showCustomInputsInline = true
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState(value.startDate);
  const [customEnd, setCustomEnd] = useState(value.endDate);

  // Sync internal state when external value changes
  useEffect(() => {
    setCustomStart(value.startDate);
    setCustomEnd(value.endDate);
  }, [value.startDate, value.endDate]);

  const calculateDatesForPreset = (preset: DateRangePreset): { start: string; end: string; label: string } => {
    const today = new Date();
    const endStr = today.toISOString().split('T')[0];

    const d = new Date(today);
    switch (preset) {
      case '7d': {
        d.setDate(d.getDate() - 7);
        return { start: d.toISOString().split('T')[0], end: endStr, label: 'গত ৭ দিন (দৈনিক বিস্তারিত)' };
      }
      case '30d': {
        d.setDate(d.getDate() - 30);
        return { start: d.toISOString().split('T')[0], end: endStr, label: 'গত ৩০ দিন (মাসিক সাম্প্রতিক)' };
      }
      case '3m': {
        d.setMonth(d.getMonth() - 3);
        return { start: d.toISOString().split('T')[0], end: endStr, label: 'গত ৩ মাস (ত্রৈমাসিক)' };
      }
      case '6m': {
        d.setMonth(d.getMonth() - 6);
        return { start: d.toISOString().split('T')[0], end: endStr, label: 'গত ৬ মাস (অর্ধবার্ষিক)' };
      }
      case 'ytd': {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return { start: startOfYear.toISOString().split('T')[0], end: endStr, label: `চলতি বছর (${today.getFullYear()})` };
      }
      case 'custom':
      default:
        return { start: customStart, end: customEnd, label: 'কাস্টম সময়কাল' };
    }
  };

  const handleSelectPreset = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      setShowCustomModal(true);
      return;
    }
    const { start, end, label } = calculateDatesForPreset(preset);
    onChange({
      startDate: start,
      endDate: end,
      preset,
      labelBn: label
    });
  };

  const handleApplyCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customStart || !customEnd) return;

    // Ensure start is before or equal to end
    let s = customStart;
    let end = customEnd;
    if (new Date(s) > new Date(end)) {
      const temp = s;
      s = end;
      end = temp;
    }

    const startObj = new Date(s);
    const endObj = new Date(end);
    const startFormatted = startObj.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
    const endFormatted = endObj.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });

    onChange({
      startDate: s,
      endDate: end,
      preset: 'custom',
      labelBn: `${startFormatted} – ${endFormatted}`
    });
    setShowCustomModal(false);
  };

  const presets: { id: DateRangePreset; label: string }[] = [
    { id: '7d', label: '৭ দিন' },
    { id: '30d', label: '৩০ দিন' },
    { id: '3m', label: '৩ মাস' },
    { id: '6m', label: '৬ মাস' },
    { id: 'ytd', label: 'চলতি বছর' },
    { id: 'custom', label: 'কাস্টম রেঞ্জ' },
  ];

  return (
    <div className={`p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Filter Title & Active Range Display */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
            <CalendarIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                সময়কাল ফিল্টার (Date Range Filter)
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {value.labelBn}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              রেঞ্জ: {value.startDate} হতে {value.endDate} পর্যন্ত
            </p>
          </div>
        </div>

        {/* Right: Quick Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          {presets.map(p => {
            const isActive = value.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm font-black ring-1 ring-emerald-500'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inline Date Pickers (visible when custom or on desktop expansion) */}
      {showCustomInputsInline && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500">শুরুর তারিখ:</span>
              <input
                type="date"
                value={customStart}
                onChange={e => {
                  setCustomStart(e.target.value);
                  if (value.preset === 'custom') {
                    onChange({
                      startDate: e.target.value,
                      endDate: customEnd,
                      preset: 'custom',
                      labelBn: 'কাস্টম সময়কাল'
                    });
                  }
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500">শেষ তারিখ:</span>
              <input
                type="date"
                value={customEnd}
                onChange={e => {
                  setCustomEnd(e.target.value);
                  if (value.preset === 'custom') {
                    onChange({
                      startDate: customStart,
                      endDate: e.target.value,
                      preset: 'custom',
                      labelBn: 'কাস্টম সময়কাল'
                    });
                  }
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleApplyCustom()}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              প্রয়োগ করুন
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSelectPreset('6m')}
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ডিফল্ট (৬ মাস) রিসেট</span>
          </button>
        </div>
      )}

      {/* Custom Modal for Mobile/Focused Range Selection */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-600" />
                <span>কাস্টম সময়কাল নির্বাচন করুন</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyCustom} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  শুরুর তারিখ (Start Date)
                </label>
                <input
                  type="date"
                  required
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  শেষ তারিখ (End Date)
                </label>
                <input
                  type="date"
                  required
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-md cursor-pointer"
                >
                  ফিল্টার চালু করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
