import React, { useState, useEffect } from 'react';
import { 
  CloudSun, Sun, CloudRain, Snowflake, Wind, Droplets, 
  Thermometer, Clock, Calendar, CheckCircle2, AlertTriangle, 
  Sparkles, RefreshCw, MapPin, Compass, ShieldCheck, ArrowRight
} from 'lucide-react';
import { farmStore } from '../services/farmStore';

interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherDesc: string;
  isDay: boolean;
  uvIndex: number;
}

export const LocalWeatherWidget: React.FC = () => {
  const [profile] = useState(farmStore.getInstitutionProfile());
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 28.5,
    apparentTemperature: 30.2,
    humidity: 62,
    windSpeed: 11.4,
    weatherCode: 1,
    weatherDesc: 'উজ্জ্বল ও মনোরম আবহাওয়া',
    isDay: true,
    uvIndex: 6
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('এখনই আপডেট');

  // Interpret WMO weather codes to Bengali
  const interpretWeatherCode = (code: number): { text: string; icon: string } => {
    if (code === 0) return { text: 'পরিষ্কার আকাশ ও উজ্জ্বল রোদ', icon: '☀️' };
    if (code >= 1 && code <= 3) return { text: 'আংশিক মেঘলা ও মনোরম আবহাওয়া', icon: '🌤️' };
    if (code >= 45 && code <= 48) return { text: 'কুয়াশাচ্ছন্ন আবহাওয়া', icon: '🌫️' };
    if (code >= 51 && code <= 67) return { text: 'হালকা থেকে মাঝারি বৃষ্টিপাত', icon: '🌦️' };
    if (code >= 71 && code <= 77) return { text: 'শীতল আবহাওয়া ও হালকা বৃষ্টি', icon: '❄️' };
    if (code >= 80 && code <= 82) return { text: 'ভারী বর্ষণ সম্ভাবনা', icon: '🌧️' };
    if (code >= 95) return { text: 'বজ্রঝড় ও দমকা হাওয়া', icon: '⛈️' };
    return { text: 'স্বাভাবিক আবহাওয়া', icon: '🌤️' };
  };

  const fetchWeather = async () => {
    setLoading(true);
    try {
      // Localized coordinates for RS Khamar (Bangladesh, Chittagong / Rangpur belt)
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=25.7439&longitude=89.2752&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&hourly=uv_index&timezone=Asia%2FDhaka'
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.current) {
          const cur = data.current;
          const codeInfo = interpretWeatherCode(cur.weather_code);
          setWeather({
            temperature: Math.round(cur.temperature_2m * 10) / 10,
            apparentTemperature: Math.round(cur.apparent_temperature * 10) / 10,
            humidity: Math.round(cur.relative_humidity_2m),
            windSpeed: Math.round(cur.wind_speed_10m * 10) / 10,
            weatherCode: cur.weather_code,
            weatherDesc: codeInfo.text,
            isDay: cur.is_day === 1,
            uvIndex: data.hourly?.uv_index?.[0] || 6
          });
          setLastUpdated(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch {
      // Sensible seasonal fallback
      const m = new Date().getMonth();
      const fallbackTemp = m >= 3 && m <= 5 ? 33.5 : m >= 10 || m <= 1 ? 19.5 : 27.5;
      setWeather(prev => ({
        ...prev,
        temperature: fallbackTemp,
        apparentTemperature: fallbackTemp + 2,
        weatherDesc: fallbackTemp > 30 ? 'উষ্ণ ও রৌদ্রোজ্জ্বল দিন' : 'মনোরম খামার আবহাওয়া'
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // 5 min refresh
    return () => clearInterval(interval);
  }, []);

  // Manager Daily Task Recommendations based on current live weather
  const taskRecommendations = () => {
    if (weather.temperature >= 32) {
      return [
        {
          title: 'শেডে স্প্রিংকলার ও ভেন্টিলেশন চালু',
          desc: 'তাপমাত্রা ৩২°সে ছাড়িয়েছে। গরু ও ছাগলের শেডে হাই-স্পিড ফ্যান ও পানির মিস্ট স্প্রে চালু রাখুন।',
          priority: 'জরুরি ⚠️',
          color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200'
        },
        {
          title: 'ভিটামিন সি ও স্যালাইন পানি প্রদান',
          desc: 'হিট স্ট্রোক প্রতিরোধে দুপুর ১২টা থেকে বিকাল ৩টা পর্যন্ত পোল্ট্রি ও গবাদিপশুকে ইলেক্ট্রোলাইট দিন।',
          priority: 'উচ্চ অগ্রাধিকার',
          color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200'
        },
        {
          title: 'ঘাস রোদে শুকিয়ে সাইলেজ প্রস্তুতি',
          desc: 'উজ্জ্বল রোদে নেপিয়ার ঘাস কেটে শুকিয়ে ভুট্টা সাইলেজ ও শুকনো খড় সংরক্ষণের আদর্শ সময়।',
          priority: 'উৎপাদন কাজ',
          color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200'
        }
      ];
    } else if (weather.weatherCode >= 51 || weather.humidity >= 78) {
      return [
        {
          title: 'শেডের লিটার ও মেঝে শুকনো রাখা',
          desc: 'স্যাঁতসেঁতে আবহাওয়ায় ব্যাক্টেরিয়া রোধে হাঁস-মুরগি ও ছাগলের ঘরে শুকনো কাঠের গুঁড়ো বা চুন দিন।',
          priority: 'বায়ো-সিকিউরিটি',
          color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60 border-teal-200'
        },
        {
          title: 'ভেজা ঘাস খাওয়ানো পরিহার',
          desc: 'বৃষ্টিভেজা কাঁচা ঘাস খাওয়ালে পেটের সমস্যা ও পাতলা পায়খানা হতে পারে; সাইলেজ ও শুকনো ভুসি দিন।',
          priority: 'স্বাস্থ্য সুরক্ষা',
          color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200'
        },
        {
          title: 'মৎস্য পুকুরের ওয়াটার লেভেল চেক',
          desc: 'অতিরিক্ত বৃষ্টিতে পুকুরের পাড় দিয়ে মাছ বের হওয়া ঠেকাতে ওভারফ্লো নেট মজবুত করুন।',
          priority: 'মৎস্য নজরদারি',
          color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200'
        }
      ];
    } else if (weather.temperature <= 20) {
      return [
        {
          title: 'বাছুর ও পোল্ট্রির ব্রুডিং উষ্ণতা বৃদ্ধি',
          desc: 'শীতল আবহাওয়ায় বাছুর ও ব্রুডার হাউজে অতিরিক্ত খড়ের বিছানা ও হিটিং ল্যাম্প ব্যবহার করুন।',
          priority: 'জরুরি যত্ন',
          color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200'
        },
        {
          title: 'সন্ধ্যায় শেডের পর্দা নামিয়ে দেওয়া',
          desc: 'রাতের ঠান্ডা বাতাস ও কুয়াশা যাতে সরাসরি পশুদের না লাগে সেজন্য চারপাশের পর্দা টেনে দিন।',
          priority: 'শীতকালীন সুরক্ষা',
          color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60 border-teal-200'
        },
        {
          title: 'খাবারে শক্তির মাত্রা বৃদ্ধি (High Energy Diet)',
          desc: 'শরীরের তাপমাত্রা স্বাভাবিক রাখতে দানাদার খাবারে চিটাগুড় ও তেলের পরিমাণ কিছুটা বাড়ান।',
          priority: 'পুষ্টি সমন্বয়',
          color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200'
        }
      ];
    } else {
      return [
        {
          title: 'পশুদের উন্মুক্ত চারণ ও গোসল সম্পন্ন',
          desc: 'আবহাওয়া মনোরম ও অনুকূল। সকাল ৯টা থেকে ১১টা পর্যন্ত খামারের খোলামেলা জায়গায় রোদ পোহাতে দিন।',
          priority: 'দৈনিক রুটিন',
          color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200'
        },
        {
          title: 'পরিমিত খাদ্য বণ্টন ও দুধ দোহন',
          desc: 'নির্ধারিত শিডিউল অনুযায়ী সকাল ও সন্ধ্যার সুষম খাদ্য দিন এবং পাত্রে সবসময় পরিষ্কার পানি রাখুন।',
          priority: 'উৎপাদন কাজ',
          color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60 border-teal-200'
        },
        {
          title: 'শেড স্যানিটেশন ও পটাশ স্প্রে',
          desc: 'খামারের ড্রেন ও ফটকের ফুটবাথে তাজা জীবাণুনাশক দ্রবণ প্রস্তুত করে স্প্রে সম্পন্ন করুন।',
          priority: 'বায়ো-সিকিউরিটি',
          color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200'
        }
      ];
    }
  };

  const tasks = taskRecommendations();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 dark:from-slate-900 dark:via-[#090d16] dark:to-slate-900 rounded-[3rem] p-6 sm:p-10 border border-emerald-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Top Bar: Location & Live Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  লাইভ আঞ্চলিক আবহাওয়া ও পূর্বাভাস
                </span>
                <span className="text-xs text-slate-400 font-bold hidden sm:inline">·</span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {profile.location || 'আর এস খামার প্রাঙ্গণ, বাংলাদেশ'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
                <CloudSun className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <span>খামার আবহাওয়া ও ম্যানেজারের দৈনিক কার্যপরিকল্পনা নির্দেশিকা</span>
              </h3>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] text-slate-400 font-mono font-bold hidden md:inline">
                আপডেট: {lastUpdated}
              </span>

              <button
                onClick={fetchWeather}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="আবহাওয়া রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
                <span>রিফ্রেশ</span>
              </button>
            </div>
          </div>

          {/* Current Weather Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Main Temperature Card */}
            <div className="col-span-2 md:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg space-y-3 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-emerald-100 font-black uppercase tracking-wider block">
                    বর্তমান তাপমাত্রা
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight">
                      {weather.temperature}
                    </span>
                    <span className="text-2xl font-black font-sans">°সে</span>
                  </div>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner">
                  {weather.temperature > 30 ? '☀️' : weather.weatherCode >= 51 ? '🌧️' : '🌤️'}
                </div>
              </div>

              <div className="space-y-1 border-t border-white/20 pt-3 text-xs">
                <div className="font-bold text-emerald-100 flex items-center gap-1">
                  <span>অনুভূত তাপমাত্রা (RealFeel):</span>
                  <span className="font-mono font-black text-white">{weather.apparentTemperature}°সে</span>
                </div>
                <p className="text-[11px] text-emerald-100/90 font-medium">
                  {weather.weatherDesc}
                </p>
              </div>
            </div>

            {/* Humidity */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">বাতাসের আর্দ্রতা</span>
                <Droplets className="w-4 h-4 text-sky-500" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                  {weather.humidity}%
                </p>
                <span className={`text-[10px] font-bold ${weather.humidity > 75 ? 'text-amber-500' : 'text-emerald-600'}`}>
                  {weather.humidity > 75 ? 'উচ্চ আর্দ্রতা' : 'আদর্শ সহনশীল'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">শেডের ভেন্টিলেশন সহায়ক</p>
            </div>

            {/* Wind Speed */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">বাতাসের গতি</span>
                <Wind className="w-4 h-4 text-teal-500" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                  {weather.windSpeed} <span className="text-xs font-bold font-sans opacity-70">কিমি/ঘণ্টা</span>
                </p>
                <span className="text-[10px] font-bold text-emerald-600">স্বাভাবিক মৃদু বাতাস</span>
              </div>
              <p className="text-[10px] text-slate-400">প্রাকৃতিক বায়ু চলাচল সক্রিয়</p>
            </div>

            {/* UV / Solar Radiation */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">ইউভি সূচক (UV)</span>
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                  {weather.uvIndex} <span className="text-xs font-bold font-sans opacity-70">/১০</span>
                </p>
                <span className={`text-[10px] font-bold ${weather.uvIndex >= 7 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {weather.uvIndex >= 7 ? 'তীব্র রোদ ও তাপ' : 'ঘাস শুকানোর উপযোগী'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">পশু চারণে সতর্কতা মানদণ্ড</p>
            </div>
          </div>

          {/* Actionable Manager's Task Planner Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    ম্যানেজারের আজকের আবহাওয়া-ভিত্তিক কর্মপরিকল্পনা
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    বর্তমান আবহাওয়া অনুযায়ী খামার কর্মীদের জন্য স্বয়ংক্রিয় কাজের অগ্রাধিকার তালিকা
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 hidden sm:inline">
                স্বয়ংক্রিয় অ্যালগরিদম সক্রিয়
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 flex flex-col justify-between hover:border-emerald-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${task.color}`}>
                        {task.priority}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">পদক্ষেপ #{idx + 1}</span>
                    </div>

                    <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {task.title}
                    </h5>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {task.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span>আজকের জন্য নির্ধারিত</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
