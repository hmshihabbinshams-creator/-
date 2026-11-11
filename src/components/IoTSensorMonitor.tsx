import React, { useState, useEffect, useMemo } from 'react';
import { 
  Cpu, Thermometer, Droplets, Wind, AlertTriangle, 
  ShieldAlert, CheckCircle2, RefreshCw, Bell, Volume2, 
  Sliders, ArrowUpRight, ShieldCheck, Flame, Fan, Zap, X
} from 'lucide-react';

export interface IoTSensorNode {
  id: string;
  shedCode: string;
  name: string;
  species: string;
  temperatureC: number;
  humidityPercent: number;
  ammoniaPpm: number;
  exhaustFanStatus: 'বন্ধ (Off)' | 'স্বাভাবিক (Normal)' | 'উচ্চগতি (High Speed)';
  status: 'optimal' | 'warning' | 'danger';
  lastPing: string;
  batteryLevel: number;
}

const INITIAL_NODES: IoTSensorNode[] = [
  {
    id: 'IOT-SHED-01',
    shedCode: 'শেড-০১',
    name: 'ডেইরি ও দুগ্ধবতী গাভী কমপ্লেক্স',
    species: 'গরু (Cattle)',
    temperatureC: 26.5,
    humidityPercent: 64,
    ammoniaPpm: 12,
    exhaustFanStatus: 'স্বাভাবিক (Normal)',
    status: 'optimal',
    lastPing: 'এখনই আপডেট (১ সেক আগে)',
    batteryLevel: 98
  },
  {
    id: 'IOT-SHED-02',
    shedCode: 'শেড-০২',
    name: 'যমুনাপারি ও ব্ল্যাক বেঙ্গল শেড',
    species: 'ছাগল ও খাসি (Goat)',
    temperatureC: 27.2,
    humidityPercent: 59,
    ammoniaPpm: 14,
    exhaustFanStatus: 'স্বাভাবিক (Normal)',
    status: 'optimal',
    lastPing: 'এখনই আপডেট (২ সেক আগে)',
    batteryLevel: 95
  },
  {
    id: 'IOT-SHED-03',
    shedCode: 'শেড-০৩',
    name: 'বাণিজ্যিক সোনালী ও ব্রয়লার হাউজ',
    species: 'মুরগি (Chicken)',
    temperatureC: 34.6, // বিপৎসীমা (>৩৩°সে)
    humidityPercent: 84, // বিপৎসীমা (>৮০%)
    ammoniaPpm: 24, // বিপৎসীমা (>২০ পিপিএম)
    exhaustFanStatus: 'উচ্চগতি (High Speed)',
    status: 'danger',
    lastPing: 'এখনই আপডেট (রিয়েল-টাইম)',
    batteryLevel: 91
  },
  {
    id: 'IOT-SHED-04',
    shedCode: 'শেড-০৪',
    name: 'খাকি ক্যাম্পবেল ও পেকিন হাঁস শেড',
    species: 'হাঁস (Duck)',
    temperatureC: 28.1,
    humidityPercent: 72,
    ammoniaPpm: 16,
    exhaustFanStatus: 'স্বাভাবিক (Normal)',
    status: 'optimal',
    lastPing: '৩ সেকেন্ড আগে',
    batteryLevel: 89
  },
  {
    id: 'IOT-SHED-05',
    shedCode: 'শেড-০৫',
    name: 'জাপানিজ কোয়েল ও সৌখিন অ্যাভিয়ারি',
    species: 'পাখি (Birds)',
    temperatureC: 29.8,
    humidityPercent: 62,
    ammoniaPpm: 11,
    exhaustFanStatus: 'স্বাভাবিক (Normal)',
    status: 'optimal',
    lastPing: '১ সেকেন্ড আগে',
    batteryLevel: 96
  },
  {
    id: 'IOT-ZONE-06',
    shedCode: 'জোন-০৬',
    name: 'হ্যাচারি ইনকিউবেশন ও ফিঙ্গারলিং নার্সারি',
    species: 'মৎস্য ও পোনা (Fish)',
    temperatureC: 28.4,
    humidityPercent: 78,
    ammoniaPpm: 9,
    exhaustFanStatus: 'স্বাভাবিক (Normal)',
    status: 'optimal',
    lastPing: '৪ সেকেন্ড আগে',
    batteryLevel: 94
  }
];

