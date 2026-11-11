import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, BellRing, Syringe, Box, AlertTriangle, 
  CheckCircle2, ShieldCheck, HeartPulse, X, ChevronRight, Check
} from 'lucide-react';
import { farmStore } from '../services/farmStore';
import { NavTab } from '../types';

export interface FarmAlertItem {
  id: string;
  category: 'vaccine' | 'stock' | 'health' | 'biosecurity';
  categoryLabel: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  time: string;
  targetTab: 'vaccine_calendar' | 'inventory_feed' | 'health_vaccination' | 'biosecurity';
}

interface AlertCenterPopoverProps {
  onTabChange: (tab: NavTab) => void;
  onSelectAdminTab?: (adminTab: any) => void;
}

export const AlertCenterPopover: React.FC<AlertCenterPopoverProps> = ({ 
  onTabChange, 
  onSelectAdminTab 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'vaccine' | 'stock' | 'health'>('all');
  const [readAlertIds, setReadAlertIds] = useState<Set<string>>(new Set());

  // Dynamic Live Alerts from farmStore
  const alerts: FarmAlertItem[] = useMemo(() => {
    const list: FarmAlertItem[] = [];

    // 1. Vaccine Alerts
    list.push({
      id: 'alt-vac-1',
      category: 'vaccine',
      categoryLabel: 'ভ্যাকসিন ও টিকা',
      title: 'যমুনাপারি খাসি (G-201): পিপিআর (PPR) বুস্টার ২ দিন মেয়াদোত্তীর্ণ',
      description: 'নির্ধারিত তারিখ ০৮ নভেম্বর পার হয়েছে। অবিলম্বে টিকা প্রদান করুন।',
      severity: 'high',
      time: 'আজকাল',
      targetTab: 'vaccine_calendar'
    });
    list.push({
      id: 'alt-vac-2',
      category: 'vaccine',
      categoryLabel: 'ভ্যাকসিন ও টিকা',
      title: 'সাহীওয়াল গাভী (C-101): খুরারোগ (FMD) টিকা আজকে নির্ধারিত',
      description: 'আজ ১০ নভেম্বর টিকা প্রদানের শেষ দিন।',
      severity: 'high',
      time: 'আজকে',
      targetTab: 'vaccine_calendar'
    });

    // 2. Low Stock Alerts
    const feedInv = farmStore.getFeedInventory();
    const lowItems = feedInv.filter(i => i.currentStock <= i.reorderLevel);
    lowItems.forEach(i => {
      list.push({
        id: `alt-stock-${i.id}`,
        category: 'stock',
        categoryLabel: 'পশুখাদ্য ইনভেন্টরি',
        title: `কম মজুদ: '${i.name}' স্টক রি-অর্ডার লেভেলের নিচে (${i.currentStock} ${i.unit})`,
        description: `নূ্যনতম মজুদ প্রয়োজন ${i.reorderLevel} ${i.unit}। দ্রুত অর্ডার করুন।`,
        severity: 'medium',
        time: 'আজকে',
        targetTab: 'inventory_feed'
      });
    });

    // 3. Animal Health Alerts
    const healthLogs = farmStore.getHealthLogs();
    const actionRequiredLogs = healthLogs.filter(h => h.status === 'Action Required');
    actionRequiredLogs.forEach(h => {
      list.push({
        id: `alt-health-${h.id}`,
        category: 'health',
        categoryLabel: 'পশুর স্বাস্থ্য',
        title: `অসুস্থতা বা নজরদারি: ${h.animalName} [${h.animalId}]`,
        description: `${h.inspectionNotes} (তাপমাত্রা: ${h.temperature})`,
        severity: 'high',
        time: h.date,
        targetTab: 'health_vaccination'
      });
    });

    // 4. Biosecurity Hazards
    list.push({
      id: 'alt-bio-1',
      category: 'biosecurity',
      categoryLabel: 'বায়োসিকিউরিটি',
      title: 'কোয়ারেন্টাইন জোন ও আইসোলেশন শেড অডিট বাকি রয়েছে',
      description: 'দুপুরের স্যানিটেশন রুটিন দ্রবণ পরিবর্তন নিশ্চিত করুন।',
      severity: 'medium',
      time: 'আজ দুপুর',
      targetTab: 'biosecurity'
    });

    return list;
  }, []);

  const unreadCount = alerts.filter(a => !readAlertIds.has(a.id)).length;
  const highSeverityCount = alerts.filter(a => a.severity === 'high' && !readAlertIds.has(a.id)).length;

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter !== 'all' && a.category !== activeFilter) return false;
    return true;
  });

  const handleAlertClick = (alertItem: FarmAlertItem) => {
    setReadAlertIds(prev => new Set(prev).add(alertItem.id));
    setIsOpen(false);
    onTabChange('admin');
    if (onSelectAdminTab) {
      onSelectAdminTab(alertItem.targetTab);
    }
  };

  const handleMarkAllRead = () => {
    setReadAlertIds(new Set(alerts.map(a => a.id)));
  };

  return (
    <div className="relative">
      {/* Alert Center Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl border transition-all cursor-pointer relative flex items-center justify-center ${
          isOpen
            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-300 dark:border-rose-800 ring-2 ring-rose-400/40'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
        }`}
        title="অ্যালার্ট ও নোটিফিকেশন সেন্টার"
      >
        <Bell className={`w-5 h-5 ${highSeverityCount > 0 ? 'text-rose-500 animate-bounce' : 'text-slate-600 dark:text-slate-300'}`} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono font-black text-[10px] shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white">
                খামার অ্যালার্ট সেন্টার ({unreadCount} টি অপঠিত)
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                সব পঠিত করুন
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1 p-2 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 overflow-x-auto text-[10px] font-bold">
            {[
              { id: 'all', label: 'সকল' },
              { id: 'vaccine', label: 'টিকা' },
              { id: 'stock', label: 'ইনভেন্টরি' },
              { id: 'health', label: 'স্বাস্থ্য' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === f.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Alert List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-500">এই বিভাগে কোনো সক্রিয় অ্যালার্ট নেই!</p>
              </div>
            ) : (
              filteredAlerts.map(item => {
                const isRead = readAlertIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleAlertClick(item)}
                    className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 group ${
                      isRead ? 'opacity-50' : 'bg-white dark:bg-slate-900'
                    }`}
                  >
                    {/* Icon based on category */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                      item.category === 'vaccine'
                        ? 'bg-rose-500'
                        : item.category === 'stock'
                        ? 'bg-amber-500'
                        : item.category === 'health'
                        ? 'bg-purple-500'
                        : 'bg-teal-500'
                    }`}>
                      {item.category === 'vaccine' ? <Syringe className="w-4 h-4" /> :
                       item.category === 'stock' ? <Box className="w-4 h-4" /> :
                       item.category === 'health' ? <HeartPulse className="w-4 h-4" /> :
                       <ShieldCheck className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black uppercase text-slate-400">{item.categoryLabel}</span>
                        <span className="text-[9px] font-mono text-slate-400">{item.time}</span>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 shrink-0 self-center transition-transform group-hover:translate-x-0.5" />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                onTabChange('admin');
              }}
              className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              খামার অ্যাডমিন প্যানেলে বিস্তারিত দেখুন →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
