import React, { useState, useEffect } from 'react';
import { farmStore } from '../services/farmStore';
import { InstitutionProfile, GalleryItem, FarmServiceItem } from '../types';
import { authService } from '../services/authService';
import { 
  Image, Plus, Edit3, Trash2, CheckCircle2, Globe, Sparkles, 
  Upload, FileText, Layers, RefreshCw, Eye, Save, AlertCircle, Sparkle 
} from 'lucide-react';

export const PublicContentAndGalleryEditor: React.FC = () => {
  const [profile, setProfile] = useState<InstitutionProfile>(() => farmStore.getInstitutionProfile());
  const currentUser = authService.getCurrentUser();
  const isReadOnly = authService.isReadOnly(currentUser);

  const [activeSubTab, setActiveSubTab] = useState<'gallery' | 'services' | 'hero_about'>('gallery');

  // Form states for profile texts
  const [heroTitle, setHeroTitle] = useState(profile.heroTitle || 'প্রাকৃতিক ও আধুনিক স্মার্ট এগ্রো ফার্মিং');
  const [heroSubtitle, setHeroSubtitle] = useState(profile.heroSubtitle || 'উন্নত প্রযুক্তির সমন্বয়ে গুণগত মানসম্পন্ন ও স্বাস্থ্যকর পশুপালন নিশ্চিত করছি আমরা।');
  const [missionTitle, setMissionTitle] = useState(profile.missionTitle || 'আমাদের লক্ষ্য ও উদ্দেশ্য');
  const [missionText, setMissionText] = useState(profile.missionText || 'উন্নত জাতের পশুপালন এবং আধুনিক প্রযুক্তির ব্যবহারের মাধ্যমে কৃষি খাতে বিপ্লব ঘটানোই আমাদের প্রধান লক্ষ্য।');
  const [footerText, setFooterText] = useState(profile.footerText || 'আর এস সৌখিন খামার - ২০২৬ । সর্বস্বত্ব সংরক্ষিত।');

  // Dynamic Lists
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(profile.galleryItems || []);
  const [servicesList, setServicesList] = useState<FarmServiceItem[]>(profile.servicesList || []);

  // Modal states
  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);

  const [galleryForm, setGalleryForm] = useState<Omit<GalleryItem, 'id'>>({
    img: '',
    title: '',
    subtitle: '',
    category: 'Pasture'
  });

  // Services Modal States
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [editingServiceItem, setEditingServiceItem] = useState<FarmServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState<Omit<FarmServiceItem, 'id'>>({
    title: '',
    desc: '',
    icon: '🌾'
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    return farmStore.subscribe(() => {
      const p = farmStore.getInstitutionProfile();
      setProfile(p);
      if (p.galleryItems) setGalleryList(p.galleryItems);
      if (p.servicesList) setServicesList(p.servicesList);
    });
  }, []);

  const handleImageUpload = (file: File, callback: (url: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) callback(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save General Profile Texts
  const handleSaveTexts = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      alert('আপনার অ্যাকাউন্টটি শুধুমাত্র রিড-অনলি মোডে পরিচালিত হচ্ছে। পরিবর্তন সংরক্ষণ সম্ভব নয়।');
      return;
    }

    farmStore.updateInstitutionProfile({
      heroTitle,
      heroSubtitle,
      missionTitle,
      missionText,
      footerText
    });
    triggerToast('পাবলিক ওয়েবসাইটের টেক্সট ও টাইটেল সফলভাবে আপডেট করা হয়েছে!');
  };

  // Gallery CRUD
  const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      alert('রিড-অনলি এক্সেস।');
      return;
    }
    if (!galleryForm.img || !galleryForm.title) {
      alert('অনুগ্রহ করে ছবির ইউআরএল/ফাইল এবং শিরোনাম প্রদান করুন।');
      return;
    }

    let updatedGallery: GalleryItem[] = [];
    if (editingGalleryItem) {
      updatedGallery = galleryList.map(item => 
        item.id === editingGalleryItem.id ? { ...editingGalleryItem, ...galleryForm } : item
      );
    } else {
      const newItem: GalleryItem = {
        id: `g-${Date.now()}`,
        ...galleryForm
      };
      updatedGallery = [newItem, ...galleryList];
    }

    setGalleryList(updatedGallery);
    farmStore.updateInstitutionProfile({ galleryItems: updatedGallery });
    setShowAddGalleryModal(false);
    setEditingGalleryItem(null);
    setGalleryForm({ img: '', title: '', subtitle: '', category: 'Pasture' });
    triggerToast('গ্যালারির ফটো ও বিবরণ সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  const handleDeleteGalleryItem = (id: string) => {
    if (isReadOnly) return;
    if (!confirm('আপনি কি নিশ্চিত যে এই ছবিটি গ্যালারি থেকে মুছে ফেলতে চান?')) return;
    const updated = galleryList.filter(g => g.id !== id);
    setGalleryList(updated);
    farmStore.updateInstitutionProfile({ galleryItems: updated });
    triggerToast('ছবি গ্যালারি থেকে অপসারণ করা হয়েছে।');
  };

  // Service CRUD
  const handleSaveServiceItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!serviceForm.title || !serviceForm.desc) return;

    let updatedServices: FarmServiceItem[] = [];
    if (editingServiceItem) {
      updatedServices = servicesList.map(s => s.id === editingServiceItem.id ? { ...editingServiceItem, ...serviceForm } : s);
    } else {
      const newService: FarmServiceItem = {
        id: `s-${Date.now()}`,
        ...serviceForm
      };
      updatedServices = [...servicesList, newService];
    }

    setServicesList(updatedServices);
    farmStore.updateInstitutionProfile({ servicesList: updatedServices });
    setShowAddServiceModal(false);
    setEditingServiceItem(null);
    setServiceForm({ title: '', desc: '', icon: '🌾' });
    triggerToast('সেবা বিবরণ সফলভাবে আপডেট করা হয়েছে!');
  };

  const handleDeleteServiceItem = (id: string) => {
    if (isReadOnly) return;
    if (!confirm('আপনি কি এই সেবা কার্ডটি মুছে ফেলতে চান?')) return;
    const updated = servicesList.filter(s => s.id !== id);
    setServicesList(updated);
    farmStore.updateInstitutionProfile({ servicesList: updated });
    triggerToast('সেবা কার্ড সফলভাবে মোছা হয়েছে।');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-[100] bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-xs font-black">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-[2.5rem] text-white p-8 border border-emerald-700/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 inline-flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>অ্যাডমিন ওয়েবসাইট ম্যানেজার</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            পাবলিক গ্যালারি ও কন্টেন্ট কাস্টমাইজেশন
          </h2>
          <p className="text-xs text-slate-300">
            পাবলিক ওয়েবসাইটে প্রদর্শিত গ্যালারি ফটো, ক্যাপশন, হিরো টাইটেল এবং সেবা কার্ডগুলো সরাসরি আপডেট করুন।
          </p>
        </div>

        {/* Subtab Selector */}
        <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveSubTab('gallery')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'gallery' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            🖼️ খামার গ্যালারি ({galleryList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'services' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            🌾 খামারের সেবাসমূহ ({servicesList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('hero_about')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'hero_about' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            📝 ওয়েবসাইটের লেখা
          </button>
        </div>
      </div>

      {/* SUBTAB 1: GALLERY MANAGER */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-emerald-600" />
                <span>পাবলিক খামার গ্যালারি ফটো ম্যানেজমেন্ট</span>
              </h3>
              <p className="text-xs text-slate-500">হোম পেজের গ্যালারিতে সরাসরি নতুন ছবি যুক্ত করুন, ক্যাপশন বা লেখা এডিট করুন</p>
            </div>

            <button
              onClick={() => {
                if (isReadOnly) {
                  alert('রিড-অনলি পারমিশন।');
                  return;
                }
                setEditingGalleryItem(null);
                setGalleryForm({ img: '', title: '', subtitle: '', category: 'Pasture' });
                setShowAddGalleryModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ছবি যুক্ত করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryList.map(item => (
              <div
                key={item.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
              >
                <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    {item.category || 'General'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">{item.title}</h4>
                    {item.subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.subtitle}</p>}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setEditingGalleryItem(item);
                        setGalleryForm({
                          img: item.img,
                          title: item.title,
                          subtitle: item.subtitle || '',
                          category: item.category || 'Pasture'
                        });
                        setShowAddGalleryModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 text-slate-600 hover:text-emerald-600 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>এডিট</span>
                    </button>

                    <button
                      onClick={() => handleDeleteGalleryItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: SERVICES MANAGER */}
      {activeSubTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>খামারের সেবা কার্ড কাস্টমাইজেশন</span>
              </h3>
              <p className="text-xs text-slate-500">হোম পেজে প্রদর্শিত সেবার নাম, বিবরণ ও ইমোজি আইকন এডিট বা সংযোজন করুন</p>
            </div>

            <button
              onClick={() => {
                if (isReadOnly) return;
                setEditingServiceItem(null);
                setServiceForm({ title: '', desc: '', icon: '🌾' });
                setShowAddServiceModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সেবা কার্ড</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {servicesList.map(service => (
              <div
                key={service.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-3xl">
                    {service.icon || '🌾'}
                  </div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">{service.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{service.desc}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setEditingServiceItem(service);
                      setServiceForm({
                        title: service.title,
                        desc: service.desc,
                        icon: service.icon || '🌾'
                      });
                      setShowAddServiceModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>এডিট করুন</span>
                  </button>

                  <button
                    onClick={() => handleDeleteServiceItem(service.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: HERO & ABOUT TEXTS */}
      {activeSubTab === 'hero_about' && (
        <form onSubmit={handleSaveTexts} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>হোম পেজ হেডলাইন ও মূল বিবরণ এডিটর</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">পাবলিক হোম পেজের ব্যানার হেডলাইন, সাবটাইটেল এবং আমাদের গল্প সেকশন পরিবর্তন করুন</p>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>পরিবর্তন সংরক্ষণ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Hero Banner Section */}
            <div className="space-y-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                ১. হিরো ব্যানার (Hero Section)
              </span>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ব্যানার মূল শিরোনাম (Hero Title)
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={e => setHeroTitle(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ব্যানার সাবটাইটেল (Hero Subtitle)
                </label>
                <textarea
                  rows={3}
                  value={heroSubtitle}
                  onChange={e => setHeroSubtitle(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* About Us Section */}
            <div className="space-y-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                ২. আমাদের গল্প ও মিশন (About Us)
              </span>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  মিশন সেকশন শিরোনাম (Mission Title)
                </label>
                <input
                  type="text"
                  value={missionTitle}
                  onChange={e => setMissionTitle(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  মিশন বিস্তারিত বিবরণ (Mission Description)
                </label>
                <textarea
                  rows={4}
                  value={missionText}
                  onChange={e => setMissionText(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>সম্পূর্ণ পরিবর্তন সেভ করুন</span>
            </button>
          </div>
        </form>
      )}

      {/* ADD/EDIT GALLERY MODAL */}
      {showAddGalleryModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-emerald-600" />
                <span>{editingGalleryItem ? 'গ্যালারি ফটো ও ক্যাপশন এডিট' : 'নতুন ফটো যোগ করুন'}</span>
              </h3>
              <button
                onClick={() => setShowAddGalleryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGalleryItem} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ছবি আপলোড / ফাইল নির্বাচন করুন
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, url => setGalleryForm(prev => ({ ...prev, img: url })));
                  }}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  অথবা ছবির লিঙ্ক (Image URL)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={galleryForm.img}
                  onChange={e => setGalleryForm({ ...galleryForm, img: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  required
                />
              </div>

              {galleryForm.img && (
                <div className="h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={galleryForm.img} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ছবি শিরোনাম (Title / Caption) *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সবুজ তৃণভূমি ও চারণক্ষেত্র"
                  value={galleryForm.title}
                  onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  উপ-শিরোনাম (Subtitle / Details)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: উন্মুক্ত প্রাকৃতিক ও স্বাস্থ্যকর পরিবেশ"
                  value={galleryForm.subtitle || ''}
                  onChange={e => setGalleryForm({ ...galleryForm, subtitle: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ক্যাটাগরি / বিভাগ
                </label>
                <select
                  value={galleryForm.category}
                  onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                >
                  <option value="Pasture">চারণভূমি (Pasture)</option>
                  <option value="Barn">ডেইরি শেড (Barn)</option>
                  <option value="Goat">ছাগল ও খাসি (Goat Shed)</option>
                  <option value="Pond">পুকুর (Pond)</option>
                  <option value="Dairy">দুধ ও প্রসেসিং (Dairy)</option>
                  <option value="Environment">পরিবেশ (Environment)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddGalleryModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT SERVICE MODAL */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>{editingServiceItem ? 'সেবা কার্ড এডিট' : 'নতুন সেবা যোগ করুন'}</span>
              </h3>
              <button onClick={() => setShowAddServiceModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveServiceItem} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">আইকন (Emoji Icon)</label>
                <input
                  type="text"
                  placeholder="যেমন: 🐄, 🥛, 🦆"
                  value={serviceForm.icon}
                  onChange={e => setServiceForm({ ...serviceForm, icon: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">সেবার শিরোনাম *</label>
                <input
                  type="text"
                  placeholder="যেমন: 🥛 প্রতিদিনের তাজা তরল দুধ"
                  value={serviceForm.title}
                  onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">বিবরণ *</label>
                <textarea
                  rows={3}
                  placeholder="সেবার সংক্ষিপ্ত বিবরণ..."
                  value={serviceForm.desc}
                  onChange={e => setServiceForm({ ...serviceForm, desc: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowAddServiceModal(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">বাতিল</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-md">সংরক্ষণ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