// Threshold rules for danger and warning
const THRESHOLDS = {
  temp: {
    optimalMin: 20,
    optimalMax: 30,
    warningMax: 33,
    dangerHigh: 33, // > ৩৩°সে বিপৎসীমা
    dangerLow: 18   // < ১৮°সে বিপৎসীমা
  },
  humidity: {
    optimalMin: 50,
    optimalMax: 70,
    warningMax: 80,
    dangerHigh: 80, // > ৮০% বিপৎসীমা
    dangerLow: 40   // < ৪০% বিপৎসীমা
  },
  ammonia: {
    optimalMax: 15,
    warningMax: 20,
    dangerHigh: 20  // > ২০ পিপিএম বিপজ্জনক
  }
};

export const IoTSensorMonitor: React.FC = () => {
  const [nodes, setNodes] = useState<IoTSensorNode[]>(INITIAL_NODES);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, boolean>>({});

  // Helper to evaluate node health status
  const evaluateStatus = (temp: number, hum: number, nh3: number): 'optimal' | 'warning' | 'danger' => {
    if (
      temp > THRESHOLDS.temp.dangerHigh || 
      temp < THRESHOLDS.temp.dangerLow || 
      hum > THRESHOLDS.humidity.dangerHigh || 
      hum < THRESHOLDS.humidity.dangerLow || 
      nh3 > THRESHOLDS.ammonia.dangerHigh
    ) {
      return 'danger';
    }

    if (
      temp > THRESHOLDS.temp.optimalMax || 
      hum > THRESHOLDS.humidity.optimalMax || 
      nh3 > THRESHOLDS.ammonia.optimalMax
    ) {
      return 'warning';
    }

    return 'optimal';
  };

  // Live simulation tick every 6 seconds if live active
  useEffect(() => {
    if (!isLiveActive) return;

    const interval = setInterval(() => {
      setNodes(prev =>
        prev.map(node => {
          // Slight realistic telemetry jitter
          const deltaT = Number(((Math.random() - 0.5) * 0.3).toFixed(1));
          const deltaH = Math.floor((Math.random() - 0.5) * 2);
          const deltaN = Math.floor((Math.random() - 0.5) * 1.5);

          const newTemp = Number(Math.max(16, Math.min(38, node.temperatureC + deltaT)).toFixed(1));
          const newHum = Math.max(35, Math.min(95, node.humidityPercent + deltaH));
          const newAmmonia = Math.max(4, Math.min(35, node.ammoniaPpm + deltaN));
          const newStatus = evaluateStatus(newTemp, newHum, newAmmonia);

          return {
            ...node,
            temperatureC: newTemp,
            humidityPercent: newHum,
            ammoniaPpm: newAmmonia,
            status: newStatus,
            lastPing: 'এখনই আপডেট (রিয়েল-টাইম)'
          };
        })
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [isLiveActive]);

  // Refresh manually
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setNodes(prev =>
        prev.map(n => ({
          ...n,
          lastPing: 'এখনই রিফ্রেশ সম্পন্ন'
        }))
      );
      setIsRefreshing(false);
    }, 500);
  };

  // Test simulation to trigger danger state on a node
  const handleSimulateDanger = (nodeId: string) => {
    setNodes(prev =>
      prev.map(n => {
        if (n.id === nodeId) {
          const isAlreadyDanger = n.status === 'danger';
          if (isAlreadyDanger) {
            // Restore to normal
            return {
              ...n,
              temperatureC: 26.2,
              humidityPercent: 62,
              ammoniaPpm: 11,
              exhaustFanStatus: 'স্বাভাবিক (Normal)',
              status: 'optimal'
            };
          } else {
            // Trigger danger
            return {
              ...n,
              temperatureC: 35.8, // > ৩৩°সে বিপদ
              humidityPercent: 86, // > ৮০% বিপদ
              ammoniaPpm: 26,     // > ২০ পিপিএম মারাত্মক বিপদ
              exhaustFanStatus: 'উচ্চগতি (High Speed)',
              status: 'danger'
            };
          }
        }
        return n;
      })
    );
  };

  // Turn on high-speed exhaust fans for a shed
  const handleToggleExhaust = (nodeId: string) => {
    setNodes(prev =>
      prev.map(n => {
        if (n.id === nodeId) {
          const isHigh = n.exhaustFanStatus.includes('উচ্চগতি');
          return {
            ...n,
            exhaustFanStatus: isHigh ? 'স্বাভাবিক (Normal)' : 'উচ্চগতি (High Speed)',
            // High speed fan reduces ammonia and temperature gradually
            ammoniaPpm: isHigh ? n.ammoniaPpm : Math.max(12, n.ammoniaPpm - 6),
            temperatureC: isHigh ? n.temperatureC : Number((n.temperatureC - 1.5).toFixed(1)),
            status: isHigh ? n.status : evaluateStatus(n.temperatureC - 1.5, n.humidityPercent, Math.max(12, n.ammoniaPpm - 6))
          };
        }
        return n;
      })
    );
  };

  // Acknowledge alert
  const handleAcknowledge = (nodeId: string) => {
    setAcknowledgedAlerts(prev => ({ ...prev, [nodeId]: true }));
  };

  // Danger summary
  const dangerNodes = useMemo(() => {
    return nodes.filter(n => n.status === 'danger');
  }, [nodes]);

  const warningNodes = useMemo(() => {
    return nodes.filter(n => n.status === 'warning');
  }, [nodes]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    if (selectedZoneFilter === 'all') return nodes;
    if (selectedZoneFilter === 'danger') return nodes.filter(n => n.status === 'danger');
    if (selectedZoneFilter === 'warning') return nodes.filter(n => n.status === 'warning');
    if (selectedZoneFilter === 'optimal') return nodes.filter(n => n.status === 'optimal');
    return nodes.filter(n => n.id === selectedZoneFilter);
  }, [nodes, selectedZoneFilter]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              লাইভ IoT সেন্সর নেটওয়ার্ক (ESP32 / Zigbee)
            </span>
            <span className="text-xs font-bold text-slate-500">৬টি শেড ও জোনের রিয়েল-টাইম ক্লাইমেট মনিটরিং</span>
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>আইওটি (IoT) সেন্সর মনিটর ও পরিবেশগত ক্লাইমেট নিয়ন্ত্রণ</span>
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Stream Toggle */}
          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isLiveActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title="রিয়েল-টাইম লাইভ ডাটা পোলিং চালু/বন্ধ করুন"
          >
            <span className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
            <span>{isLiveActive ? 'লাইভ সিঙ্ক চালু' : 'সিঙ্ক বিরতি'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="সেন্সর ডাটা রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>
      </div>

      {/* Global Red Danger Alert Banner (Active when any shed exceeds safe threshold) */}
      {dangerNodes.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-500/10 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-900 dark:text-rose-200 shadow-xl shadow-rose-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-rose-600 text-white">
                    জরুরি বিপদ সতর্কতা (Critical Danger Alert)
                  </span>
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                    {dangerNodes.length}টি শেডে প্যারামিটার বিপৎসীমা অতিক্রম করেছে!
                  </span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                  {dangerNodes.map(n => `${n.shedCode} (${n.name})`).join(', ')} এ উচ্চ তাপমাত্রা, আর্দ্রতা বা অ্যামোনিয়া গ্যাস ক্ষতিকর মাত্রায় পৌঁছেছে। অবিলম্বে এক্সহস্ট ফ্যান চালু করুন ও বায়ু চলাচল স্বাভাবিক করুন।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  dangerNodes.forEach(dn => handleToggleExhaust(dn.id));
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Fan className="w-4 h-4 animate-spin" />
                <span>সব ঝুঁকিপূর্ণ শেডে হাই-স্পিড ফ্যান চালু</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Ranges Reference Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Temperature Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">তাপমাত্রা (Temperature)</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">ডিগ্রি সেলসিয়াস (°সে)</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>আদর্শ স্বাভাবিক সীমা:</span>
              <span className="font-bold text-emerald-600 font-mono">২০°সে – ৩০°সে</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
              <span>লাল বিপৎসীমা:</span>
              <span className="font-mono">&gt; ৩৩°সে অথবা &lt; ১৮°সে</span>
            </div>
          </div>
        </div>

        {/* Humidity Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">আর্দ্রতা (Humidity)</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">শতাংশ (%)</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>আদর্শ স্বাভাবিক সীমা:</span>
              <span className="font-bold text-emerald-600 font-mono">৫০% – ৭০%</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
              <span>লাল বিপৎসীমা:</span>
              <span className="font-mono">&gt; ৮০% অথবা &lt; ৪০%</span>
            </div>
          </div>
        </div>

        {/* Ammonia PPM Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">অ্যামোনিয়া গ্যাস (NH₃)</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">পিপিএম (PPM)</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>আদর্শ স্বাভাবিক সীমা:</span>
              <span className="font-bold text-emerald-600 font-mono">&lt; ১৫ পিপিএম</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
              <span>লাল বিপৎসীমা:</span>
              <span className="font-mono">&gt; ২০ পিপিএম (বিষাক্ত)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Zone Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500">ফিল্টার:</span>
          {[
            { id: 'all', label: `সকল শেড (${nodes.length})` },
            { id: 'danger', label: `বিপৎসীমায় (${dangerNodes.length}) 🚨` },
            { id: 'warning', label: `সতর্কতায় (${warningNodes.length}) ⚠️` },
            { id: 'optimal', label: 'আদর্শ/স্বাভাবিক 🟢' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedZoneFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedZoneFilter === f.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-bold">
          অনলাইন সেন্সর নোড: <span className="font-mono text-emerald-600">{nodes.length}/{nodes.length} টি সচল</span>
        </div>
      </div>

      {/* IoT Shed Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNodes.map(node => {
          const isTempDanger = node.temperatureC > THRESHOLDS.temp.dangerHigh || node.temperatureC < THRESHOLDS.temp.dangerLow;
          const isHumDanger = node.humidityPercent > THRESHOLDS.humidity.dangerHigh || node.humidityPercent < THRESHOLDS.humidity.dangerLow;
          const isAmmoniaDanger = node.ammoniaPpm > THRESHOLDS.ammonia.dangerHigh;

          const isOverallDanger = isTempDanger || isHumDanger || isAmmoniaDanger;
          const isWarning = !isOverallDanger && (
            node.temperatureC > THRESHOLDS.temp.optimalMax || 
            node.humidityPercent > THRESHOLDS.humidity.optimalMax || 
            node.ammoniaPpm > THRESHOLDS.ammonia.optimalMax
          );

          // Card styles based on danger/warning
          const cardBorder = isOverallDanger
            ? 'border-2 border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 shadow-xl shadow-rose-500/10 ring-2 ring-rose-500/20'
            : isWarning
            ? 'border-2 border-amber-400 bg-amber-50/40 dark:bg-amber-950/30 shadow-md'
            : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 shadow-sm';

          return (
            <div
              key={node.id}
              className={`p-6 rounded-3xl transition-all space-y-5 flex flex-col justify-between ${cardBorder}`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {node.shedCode}
                      </span>
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 font-mono">
                        {node.id}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                      {node.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-bold">{node.species}</p>
                  </div>

                  {/* Status Indicator Badge */}
                  <div className="flex flex-col items-end gap-1">
                    {isOverallDanger ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-md shadow-rose-600/30 flex items-center gap-1 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        <span>বিপৎসীমা লাল সতর্কতা</span>
                      </span>
                    ) : isWarning ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-white flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        <span>সতর্কতা</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>আদর্শ</span>
                      </span>
                    )}

                    <span className="text-[9px] font-mono text-slate-400">
                      ব্যাটারি: {node.batteryLevel}%
                    </span>
                  </div>
                </div>

                {/* Specific Danger Callout Message */}
                {isOverallDanger && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-600/10 dark:bg-rose-950/80 border border-rose-500 text-rose-800 dark:text-rose-200 text-xs font-bold space-y-0.5">
                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-black">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>বিপদ সতর্কতা সক্রিয়!</span>
                    </div>
                    <p className="text-[11px] leading-snug">
                      {isAmmoniaDanger && 'অ্যামোনিয়া গ্যাস বিপৎসীমা (>২০ ppm) ছাড়িয়েছে। '}
                      {isTempDanger && 'তাপমাত্রা স্বাভাবিকের চেয়ে চরম বিপৎসীমায়। '}
                      {isHumDanger && 'আর্দ্রতা অস্বাভাবিক মাত্রায় উচ্চ/নিম্ন।'}
                    </p>
                  </div>
                )}

                {/* Sensor Metrics Readouts with 100% Bengali Labels and Units */}
                <div className="space-y-2.5 pt-4">
                  {/* Temperature Readout */}
                  <div className={`p-3 rounded-2xl flex items-center justify-between border transition-colors ${
                    isTempDanger
                      ? 'bg-rose-100/90 dark:bg-rose-900/60 border-rose-400 text-rose-950 dark:text-rose-100 font-black'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isTempDanger ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60'}`}>
                        <Thermometer className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">তাপমাত্রা</span>
                        <span className="text-[10px] text-slate-400">স্বাভাবিক: ২০°-৩০°সে</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-lg font-black font-mono tabular-nums block ${isTempDanger ? 'text-rose-600 dark:text-rose-300' : 'text-slate-900 dark:text-white'}`}>
                        {node.temperatureC} <span className="text-xs font-bold font-sans">°সে</span>
                      </span>
                      {isTempDanger && (
                        <span className="text-[9px] font-black text-rose-600 uppercase">বিপজ্জনক ⚠️</span>
                      )}
                    </div>
                  </div>

                  {/* Humidity Readout */}
                  <div className={`p-3 rounded-2xl flex items-center justify-between border transition-colors ${
                    isHumDanger
                      ? 'bg-rose-100/90 dark:bg-rose-900/60 border-rose-400 text-rose-950 dark:text-rose-100 font-black'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isHumDanger ? 'bg-rose-600 text-white' : 'bg-sky-50 text-sky-600 dark:bg-sky-950/60'}`}>
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">আর্দ্রতা</span>
                        <span className="text-[10px] text-slate-400">স্বাভাবিক: ৫০%-৭০%</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-lg font-black font-mono tabular-nums block ${isHumDanger ? 'text-rose-600 dark:text-rose-300' : 'text-slate-900 dark:text-white'}`}>
                        {node.humidityPercent} <span className="text-xs font-bold font-sans">%</span>
                      </span>
                      {isHumDanger && (
                        <span className="text-[9px] font-black text-rose-600 uppercase">বিপজ্জনক ⚠️</span>
                      )}
                    </div>
                  </div>

                  {/* Ammonia Gas Readout */}
                  <div className={`p-3 rounded-2xl flex items-center justify-between border transition-colors ${
                    isAmmoniaDanger
                      ? 'bg-rose-100/90 dark:bg-rose-900/60 border-rose-400 text-rose-950 dark:text-rose-100 font-black'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isAmmoniaDanger ? 'bg-rose-600 text-white' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60'}`}>
                        <Wind className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">অ্যামোনিয়া গ্যাস (NH₃)</span>
                        <span className="text-[10px] text-slate-400">বিপৎসীমা: &gt;২০ পিপিএম</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-lg font-black font-mono tabular-nums block ${isAmmoniaDanger ? 'text-rose-600 dark:text-rose-300' : 'text-slate-900 dark:text-white'}`}>
                        {node.ammoniaPpm} <span className="text-xs font-bold font-sans">পিপিএম</span>
                      </span>
                      {isAmmoniaDanger && (
                        <span className="text-[9px] font-black text-rose-600 uppercase">বিষাক্ত সীমা ⚠️</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Controls & Live Interventions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">বায়ুপ্রবাহ ও ফ্যান:</span>
                  <span className={`font-black ${node.exhaustFanStatus.includes('উচ্চগতি') ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                    {node.exhaustFanStatus}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleToggleExhaust(node.id)}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      node.exhaustFanStatus.includes('উচ্চগতি')
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Fan className={`w-3.5 h-3.5 ${node.exhaustFanStatus.includes('উচ্চগতি') ? 'animate-spin' : ''}`} />
                    <span>{node.exhaustFanStatus.includes('উচ্চগতি') ? 'ফ্যান স্বাভাবিক করুন' : 'উচ্চগতি ফ্যান চালু'}</span>
                  </button>

                  {/* Simulate Toggle Button for Testing */}
                  <button
                    onClick={() => handleSimulateDanger(node.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    title={isOverallDanger ? 'স্বাভাবিক অবস্থায় ফিরিয়ে নিন' : 'বিপৎসীমা লাল সতর্কতা টেস্ট করুন'}
                  >
                    {isOverallDanger ? 'রিসেট ↺' : '⚠️ টেস্ট'}
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 text-right pt-0.5">
                  {node.lastPing}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
