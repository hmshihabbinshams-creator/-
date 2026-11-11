import React, { useMemo } from 'react';
import { 
  HeartPulse, AlertCircle, ShieldAlert, Activity, 
  ArrowUpRight, Thermometer, Syringe, Stethoscope,
  Clock, Zap, CheckCircle2, Bot, Info, ChevronRight
} from 'lucide-react';
import { farmStore } from '../services/farmStore';
import { LivestockItem, HealthLog } from '../types';

export const AiHealthMonitor: React.FC = () => {
  const livestock = farmStore.getLivestock();
  const healthLogs = farmStore.getHealthLogs();

  // Mock sensor risk mapping (in a real app, this would come from a backend or real sensors)
  const sensorData = {
    'IOT-SHED-03': { status: 'danger', temp: 34.6, ammonia: 24 }, // From IoTSensorMonitor constants
  };

  const riskDashboard = useMemo(() => {
    return livestock.map(animal => {
      let riskScore = 0;
      const reasons: string[] = [];
      const steps: string[] = [];

      // 1. Health Condition Check
      if (animal.healthCondition?.includes('চিকিৎসা') || animal.healthCondition?.includes('নজরদারি')) {
        riskScore += 40;
        reasons.push('বর্তমান চিকিৎসাধীন অবস্থা');
        steps.push('নির্ধারিত ওষুধ ও পথ্য সময়মতো প্রদান নিশ্চিত করুন।');
      }

      // 2. Recent Health Log Analysis
      const lastLog = healthLogs.find(h => h.animalId === animal.id);
      if (lastLog) {
        if (lastLog.status === 'Action Required') {
          riskScore += 30;
          reasons.push('সর্বশেষ স্বাস্থ্য পরিদর্শনে সমস্যা শনাক্ত');
          steps.push('ডাক্তারের পরামর্শ অনুযায়ী ফলো-আপ চেকআপ করান।');
        }
        
        const temp = parseFloat(lastLog.temperature.replace(/[^0-9.]/g, ''));
        if (temp > 103) {
          riskScore += 20;
          reasons.push(`উচ্চ শারীরিক তাপমাত্রা (${lastLog.temperature})`);
          steps.push('ঠান্ডা পানি দিয়ে শরীর মুছে দিন এবং ছায়াযুক্ত স্থানে রাখুন।');
        }
        
        if (lastLog.appetite === 'কম' || lastLog.appetite === 'একেবারে নাই') {
          riskScore += 15;
          reasons.push('খাবারে অরুচি');
          steps.push('হজমকারক বা রুচিবর্ধক মিনারেল মিক্স প্রদান করুন।');
        }
      }

      // 3. Sensor Data Correlation (Environmental Risk)
      // Map animal to shed sensor nodes (Simplified logic)
      let shedId = '';
      if (animal.type.includes('মুরগি')) shedId = 'IOT-SHED-03';
      
      const envData = sensorData[shedId as keyof typeof sensorData];
      if (envData && envData.status === 'danger') {
        riskScore += 25;
        reasons.push('পরিবেশগত বিপৎসীমা অতিক্রম (উচ্চ তাপ/অ্যামোনিয়া)');
        steps.push('শেডের ফ্যান চালু করুন এবং পর্যাপ্ত বায়ু চলাচল নিশ্চিত করুন।');
      }

      // 4. Vaccine Risk
      if (animal.healthStatus?.includes('টিকা প্রয়োজন')) {
        riskScore += 10;
        reasons.push('ভ্যাকসিনেশনের সময় অতিক্রান্ত');
        steps.push('জরুরি ভিত্তিতে নিকটস্থ প্রাণিসম্পদ কর্মকর্তার সাথে যোগাযোগ করুন।');
      }

      const finalScore = Math.min(100, riskScore);
      let status: 'critical' | 'high' | 'medium' | 'low' = 'low';
      if (finalScore >= 80) status = 'critical';
      else if (finalScore >= 50) status = 'high';
      else if (finalScore >= 20) status = 'medium';

      return {
        ...animal,
        riskScore: finalScore,
        status,
        reasons,
        interventionSteps: steps.slice(0, 3)
      };
    }).filter(a => a.riskScore > 0).sort((a, b) => b.riskScore - a.riskScore);
  }, [livestock, healthLogs]);

  const criticalCount = riskDashboard.filter(a => a.status === 'critical').length;
  const highCount = riskDashboard.filter(a => a.status === 'high').length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-[10px] border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
              <HeartPulse className="w-3.5 h-3.5" />
              AI Health Monitor
            </span>
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black animate-pulse">
                {criticalCount}টি পশু অতি ঝুঁকিতে!
              </span>
            )}
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">পশু স্বাস্থ্য ঝুঁকি পর্যবেক্ষণ ড্যাশবোর্ড</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">রিয়েল-টাইম সেন্সর ডাটা ও হেলথ লগ বিশ্লেষণ করে তৈরি ঝুঁকি ভিত্তিক অগ্রাধিকার তালিকা</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
           <div className="text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">মোট পর্যবেক্ষণ</p>
             <p className="text-xl font-black text-slate-900 dark:text-white">{livestock.length} টি</p>
           </div>
           <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
           <div className="text-center">
             <p className="text-[10px] font-bold text-rose-500 uppercase mb-1">ঝুঁকিপূর্ণ</p>
             <p className="text-xl font-black text-rose-600">{criticalCount + highCount} টি</p>
           </div>
        </div>
      </div>

      {riskDashboard.length === 0 ? (
        <div className="p-12 text-center bg-emerald-50/30 dark:bg-emerald-950/10 rounded-[2rem] border-2 border-dashed border-emerald-200 dark:border-emerald-800 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white">সব কিছু ঠিক আছে!</h3>
          <p className="text-sm text-slate-500">বর্তমানে কোনো পশু ঝুঁকির তালিকায় নেই।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {riskDashboard.map((animal) => (
            <div 
              key={animal.id} 
              className={`p-6 rounded-[2.5rem] border-2 transition-all hover:shadow-xl space-y-5 flex flex-col ${
                animal.status === 'critical' ? 'bg-rose-50/50 border-rose-500 dark:bg-rose-950/20' : 
                animal.status === 'high' ? 'bg-amber-50/50 border-amber-400 dark:bg-amber-950/20' : 
                'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                      {animal.id}
                    </span>
                    <span className={`text-[10px] font-black uppercase ${
                      animal.status === 'critical' ? 'text-rose-600' : 
                      animal.status === 'high' ? 'text-amber-600' : 'text-indigo-600'
                    }`}>
                      {animal.type.split(' ')[0]}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{animal.name}</h4>
                </div>

                <div className="text-right">
                  <div className="flex flex-col items-end">
                    <span className={`text-2xl font-black font-mono tracking-tighter ${
                      animal.status === 'critical' ? 'text-rose-600 animate-pulse' : 
                      animal.status === 'high' ? 'text-amber-600' : 'text-indigo-600'
                    }`}>
                      {animal.riskScore}%
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Risk Score</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    animal.status === 'critical' ? 'bg-rose-600' : 
                    animal.status === 'high' ? 'bg-amber-500' : 'bg-indigo-500'
                  }`} 
                  style={{ width: `${animal.riskScore}%` }} 
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3" />
                    ঝুঁকির কারণসমূহ
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {animal.reasons.map((reason, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-white/50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    করণীয় পদক্ষেপ (Action Steps)
                  </p>
                  <div className="space-y-1.5">
                    {animal.interventionSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 group">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed group-hover:text-emerald-600 transition-colors">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button className="mt-auto w-full py-3 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all group">
                <Stethoscope className="w-3.5 h-3.5" />
                ডাক্তারের পরামর্শ নিন
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
        <Bot className="w-5 h-5 text-blue-600" />
        <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 leading-relaxed">
          এআই এনালিটিক্স ইঞ্জিন খামারের সেন্সর এবং ম্যানুয়াল লগ থেকে প্রাপ্ত ডাটা ক্রমাগত বিশ্লেষণ করে স্বাস্থ্য ঝুঁকি নিরূপণ করছে। অস্বাভাবিক তাপমাত্রা বা আচরণ শনাক্ত হলে তাত্ক্ষণিক পপ-আপ অ্যালার্ট প্রদান করা হবে।
        </p>
      </div>
    </div>
  );
};
