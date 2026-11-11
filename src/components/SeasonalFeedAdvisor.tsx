import React, { useState, useEffect } from 'react';
import { farmStore } from '../services/farmStore';
import { SeasonalFeedGuideline } from '../types';
import { CloudSun, Sun, CloudRain, Snowflake, Thermometer, Wind, AlertTriangle, CheckCircle2, Utensils, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';

interface SeasonalFeedAdvisorProps {
  onApplyDietToLog?: (animalType: string, feedNote: string) => void;
}

export const SeasonalFeedAdvisor: React.FC<SeasonalFeedAdvisorProps> = ({ onApplyDietToLog }) => {
  const [temperature, setTemperature] = useState<number>(31.5);
  const [weatherCode, setWeatherCode] = useState<number>(0);
  const [windSpeed, setWindSpeed] = useState<number>(12);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [selectedAnimalCategory, setSelectedAnimalCategory] = useState<string>('সব পশু');
  const [guidelines, setGuidelines] = useState<SeasonalFeedGuideline[]>([]);

  useEffect(() => {
    setGuidelines(farmStore.getSeasonalFeedGuidelines());
    fetchLocalWeather();
  }, []);

  const fetchLocalWeather = async () => {
    setLoadingWeather(true);
    try {
      // Rangpur / Bogura location of RS Khamar
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=25.7439&longitude=89.2752&current_weather=true');
      if (res.ok) {
        const data = await res.json();
        if (data && data.current_weather) {
          setTemperature(data.current_weather.temperature);
          setWeatherCode(data.current_weather.weathercode);
          setWindSpeed(data.current_weather.windspeed);
        }
      }
    } catch {
      // Fallback sensible seasonal temperature
      const month = new Date().getMonth(); // 0 to 11
      if (month >= 4 && month <= 7) setTemperature(34);
      else if (month >= 11 || month <= 1) setTemperature(16);
      else setTemperature(28);
    } finally {
      setLoadingWeather(false);
    }
  };

  // Determine active season based on temperature and month
  const currentMonth = new Date().getMonth(); // 0 = Jan, 4 = May, 10 = Nov
  let detectedSeasonKey = 'গ্রীষ্মকাল (Summer)';
  if (temperature > 32 || (currentMonth >= 3 && currentMonth <= 5)) {
    detectedSeasonKey = 'গ্রীষ্মকাল (Summer)';
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    detectedSeasonKey = 'বর্ষাকাল (Monsoon)';
  } else if (temperature < 20 || currentMonth >= 11 || currentMonth <= 1) {
    detectedSeasonKey = 'শীতকাল (Winter)';
  } else {
    detectedSeasonKey = 'শরৎ/বসন্ত (Spring)';
  }

  const activeGuideline = guidelines.find(g => g.season.includes(detectedSeasonKey.split(' ')[0])) || guidelines[0];

  const getWeatherDescription = (code: number, temp: number) => {
    if (code >= 51 && code <= 67) return { text: 'হালকা থেকে মাঝারি বৃষ্টিপাত', icon: CloudRain, color: 'text-blue-500' };
    if (code >= 71) return { text: 'কুয়াশাচ্ছন্ন ঠান্ডা আবহাওয়া', icon: Snowflake, color: 'text-cyan-500' };
    if (temp >= 33) return { text: 'তীব্র তাপদাহ ও প্রখর রোদ', icon: Sun, color: 'text-amber-500' };
    return { text: 'স্বাভাবিক রৌদ্রোজ্জ্বল আবহাওয়া', icon: CloudSun, color: 'text-emerald-500' };
  };

  const weatherInfo = getWeatherDescription(weatherCode, temperature);
  const WeatherIcon = weatherInfo.icon;

  const filteredAdvice = activeGuideline ? activeGuideline.dietAdvice.filter(d => {
    if (selectedAnimalCategory === 'সব পশু') return true;
    return d.animalType.includes(selectedAnimalCategory);
  }) : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-6">
      {/* Header with live weather banner */}
      <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>স্মার্ট এগ্রো-ওয়েদার নিউট্রিশন অ্যাসিস্ট্যান্ট</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            আবহাওয়াভিত্তিক মৌসুমী খাদ্য নির্দেশিকা (Seasonal Feed Advisor)
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            রংপুর/বগুড়া আঞ্চলিক রিয়েল-টাইম ওয়েদার ডাটা বিশ্লেষণ করে প্রাণী অনুযায়ী পুষ্টি ও খাদ্য তালিকা
          </p>
        </div>

        {/* Live Weather Widget */}
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center">
            <WeatherIcon className={`w-7 h-7 ${weatherInfo.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {temperature}°C
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                {detectedSeasonKey.split(' ')[0]}
              </span>
              <button 
                onClick={fetchLocalWeather} 
                disabled={loadingWeather}
                className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                title="আবহাওয়া রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingWeather ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5 flex items-center gap-2">
              <span>{weatherInfo.text}</span>
              <span className="opacity-30">|</span>
              <span className="flex items-center gap-1 font-mono"><Wind className="w-3 h-3 text-slate-400" />{windSpeed} km/h</span>
            </p>
          </div>
        </div>
      </div>

      {/* Season Alert Banner */}
      {activeGuideline && (
        <div className="px-8">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <strong className="font-black mr-1">বর্তমান সিজন পরামর্শ ({activeGuideline.temperatureRange}):</strong>
              <span>{activeGuideline.weatherNotice}</span>
            </div>
          </div>
        </div>
      )}

      {/* Animal Category Filters */}
      <div className="px-8 flex flex-wrap gap-2">
        {['সব পশু', 'গরু', 'ছাগল', 'হাঁস', 'মুরগি'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedAnimalCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedAnimalCategory === cat
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {cat === 'সব পশু' ? 'সকল প্রাণীর ডায়েট' : `${cat} স্পেশাল`}
          </button>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAdvice.map((item, idx) => (
          <div 
            key={idx}
            className="p-6 rounded-[2rem] bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {item.animalType.includes('গরু') ? '🐄' : item.animalType.includes('ছাগল') ? '🐐' : item.animalType.includes('হাঁস') ? '🦆' : '🐓'}
                  </span>
                  <h4 className="font-black text-slate-900 dark:text-white text-base">
                    {item.animalType}
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-black uppercase">
                  আজকের সুষম ডায়েট
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                    🌅 সকালের খাদ্য (Morning Ration)
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {item.morningDiet}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">
                    🌇 সন্ধ্যার খাদ্য (Evening Ration)
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {item.eveningDiet}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40">
                  <p className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">
                    💊 খনিজ ও পুষ্টি সম্পূরক (Supplements)
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {item.supplements}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                  <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">
                    ⚠️ জরুরি সতর্কতা (Veterinary Precaution)
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {item.precautions}
                  </p>
                </div>
              </div>
            </div>

            {onApplyDietToLog && (
              <button
                onClick={() => onApplyDietToLog(item.animalType, `${activeGuideline?.season}: সকাল: ${item.morningDiet} | বিকাল: ${item.eveningDiet}`)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:bg-emerald-600"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>দৈনিক খাদ্য এন্ট্রিতে যুক্ত করুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
