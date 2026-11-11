import React, { useState } from 'react';
import { EnvironmentalSensorData, INITIAL_ENVIRONMENTAL_SENSORS, exportGrowthAndEnvCsv } from '../services/exportService';
import { LivestockItem } from '../types';
import { Thermometer, Droplets, Wind, AlertTriangle, CheckCircle2, Printer, FileSpreadsheet, RefreshCw, Cpu, ShieldAlert, Sparkles } from 'lucide-react';

interface EnvironmentalMonitoringProps {
  livestock: LivestockItem[];
  farmProfileName?: string;
}

export const EnvironmentalMonitoring: React.FC<EnvironmentalMonitoringProps> = ({
  livestock,
  farmProfileName = 'আর এস সৌখিন খামার',
}) => {
  const [sensors, setSensors] = useState<EnvironmentalSensorData[]>(INITIAL_ENVIRONMENTAL_SENSORS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'warning'>('all');

  const handleRefreshSensors = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSensors(prev =>
        prev.map(s => {
          const deltaTemp = (Math.random() - 0.5) * 0.4;
          const deltaHum = Math.floor((Math.random() - 0.5) * 2);
          const newTemp = Number((s.temperatureC + deltaTemp).toFixed(1));
          const newHum = Math.min(90, Math.max(40, s.humidityPercent + deltaHum));
          return {
            ...s,
            temperatureC: newTemp,
            humidityPercent: newHum,
            lastReadingTime: 'একদম নতুন পাঠ (এখন)',
          };
        })
      );
      setIsRefreshing(false);
    }, 600);
  };

  const handleToggleFan = (sensorId: string) => {
    setSensors(prev =>
      prev.map(s => {
        if (s.id === sensorId) {
          const nextFan = s.fanStatus.includes('High')
            ? 'Optimal (আদর্শ)'
            : 'High Speed (উচ্চগতি)';
          return { ...s, fanStatus: nextFan as any };
        }
        return s;
      })
    );
  };

  const warningCount = sensors.filter(s => s.status !== 'Optimal').length;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xl space-y-6 relative">
      {/* Module Title & Export Buttons Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              স্মার্ট আইওটি সেন্সর নেটওয়ার্ক
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-bold text-slate-500">
              ৫টি খামার বিল্ডিং এর রিয়েল-টাইম ক্লাইমেট মনিটরিং
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-teal-600" />
            <span>পরিবেশগত মনিটরিং মডিউল (Environmental Monitoring)</span>
          </h3>
        </div>

        {/* Action Controls: Refresh & Download Export Reports */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefreshSensors}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>সেন্সর রিফ্রেশ</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span>পরিবেশ রিপোর্ট প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

      {/* Building Climate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {sensors.map(sensor => {
          const isWarning = sensor.status !== 'Optimal';

          return (
            <div
              key={sensor.id}
              className={`p-5 rounded-3xl border transition-all space-y-4 relative ${
                isWarning
                  ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                  : 'bg-white border-slate-200/90 hover:border-teal-300 shadow-sm'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {sensor.id}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {sensor.buildingName}
                  </h4>
                  <p className="text-[11px] font-bold text-teal-700 mt-0.5">
                    {sensor.speciesType}
                  </p>
                </div>

                <span
                  className={`w-3 h-3 rounded-full ${
                    isWarning ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                  }`}
                  title={sensor.status}
                />
              </div>

              {/* Climate Metrics */}
              <div className="space-y-2 pt-1">
                {/* Temperature */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-slate-600">তাপমাত্রা:</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {sensor.temperatureC}° সে
                  </span>
                </div>

                {/* Humidity */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-bold text-slate-600">আর্দ্রতা:</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {sensor.humidityPercent}%
                  </span>
                </div>

                {/* Ammonia PPM */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-600">অ্যামোনিয়া (PPM):</span>
                  </div>
                  <span className="text-xs font-black text-slate-800 font-mono">
                    {sensor.ammoniaPpm} ppm
                  </span>
                </div>
              </div>

              {/* Fan status and override button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">ফ্যান স্পিড</span>
                  <span className="text-xs font-black text-slate-800">{sensor.fanStatus}</span>
                </div>

                <button
                  onClick={() => handleToggleFan(sensor.id)}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-200 transition-colors cursor-pointer"
                >
                  কন্ট্রোল
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sensor Calibration & Safety Guidelines Footer */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            সকল খামার বিল্ডিং এর পরিবেশগত আর্দ্রতা ৫০-৭০% এবং তাপমাত্রা ২২°-২৯° সেলসিয়াসে আদর্শ নিয়ন্ত্রিত।
          </span>
        </div>
        <span className="text-[11px] font-bold text-slate-400">
          অটোমেটিক ভেন্টিলেশন ফ্যান অন
        </span>
      </div>
    </div>
  );
};

export const LivestockEnvironmentalModule = EnvironmentalMonitoring;

