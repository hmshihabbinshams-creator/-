import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, ShieldCheck, HelpCircle, ArrowLeft, AlertTriangle, CheckCircle2, ClipboardList, Stethoscope, Camera, X, Image as ImageIcon } from 'lucide-react';
import { DiagnosisReport } from '../types';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  image?: string;
  isReport?: boolean;
  reportData?: DiagnosisReport;
}

interface AiDoctorChatProps {
  onBack?: () => void;
}

export const AiDoctorChat: React.FC<AiDoctorChatProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `আসসালামু আলাইকুম! আমি 'আর এস খামার'-এর প্রধান এআই ভেটেরিনারি ডাক্তার ও খামার উপদেষ্টা। আমি বাংলাদেশের খামারিদের জন্য বিশেষভাবে তৈরি। গরু, ছাগল, হাঁস-মুরগি বা সৌখিন পাখির রোগবালাই, খাদ্য, কিংবা খামার পরিচালনা নিয়ে যেকোনো প্রশ্ন করতে পারেন। আপনার পশুর লক্ষণগুলো লিখুন অথবা একটি ছবি তুলে পাঠান, আমি আমাদের নিজস্ব 'আঞ্চলিক প্রাণিসম্পদ ডাটাবেস' ব্যবহার করে আপনাকে দ্রুত পরামর্শ দেব।`,
    },
  ]);
  const [input, setInput] = useState('');
  const [animalType, setAnimalType] = useState('গরু (Cattle)');
  const [loading, setLoading] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !selectedImage) || loading) return;

    const userMsg = input.trim();
    const currentImage = selectedImage;
    
    setInput('');
    clearImage();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg || 'ছবি আপলোড করা হয়েছে', image: currentImage || undefined }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/veterinary-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMsg, 
          animalType,
          image: currentImage?.split(',')[1] // send only base64 part
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.advice }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: 'দুঃখিত, এই মুহূর্তে এআই সেবা সংযুক্ত করতে সমস্যা হচ্ছে।' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'ai', text: 'সার্ভার সংযোগে ত্রুটি দেখা দিয়েছে।' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnose = async () => {
    if ((!input.trim() && !selectedImage) || isDiagnosing) return;

    const userMsg = input.trim();
    const currentImage = selectedImage;
    
    setInput('');
    clearImage();
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: `লক্ষণ ও ছবি বিশ্লেষণ অনুরোধ: ${userMsg || 'শুধুমাত্র ছবি বিশ্লেষণ'}`,
      image: currentImage || undefined
    }]);
    setIsDiagnosing(true);

    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symptoms: userMsg, 
          animalType,
          image: currentImage?.split(',')[1]
        }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setMessages(prev => [
          ...prev, 
          { 
            sender: 'ai', 
            text: `আমি আপনার প্রদানকৃত তথ্য ও ছবি বিশ্লেষণ করেছি। এখানে একটি প্রাথমিক রিপোর্ট দেওয়া হলো:`,
            isReport: true,
            reportData: data.report
          }
        ]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: 'দুঃখিত, লক্ষণগুলো বিশ্লেষণ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'ai', text: 'সার্ভার সংযোগে ত্রুটি দেখা দিয়েছে।' }]);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const DiagnosticReportCard = ({ report }: { report: DiagnosisReport }) => (
    <div className="mt-4 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-emerald-600" />
          <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">স্বয়ংক্রিয় স্বাস্থ্য বিশ্লেষণ রিপোর্ট</h4>
        </div>
        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
          report.confidence === 'high' ? 'bg-emerald-100 text-emerald-700' : 
          report.confidence === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
        }`}>
          নিশ্চয়তা: {report.confidence === 'high' ? 'উচ্চ (High)' : report.confidence === 'medium' ? 'মাঝারি (Medium)' : 'স্বল্প (Low)'}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">সম্ভাব্য রোগ:</p>
        <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 leading-tight">{report.possibleDisease}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <ClipboardList className="w-3.5 h-3.5 text-emerald-500" />
            <span>বিশ্লেষিত লক্ষণসমূহ:</span>
          </div>
          <ul className="space-y-1">
            {report.symptomsAnalyzed.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="mt-1 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            <span>প্রাথমিক চিকিৎসা:</span>
          </div>
          <ul className="space-y-1">
            {report.firstAidSteps.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="mt-1 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
        <p className="text-[10px] font-black text-blue-600 uppercase mb-1">প্রতিরোধমূলক পরামর্শ:</p>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">"{report.preventionAdvice}"</p>
      </div>

      {report.requiresUrgentVet && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 rounded-xl flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-black text-red-700 dark:text-red-400 uppercase leading-none mb-1">সতর্কতা: জরুরি অবস্থা!</p>
            <p className="text-[11px] text-red-600 dark:text-red-300 font-bold leading-tight">এটি একটি সংক্রামক বা জীবনঘাতী রোগ হতে পারে। দ্রুত রেজিস্টার্ড ভেটেরিনারি সার্জনের পরামর্শ নিন।</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Back button */}
      {onBack && (
        <div className="flex items-center justify-start">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-1 transition-transform" />
            <span>পূর্বের পেজে ফিরে যান (Back)</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-emerald-200 dark:border-emerald-900 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/30">
            🩺
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Gemini AI 3.8 Flash Powered</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">এআই ভেটেরিনারি ডাক্তার ও পরামর্শক</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">খামারের পশু ও পাখির যেকোনো স্বাস্থ্যগত ও খাদ্য সংক্রান্ত পরামর্শের জন্য রিয়েল-টাইম এআই বিশেষজ্ঞ।</p>
          </div>
        </div>

        <div>
          <select
            value={animalType}
            onChange={e => setAnimalType(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none shadow-sm"
          >
            <option value="গরু (Cattle)">গরু (Cattle)</option>
            <option value="ছাগল (Goat)">ছাগল (Goat)</option>
            <option value="হাঁস-মুরগি (Poultry)">হাঁস-মুরগি (Poultry)</option>
            <option value="পাখি (Birds)">সৌখিন পাখি (Birds)</option>
          </select>
        </div>
      </div>

      {/* Chat Window */}
      <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[650px]">
        {/* Message Thread */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 ${m.sender === 'user' ? 'bg-blue-600' : 'bg-emerald-600 shadow-lg shadow-emerald-600/20'}`}>
                {m.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-[85%] space-y-2`}>
                {m.image && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm mb-2">
                    <img src={m.image} alt="Uploaded Symptom" className="w-full max-h-60 object-cover" />
                  </div>
                )}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-sm'}`}>
                  {m.text}
                </div>
                {m.isReport && m.reportData && (
                  <DiagnosticReportCard report={m.reportData} />
                )}
              </div>
            </div>
          ))}
          {(loading || isDiagnosing) && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl text-xs text-slate-400 border border-slate-200 dark:border-slate-800">
                {isDiagnosing ? 'লক্ষণগুলো গভীরভাবে বিশ্লেষণ করা হচ্ছে...' : 'পরামর্শ তৈরি করা হচ্ছে...'}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Image Preview */}
          {selectedImage && (
            <div className="relative inline-block group">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-lg">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Suggestion Chips */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-center mr-1">সাধারণ লক্ষণ:</span>
            {(animalType.includes('গরু') 
                ? ['পা ও মুখে ঘা', 'পেট ফাঁপা', 'অতিরিক্ত লালা', 'খুড়িয়ে হাঁটা', 'ওলান ফোলা'] 
                : animalType.includes('ছাগল') 
                  ? ['দুর্গন্ধযুক্ত পাতলা পায়খানা', 'নাক-মুখে সর্দি', 'শরীরে গুটি', 'তীব্র জ্বর'] 
                  : ['সবুজ পায়খানা', 'ঘাড় বাঁকা', 'ঝিমুনি', 'রক্তযুক্ত পায়খানা']
            ).map((symptom, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInput(prev => prev ? `${prev}, ${symptom}` : symptom)}
                className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer"
              >
                + {symptom}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm"
                title="ছবি তুলুন বা আপলোড করুন"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="লক্ষণগুলো এখানে লিখুন (যেমন: মুখ দিয়ে লালা পড়ছে, পা খুঁড়িয়ে হাঁটছে)..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(e as any)}
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-24"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading || isDiagnosing || !input.trim()}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-700 transition-colors disabled:opacity-50"
                  title="সাধারণ প্রশ্ন"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleDiagnose}
              disabled={loading || isDiagnosing || !input.trim()}
              className="px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50 group uppercase tracking-wider"
            >
              <Stethoscope className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>বিশ্লেষণ করুন</span>
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-1">
            <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> সুরক্ষিত পরামর্শ</div>
            <div className="flex items-center gap-1"><HelpCircle className="w-3 h-3 text-blue-500" /> এলাকা ভিত্তিক ডাটাবেস</div>
          </div>
        </div>
      </div>
    </div>
  );
};
