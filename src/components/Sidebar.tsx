import React, { useState, useEffect } from 'react';
import { NavTab } from '../types';
import { farmStore } from '../services/farmStore';
import { authService, AdminUser } from '../services/authService';
import { 
  Home, ShoppingBag, Database, LayoutDashboard, 
  Settings, Users, ShieldCheck, Calendar, 
  Sprout, Cpu, Utensils, Scale, TrendingUp, 
  Syringe, Bot, Box, ShoppingCart, User, 
  Landmark, Mic, LogIn, LogOut, Sun, Moon, 
  ChevronRight, Stethoscope, BarChart3, Key, Lock, Droplets, Activity, Wrench, Image, Globe
} from 'lucide-react';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  adminTab?: string;
  onAdminTabChange?: (tab: any) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onOpenLoginModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, onTabChange, adminTab, onAdminTabChange, 
  isDarkMode, toggleDarkMode, onOpenLoginModal 
}) => {
  const [profile, setProfile] = useState(farmStore.getInstitutionProfile());
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => authService.getCurrentUser());
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    const unsubStore = farmStore.subscribe(() => setProfile(farmStore.getInstitutionProfile()));
    const unsubAuthService = authService.subscribe(() => setAdminUser(authService.getCurrentUser()));
    const unsubFirebaseAuth = onAuthStateChanged(auth, u => setFirebaseUser(u));

    return () => {
      unsubStore();
      unsubAuthService();
      unsubFirebaseAuth();
    };
  }, []);

  const isAuthenticated = !!adminUser || !!firebaseUser;

  const publicLinks = [
    { id: 'home', label: 'হোম পেজ (পাবলিক)', icon: Home },
    { id: 'store', label: 'পশু শপ ও পণ্য', icon: ShoppingBag },
  ];

  // Specific Sector Groups
  const sectorLinks = [
    { id: 'main_dashboard', label: 'সার্বিক এক্সিকিউটিভ ড্যাশবোর্ড', icon: LayoutDashboard, badge: 'Overview' },
    { id: 'sector_cattle', label: 'ডেইরি ও গরু খাত', icon: Droplets, badge: 'Dairy' },
    { id: 'sector_goat', label: 'ছাগল ও খাসি খাত', icon: Scale, badge: 'Goat' },
    { id: 'sector_poultry', label: 'পোল্ট্রি ও হাঁস-মুরগি খাত', icon: Box, badge: 'Poultry' },
    { id: 'sector_fishery', label: 'মৎস্য হ্যাচারি ও পুকুর খাত', icon: Activity, badge: 'Fish' },
    { id: 'sector_feed', label: 'খাদ্য ও পুষ্টি খাত', icon: Utensils, badge: 'Feed' },
    { id: 'sector_health', label: 'স্বাস্থ্য ও চিকিৎসা খাত', icon: Stethoscope, badge: 'Health' },
    { id: 'sector_production_sales', label: 'উৎপাদন ও সেলস খাত', icon: TrendingUp, badge: 'Sales' },
    { id: 'sector_finance', label: 'অর্থ ও লেজার খাত', icon: Landmark, badge: 'Accounts' },
  ];

  const adminSettingsLinks = [
    { id: 'maintenance', label: 'খামার মেরামত ও ইনফ্রাস্ট্রাকচার', icon: Wrench, badge: 'Tasks' },
    { id: 'public_content', label: 'পাবলিক ওয়েবসাইট এডিটর', icon: Globe, badge: 'Web' },
    { id: 'user_management', label: 'ইউজারনেম ও পাসওয়ার্ড তৈরি', icon: Key, badge: 'Auth' },
    { id: 'employees', label: 'কর্মচারী ও বেতন ব্যবস্থাপনা', icon: Users },
    { id: 'calendar', label: 'খামার ক্যালেন্ডার ও যৌথ শিডিউল', icon: Calendar },
    { id: 'profile', label: 'খামার প্রোফাইল ও সেটিংস', icon: Settings },
  ];

  const handleAdminNavigate = (tabId: string) => {
    if (!isAuthenticated) {
      onOpenLoginModal();
      return;
    }
    onTabChange('admin');
    onAdminTabChange?.(tabId);
  };

  const handleLogout = () => {
    authService.logout();
    if (firebaseUser) signOut(auth);
    onTabChange('home');
  };

  return (
    <aside className="w-72 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 overflow-hidden shadow-xl">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
          {profile.logo || '🌾'}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight truncate">{profile.name}</h2>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">স্মার্ট খামার ও ডেইরি</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        
        {/* Public View Section */}
        <div className="space-y-1.5">
          <div className="px-3 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
            <span>পাবলিক ওয়েবসাইট</span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">গ্রাহক ভিউ</span>
          </div>
          {publicLinks.map(link => (
            <button
              key={link.id}
              onClick={() => onTabChange(link.id as NavTab)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all group cursor-pointer ${
                currentTab === link.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-emerald-600 font-bold'
              }`}
            >
              <link.icon className={`w-4.5 h-4.5 ${currentTab === link.id ? 'text-white' : 'group-hover:text-emerald-600'}`} />
              <span className="text-xs">{link.label}</span>
              {currentTab === link.id && <ChevronRight className="ml-auto w-4 h-4 opacity-75" />}
            </button>
          ))}
        </div>

        {/* Admin Navigation Section: Shown ONLY when inside Admin Panel */}
        {currentTab === 'admin' && (
          <>
            <div className="h-px bg-slate-200 dark:bg-slate-800 mx-1" />

            <div className="space-y-3">
              <div className="px-3 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">খামার অ্যাডমিন প্যানেল</span>
                {isAuthenticated && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold">
                    সক্রিয় ✓
                  </span>
                )}
              </div>

              {isAuthenticated && (
                /* Authenticated Admin Navigation - By Sectors (খাতভিত্তিক) */
                <div className="space-y-5">
                  
                  {/* Sector Portals */}
                  <div className="space-y-1">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      খাতভিত্তিক পোর্টালসমূহ (Sectors)
                    </p>
                    {sectorLinks.map(sec => (
                      <button
                        key={sec.id}
                        onClick={() => handleAdminNavigate(sec.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all group cursor-pointer ${
                          currentTab === 'admin' && adminTab === sec.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 font-black'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-emerald-600 font-bold'
                        }`}
                      >
                        <sec.icon className={`w-4 h-4 shrink-0 ${currentTab === 'admin' && adminTab === sec.id ? 'text-emerald-600' : 'group-hover:text-emerald-600'}`} />
                        <span className="text-xs truncate">{sec.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Management & Administration */}
                  <div className="space-y-1">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      প্রশাসন ও একাউন্ট
                    </p>
                    {adminSettingsLinks.map(link => (
                      <button
                        key={link.id}
                        onClick={() => handleAdminNavigate(link.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all group cursor-pointer ${
                          currentTab === 'admin' && adminTab === link.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/30 font-black'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-indigo-600 font-bold'
                        }`}
                      >
                        <link.icon className={`w-4 h-4 shrink-0 ${currentTab === 'admin' && adminTab === link.id ? 'text-indigo-600' : 'group-hover:text-indigo-600'}`} />
                        <span className="text-xs truncate">{link.label}</span>
                        {link.badge && (
                          <span className="ml-auto px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[9px] font-black">
                            {link.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-3">
        <div className="flex items-center justify-between px-1">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-amber-400 border border-slate-100 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
            title="ডার্ক / লাইট মোড"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer"
              title="লগ আউট করুন"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          )}
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {adminUser ? adminUser.displayName.charAt(0) : firebaseUser?.displayName?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                {adminUser?.displayName || firebaseUser?.displayName || 'খামার পরিচালক'}
              </p>
              <p className="text-[10px] text-emerald-600 font-mono font-bold truncate">
                @{adminUser?.username || 'admin'} ({adminUser?.role === 'owner' ? 'মালিক' : 'ম্যানেজার'})
              </p>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <p className="text-[10px] text-center text-slate-400 font-medium">© ২০২৬ {profile.name}</p>
        )}
      </div>

    </aside>
  );
};
