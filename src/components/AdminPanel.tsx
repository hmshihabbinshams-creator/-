import React, { useState, useEffect } from 'react';
import { farmStore, getDefaultStructuredFeedPlan, getAutomatedFeedingSchedule } from '../services/farmStore';
import { authService, RegisteredUser, PermissionMode } from '../services/authService';
import { 
  LivestockItem, CustomerOrder, EmployeeRecord, InstitutionProfile, 
  FeedLog, HealthLog, FeedInventoryItem, OwnerTransaction, StructuredFeedItem, AutomatedFeedingSchedule
} from '../types';
import { 
  Database, Plus, Search, ShoppingBag, DollarSign, CheckCircle2, 
  ShieldCheck, Tag, Sparkles, TrendingUp, AlertCircle, Eye, EyeOff, 
  ArrowLeft, Lock, Globe, Filter, X, Edit3, Trash2, AlertTriangle,
  Building2, BadgeCheck, Landmark, RotateCcw, FileText, Check, Phone, Mail, MapPin, Award, BarChart3,
  Stethoscope, Syringe, Activity, FileSpreadsheet, Printer, Utensils, Box, Bot, AlertOctagon,
  User, Wallet, ArrowUpRight, History, Scale, Calendar, ChevronRight, Megaphone,
  Droplets, Thermometer, Info, Cpu, ShoppingCart, Clock, Sun, Moon, Palette
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ComposedChart, Area, AreaChart
} from 'recharts';
import { LivestockDashboard } from './LivestockDashboard';
import { DailyFeedLogger } from './DailyFeedLogger';
import { AiDoctorChat } from './AiDoctorChat';
import { Farm3DViewer } from './Farm3DViewer';
import { SeasonalFeedAdvisor } from './SeasonalFeedAdvisor';
import { LivestockGrowthChart } from './LivestockGrowthChart';
import { LivestockEnvironmentalModule } from './LivestockEnvironmentalModule';
import { SeasonalGrowthForecastModule } from './SeasonalGrowthForecastModule';
import { VaccinationManagement } from './VaccinationManagement';
import { FoodEfficiencyReportWidget } from './FoodEfficiencyReportWidget';
import { exportGrowthAndEnvCsv, exportLivestockCsv, INITIAL_ENVIRONMENTAL_SENSORS } from '../services/exportService';
import { AnimalProfitabilityDashboard } from './AnimalProfitabilityDashboard';
import { MarketingStudio } from './MarketingStudio';
import { FarmCalendar } from './FarmCalendar';
import { IndividualAnimalLedger } from './IndividualAnimalLedger';
import { downloadFarmPdfReport } from '../services/pdfReportGenerator';
import { FCRTrackerCard } from './FCRTrackerCard';
import { ExpenseSectorChart } from './ExpenseSectorChart';
import { AnimalHealthMap } from './AnimalHealthMap';
import { FeedSupplyChainCard } from './FeedSupplyChainCard';
import { BioSecurityAuditCard } from './BioSecurityAuditCard';
import { BioSecurityChecklistModule } from './BioSecurityChecklistModule';
import { VaccineHealthCalendarModule } from './VaccineHealthCalendarModule';
import { FeedInventoryTrackerModule } from './FeedInventoryTrackerModule';
import { AiFeedAdvisorModule } from './AiFeedAdvisorModule';
import { RealtimeFarmStatusWidget } from './RealtimeFarmStatusWidget';
import { FarmOperationalDashboard } from './FarmOperationalDashboard';
import { FutureProductionForecastingModule } from './FutureProductionForecastingModule';
import { AutomatedReportGeneratorModule } from './AutomatedReportGeneratorModule';
import { IoTSensorMonitor } from './IoTSensorMonitor';
import { MonthlyProfitLossSummaryCard } from './MonthlyProfitLossSummaryCard';
import { MarketPricePredictionModule } from './MarketPricePredictionModule';
import { VoicePhraseConfigPanel } from './VoicePhraseConfigPanel';
import { QuickStartModal } from './QuickStartModal';
import { VoiceTourModal } from './VoiceTourModal';
import { CropPlanner } from './CropPlanner';
import { AiSmartFarmAdvisor } from './AiSmartFarmAdvisor';
import { AiSmartSupplyChainManager } from './AiSmartSupplyChainManager';
import { AiFarmInsightEngine } from './AiFarmInsightEngine';
import { AiHealthMonitor } from './AiHealthMonitor';
import { ProductionMetricsDashboard } from './ProductionMetricsDashboard';
import { AnimalProfileModal } from './AnimalProfileModal';
import { InteractiveLiveDashboard } from './InteractiveLiveDashboard';
import { LocalWeatherWidget } from './LocalWeatherWidget';
import { Mic, Sprout, Lightbulb, Users } from 'lucide-react';
import { CattleSectorView } from './sectors/CattleSectorView';
import { GoatSectorView } from './sectors/GoatSectorView';
import { PoultrySectorView } from './sectors/PoultrySectorView';
import { FisherySectorView } from './sectors/FisherySectorView';
import { FeedSectorView } from './sectors/FeedSectorView';
import { HealthSectorView } from './sectors/HealthSectorView';
import { ProductionSalesSectorView } from './sectors/ProductionSalesSectorView';
import { FinanceSectorView } from './sectors/FinanceSectorView';
import { UserManagementSectorView } from './sectors/UserManagementSectorView';
import { MainOverviewDashboardView } from './sectors/MainOverviewDashboardView';
import { VaccinationAlertPopupModal } from './VaccinationAlertPopupModal';
import { FarmMaintenanceModule } from './FarmMaintenanceModule';
import { PublicContentAndGalleryEditor } from './PublicContentAndGalleryEditor';

export type AdminTab = 
  | 'main_dashboard'
  | 'maintenance'
  | 'public_content'
  | 'sector_cattle'
  | 'sector_goat'
  | 'sector_poultry'
  | 'sector_fishery'
  | 'sector_feed'
  | 'sector_health'
  | 'sector_production_sales'
  | 'sector_finance'
  | 'user_management'
  | 'production_metrics'
  | 'inventory'
  | 'calendar'
  | 'smart_advisor'
  | 'crop_planner'
  | 'growth_env'
  | 'iot_monitor'
  | 'fcr_tracker'
  | 'price_prediction'
  | 'biosecurity'
  | 'vaccine_calendar'
  | 'feed_advisor'
  | 'auto_report'
  | 'orders'
  | 'feed_entry'
  | 'health_vaccination'
  | 'inventory_feed'
  | 'supply_chain'
  | 'employees'
  | 'analytics'
  | 'financial_dashboard'
  | 'marketing'
  | 'ledger'
  | 'aidoctor'
  | 'tour3d'
  | 'profile'
  | 'voice_phrases';

interface AdminPanelProps {
  onBack?: () => void;
  initialTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
  onOpenEasyEntry?: (category?: any) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onBack, 
  initialTab = 'main_dashboard', 
  onTabChange, 
  onOpenEasyEntry,
  isDarkMode,
  toggleDarkMode
}) => {
  const activeTab = initialTab;
  const setActiveTab = (tab: AdminTab) => onTabChange?.(tab);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => authService.getUsers());
  const currentUser = authService.getCurrentUser();
  const isReadOnlyUser = authService.isReadOnly(currentUser);

  useEffect(() => {
    return authService.subscribe(() => {
      setRegisteredUsers(authService.getUsers());
    });
  }, []);
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'in_farm' | 'for_sale' | 'sold'>('all');
  const [livestock, setLivestock] = useState<LivestockItem[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [feedLogs, setFeedLogs] = useState<FeedLog[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [institutionProfile, setInstitutionProfile] = useState<InstitutionProfile>(farmStore.getInstitutionProfile());
  const [search, setSearch] = useState('');
  const [soldStats, setSoldStats] = useState<any[]>([]);
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [recoveryStats, setRecoveryStats] = useState<any[]>([]);
  const [forecasting, setForecasting] = useState<any>({ historicalMonthlyProfit: [], nextQuarterPredictedProfit: 0 });
  const [payoutReceipt, setPayoutReceipt] = useState<any>(null);

  // Predictive Growth States
  const [predictiveGrowthEnabled, setPredictiveGrowthEnabled] = useState(false);
  const [growthHorizonMonths, setGrowthHorizonMonths] = useState<number>(3);

  // PDF Preview State
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);
  const [pdfDownloadedNotice, setPdfDownloadedNotice] = useState(false);

  // Success Toast State
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Modals Visibility
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuickStartModal, setShowQuickStartModal] = useState(false);
  const [showVoiceTourModal, setShowVoiceTourModal] = useState(false);
  const [showAddHealthModal, setShowAddHealthModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showFeedPurchaseModal, setShowFeedPurchaseModal] = useState<FeedInventoryItem | null>(null);
  const [showDividendModal, setShowDividendModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showResetProfileModal, setShowResetProfileModal] = useState(false);
  const [showVaccinationAlertModal, setShowVaccinationAlertModal] = useState(true);
  
  // Edit/Delete Targets
  const [editAnimal, setEditAnimal] = useState<LivestockItem | null>(null);
  const [deleteTargetAnimal, setDeleteTargetAnimal] = useState<LivestockItem | null>(null);
  const [editEmployee, setEditEmployee] = useState<EmployeeRecord | null>(null);
  const [deleteTargetEmployee, setDeleteTargetEmployee] = useState<EmployeeRecord | null>(null);
  const [deleteTargetOrder, setDeleteTargetOrder] = useState<CustomerOrder | null>(null);
  const [saleModalAnimal, setSaleModalAnimal] = useState<LivestockItem | null>(null);
  const [showFeedingScheduleModalAnimal, setShowFeedingScheduleModalAnimal] = useState<LivestockItem | null>(null);
  const [selectedProfileAnimal, setSelectedProfileAnimal] = useState<LivestockItem | null>(null);

  // Form States
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<LivestockItem['type']>('ছাগল (Goat)');
  const [formBreed, setFormBreed] = useState('');
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(20000);
  const [formTargetRearingMonths, setFormTargetRearingMonths] = useState<number>(6);
  const [formTargetSellingPrice, setFormTargetSellingPrice] = useState<number>(35000);
  const [formInitialWeight, setFormInitialWeight] = useState<number>(30);
  const [formCurrentWeight, setFormCurrentWeight] = useState<number>(30);
  const [formTargetWeight, setFormTargetWeight] = useState<number>(45);
  const [formHealthStatus, setFormHealthStatus] = useState<string>('সুস্থ ও সবল');
  const [formDailyDietPlan, setFormDailyDietPlan] = useState<string>('নির্ধারিত পুষ্টিকর দানাদার খাবার ও সবুজ ঘাস');
  const [formDailyFeedBudget, setFormDailyFeedBudget] = useState<number>(85);
  const [formStructuredFeedItems, setFormStructuredFeedItems] = useState<StructuredFeedItem[]>(() => getDefaultStructuredFeedPlan('ছাগল (Goat)').items);
  const [formPhoto, setFormPhoto] = useState<string>('');
  const [formWaterPH, setFormWaterPH] = useState<number>(7.0);
  const [formWaterTemperature, setFormWaterTemperature] = useState<number>(28.0);
  
  const [healthForm, setHealthForm] = useState<Omit<HealthLog, 'id'>>({
    animalId: '', animalName: '', date: new Date().toISOString().split('T')[0],
    temperature: '101.5 °F', weightKg: 45, appetite: 'স্বাভাবিক',
    vaccinationName: 'পিপিআর (PPR) / তড়কা ভ্যাকসিন', vaccinationStatus: 'সম্পন্ন',
    nextVaccineDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    inspectionNotes: 'শারীরিক গঠন ও বৃদ্ধি সন্তোষজনক। স্বাভাবিক জাবর কাটছে।',
    status: 'Checked', inspectorName: 'ভেটেরিনারি সার্জন',
  });

  const [employeeForm, setEmployeeForm] = useState<EmployeeRecord>({
    id: `EMP-${Math.floor(100 + Math.random() * 900)}`, name: '', role: '', salary: 0, phone: '', status: 'Active',
  });

  const [transactionForm, setTransactionForm] = useState<Omit<OwnerTransaction, 'id'>>({
    date: new Date().toISOString().split('T')[0], type: 'Investment', amount: 0, description: '',
  });

  const [purchaseForm, setPurchaseForm] = useState({ amount: 0, cost: 0 });
  const [dividendDistributions, setDividendDistributions] = useState<{ ownerName: string, amount: number }[]>([]);
  const [profileForm, setProfileForm] = useState<InstitutionProfile>(farmStore.getInstitutionProfile());
  const [salePrice, setSalePrice] = useState<number>(0);
  const [saleDescription, setSaleDescription] = useState('');

  // Search/Filters
  const [healthSearch, setHealthSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState<'all' | 'action_required' | 'checked'>('all');
  const [employeeSearch, setEmployeeSearch] = useState('');

  useEffect(() => {
    const update = () => {
      setLivestock(farmStore.getLivestock());
      setOrders(farmStore.getOrders());
      setEmployees(farmStore.getEmployees());
      setFeedLogs(farmStore.getFeedLogs());
      setHealthLogs(farmStore.getHealthLogs());
      const p = farmStore.getInstitutionProfile();
      setInstitutionProfile(p);
      setProfileForm(p);
      setSoldStats(farmStore.getSoldLivestockStats());
      setLedgerData(farmStore.getDetailedFinancialLedger());
      setRecoveryStats(farmStore.getInvestmentRecoveryStats());
      setForecasting(farmStore.getFinancialForecasting());
    };
    update();
    const unsubscribe = farmStore.subscribe(update);
    return () => unsubscribe();
  }, []);

  const fishAlerts = React.useMemo(() => {
    return livestock.filter(item => {
      if (!item.type.includes('মাছ')) return false;
      const ph = item.waterPH ?? 7.0;
      const temp = item.waterTemperature ?? 28.0;
      // Tilapia/General: pH 6.5-8.5, Temp 24-33°C.
      const phBad = ph < 6.5 || ph > 8.5;
      const tempBad = temp < 24 || temp > 33;
      return phBad || tempBad;
    }).map(item => {
      const ph = item.waterPH ?? 7.0;
      const temp = item.waterTemperature ?? 28.0;
      let reasons = [];
      if (ph < 6.5) reasons.push('pH খুব কম (অম্লীয়)');
      if (ph > 8.5) reasons.push('pH খুব বেশি (ক্ষারীয়)');
      if (temp < 24) reasons.push('তাপমাত্রা খুব কম');
      if (temp > 33) reasons.push('তাপমাত্রা খুব বেশি');
      return { ...item, alertReason: reasons.join(', ') };
    });
  }, [livestock]);

  useEffect(() => {
    if (showDividendModal && institutionProfile.proprietor) {
      const owners = institutionProfile.proprietor.split(/[,/]/).map(s => s.trim());
      setDividendDistributions(owners.map(name => ({ ownerName: name, amount: 0 })));
    }
  }, [showDividendModal, institutionProfile.proprietor]);

  // Derived Financials
  const financial = farmStore.getFinancialReport();
  const feedInventory = farmStore.getFeedInventory();
  const lowStockItems = feedInventory.filter(item => item.currentStockKg <= item.minThresholdKg);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const growthDeviatedAnimals = livestock.filter(item => {
    if (item.status === 'বিক্রিত (Sold)') return false;
    if (item.growthHistory && item.growthHistory.length > 0) {
      const latest = item.growthHistory[item.growthHistory.length - 1];
      return latest.weightKg < latest.targetExpectedKg * 0.9;
    }
    return false;
  });

  // Handlers
  const handleCreateLivestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmStore.canAffordPurchase(Number(formPurchasePrice))) {
      alert(`দুঃখিত! দোকানের ক্যাশ (Business Cash) পর্যাপ্ত নয়। বর্তমান ক্যাশ: ${financial.businessCash.toLocaleString('bn-BD')} ৳। অনুগ্রহ করে ইনভেস্টমেন্ট যোগ করুন।`);
      return;
    }
    const typePrefix = formType.includes('গরু') ? 'C' : formType.includes('ছাগল') ? 'G' : formType.includes('হাঁস') ? 'D' : formType.includes('মুরগি') ? 'P' : formType.includes('পাখি') ? 'B' : formType.includes('মাছ') ? 'F' : 'B';
    const planItems = formStructuredFeedItems.length > 0 ? formStructuredFeedItems : getDefaultStructuredFeedPlan(formType).items;
    const calculatedBudget = planItems.reduce((s, i) => s + (Number(i.estimatedCostTaka) || 0), 0) || formDailyFeedBudget;

    const newAnimal: LivestockItem = {
      id: `${typePrefix}-${Math.floor(100 + Math.random() * 900)}`,
      name: formName || 'নতুন খামার প্রাণী',
      type: formType,
      breed: formBreed || 'উন্নত জাত',
      batchOrFlock: formType.includes('হাঁস') || formType.includes('মুরগি') || formType.includes('পাখি') ? 'পাল/ফ্লক' : 'একক পালন',
      quantity: 1,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: Number(formPurchasePrice),
      initialWeight: Number(formInitialWeight) || 30,
      currentWeight: Number(formCurrentWeight) || 30,
      targetWeight: Number(formTargetWeight) || Math.round((Number(formCurrentWeight) || 30) * 1.3),
      age: '১ বছর',
      healthStatus: formHealthStatus || 'সুস্থ ও সবল',
      dailyDietPlan: planItems.map(i => `${i.name} (${i.targetAmountKg} ${i.unit})`).join(', ') || formDailyDietPlan,
      dailyFeedBudget: calculatedBudget,
      structuredFeedPlan: planItems,
      isForSale: false,
      sellingPrice: Number(formTargetSellingPrice) || Math.round(Number(formPurchasePrice) * 1.3),
      status: 'খামারে পালনরত',
      photoPlaceholder: formPhoto || undefined,
      targetRearingMonths: Number(formTargetRearingMonths) || 6,
      targetSellingPrice: Number(formTargetSellingPrice) || Math.round(Number(formPurchasePrice) * 1.3),
      waterPH: formType.includes('মাছ') ? formWaterPH : undefined,
      waterTemperature: formType.includes('মাছ') ? formWaterTemperature : undefined,
      pondMaintenanceLogs: formType.includes('মাছ') ? [] : undefined,
    };
    farmStore.addLivestock(newAnimal);
    setShowAddModal(false);
    setFormName('');
    setFormBreed('');
    setFormPurchasePrice(20000);
    setFormTargetRearingMonths(6);
    setFormTargetSellingPrice(35000);
    setFormInitialWeight(30);
    setFormCurrentWeight(30);
    setFormTargetWeight(45);
    setFormHealthStatus('সুস্থ ও সবল');
    setFormDailyDietPlan('নির্ধারিত পুষ্টিকর দানাদার খাবার ও সবুজ ঘাস');
    setFormPhoto('');
    setFormWaterPH(7.0);
    setFormWaterTemperature(28.0);
    triggerToast('সফলভাবে নতুন পশু ক্রয় ও ইনভেন্টরি আপডেট করা হয়েছে!');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAnimal) return;
    const planItems = editAnimal.structuredFeedPlan || [];
    const calculatedBudget = planItems.reduce((s, i) => s + (Number(i.estimatedCostTaka) || 0), 0) || editAnimal.dailyFeedBudget || 100;
    
    const updated: LivestockItem = {
      ...editAnimal,
      dailyFeedBudget: calculatedBudget,
      dailyDietPlan: planItems.length > 0 ? planItems.map(i => `${i.name} (${i.targetAmountKg} ${i.unit})`).join(', ') : editAnimal.dailyDietPlan,
    };
    farmStore.updateLivestock(updated);
    setEditAnimal(null);
    triggerToast('পশুর প্রোফাইল, খাদ্য তালিকা ও বাজেট সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetAnimal) return;
    farmStore.deleteLivestock(deleteTargetAnimal.id);
    setDeleteTargetAnimal(null);
  };

  const handleCreateHealthLog = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = livestock.find(a => a.id === healthForm.animalId);
    farmStore.addHealthLog({ ...healthForm, animalName: animal ? animal.name : (healthForm.animalName || 'খামার গবাদিপশু') });
    setShowAddHealthModal(false);
  };

  const handleToggleHealthStatus = (logId: string) => farmStore.toggleHealthStatus(logId);

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    farmStore.addEmployee(employeeForm);
    setShowAddEmployeeModal(false);
    setEmployeeForm({ id: `EMP-${Math.floor(100 + Math.random() * 900)}`, name: '', role: '', salary: 0, phone: '', status: 'Active' });
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmployee) return;
    farmStore.updateEmployee(editEmployee);
    setEditEmployee(null);
  };

  const handleDeleteEmployee = () => {
    if (!deleteTargetEmployee) return;
    farmStore.deleteEmployee(deleteTargetEmployee.id);
    setDeleteTargetEmployee(null);
  };

  const handleOrderAction = (orderId: string, action: 'Confirmed' | 'Delivered' | 'Cancelled') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (action === 'Delivered') {
      farmStore.markAsSold(order.animalId, orderId);
    } else {
      farmStore.updateOrderStatus(orderId, action);
    }
  };

  const handleConfirmSaleListing = (makeForSale: boolean) => {
    if (!saleModalAnimal) return;
    farmStore.toggleForSale(saleModalAnimal.id, makeForSale, salePrice, saleDescription);
    setSaleModalAnimal(null);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    farmStore.addOwnerTransaction(transactionForm);
    setShowAddTransactionModal(false);
    setTransactionForm({ date: new Date().toISOString().split('T')[0], type: 'Investment', amount: 0, description: '' });
  };

  const handlePurchaseFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFeedPurchaseModal) return;
    farmStore.purchaseFeed(showFeedPurchaseModal.id, purchaseForm.amount, purchaseForm.cost);
    setShowFeedPurchaseModal(null);
    setPurchaseForm({ amount: 0, cost: 0 });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    farmStore.updateInstitutionProfile(profileForm);
    setInstitutionProfile({ ...profileForm });
    setShowEditProfileModal(false);
  };

  const handleOpenEditProfile = () => {
    setProfileForm({ ...institutionProfile });
    setShowEditProfileModal(true);
  };

  const handleResetProfile = () => {
    farmStore.resetInstitutionProfile();
    const def = farmStore.getInstitutionProfile();
    setInstitutionProfile(def);
    setProfileForm(def);
    setShowResetProfileModal(false);
  };

  const handleImageFileUpload = (file: File, callback: (dataUrl: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) callback(e.target.result as string); };
    reader.readAsDataURL(file);
  };

  // Analytics Data
  const monthlyAnalyticsData = [
    { month: 'জানুয়ারি', feedCost: 14200, salesRevenue: 45000, netProfit: 30800 },
    { month: 'ফেব্রুয়ারি', feedCost: 16800, salesRevenue: 62000, netProfit: 45200 },
    { month: 'মার্চ', feedCost: 19500, salesRevenue: 78000, netProfit: 58500 },
    { month: 'এপ্রিল', feedCost: 21000, salesRevenue: 95000, netProfit: 74000 },
    { month: 'মে (চলমান)', feedCost: 18400, salesRevenue: 103000, netProfit: 84600 },
  ];

  const filteredLivestock = livestock.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (inventoryFilter === 'for_sale') return item.isForSale && item.status !== 'বিক্রিত (Sold)';
    if (inventoryFilter === 'in_farm') return !item.isForSale && item.status !== 'বিক্রিত (Sold)';
    if (inventoryFilter === 'sold') return item.status === 'বিক্রিত (Sold)';
    return true;
  });

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
       {successToast && (
         <div className="fixed top-20 right-6 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-6 h-6 text-white" />
            <span className="text-sm font-black">{successToast}</span>
         </div>
       )}

      {/* Page Header (Clean, Context-Aware) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            <span>খামার অ্যাডমিন</span>
            <span className="opacity-40">/</span>
            <span className="text-emerald-600 font-bold">{activeTab.replace(/_/g, ' ')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {activeTab === 'maintenance' ? '🛠️ খামার মেরামত ও ইনফ্রাস্ট্রাকচার রক্ষণাবেক্ষণ' :
             activeTab === 'public_content' ? '🌐 পাবলিক ওয়েবসাইট কন্টেন্ট এডিটর' :
             activeTab === 'sector_cattle' ? '🐄 ডেইরি ও গবাদিপশু খাত' :
             activeTab === 'sector_goat' ? '🐐 ছাগল ও খাসি খাত' :
             activeTab === 'sector_poultry' ? '🦆 পোল্ট্রি ও হাঁস-মুরগি খাত' :
             activeTab === 'sector_fishery' ? '🐟 মৎস্য হ্যাচারি ও পুকুর খাত' :
             activeTab === 'sector_feed' ? '🌾 খাদ্য ও পুষ্টি খাত' :
             activeTab === 'sector_health' ? '🩺 স্বাস্থ্য, টিকা ও চিকিৎসা খাত' :
             activeTab === 'sector_production_sales' ? '📊 উৎপাদন ও কাস্টমার সেলস খাত' :
             activeTab === 'sector_finance' ? '💰 অর্থ, মুনাফা ও লেজার খাত' :
             activeTab === 'user_management' ? '🔐 ইউজারনেম ও পাসওয়ার্ড ব্যবস্থাপনা' :
             activeTab === 'main_dashboard' ? 'সার্বিক খামার এক্সিকিউটিভ ড্যাশবোর্ড' :
             activeTab === 'production_metrics' ? '৩০ দিনের উৎপাদন মেট্রিক্স ড্যাশবোর্ড' :
             activeTab === 'inventory' ? 'গবাদিপশু ইনভেন্টরি ও প্রোফাইল' :
             activeTab === 'orders' ? 'কাস্টমার অর্ডারসমূহ' :
             activeTab === 'employees' ? 'কর্মচারী ব্যবস্থাপনা' :
             activeTab === 'profile' ? 'খামার প্রোফাইল ও সেটিংস' :
             activeTab.replace(/_/g, ' ')}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'inventory' && (
            <button
              onClick={() => {
                if (isReadOnlyUser) {
                  alert('আপনার অ্যাকাউন্টের জন্য Read-Only (শুধুমাত্র দেখা) পারমিশন নির্ধারিত রয়েছে। তথ্য ইনপুট করতে প্রধান প্রশাসকের সাথে যোগাযোগ করুন।');
                  return;
                }
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন পশু এন্ট্রি</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
            title="রিপোর্ট প্রিন্ট"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">প্রিন্ট</span>
          </button>

          <button
            onClick={() => downloadFarmPdfReport()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs cursor-pointer transition-colors"
            title="PDF ডাউনলোড"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Tab Contents - Clean Sector Views */}
      <div className="min-h-[500px]">
        {/* SECTORS WITH THEIR OWN DEDICATED DASHBOARDS AT TOP */}
        {activeTab === 'sector_cattle' && (
          <CattleSectorView onOpenAddModal={() => setShowAddModal(true)} onOpenEasyEntry={onOpenEasyEntry} />
        )}

        {activeTab === 'sector_goat' && (
          <GoatSectorView onOpenAddModal={() => setShowAddModal(true)} onOpenEasyEntry={onOpenEasyEntry} />
        )}

        {activeTab === 'sector_poultry' && (
          <PoultrySectorView onOpenAddModal={() => setShowAddModal(true)} onOpenEasyEntry={onOpenEasyEntry} />
        )}

        {activeTab === 'sector_fishery' && (
          <FisherySectorView />
        )}

        {activeTab === 'sector_feed' && (
          <FeedSectorView onOpenEasyEntry={onOpenEasyEntry} />
        )}

        {activeTab === 'sector_health' && (
          <HealthSectorView />
        )}

        {activeTab === 'sector_production_sales' && (
          <ProductionSalesSectorView />
        )}

        {activeTab === 'sector_finance' && (
          <FinanceSectorView />
        )}

        {activeTab === 'user_management' && (
          <UserManagementSectorView />
        )}

        {activeTab === 'maintenance' && (
          <FarmMaintenanceModule />
        )}

        {activeTab === 'public_content' && (
          <PublicContentAndGalleryEditor />
        )}
          {activeTab === 'calendar' && (
            <FarmCalendar
              livestock={livestock}
              healthLogs={healthLogs}
              onSelectAnimal={(id) => {
                setActiveTab('inventory');
                setSearch(id);
              }}
            />
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">ইনভেন্টরি ও পাবলিক কন্ট্রোল</h3>
                    <p className="text-xs text-slate-500 font-medium">বিক্রির জন্য প্রস্তুত পশুগুলো এখান থেকে শপে যোগ করুন</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
                  {['all', 'in_farm', 'for_sale', 'sold'].map(f => (
                    <button
                      key={f}
                      onClick={() => setInventoryFilter(f as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                        inventoryFilter === f 
                          ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'সব পশু' : f === 'in_farm' ? 'খামারে আছে' : f === 'for_sale' ? 'পাবলিক শপে' : 'বিক্রিত পশু'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Search className="w-5 h-5 text-slate-400" />
                <input type="text" placeholder="পশুর নাম বা আইডি দিয়ে খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-transparent border-none text-sm font-medium focus:outline-none text-slate-900 dark:text-white" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredLivestock.map(item => {
                  const stats = farmStore.getAnimalCostStats(item.id);
                  const isSold = item.status === 'বিক্রিত (Sold)';
                  const sched = getAutomatedFeedingSchedule(item);
                  const fedInfo = farmStore.isAnimalFedToday(item.id);

                  return (
                    <div key={item.id} className={`group bg-white dark:bg-slate-900 rounded-[2rem] border overflow-hidden transition-all hover:shadow-xl hover:translate-y-[-4px] flex flex-col ${isSold ? 'border-purple-200 dark:border-purple-900/40 opacity-90' : item.isForSale ? 'border-emerald-200 dark:border-emerald-900/40 ring-4 ring-emerald-500/5' : 'border-slate-200 dark:border-slate-800'}`}>
                      <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                        {item.photoPlaceholder ? <img src={item.photoPlaceholder} className="w-full h-full object-cover" /> : <span className="text-6xl">{item.type.includes('গরু') ? '🐄' : item.type.includes('ছাগল') ? '🐐' : '🕊️'}</span>}
                        <div className="absolute top-4 left-4"><span className="px-3 py-1 rounded-lg bg-black/60 text-white font-mono text-[9px] font-black tracking-widest">ID: {item.id}</span></div>
                        <div className="absolute top-4 right-4"><span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${isSold ? 'bg-purple-600 text-white' : item.isForSale ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>{item.status}</span></div>
                      </div>
                      <div className="p-6 space-y-4 flex-1 flex flex-col">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{item.name}</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{item.type} · {item.breed} · বয়স: {item.age}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                             <p className="text-[8px] text-slate-400 font-bold uppercase">{isSold ? 'মোট খরচ' : 'ক্রয়মূল্য'}</p>
                             <p className="text-xs font-black text-slate-900 dark:text-white">{(isSold ? stats.totalExpense : item.purchasePrice).toLocaleString('bn-BD')} ৳</p>
                          </div>
                          <div className={`p-2 rounded-xl border ${isSold ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/40' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40'}`}>
                             <p className={`text-[8px] font-bold uppercase ${isSold ? 'text-indigo-600' : 'text-emerald-600'}`}>{isSold ? 'অর্জিত লাভ' : 'খাবার খরচ'}</p>
                             <p className={`text-xs font-black ${isSold ? 'text-indigo-700 dark:text-indigo-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                               {(isSold ? (stats.currentSellingPrice - stats.totalExpense) : stats.totalFeedCost).toLocaleString('bn-BD')} ৳
                             </p>
                          </div>
                        </div>

                        {/* Automated Feeding Schedule & Confirm Feeding Card */}
                        {!isSold && (
                          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                                <Utensils className="w-3.5 h-3.5 text-amber-600" />
                                <span>অটো খাদ্য শিডিউল ({sched.ageGroupLabel})</span>
                              </span>
                              <span className="text-[9px] font-mono font-bold text-amber-800 dark:text-amber-400">{sched.totalDailyKg} কেজি/দিন</span>
                            </div>

                            {/* Confirm Feeding Action Button */}
                            {fedInfo.isFed ? (
                              <div className="py-2 px-3 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 text-emerald-800 dark:text-emerald-300 font-black text-[11px] flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>আজকের খাবার প্রদান সম্পন্ন ✓</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">সকাল</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  farmStore.confirmFeedingForAnimal(item.id, 'সকাল');
                                  triggerToast(`${item.name}-এর খাবার প্রদান সফলভাবে নিশ্চিত করা হয়েছে ✓`);
                                }}
                                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer transform active:scale-95"
                              >
                                <Utensils className="w-4 h-4 text-white" />
                                <span>খাবার দেওয়া নিশ্চিত করুন (Confirm Feeding)</span>
                              </button>
                            )}

                            <button
                              onClick={() => setShowFeedingScheduleModalAnimal(item)}
                              className="w-full text-center text-[10px] font-bold text-amber-800 dark:text-amber-400 hover:underline flex items-center justify-center gap-1 cursor-pointer pt-0.5"
                            >
                              <Calendar className="w-3 h-3 text-amber-600" />
                              <span>বয়স ভিত্তিক পূর্ণাঙ্গ শিডিউল বিস্তারিত</span>
                            </button>
                          </div>
                        )}

                        {isSold && (
                          <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between">
                             <div className="space-y-0.5">
                               <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">বিক্রয়মূল্য</p>
                               <p className="text-sm font-black font-mono tracking-tighter">{stats.currentSellingPrice.toLocaleString('bn-BD')} ৳</p>
                             </div>
                             <div className="text-right space-y-0.5">
                               <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">পুজি ফেরত</p>
                               <p className="text-sm font-black text-emerald-400 font-mono tracking-tighter">{stats.totalExpense.toLocaleString('bn-BD')} ৳</p>
                             </div>
                          </div>
                        )}

                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                           <div className="flex gap-1 items-center">
                              <button 
                                onClick={() => setSelectedProfileAnimal(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-black transition-colors cursor-pointer border border-emerald-200"
                                title="প্রাণীর পূর্ণাঙ্গ প্রোফাইল ও স্বাস্থ্য লগ দেখুন"
                              >
                                প্রোফাইল
                              </button>
                              {!isSold && (
                                <button 
                                  onClick={() => {
                                    const plan = item.structuredFeedPlan && item.structuredFeedPlan.length > 0 
                                      ? item.structuredFeedPlan 
                                      : getDefaultStructuredFeedPlan(item.type).items;
                                    const budget = item.dailyFeedBudget || plan.reduce((s, i) => s + (Number(i.estimatedCostTaka) || 0), 0);
                                    setEditAnimal({
                                      ...item,
                                      structuredFeedPlan: plan,
                                      dailyFeedBudget: budget,
                                    });
                                  }} 
                                  className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button onClick={() => setDeleteTargetAnimal(item)} className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                           </div>
                           {!isSold && (
                             <button onClick={() => setSaleModalAnimal(item)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${item.isForSale ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                               {item.isForSale ? 'মূল্য পরিবর্তন' : 'শপে অ্যাড করুন'}
                             </button>
                           )}
                           {isSold && (
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Product Settled ✓</span>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'growth_env' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <IoTSensorMonitor />
              <LivestockGrowthChart livestock={livestock} />
              <SeasonalGrowthForecastModule livestock={livestock} farmProfileName={institutionProfile.name} />
              <LivestockEnvironmentalModule livestock={livestock} farmProfileName={institutionProfile.name} />
            </div>
          )}

          {activeTab === 'iot_monitor' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <IoTSensorMonitor />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">কাস্টমার অর্ডার ও ডেলিভারি রেজিস্ট্রি</h3>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">{orders.length} টি অর্ডার</span>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-xs border-collapse">
                   <thead>
                     <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                       <th className="p-5">আইডি ও তারিখ</th>
                       <th className="p-5">কাস্টমারের তথ্য</th>
                       <th className="p-5">পশু</th>
                       <th className="p-5">মূল্য</th>
                       <th className="p-5">অবস্থা</th>
                       <th className="p-5 text-right">অ্যাকশন</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {orders.map(o => (
                       <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                         <td className="p-5 font-mono font-bold text-emerald-600">{o.id}<br/><span className="text-[10px] text-slate-400 font-normal">{o.orderDate}</span></td>
                         <td className="p-5"><p className="font-black text-slate-900 dark:text-white">{o.customerName}</p><span className="text-[10px] text-slate-500">{o.customerPhone}</span></td>
                         <td className="p-5 font-bold">{o.animalName}</td>
                         <td className="p-5 font-black text-blue-600 font-mono">{o.agreedPrice.toLocaleString('bn-BD')} ৳</td>
                         <td className="p-5">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                              o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 
                              o.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>{o.status}</span>
                         </td>
                         <td className="p-5 text-right">
                            <div className="flex justify-end gap-1.5">
                              {o.status === 'Pending' && <button onClick={() => handleOrderAction(o.id, 'Confirmed')} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[10px] cursor-pointer">কনফার্ম</button>}
                              {o.status !== 'Delivered' && <button onClick={() => handleOrderAction(o.id, 'Delivered')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] cursor-pointer">ডেলিভারি</button>}
                              <button onClick={() => setDeleteTargetOrder(o)} className="p-1.5 rounded-lg bg-slate-100 text-red-600 hover:bg-red-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'production_metrics' && <ProductionMetricsDashboard />}

          {activeTab === 'main_dashboard' && (
            <MainOverviewDashboardView onSelectTab={setActiveTab} onOpenEasyEntry={onOpenEasyEntry} />
          )}

          {activeTab === 'smart_advisor' && (
            <div className="space-y-8">
              <AiFarmInsightEngine />
              <AiSmartFarmAdvisor />
            </div>
          )}

          {activeTab === 'crop_planner' && <CropPlanner livestock={livestock} />}

          {activeTab === 'feed_entry' && (
            <div className="space-y-8">
              <DailyFeedLogger />
              <AiFeedAdvisorModule />
            </div>
          )}

          {activeTab === 'fcr_tracker' && <FCRTrackerCard livestock={livestock} />}

          {activeTab === 'price_prediction' && <MarketPricePredictionModule />}

          {activeTab === 'biosecurity' && <BioSecurityChecklistModule />}

          {activeTab === 'vaccine_calendar' && <VaccineHealthCalendarModule livestock={livestock} healthLogs={healthLogs} />}

          {activeTab === 'feed_advisor' && <AiFeedAdvisorModule />}

          {activeTab === 'auto_report' && <AutomatedReportGeneratorModule />}

          {activeTab === 'health_vaccination' && (
            <div className="space-y-8">
              <AiHealthMonitor />
              <VaccineHealthCalendarModule livestock={livestock} healthLogs={healthLogs} />
              <BioSecurityChecklistModule />
              <AnimalHealthMap livestock={livestock} onOpenAiDoctor={() => setActiveTab('aidoctor')} />
              <BioSecurityAuditCard />
              <VaccinationManagement livestock={livestock} healthLogs={healthLogs} />
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">গবাদিপশুর স্বাস্থ্য ও ভ্যাকসিনেশন রেজিস্ট্রি</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">শরীরের তাপমাত্রা, ওজন এবং খাবারের রুচি ট্র্যাক করুন</p>
                </div>
                <button onClick={() => setShowAddHealthModal(true)} className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span>নতুন স্বাস্থ্য পরিদর্শন এন্ট্রি</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {healthLogs.map(log => (
                  <div key={log.id} className={`bg-white dark:bg-slate-900 p-6 rounded-[2rem] border transition-all hover:shadow-xl space-y-4 ${log.status === 'Action Required' ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-start pb-3 border-b border-slate-50">
                      <div><h4 className="font-black text-slate-900 dark:text-white">{log.animalName}</h4><span className="text-[10px] text-slate-400 font-mono">[{log.animalId}] · {log.date}</span></div>
                      <button onClick={() => handleToggleHealthStatus(log.id)} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${log.status === 'Checked' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-600 text-white animate-pulse'}`}>{log.status === 'Checked' ? 'Checked' : 'Needs Action'}</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       <div className="p-2 bg-slate-50 rounded-xl text-center"><p className="text-[8px] text-slate-400 font-bold">তাপমাত্রা</p><p className="text-xs font-black">{log.temperature}</p></div>
                       <div className="p-2 bg-slate-50 rounded-xl text-center"><p className="text-[8px] text-slate-400 font-bold">ওজন</p><p className="text-xs font-black">{log.weightKg}kg</p></div>
                       <div className="p-2 bg-slate-50 rounded-xl text-center"><p className="text-[8px] text-slate-400 font-bold">রুচি</p><p className="text-xs font-black text-emerald-600">{log.appetite}</p></div>
                    </div>
                    <div className="p-3 bg-blue-50/50 rounded-xl text-[11px] font-medium text-blue-700 flex items-center gap-2"><Syringe className="w-3.5 h-3.5" /><span>ভ্যাকসিন: {log.vaccinationName}</span></div>
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl leading-relaxed">"{log.inspectionNotes}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory_feed' && (
            <div className="space-y-8">
              <FeedInventoryTrackerModule />
              <FeedSupplyChainCard />
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">খাদ্য মজুদ ও অটোমেটিক অ্যালার্ট</h3>
                  <Box className="w-8 h-8 text-orange-500 opacity-20" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {feedInventory.map(item => {
                    const isLow = item.currentStockKg <= item.minThresholdKg;
                    return (
                      <div key={item.id} className={`p-6 rounded-[2rem] border transition-all ${isLow ? 'bg-red-50 border-red-200 shadow-lg shadow-red-500/10' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                        <h4 className="font-black text-slate-900 dark:text-white mb-2">{item.name}</h4>
                        <p className={`text-4xl font-black font-mono tracking-tighter ${isLow ? 'text-red-600 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                          {item.currentStockKg} <span className="text-xs font-bold opacity-40 uppercase">Kg</span>
                        </p>
                        <div className="mt-4 h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                           <div className={`h-full transition-all duration-1000 ${isLow ? 'bg-red-600' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (item.currentStockKg / (item.minThresholdKg * 3)) * 100)}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-[10px] font-bold text-slate-400">Min: {item.minThresholdKg}kg</span>
                          <button onClick={() => setShowFeedPurchaseModal(item)} className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer">
                            <Plus className="w-3 h-3" />
                            <span>মজুদ বাড়ান</span>
                          </button>
                        </div>
                      </div>
                    );
                 })}
               </div>
            </div>
            </div>
          )}

          {activeTab === 'supply_chain' && <AiSmartSupplyChainManager />}

          {activeTab === 'employees' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div><h3 className="text-2xl font-black text-slate-900 dark:text-white">কর্মচারী ব্যবস্থাপনা</h3><p className="text-xs text-slate-500 font-medium mt-1">খামারের সকল কর্মীদের তালিকা ও বেতন বিবরণী</p></div>
                <button onClick={() => setShowAddEmployeeModal(true)} className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-xl shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"><Plus className="w-4 h-4" /><span>নতুন কর্মচারী যুক্ত করুন</span></button>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead><tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800"><th className="p-5">নাম ও আইডি</th><th className="p-5">পদবি</th><th className="p-5">বেতন</th><th className="p-5">ফোন</th><th className="p-5 text-right">অ্যাকশন</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {employees.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="p-5 font-black text-slate-900 dark:text-white">{e.name}<br/><span className="text-[10px] text-slate-400 font-mono">{e.id}</span></td>
                        <td className="p-5 font-bold text-slate-600 dark:text-slate-400">{e.role}</td>
                        <td className="p-5 font-black text-emerald-600 font-mono text-sm">{e.salary.toLocaleString('bn-BD')} ৳</td>
                        <td className="p-5 font-mono text-slate-500">{e.phone}</td>
                        <td className="p-5 text-right"><div className="flex justify-end gap-1.5"><button onClick={() => setEditEmployee(e)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 transition-colors"><Edit3 className="w-4 h-4" /></button><button onClick={() => setDeleteTargetEmployee(e)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}



          {activeTab === 'analytics' && (
            <div className="space-y-10">
               {/* Analytics Action Header Bar */}
               <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div>
                   <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">আর্থিক অ্যানালিটিক্স ও পারফরম্যান্স ডাটা অডিট</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">খামারের আয়-ব্যয়, লাভ-ক্ষতি, FCR অনুপাত ও বাজারদর পূর্বাভাসের সামগ্রিক বিশ্লেষণ।</p>
                 </div>
                 <button
                   onClick={() => downloadFarmPdfReport()}
                   className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xl shadow-emerald-600/20 transition-all flex items-center gap-2.5 cursor-pointer shrink-0"
                   title="পিডিএফ অডিট রিপোর্ট ডাউনলোড করুন"
                 >
                   <FileText className="w-4.5 h-4.5 text-white" />
                   <span>পিডিএফ রিপোর্ট ডাউনলোড করুন</span>
                 </button>
               </div>

               <AutomatedReportGeneratorModule />

               <MonthlyProfitLossSummaryCard />

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <h4 className="font-black text-slate-900 dark:text-white">মাসিক খাদ্য খরচের ট্রেন্ড</h4>
                    <div className="h-72 w-full">
                       <ResponsiveContainer><BarChart data={monthlyAnalyticsData}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3}/><XAxis dataKey="month" fontSize={9}/><YAxis fontSize={9}/><Tooltip contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', color: '#fff'}}/><Bar dataKey="feedCost" fill="#10b981" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer>
                    </div>
                  </div>
                   <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <h4 className="font-black text-slate-900 dark:text-white">রাজস্ব বনাম নিট মুনাফা</h4>
                    <div className="h-72 w-full">
                       <ResponsiveContainer><LineChart data={monthlyAnalyticsData}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3}/><XAxis dataKey="month" fontSize={9}/><YAxis fontSize={9}/><Tooltip contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', color: '#fff'}}/><Legend iconType="circle"/><Line type="monotone" dataKey="salesRevenue" stroke="#10b981" strokeWidth={4} dot={{r:4, fill:'#10b981', stroke:'#fff'}}/><Line type="monotone" dataKey="netProfit" stroke="#3b82f6" strokeWidth={4} dot={{r:4, fill:'#3b82f6', stroke:'#fff'}}/></LineChart></ResponsiveContainer>
                    </div>
                  </div>
               </div>

               <FutureProductionForecastingModule />

               <MarketPricePredictionModule />

               <ExpenseSectorChart />

               <FCRTrackerCard livestock={livestock} />

               <FoodEfficiencyReportWidget livestock={livestock} />

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 dark:text-white">পুজি ফেরত সময়রেখা (Recovery Timeline)</h4>
                      <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">গড় দিন (Avg Days)</div>
                    </div>
                    <div className="h-72 w-full">
                       <ResponsiveContainer>
                         <BarChart data={recoveryStats} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1}/>
                           <XAxis type="number" fontSize={9} />
                           <YAxis dataKey="category" type="category" fontSize={9} width={100} />
                           <Tooltip contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', color: '#fff'}} />
                           <Bar dataKey="avgDaysToSell" fill="#10b981" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 10, fill: '#64748b' }} />
                         </BarChart>
                       </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">পশু ক্রয় থেকে বিক্রয় পর্যন্ত অতিবাহিত গড় সময়ের চিত্র</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <h4 className="font-black text-slate-900 dark:text-white">লভ্যাংশ প্রবৃদ্ধি ট্রেন্ড (Net Profit Growth)</h4>
                    <div className="h-72 w-full">
                       <ResponsiveContainer>
                         <AreaChart data={forecasting.historicalMonthlyProfit}>
                           <defs>
                             <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1}/>
                           <XAxis dataKey="month" fontSize={9}/>
                           <YAxis fontSize={9}/>
                           <Tooltip contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', color: '#fff'}}/>
                           <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 opacity-[0.03] rounded-full translate-x-32 translate-y-[-32px]" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="space-y-2 text-center md:text-left">
                          <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">বাৎসরিক নিট প্রফিট মার্জিন</h4>
                          <p className="text-slate-500 font-medium">বিনিয়োগ ও পরিচালন ব্যয়ের বিপরীতে উপার্জিত মুনাফার হার</p>
                       </div>
                       <div className="text-center md:text-right">
                          <span className="text-6xl font-black text-emerald-600 font-mono tracking-tighter">
                            {((financial.netProfit / (financial.totalInvestment || 1)) * 100).toFixed(1)}%
                          </span>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Annual ROI Estimate</p>
                       </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[3rem] text-white shadow-xl flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 uppercase text-[10px] font-black tracking-widest">
                      <Sparkles className="w-4 h-4" />
                      <span>মুনাফা পূর্বাভাস (Forecasting)</span>
                    </div>
                    <div>
                      <p className="text-3xl font-black font-mono tracking-tighter text-emerald-400">+{forecasting.nextQuarterPredictedProfit.toLocaleString('bn-BD')} ৳</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">আগামী ৩ মাসের সম্ভাব্য নিট মুনাফা</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-medium text-slate-400 leading-relaxed italic">
                      * অতীত বিক্রয় গতির (Sales Velocity) ওপর ভিত্তি করে এই অনুমানটি করা হয়েছে।
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'financial_dashboard' && <AnimalProfitabilityDashboard />}

          {activeTab === 'marketing' && <MarketingStudio />}

          {activeTab === 'ledger' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               {/* Individual Animal Ledger Component */}
               <IndividualAnimalLedger onOpenEasyEntry={onOpenEasyEntry} />

               {/* Sold Products Ledger Section */}
               <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                   <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-800/20">
                     <div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                         <BarChart3 className="w-5 h-5 text-emerald-500" />
                         <span>ফাইন্যান্সিয়াল লেজার ও অডিট ট্রেইল (Financial Ledger)</span>
                       </h3>
                       <p className="text-[11px] text-slate-500 font-medium mt-1">দোকানের প্রতিটি লেনদেন ও বিক্রয় মুনাফার বিস্তারিত সময়ক্রম</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <button 
                          onClick={() => window.print()}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-black text-[10px] hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>লেজার প্রিন্ট করুন</span>
                        </button>
                        <button 
                          onClick={() => window.print()}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-[10px] shadow-md shadow-emerald-600/20 transition-all cursor-pointer transform hover:scale-105 active:scale-95"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>লেজার রিপোর্ট প্রিন্ট করুন</span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                        <div className="text-right">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">সর্বমোট লেনদেন</p>
                           <p className="text-lg font-black text-slate-900 dark:text-white font-mono tabular-nums">{ledgerData.length} টি</p>
                        </div>
                     </div>
                  </div>
                  <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
                             <th className="p-6">তারিখ</th>
                             <th className="p-6">বিবরণ / আইটেম</th>
                             <th className="p-6 text-center"> ধরন</th>
                             <th className="p-6">পুজি/পরিমাণ</th>
                             <th className="p-6">বিক্রয়মূল্য/দিন</th>
                             <th className="p-6 text-right">মুনাফা (৳)</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {ledgerData.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-12 text-center text-slate-400 font-medium italic">বর্তমানে কোনো লেনদেনের রেকর্ড নেই।</td>
                            </tr>
                          ) : ledgerData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                              <td className="p-6 font-mono text-xs text-slate-500 whitespace-nowrap">{row.date}</td>
                              <td className="p-6">
                                 <p className="font-black text-slate-900 dark:text-white text-sm">{row.item}</p>
                                 <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">ID: {row.id}</span>
                              </td>
                              <td className="p-6 text-center">
                                 <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                                   row.type === 'Sale' ? 'bg-emerald-50 text-emerald-700' : 
                                   row.type === 'Investment' ? 'bg-blue-50 text-blue-700' : 
                                   row.type === 'Dividend' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                 }`}>{row.type === 'Sale' ? 'বিক্রয়' : row.type === 'Investment' ? 'বিনিয়োগ' : row.type === 'Dividend' ? 'লভ্যাংশ' : row.type}</span>
                              </td>
                              <td className="p-6">
                                 <div className="flex flex-col">
                                   <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{(row.purchasePrice || row.amount || 0).toLocaleString('bn-BD')} ৳</span>
                                   {row.type === 'Sale' && <span className="text-[9px] text-slate-400">Recapitalized</span>}
                                 </div>
                              </td>
                              <td className="p-6">
                                {row.type === 'Sale' ? (
                                  <div className="flex flex-col">
                                    <span className="font-black text-slate-900 dark:text-white text-xs">{row.salePrice.toLocaleString('bn-BD')} ৳</span>
                                    <span className="text-[9px] font-bold text-emerald-600">{row.daysToSell} দিনে বিক্রিত</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-xs">--</span>
                                )}
                              </td>
                              <td className="p-6 text-right">
                                 {row.profit > 0 ? (
                                   <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-black font-mono text-sm">
                                     +{row.profit.toLocaleString('bn-BD')} ৳
                                   </span>
                                 ) : row.type === 'Dividend' ? (
                                   <span className="text-indigo-600 font-black text-sm">-{row.amount.toLocaleString('bn-BD')} ৳</span>
                                 ) : (
                                   <span className="text-slate-300 text-xs">--</span>
                                 )}
                              </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Profit Insight Cards */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-700 to-violet-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Wallet className="w-32 h-32" /></div>
                       <div className="relative z-10 space-y-8">
                         <div>
                           <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">উত্তোলনযোগ্য লভ্যাংশ</p>
                           <h3 className="text-5xl font-black font-mono tracking-tighter">{financial.withdrawableProfit.toLocaleString('bn-BD')} <span className="text-2xl font-bold opacity-50">৳</span></h3>
                         </div>
                         <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs py-2 border-b border-white/10"><span className="opacity-70">অর্জিত মোট মুনাফা</span><span className="font-bold">{financial.totalProfitEarned.toLocaleString('bn-BD')} ৳</span></div>
                            <div className="flex items-center justify-between text-xs py-2 border-b border-white/10"><span className="opacity-70">পরিচালন ব্যয় (বেতন)</span><span className="font-bold">-{financial.totalSalaryExpense.toLocaleString('bn-BD')} ৳</span></div>
                            <div className="flex items-center justify-between text-xs py-2"><span className="opacity-70">পূর্বের উত্তোলন</span><span className="font-bold">-{financial.totalOwnerWithdrawal.toLocaleString('bn-BD')} ৳</span></div>
                         </div>
                         <button onClick={() => setShowDividendModal(true)} className="w-full py-4 rounded-2xl bg-white text-indigo-700 font-black text-sm shadow-xl hover:shadow-indigo-500/20 transition-all active:scale-[0.98] cursor-pointer">লভ্যাংশ বন্টন করুন</button>
                       </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                       <div className="flex items-center justify-between"><h4 className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-widest text-slate-400">মালিকের ইনভেস্টমেন্ট</h4><Plus className="w-4 h-4 text-emerald-500" /></div>
                       <div>
                         <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{financial.totalInvestment.toLocaleString('bn-BD')} ৳</p>
                         <p className="text-[10px] text-slate-500 font-medium mt-1">খামারের জন্য দেওয়া মোট মূলধন</p>
                       </div>
                       <button onClick={() => { setTransactionForm({ ...transactionForm, type: 'Investment' }); setShowAddTransactionModal(true); }} className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition-all cursor-pointer">নতুন ইনভেস্টমেন্ট যোগ করুন</button>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                     <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <div><h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><History className="w-5 h-5 text-indigo-500" /><span>লেনদেনের পূর্ণাঙ্গ ইতিহাস</span></h3><p className="text-[11px] text-slate-500 font-medium mt-1">ইনভেস্টমেন্ট ও লভ্যাংশ বন্টনের বিস্তারিত তালিকা</p></div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Ledger</span></div>
                     </div>
                     <div className="flex-1 overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                           <thead><tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100 dark:border-slate-800"><th className="p-6">তারিখ</th><th className="p-6">বিবরণ ও ধরন</th><th className="p-6 text-right">পরিমাণ (৳)</th></tr></thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {farmStore.getOwnerTransactions().map(tx => (
                                <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                  <td className="p-6 font-mono text-slate-500 text-xs">{tx.date}</td>
                                  <td className="p-6">
                                     <div className="flex flex-col gap-1">
                                       <span className="font-bold text-slate-900 dark:text-white text-sm">{tx.description || (tx.type === 'Investment' ? 'মূলধন বিনিয়োগ' : 'লভ্যাংশ উত্তোলন')}</span>
                                       <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                         tx.type === 'Investment' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 
                                         tx.type === 'Dividend' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' : 'bg-rose-50 text-rose-700'
                                       }`}>{tx.type}</span>
                                     </div>
                                  </td>
                                  <td className={`p-6 text-right font-black font-mono text-lg tracking-tighter ${tx.type === 'Investment' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    {tx.type === 'Investment' ? '+' : '-'}{tx.amount.toLocaleString('bn-BD')}
                                  </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-5 flex items-center gap-3"><Globe className="w-5 h-5 text-emerald-500" /><span>পাবলিক হোমপেজ কন্টেন্ট</span></h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hero Title</span><p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{institutionProfile.heroTitle}</p></div>
                        <div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hero Subtitle</span><p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{institutionProfile.heroSubtitle}</p></div>
                        <div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mission Title</span><p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{institutionProfile.missionTitle}</p></div>
                        <div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mission Text</span><p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{institutionProfile.missionText}</p></div>
                     </div>
                     <div className="space-y-6">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Feature 1</span>
                           <p className="text-xs font-bold text-slate-800 dark:text-white">{institutionProfile.feature1Title}</p>
                           <p className="text-[10px] text-slate-500 leading-relaxed">{institutionProfile.feature1Text}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Feature 2</span>
                           <p className="text-xs font-bold text-slate-800 dark:text-white">{institutionProfile.feature2Title}</p>
                           <p className="text-[10px] text-slate-500 leading-relaxed">{institutionProfile.feature2Text}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Feature 3</span>
                           <p className="text-xs font-bold text-slate-800 dark:text-white">{institutionProfile.feature3Title}</p>
                           <p className="text-[10px] text-slate-500 leading-relaxed">{institutionProfile.feature3Text}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'voice_phrases' && <VoicePhraseConfigPanel onSelectAdminTab={setActiveTab as any} />}
          {activeTab === 'aidoctor' && <AiDoctorChat />}
          {activeTab === 'tour3d' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">৩ডি ভার্চুয়াল খামার এডিটর</h3>
                    <p className="text-xs text-slate-500 font-medium">আপনার খামারের থ্রিডি লেআউট কাস্টমাইজ করুন এবং বিভিন্ন উপাদান যুক্ত করুন</p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase border border-blue-100 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" />
                    <span>এডিট মোড চালু করে ক্লিক করে অবজেক্ট বসান</span>
                  </div>
               </div>
               <div className="h-[75vh] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-900 relative">
                  <Farm3DViewer />
               </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
               <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                  <div className="h-40 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 relative overflow-hidden">
                     <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                  </div>
                  <div className="px-10 pb-10 flex flex-col items-start relative">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center text-6xl border-8 border-white dark:border-[#090d16] translate-y-[-50%] overflow-hidden z-10">
                      {institutionProfile.logo ? <img src={institutionProfile.logo} className="w-full h-full object-cover" /> : '🌾'}
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between w-full gap-8 mt-[-40px]">
                       <div className="pt-2">
                         <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{institutionProfile.name}</h3>
                         <p className="text-slate-500 font-bold mt-1 uppercase tracking-[0.2em] text-[10px] opacity-70">{institutionProfile.tagline}</p>
                       </div>
                       <div className="flex items-center gap-3">
                         <button onClick={handleOpenEditProfile} className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer">প্রোফাইল এডিট করুন</button>
                         <button onClick={() => setShowResetProfileModal(true)} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all border border-slate-100 dark:border-slate-700 cursor-pointer"><RotateCcw className="w-5 h-5" /></button>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-5 flex items-center gap-3"><BadgeCheck className="w-5 h-5 text-emerald-500" /><span>অফিশিয়াল পরিচিতি</span></h4>
                    <div className="grid grid-cols-2 gap-8">
                       {[
                         { label: 'প্রধান স্বত্বাধিকারী', value: institutionProfile.proprietor },
                         { label: 'নিবন্ধন নম্বর', value: institutionProfile.registrationNumber },
                         { label: 'লাইসেন্স আইডি', value: institutionProfile.licenseNumber },
                         { label: 'স্থাপিত সন', value: institutionProfile.establishedYear }
                       ].map((item, i) => (
                         <div key={i} className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span><p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{item.value}</p></div>
                       ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-5 flex items-center gap-3"><Mail className="w-5 h-5 text-blue-500" /><span>যোগাযোগ ও জীবনিরাপত্তা</span></h4>
                    <div className="grid grid-cols-2 gap-8">
                       {[
                         { label: 'অফিশিয়াল মোবাইল', value: institutionProfile.phone },
                         { label: 'ইমেইল এড্রেস', value: institutionProfile.email },
                         { label: 'ঠিকানা ও অবস্থান', value: `${institutionProfile.location}, ${institutionProfile.district}` },
                         { label: 'বায়ো-সিকিউরিটি', value: institutionProfile.bioSecurityTier, badge: true }
                       ].map((item, i) => (
                         <div key={i} className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>{item.badge ? <div className="mt-1"><span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-black border border-blue-100 dark:border-blue-800">{item.value}</span></div> : <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{item.value}</p>}</div>
                       ))}
                    </div>
                  </div>
               </div>

               {/* Theme & Display Preferences Card */}
               <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                   <div>
                     <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2.5">
                       <Palette className="w-5 h-5 text-emerald-500" />
                       <span>থিম ও ইন্টারফেস ডিসপ্লে সেটিংস (Theme Settings)</span>
                     </h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                       অ্যাডমিন প্যানেল এবং সম্পূর্ণ ইন্টারফেসের কালার থিম স্বাধীনভাবে নির্বাচন করুন। আপনার পছন্দ লোকাল স্টোরেজে সংরক্ষিত থাকবে।
                     </p>
                   </div>
                   
                   {/* Theme Switcher Toggle Buttons */}
                   <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                     <button
                       type="button"
                       onClick={() => {
                         if (isDarkMode && toggleDarkMode) toggleDarkMode();
                       }}
                       className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                         !isDarkMode
                           ? 'bg-white text-amber-600 shadow-md border border-slate-200/80 scale-105'
                           : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                       }`}
                     >
                       <Sun className="w-4 h-4 text-amber-500" />
                       <span>লাইট মোড (Light)</span>
                     </button>

                     <button
                       type="button"
                       onClick={() => {
                         if (!isDarkMode && toggleDarkMode) toggleDarkMode();
                       }}
                       className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                         isDarkMode
                           ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                           : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                       }`}
                     >
                       <Moon className="w-4 h-4 text-indigo-300" />
                       <span>ডার্ক মোড (Dark)</span>
                     </button>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                   <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                     <div>
                       <span className="font-bold text-slate-800 dark:text-slate-200 block">বর্তমান সক্রিয় ইন্টারফেস থিম:</span>
                       <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                         {isDarkMode ? 'নাইট / ডার্ক ইন্টারফেস (Dark Mode)' : 'ডে / লাইট ইন্টারফেস (Light Mode)'}
                       </span>
                     </div>
                     <span className="text-2xl">{isDarkMode ? '🌙' : '☀️'}</span>
                   </div>

                   <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                     <div>
                       <span className="font-bold text-slate-800 dark:text-slate-200 block">পারসিস্টেন্ট মেমোরি স্ট্যাটাস:</span>
                       <span className="text-[11px] text-slate-500 font-semibold">
                         localStorage স্বয়ংক্রিয় সেভড (<code className="text-emerald-600 dark:text-emerald-400 font-mono">rs_theme</code>)
                       </span>
                     </div>
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                   </div>
                 </div>
               </div>

               {/* RBAC User Permissions & Access Control Card */}
               <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                   <div>
                     <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2.5">
                       <ShieldCheck className="w-5 h-5 text-indigo-500" />
                       <span>রোল-বেসড এক্সেস কন্ট্রোল (RBAC User Permissions)</span>
                     </h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                       প্রধান অ্যাডমিন হিসেবে অন্যান্য ব্যবহারকারী অ্যাকাউন্টগুলোর জন্য <strong>"Read-Only" (শুধুমাত্র দেখা)</strong> বা <strong>"Data Entry" (তথ্য সংযোজন ও সম্পাদনা)</strong> অনুমতি নির্ধারণ করুন।
                     </p>
                   </div>

                   <button
                     type="button"
                     onClick={() => setActiveTab('user_management')}
                     className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition-all self-start sm:self-auto"
                   >
                     <Users className="w-4 h-4" />
                     <span>সকল ইউজার ও পারমিশন বিস্তারিত</span>
                   </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 space-y-1">
                     <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold text-xs">
                       <Eye className="w-4 h-4 text-sky-500" />
                       <span>Read-Only Mode (শুধুমাত্র দেখা)</span>
                     </div>
                     <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                       ব্যবহারকারী শুধু খামারের হিসাব, গ্রাফ ও ড্যাশবোর্ড দেখতে পারবেন। কোনো তথ্য ইনপুট বা এডিট করা নিষ্ক্রিয়।
                     </p>
                   </div>

                   <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1">
                     <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
                       <Edit3 className="w-4 h-4 text-amber-500" />
                       <span>Data Entry Mode (ইনপুট ও এডিট)</span>
                     </div>
                     <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                       দৈনিক খাবার, স্বাস্থ্য রেকর্ড, টিকা ও নতুন পশু ক্রয় ইনপুট দিতে পারবেন। ইউজার ডিলিট বা সিকিউরিটি রিমুভ ব্লকড।
                     </p>
                   </div>

                   <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1">
                     <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                       <ShieldCheck className="w-4 h-4 text-emerald-500" />
                       <span>Full Access (প্রধান পরিচালক)</span>
                     </div>
                     <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                       মালিক বা প্রধান অ্যাডমিন — সর্বময় নিয়ন্ত্রণ, পারমিশন পরিবর্তন ও ইউজার ম্যানেজমেন্টের পূর্ণ ক্ষমতা।
                     </p>
                   </div>
                 </div>

                 {/* Quick Permissions Selector Table */}
                 <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                   <table className="w-full text-left text-xs">
                     <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-black uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                       <tr>
                         <th className="p-4">ব্যবহারকারী</th>
                         <th className="p-4">ইউজারনেম</th>
                         <th className="p-4">রোল</th>
                         <th className="p-4">RBAC অনুমতি (Permissions Level)</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {registeredUsers.map(u => {
                         const isOwner = u.role === 'owner' || u.username === 'admin';
                         return (
                           <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                             <td className="p-4 font-bold text-slate-900 dark:text-white">{u.displayName}</td>
                             <td className="p-4 font-mono text-indigo-600 dark:text-indigo-400 font-bold">@{u.username}</td>
                             <td className="p-4 text-slate-600 dark:text-slate-400 capitalize">{u.role}</td>
                             <td className="p-4">
                               {isOwner ? (
                                 <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-[10px]">
                                   👑 Full Access (মালিক)
                                 </span>
                               ) : (
                                 <select
                                   value={u.permissionMode || 'data_entry'}
                                   onChange={e => {
                                     authService.updateUser(u.id, { permissionMode: e.target.value as PermissionMode });
                                     triggerToast(`"${u.displayName}"-এর পারমিশন আপডেট করে ${e.target.value === 'read_only' ? 'Read-Only (শুধুমাত্র দেখা)' : e.target.value === 'data_entry' ? 'Data Entry' : 'Full Access'} করা হয়েছে।`);
                                   }}
                                   className={`px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer focus:outline-none ${
                                     (u.permissionMode || 'data_entry') === 'read_only'
                                       ? 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800'
                                       : (u.permissionMode || 'data_entry') === 'data_entry'
                                       ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                                       : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                                   }`}
                                 >
                                   <option value="data_entry">✍️ Data Entry (এন্ট্রি ও এডিটিং)</option>
                                   <option value="read_only">👁️ Read-Only (শুধুমাত্র দেখা)</option>
                                   <option value="full_access">👑 Full Access (সর্বময় ক্ষমতা)</option>
                                 </select>
                               )}
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 </div>
               </div>
            </div>
          )}
        </div>

      {/* Modern Redesigned Modals */}

      
      {/* Modal: New Purchase */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-10 max-w-2xl w-full shadow-2xl border border-white/20 space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-800">
                 <div><h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">নতুন পশু ক্রয় এন্ট্রি (Livestock Entry)</h3><p className="text-xs text-slate-500 font-medium">খামার ডাটাবেজে নতুন গবাদিপশু বা পাখির রেকর্ড যোগ করুন</p></div>
                 <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateLivestock} className="grid grid-cols-2 gap-6">
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">পশুর ধরন (Category) *</label>
                   <select value={formType} onChange={e => { const newType = e.target.value as any; setFormType(newType); const def = getDefaultStructuredFeedPlan(newType); setFormStructuredFeedItems(def.items); setFormDailyFeedBudget(def.dailyBudget); }} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white">
                     <option value="গরু (Cattle)">গরু (Cattle)</option>
                     <option value="ছাগল (Goat)">ছাগল (Goat)</option>
                     <option value="হাঁস (Duck)">হাঁস (Duck)</option>
                     <option value="মুরগি (Chicken)">মুরগি (Chicken)</option>
                     <option value="পাখি (Birds)">পাখি (Birds)</option>
                     <option value="মাছ (Fish)">মাছ (Fish)</option>
                   </select>
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">পশুর নাম / ব্যাচ আইডি *</label>
                   <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white" placeholder="সাহীওয়াল প্রিন্সেস / পাখির ব্যাচ" required />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">জাত (Breed)</label>
                   <input type="text" value={formBreed} onChange={e => setFormBreed(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white" placeholder="যমুনাপারি / পেকিন / জাপানি" />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">ক্রয়মূল্য / ক্রয় রেট (Purchase Rate - ৳) *</label>
                   <input type="number" value={formPurchasePrice} onChange={e => setFormPurchasePrice(Number(e.target.value))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-emerald-600 text-xl focus:ring-2 focus:ring-emerald-500 transition-all" required />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">টার্গেট পালনকাল (Target Rearing Duration - মাস) *</label>
                   <input type="number" min={1} max={36} value={formTargetRearingMonths} onChange={e => setFormTargetRearingMonths(Number(e.target.value))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white font-mono" required />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">টার্গেট বিক্রয়মূল্য (Target Selling Price - ৳)</label>
                   <input type="number" value={formTargetSellingPrice} onChange={e => setFormTargetSellingPrice(Number(e.target.value))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-emerald-600 text-xl focus:ring-2 focus:ring-emerald-500 transition-all" />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">প্রারম্ভিক / বর্তমান ওজন (কেজি)</label>
                   <input type="number" value={formCurrentWeight} onChange={e => { setFormCurrentWeight(Number(e.target.value)); setFormInitialWeight(Number(e.target.value)); }} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white" />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">টার্গেট ওজন (Target Weight - কেজি)</label>
                   <input type="number" value={formTargetWeight} onChange={e => setFormTargetWeight(Number(e.target.value))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white" />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">স্বাস্থ্য অবস্থা</label>
                   <input type="text" value={formHealthStatus} onChange={e => setFormHealthStatus(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white" placeholder="সুস্থ ও সবল" />
                 </div>
                  {formType.includes('মাছ') && (
                    <>
                      <div className="col-span-2 sm:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">পানির pH মাত্রা (Water pH)</label>
                        <input type="number" step="0.1" value={formWaterPH} onChange={e => setFormWaterPH(Number(e.target.value))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-blue-600 text-xl focus:ring-2 focus:ring-blue-500 transition-all" />
                      </div>
                      <div className="col-span-2 sm:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">পানির তাপমাত্রা (Temperature - °C)</label>
                        <input type="number" step="0.1" value={formWaterTemperature} onChange={e => setFormWaterTemperature(Number(e.target.value))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-orange-600 text-xl focus:ring-2 focus:ring-orange-500 transition-all" />
                      </div>
                    </>
                  )}
                  {/* Structured Feed Plan Editor */}
                 <div className="col-span-2 p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-4">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                     <div>
                       <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                         <Utensils className="w-4 h-4 text-amber-600" />
                         <span>খাবারের আলাদা আলাদা উপাদান বাজেট (Structured Diet Plan)</span>
                       </h4>
                       <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                         {formType} এর জন্য অটোমেটিক নির্ধারিত খাদ্য উপাদানসমূহ। পরিমাণ ও খরচ এন্ট্রি করুন।
                       </p>
                     </div>
                     <div className="text-right">
                       <span className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-400">মোট হিসাবকৃত দৈনিক খাদ্য বাজেট</span>
                       <p className="text-lg font-black font-mono text-amber-900 dark:text-amber-200">
                         {formStructuredFeedItems.reduce((s, i) => s + (Number(i.estimatedCostTaka) || 0), 0)} ৳/দিন
                       </p>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
                     {formStructuredFeedItems.map((item, idx) => (
                       <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-100 dark:border-slate-700 shadow-sm">
                         <input
                           type="text"
                           value={item.name}
                           onChange={e => {
                             const next = [...formStructuredFeedItems];
                             next[idx].name = e.target.value;
                             setFormStructuredFeedItems(next);
                           }}
                           className="w-full sm:w-1/3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs font-bold border-none text-slate-800 dark:text-white"
                           placeholder="খাবারের উপাদান"
                         />
                         <div className="flex items-center gap-1 w-1/2 sm:w-1/3">
                           <input
                             type="number"
                             step="0.01"
                             value={item.targetAmountKg}
                             onChange={e => {
                               const next = [...formStructuredFeedItems];
                               next[idx].targetAmountKg = Number(e.target.value);
                               setFormStructuredFeedItems(next);
                             }}
                             className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs font-bold border-none text-slate-800 dark:text-white font-mono text-center"
                             placeholder="পরিমাণ"
                           />
                           <span className="text-[10px] font-bold text-slate-500">{item.unit || 'কেজি'}</span>
                         </div>
                         <div className="flex items-center gap-1 w-1/2 sm:w-1/3">
                           <input
                             type="number"
                             value={item.estimatedCostTaka}
                             onChange={e => {
                               const next = [...formStructuredFeedItems];
                               next[idx].estimatedCostTaka = Number(e.target.value);
                               setFormStructuredFeedItems(next);
                             }}
                             className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs font-black text-amber-600 border-none font-mono text-center"
                             placeholder="খরচ (৳)"
                           />
                           <span className="text-[10px] font-bold text-slate-500">৳</span>
                         </div>
                         <button
                           type="button"
                           onClick={() => setFormStructuredFeedItems(formStructuredFeedItems.filter((_, i) => i !== idx))}
                           className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                         >
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                     ))}
                   </div>

                   <div className="flex items-center justify-between pt-1">
                     <button
                       type="button"
                       onClick={() => setFormStructuredFeedItems([...formStructuredFeedItems, { name: 'নতুন খাদ্য উপাদান', targetAmountKg: 0.5, unit: 'কেজি', estimatedCostTaka: 20 }])}
                       className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                     >
                       <Plus className="w-3.5 h-3.5" /> উপাদান যোগ করুন
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         const def = getDefaultStructuredFeedPlan(formType);
                         setFormStructuredFeedItems(def.items);
                         setFormDailyFeedBudget(def.dailyBudget);
                       }}
                       className="text-xs font-bold text-slate-500 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
                     >
                       <RotateCcw className="w-3.5 h-3.5" /> রিকমেন্ডেড উপাদান রিসেট
                     </button>
                   </div>
                 </div>
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">পশুর ছবি আপলোড</label>
                    <input type="file" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) handleImageFileUpload(e.target.files[0], setFormPhoto); }} className="w-full text-xs text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
                 </div>
                 <div className="col-span-2 pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onClick={() => setShowAddModal(false)} className="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest cursor-pointer">বাতিল</button>
                    <button type="submit" className="px-10 py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all cursor-pointer">এন্ট্রি সম্পন্ন করুন</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Modal: Health Entry */}
      {showAddHealthModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl space-y-8">
              <div className="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-800">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3"><Stethoscope className="w-6 h-6 text-rose-500" /><span>স্বাস্থ্য পরিদর্শন</span></h3>
                 <button onClick={() => setShowAddHealthModal(false)} className="text-slate-400 hover:text-red-500 cursor-pointer"><X /></button>
              </div>
              <form onSubmit={handleCreateHealthLog} className="space-y-6">
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">পশু নির্বাচন করুন *</label><select value={healthForm.animalId} onChange={e => { const id = e.target.value; const a = livestock.find(x => x.id === id); setHealthForm({ ...healthForm, animalId: id, animalName: a ? a.name : '' }); }} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold" required><option value="">-- পশু সিলেক্ট করুন --</option>{livestock.map(a => <option key={a.id} value={a.id}>[{a.id}] {a.name}</option>)}</select></div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">তাপমাত্রা</label><input type="text" value={healthForm.temperature} onChange={e => setHealthForm({ ...healthForm, temperature: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold" placeholder="101.5 °F" /></div>
                   <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">ওজন (কেজি)</label><input type="number" value={healthForm.weightKg} onChange={e => setHealthForm({ ...healthForm, weightKg: Number(e.target.value) })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold" /></div>
                 </div>
                 <button type="submit" className="w-full py-5 rounded-2xl bg-rose-600 text-white font-black shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all cursor-pointer">নিবন্ধন করুন</button>
              </form>
           </div>
        </div>
      )}

      {/* Modal: Add Employee */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-md w-full shadow-2xl space-y-8">
              <div className="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-800"><h3 className="text-2xl font-black text-slate-900 dark:text-white">নতুন নিয়োগ</h3><button onClick={() => setShowAddEmployeeModal(false)} className="text-slate-400 hover:text-red-500 cursor-pointer"><X /></button></div>
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                 <input type="text" placeholder="কর্মচারীর নাম" value={employeeForm.name} onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black" required />
                 <input type="text" placeholder="পদবি (ম্যানেজার/সহকারী)" value={employeeForm.role} onChange={e => setEmployeeForm({ ...employeeForm, role: e.target.value })} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold" required />
                 <input type="number" placeholder="মাসিক বেতন (টাকা)" value={employeeForm.salary} onChange={e => setEmployeeForm({ ...employeeForm, salary: Number(e.target.value) })} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-emerald-600 text-lg" required />
                 <input type="text" placeholder="ফোন নম্বর" value={employeeForm.phone} onChange={e => setEmployeeForm({ ...employeeForm, phone: e.target.value })} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-mono" required />
                 <button type="submit" className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all cursor-pointer mt-4">নিয়োগ চূড়ান্ত করুন</button>
              </form>
           </div>
        </div>
      )}

      {/* Modal: Add Transaction (Investment/Withdrawal) */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-md w-full shadow-2xl space-y-8">
              <div className="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-800">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white">{transactionForm.type === 'Investment' ? 'ইনভেস্টমেন্ট যোগ' : 'লভ্যাংশ উত্তোলন'}</h3>
                 <button onClick={() => setShowAddTransactionModal(false)} className="text-slate-400 hover:text-red-500 cursor-pointer"><X /></button>
              </div>
              <form onSubmit={handleAddTransaction} className="space-y-6">
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">টাকার পরিমাণ (৳)</label><input type="number" value={transactionForm.amount} onChange={e => setTransactionForm({ ...transactionForm, amount: Number(e.target.value) })} className="w-full p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-3xl text-emerald-600 tracking-tighter" required /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">বিবরণ</label><textarea value={transactionForm.description} onChange={e => setTransactionForm({ ...transactionForm, description: e.target.value })} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm min-h-[120px] focus:ring-2 focus:ring-emerald-500" placeholder="লেনদেনের বিস্তারিত বিবরণ লিখুন..." required /></div>
                 <button type="submit" className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black shadow-xl hover:bg-emerald-700 transition-all cursor-pointer">লেনদেন সম্পন্ন করুন</button>
              </form>
           </div>
        </div>
      )}

      {/* Modal: Dividend Distribution Calculator */}
      {showDividendModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-800">
               <div><h3 className="text-2xl font-black text-slate-900 dark:text-white">লভ্যাংশ বন্টন ক্যালকুলেটর</h3><p className="text-xs text-slate-500 font-medium">মালিকদের মধ্যে অর্জিত মুনাফা ভাগ করে দিন</p></div>
               <button onClick={() => setShowDividendModal(false)} className="text-slate-400 hover:text-red-500 cursor-pointer"><X /></button>
            </div>
            
            <div className="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
              <div><p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">বন্টনযোগ্য মোট লভ্যাংশ</p><p className="text-4xl font-black text-emerald-700 dark:text-emerald-300 font-mono tracking-tighter">{financial.withdrawableProfit.toLocaleString('bn-BD')} ৳</p></div>
              <TrendingUp className="w-10 h-10 text-emerald-600/30" />
            </div>

            <div className="space-y-4">
               {dividendDistributions.map((dist, idx) => (
                 <div key={idx} className="grid grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                   <div className="col-span-7"><input type="text" value={dist.ownerName} onChange={(e) => { const n = [...dividendDistributions]; n[idx].ownerName = e.target.value; setDividendDistributions(n); }} className="w-full bg-transparent border-none text-sm font-black text-slate-700 dark:text-white focus:outline-none" placeholder="মালিকের নাম" /></div>
                   <div className="col-span-5 flex items-center gap-3">
                      <input type="number" value={dist.amount} onChange={(e) => { const n = [...dividendDistributions]; n[idx].amount = Number(e.target.value); setDividendDistributions(n); }} className="flex-1 bg-transparent border-none text-right text-xl font-black text-indigo-600 focus:outline-none font-mono" placeholder="0" />
                      <button onClick={() => setDividendDistributions(dividendDistributions.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                   </div>
                 </div>
               ))}
               <button onClick={() => setDividendDistributions([...dividendDistributions, { ownerName: '', amount: 0 }])} className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 font-bold text-xs flex items-center justify-center gap-2 transition-all"><Plus className="w-4 h-4" /><span>নতুন মালিক যোগ করুন</span></button>
            </div>

            <div className="p-6 rounded-[2rem] bg-slate-900 text-white flex items-center justify-between">
               <div><p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">বন্টনকৃত সর্বমোট</p><p className={`text-2xl font-black font-mono ${dividendDistributions.reduce((s, d) => s + d.amount, 0) > financial.withdrawableProfit ? 'text-red-400' : 'text-indigo-400'}`}>{dividendDistributions.reduce((s, d) => s + d.amount, 0).toLocaleString('bn-BD')} ৳</p></div>
               <div className="text-right"><p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">অবশিষ্ট লভ্যাংশ</p><p className="text-2xl font-black font-mono">{(financial.withdrawableProfit - dividendDistributions.reduce((s, d) => s + d.amount, 0)).toLocaleString('bn-BD')} ৳</p></div>
            </div>

            <button disabled={dividendDistributions.reduce((s, d) => s + d.amount, 0) === 0 || dividendDistributions.reduce((s, d) => s + d.amount, 0) > financial.withdrawableProfit} onClick={() => { 
                const dists = dividendDistributions.filter(d => d.amount > 0);
                farmStore.distributeDividends(dists); 
                setPayoutReceipt({ 
                  date: new Date().toISOString().split('T')[0],
                  distributions: dists,
                  total: dists.reduce((s, d) => s + d.amount, 0)
                });
                setShowDividendModal(false); 
             }} className="w-full py-5 rounded-2xl bg-emerald-600 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all cursor-pointer">বন্টন নিশ্চিত করুন</button>
          </div>
        </div>
      )}

      {/* Modal: Dividend Receipt */}
      {payoutReceipt && (
        <div className="fixed inset-0 z-[70] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 max-w-lg w-full shadow-2xl space-y-10 relative overflow-hidden border-8 border-slate-50 dark:border-slate-800">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Landmark className="w-24 h-24" /></div>
              <div className="text-center space-y-2">
                 <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-xl mb-6"><Check className="w-10 h-10" /></div>
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">পেমেন্ট ডিজিটাল রিসিট</h3>
                 <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{institutionProfile.name}</p>
              </div>

              <div className="space-y-6">
                 <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">তারিখ:</span>
                    <span className="font-mono font-bold">{payoutReceipt.date}</span>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">বন্টন বিবরণী:</p>
                    {payoutReceipt.distributions.map((d: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                         <span className="font-bold text-slate-700 dark:text-slate-300">{d.ownerName}</span>
                         <span className="font-black text-emerald-600 font-mono text-lg">{d.amount.toLocaleString('bn-BD')} ৳</span>
                      </div>
                    ))}
                 </div>
                 <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-lg font-black text-slate-900 dark:text-white">সর্বমোট প্রদান:</span>
                    <span className="text-3xl font-black text-indigo-600 font-mono tracking-tighter">{payoutReceipt.total.toLocaleString('bn-BD')} ৳</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => window.print()} className="py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-xl"><Printer className="w-4 h-4" /> প্রিন্ট রিসিট</button>
                 <button onClick={() => setPayoutReceipt(null)} className="py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest cursor-pointer shadow-xl">বন্ধ করুন</button>
              </div>
           </div>
        </div>
      )}

      {/* Modal: Edit Animal Profile */}
      {editAnimal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-10 max-w-2xl w-full shadow-2xl border border-white/20 space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-800">
                 <div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white">প্রোফাইল তথ্য ও পরিকল্পনা আপডেট</h3>
                   <p className="text-xs text-slate-500 font-medium">{editAnimal.name} [{editAnimal.id}]</p>
                 </div>
                 <button onClick={() => setEditAnimal(null)} className="text-slate-400 hover:text-red-500 cursor-pointer"><X /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-6">
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">পশুর ধরন (Category)</label>
                   <select value={editAnimal.type} onChange={e => setEditAnimal({ ...editAnimal, type: e.target.value as any })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-900 dark:text-white">
                     <option value="গরু (Cattle)">গরু (Cattle)</option>
                     <option value="ছাগল (Goat)">ছাগল (Goat)</option>
                     <option value="হাঁস (Duck)">হাঁস (Duck)</option>
                     <option value="মুরগি (Chicken)">মুরগি (Chicken)</option>
                     <option value="পাখি (Birds)">পাখি (Birds)</option>
                     <option value="মাছ (Fish)">মাছ (Fish)</option>
                   </select>
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">পশুর নাম</label>
                   <input type="text" value={editAnimal.name} onChange={e => setEditAnimal({ ...editAnimal, name: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-900 dark:text-white" />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">জাত (Breed)</label>
                   <input type="text" value={editAnimal.breed} onChange={e => setEditAnimal({ ...editAnimal, breed: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-900 dark:text-white" />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">ক্রয়মূল্য / ক্রয় রেট (Purchase Rate - ৳)</label>
                   <input type="number" value={editAnimal.purchasePrice} onChange={e => setEditAnimal({ ...editAnimal, purchasePrice: Number(e.target.value) })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-emerald-600 text-lg" />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">টার্গেট পালনকাল (Target Rearing Duration - মাস)</label>
                   <input type="number" min={1} max={36} value={editAnimal.targetRearingMonths || 6} onChange={e => setEditAnimal({ ...editAnimal, targetRearingMonths: Number(e.target.value) })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-900 dark:text-white font-mono" />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">টার্গেট বিক্রয়মূল্য (Target Selling Price - ৳)</label>
                   <input type="number" value={editAnimal.targetSellingPrice || editAnimal.sellingPrice} onChange={e => setEditAnimal({ ...editAnimal, targetSellingPrice: Number(e.target.value) })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-emerald-600 text-lg" />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">বর্তমান ওজন (কেজি)</label>
                   <input type="number" value={editAnimal.currentWeight} onChange={e => setEditAnimal({ ...editAnimal, currentWeight: Number(e.target.value) })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-900 dark:text-white" />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">টার্গেট অর্জনযোগ্য ওজন (কেজি)</label>
                   <input type="number" value={editAnimal.targetWeight || Math.round(editAnimal.currentWeight * 1.25)} onChange={e => setEditAnimal({ ...editAnimal, targetWeight: Number(e.target.value) })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-900 dark:text-white" />
                 </div>
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">স্বাস্থ্য অবস্থা</label>
                   <input type="text" value={editAnimal.healthStatus} onChange={e => setEditAnimal({ ...editAnimal, healthStatus: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-900 dark:text-white" />
                 </div>
                  {editAnimal.type.includes('মাছ') && (
                    <>
                      <div className="col-span-2 sm:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">পানির pH মাত্রা (Water pH)</label>
                        <input type="number" step="0.1" value={editAnimal.waterPH || 7.0} onChange={e => setEditAnimal({ ...editAnimal, waterPH: Number(e.target.value) })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-blue-600 text-lg focus:ring-2 focus:ring-blue-500 transition-all" />
                      </div>
                      <div className="col-span-2 sm:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">পানির তাপমাত্রা (Temp - °C)</label>
                        <input type="number" step="0.1" value={editAnimal.waterTemperature || 28.0} onChange={e => setEditAnimal({ ...editAnimal, waterTemperature: Number(e.target.value) })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-orange-600 text-lg focus:ring-2 focus:ring-orange-500 transition-all" />
                      </div>
                      
                      <div className="col-span-2 p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-4">
                        <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-2">
                          <History className="w-4 h-4 text-blue-600" />
                          <span>পুকুর রক্ষণাবেক্ষণ লগ (Pond Maintenance Logs)</span>
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="অ্যাকশন (যেমন: চুন প্রয়োগ)" 
                              className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-800 border-none text-xs font-bold focus:ring-2 focus:ring-blue-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const val = (e.target as HTMLInputElement).value;
                                  if (val) {
                                    const logs = editAnimal.pondMaintenanceLogs || [];
                                    setEditAnimal({
                                      ...editAnimal,
                                      pondMaintenanceLogs: [
                                        { id: `PML-${Date.now()}`, date: new Date().toISOString().split('T')[0], action: val },
                                        ...logs
                                      ]
                                    });
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }
                              }}
                            />
                            <button 
                              type="button"
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase cursor-pointer transition-all active:scale-95 shadow-sm"
                              onClick={(e) => {
                                const input = (e.currentTarget.previousSibling as HTMLInputElement);
                                if (input.value) {
                                  const logs = editAnimal.pondMaintenanceLogs || [];
                                  setEditAnimal({
                                    ...editAnimal,
                                    pondMaintenanceLogs: [
                                      { id: `PML-${Date.now()}`, date: new Date().toISOString().split('T')[0], action: input.value },
                                      ...logs
                                    ]
                                  });
                                  input.value = '';
                                }
                              }}
                            >
                              যোগ করুন
                            </button>
                          </div>
                          
                          <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {(editAnimal.pondMaintenanceLogs || []).map((log, lidx) => (
                              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 shadow-sm">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-slate-800 dark:text-white">{log.action}</p>
                                  <p className="text-[10px] text-slate-400">{log.date}</p>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    const next = (editAnimal.pondMaintenanceLogs || []).filter((_, i) => i !== lidx);
                                    setEditAnimal({ ...editAnimal, pondMaintenanceLogs: next });
                                  }}
                                  className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {/* Structured Feed Plan & Budget Editor for Edit Modal */}
                 <div className="col-span-2 p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-4">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                     <div>
                       <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                         <Utensils className="w-4 h-4 text-amber-600" />
                         <span>খাবারের উপাদানসমূহ ও দৈনিক খাদ্য বাজেট (Diet Plan Options)</span>
                       </h4>
                       <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                         {editAnimal.name} এর খাবার প্রতিটি উপাদানের পরিমাণ ও খরচ আলাদাভাবে নির্ধারণ করুন
                       </p>
                     </div>
                     <div className="text-right">
                       <span className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-400">মোট হিসাবকৃত দৈনিক খাদ্য বাজেট</span>
                       <p className="text-lg font-black font-mono text-amber-900 dark:text-amber-200">
                         {(editAnimal.structuredFeedPlan || []).reduce((s, i) => s + (Number(i.estimatedCostTaka) || 0), 0)} ৳/দিন
                       </p>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
                     {(editAnimal.structuredFeedPlan || []).map((item, idx) => (
                       <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-100 dark:border-slate-700 shadow-sm">
                         <input
                           type="text"
                           value={item.name}
                           onChange={e => {
                             const next = [...(editAnimal.structuredFeedPlan || [])];
                             next[idx].name = e.target.value;
                             setEditAnimal({ ...editAnimal, structuredFeedPlan: next });
                           }}
                           className="w-full sm:w-1/3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs font-bold border-none text-slate-800 dark:text-white"
                           placeholder="খাবারের উপাদান"
                         />
                         <div className="flex items-center gap-1 w-1/2 sm:w-1/3">
                           <input
                             type="number"
                             step="0.01"
                             value={item.targetAmountKg}
                             onChange={e => {
                               const next = [...(editAnimal.structuredFeedPlan || [])];
                               next[idx].targetAmountKg = Number(e.target.value);
                               setEditAnimal({ ...editAnimal, structuredFeedPlan: next });
                             }}
                             className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs font-bold border-none text-slate-800 dark:text-white font-mono text-center"
                             placeholder="পরিমাণ"
                           />
                           <span className="text-[10px] font-bold text-slate-500">{item.unit || 'কেজি'}</span>
                         </div>
                         <div className="flex items-center gap-1 w-1/2 sm:w-1/3">
                           <input
                             type="number"
                             value={item.estimatedCostTaka}
                             onChange={e => {
                               const next = [...(editAnimal.structuredFeedPlan || [])];
                               next[idx].estimatedCostTaka = Number(e.target.value);
                               setEditAnimal({ ...editAnimal, structuredFeedPlan: next });
                             }}
                             className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs font-black text-amber-600 border-none font-mono text-center"
                             placeholder="খরচ (৳)"
                           />
                           <span className="text-[10px] font-bold text-slate-500">৳</span>
                         </div>
                         <button
                           type="button"
                           onClick={() => {
                             const next = (editAnimal.structuredFeedPlan || []).filter((_, i) => i !== idx);
                             setEditAnimal({ ...editAnimal, structuredFeedPlan: next });
                           }}
                           className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                         >
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                     ))}
                   </div>

                   <div className="flex items-center justify-between pt-1">
                     <button
                       type="button"
                       onClick={() => {
                         const current = editAnimal.structuredFeedPlan || [];
                         setEditAnimal({
                           ...editAnimal,
                           structuredFeedPlan: [...current, { name: 'নতুন খাদ্য উপাদান', targetAmountKg: 0.5, unit: 'কেজি', estimatedCostTaka: 25 }]
                         });
                       }}
                       className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                     >
                       <Plus className="w-3.5 h-3.5" /> উপাদান যোগ করুন
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         const def = getDefaultStructuredFeedPlan(editAnimal.type);
                         setEditAnimal({
                           ...editAnimal,
                           structuredFeedPlan: def.items,
                           dailyFeedBudget: def.dailyBudget,
                         });
                       }}
                       className="text-xs font-bold text-slate-500 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
                     >
                       <RotateCcw className="w-3.5 h-3.5" /> রিকমেন্ডেড উপাদান রিসেট
                     </button>
                   </div>
                 </div>
                 <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">ছবি পরিবর্তন</label>
                   <input type="file" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) handleImageFileUpload(e.target.files[0], (url) => setEditAnimal({ ...editAnimal, photoPlaceholder: url })); }} className="w-full text-xs text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
                 </div>
                 <div className="col-span-2 flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                   <button type="button" onClick={() => setEditAnimal(null)} className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs cursor-pointer">বাতিল</button>
                   <button type="submit" className="px-10 py-3 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-lg hover:bg-emerald-700 transition-all cursor-pointer">সংরক্ষণ করুন</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {(deleteTargetAnimal || deleteTargetEmployee || deleteTargetOrder) && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] max-w-sm w-full text-center space-y-6 shadow-2xl border border-red-500/20">
              <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 flex items-center justify-center text-3xl mx-auto"><Trash2 className="w-10 h-10" /></div>
              <div><h3 className="text-2xl font-black text-slate-900 dark:text-white">নিশ্চিত তো?</h3><p className="text-sm text-slate-500 mt-1">এই রেকর্ডটি স্থায়ীভাবে মুছে ফেলা হবে। এই অ্যাকশন আর ফিরিয়ে নেওয়া সম্ভব নয়।</p></div>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => { setDeleteTargetAnimal(null); setDeleteTargetEmployee(null); setDeleteTargetOrder(null); }} className="py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-black text-xs uppercase tracking-widest cursor-pointer">বাতিল</button>
                 <button onClick={() => { if (deleteTargetAnimal) handleConfirmDelete(); if (deleteTargetEmployee) handleDeleteEmployee(); if (deleteTargetOrder) farmStore.deleteOrder(deleteTargetOrder.id); setDeleteTargetAnimal(null); setDeleteTargetEmployee(null); setDeleteTargetOrder(null); }} className="py-4 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 cursor-pointer hover:bg-red-700 transition-all">মুছে ফেলুন</button>
              </div>
           </div>
        </div>
      )}

      {/* Modal: Public Sale Control */}
      {saleModalAnimal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl space-y-8">
              <div className="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-800"><div><h3 className="text-2xl font-black text-slate-900 dark:text-white">পাবলিক শপ কন্ট্রোল</h3><p className="text-xs text-slate-500">গ্রাহকের জন্য মূল্য নির্ধারণ করুন</p></div><button onClick={() => setSaleModalAnimal(null)} className="text-slate-400 hover:text-red-500 cursor-pointer"><X /></button></div>
              <div className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">পাবলিক বিক্রয়মূল্য (৳) *</label><input type="number" value={salePrice} onChange={e => setSalePrice(Number(e.target.value))} className="w-full p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-3xl text-emerald-600 focus:ring-2 focus:ring-emerald-500" required /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">পাবলিক বিবরণ</label><textarea rows={3} value={saleDescription} onChange={e => setSaleDescription(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-emerald-500" placeholder="কাস্টমারদের জন্য আকর্ষণীয় বিবরণ লিখুন..." /></div>
                <div className="flex justify-between items-center gap-4 pt-4">
                   {saleModalAnimal.isForSale && <button onClick={() => handleConfirmSaleListing(false)} className="px-6 py-4 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all cursor-pointer">শপ থেকে সরান</button>}
                   <button onClick={() => handleConfirmSaleListing(true)} className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all cursor-pointer">শপে আপডেট করুন</button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Modal: Feed Purchase / Stock Update */}
      {showFeedPurchaseModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-md w-full shadow-2xl space-y-8">
              <div className="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-800"><h3 className="text-2xl font-black text-slate-900 dark:text-white">{showFeedPurchaseModal.name} - মজুদ আপডেট</h3><button onClick={() => setShowFeedPurchaseModal(null)} className="text-slate-400 hover:text-red-500 cursor-pointer"><X /></button></div>
              <form onSubmit={handlePurchaseFeed} className="space-y-6">
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">পরিমাণ (কেজি)</label><input type="number" value={purchaseForm.amount} onChange={e => setPurchaseForm({ ...purchaseForm, amount: Number(e.target.value) })} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-xl" required /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">মোট খরচ (৳)</label><input type="number" value={purchaseForm.cost} onChange={e => setPurchaseForm({ ...purchaseForm, cost: Number(e.target.value) })} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-xl text-rose-600" required /></div>
                 <button type="submit" className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black shadow-xl hover:bg-emerald-700 transition-all cursor-pointer">মজুদ বাড়ান</button>
              </form>
           </div>
        </div>
      )}

      {/* Modal: Edit Profile */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-800"><h3 className="text-2xl font-black text-slate-900 dark:text-white">প্রোফাইল আপডেট</h3><button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-red-500 cursor-pointer"><X /></button></div>
              <form onSubmit={handleSaveProfile} className="grid grid-cols-2 gap-6">
                 <div className="col-span-2 sm:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">প্রতিষ্ঠানের নাম *</label><input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold" required /></div>
                 <div className="col-span-2 sm:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">ট্যাগলাইন</label><input type="text" value={profileForm.tagline} onChange={e => setProfileForm({ ...profileForm, tagline: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-medium" /></div>
                 <div className="col-span-2 sm:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">স্বত্বাধিকারী</label><input type="text" value={profileForm.proprietor} onChange={e => setProfileForm({ ...profileForm, proprietor: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold" /></div>
                 <div className="col-span-2 sm:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">মোবাইল নম্বর</label><input type="text" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-mono" /></div>
                 
                 <div className="col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800"><h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">পাবলিক হোমপেজ কাস্টমাইজেশন</h4></div>
                 
                 <div className="col-span-2 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Hero Title (প্রধান শিরোনাম)</label><input type="text" value={profileForm.heroTitle} onChange={e => setProfileForm({ ...profileForm, heroTitle: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm" /></div>
                 <div className="col-span-2 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Hero Subtitle (উপ-শিরোনাম)</label><textarea rows={2} value={profileForm.heroSubtitle} onChange={e => setProfileForm({ ...profileForm, heroSubtitle: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-xs" /></div>
                 
                 <div className="col-span-2 sm:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Mission Title</label><input type="text" value={profileForm.missionTitle} onChange={e => setProfileForm({ ...profileForm, missionTitle: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs" /></div>
                 <div className="col-span-2 sm:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Mission Text</label><textarea rows={2} value={profileForm.missionText} onChange={e => setProfileForm({ ...profileForm, missionText: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-[10px]" /></div>
                 
                 <div className="col-span-2 sm:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Feature 1 Title</label><input type="text" value={profileForm.feature1Title} onChange={e => setProfileForm({ ...profileForm, feature1Title: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs" /></div>
                 <div className="col-span-2 sm:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Feature 1 Text</label><input type="text" value={profileForm.feature1Text} onChange={e => setProfileForm({ ...profileForm, feature1Text: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-[10px]" /></div>
                 
                 <div className="col-span-2 sm:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Feature 2 Title</label><input type="text" value={profileForm.feature2Title} onChange={e => setProfileForm({ ...profileForm, feature2Title: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs" /></div>
                 <div className="col-span-2 sm:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Feature 2 Text</label><input type="text" value={profileForm.feature2Text} onChange={e => setProfileForm({ ...profileForm, feature2Text: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-[10px]" /></div>

                 <div className="col-span-2 sm:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Feature 3 Title</label><input type="text" value={profileForm.feature3Title} onChange={e => setProfileForm({ ...profileForm, feature3Title: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs" /></div>
                 <div className="col-span-2 sm:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Feature 3 Text</label><input type="text" value={profileForm.feature3Text} onChange={e => setProfileForm({ ...profileForm, feature3Text: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-[10px]" /></div>
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">লোগো পরিবর্তন</label>
                    <input type="file" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) handleImageFileUpload(e.target.files[0], (url) => setProfileForm({ ...profileForm, logo: url })); }} className="w-full text-xs text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
                 </div>
                 <div className="col-span-2 pt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowEditProfileModal(false)} className="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest cursor-pointer">বাতিল</button><button type="submit" className="px-10 py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all cursor-pointer">সংরক্ষণ করুন</button></div>
              </form>
           </div>
        </div>
      )}

      {/* Modal: Reset/Clear Profile */}
      {showResetProfileModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-white/20 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">প্রোফাইল রিসেট</h3>
              <button onClick={() => setShowResetProfileModal(false)} className="text-slate-400 hover:text-red-500 cursor-pointer"><X /></button>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">আপনি কি নিশ্চিতভাবে আপনার প্রতিষ্ঠানের লোগো এবং প্রোফাইল তথ্য রিসেট করতে চান? এটি পূর্বনির্ধারিত (Default) তথ্যে ফিরে যাবে।</p>
            <div className="flex flex-col gap-3 pt-4">
              <button onClick={handleResetProfile} className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all cursor-pointer">হ্যাঁ, রিসেট করুন</button>
            </div>
          </div>
        </div>
      )}

       {/* Modal: Automated Feeding Schedule & Confirmation */}
       {showFeedingScheduleModalAnimal && (() => {
         const animal = showFeedingScheduleModalAnimal;
         const schedule = getAutomatedFeedingSchedule(animal);

         return (
           <div className="fixed inset-0 z-[65] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-10 max-w-2xl w-full shadow-2xl border border-white/20 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                 <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-full border border-amber-200">
                         <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                         <span>বয়স ও প্রজাতি ভিত্তিক অটোর্যাশন অ্যালগরিদম</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">{animal.name} — খাদ্য শিডিউল</h3>
                      <p className="text-xs text-slate-500 font-medium">আইডি: [{animal.id}] · প্রজাতি: {animal.type} · বয়স: {animal.age}</p>
                    </div>
                    <button onClick={() => setShowFeedingScheduleModalAnimal(null)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                 </div>

                 {/* Age & Category Summary Banner */}
                 <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-xl bg-amber-500 text-white text-xs font-black">
                        {schedule.ageGroupLabel}
                      </span>
                      <span className="text-xs font-black text-amber-900 dark:text-amber-300 font-mono">
                        র‍্যাশন গুণক: {schedule.portionMultiplier}x
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      💡 <span className="font-bold">পুষ্টি নির্দেশিকা:</span> {schedule.rationGuidelines}
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                       <div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">মোট দৈনিক খাদ্য ওজন</span>
                         <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{schedule.totalDailyKg} <span className="text-xs">কেজি/দিন</span></p>
                       </div>
                       <div className="text-right">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">দৈনিক প্রাক্কলিত বাজেট</span>
                         <p className="text-2xl font-black text-emerald-600 font-mono">{schedule.recommendedDailyBudgetTaka} <span className="text-xs">৳/দিন</span></p>
                       </div>
                    </div>
                 </div>

                 {/* 3 Automated Time Slot Breakdown Cards */}
                 <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Clock className="w-4 h-4 text-emerald-600" />
                       <span>দৈনিক সময়ভিত্তিক র্যাশন বণ্টন (Time Slots Portion):</span>
                    </h4>

                    <div className="grid grid-cols-1 gap-4">
                       {schedule.timeSlots.map((slot, sIdx) => (
                         <div key={sIdx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                               <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                     {sIdx + 1}
                                  </span>
                                  <div>
                                     <h5 className="font-black text-sm text-slate-900 dark:text-white">{slot.timeLabel}</h5>
                                     <span className="text-[10px] text-slate-500 font-bold">দৈনিক পোর্েশনের {slot.portionPercentage}%</span>
                                  </div>
                               </div>
                               <button
                                 onClick={() => {
                                   farmStore.confirmFeedingForAnimal(animal.id, slot.slot);
                                   triggerToast(`${animal.name}-এর ${slot.slot} বেলার খাবার প্রদান সফলভাবে নিশ্চিত করা হয়েছে!`);
                                 }}
                                 className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                               >
                                 <Utensils className="w-3.5 h-3.5 text-white" />
                                 <span>{slot.slot} বেলার খাবার নিশ্চিত করুন</span>
                               </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                               {slot.items.map((it, iIdx) => (
                                 <div key={iIdx} className="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{it.name}</span>
                                    <span className="font-black text-emerald-600 font-mono">{it.targetAmount} {it.unit}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button onClick={() => setShowFeedingScheduleModalAnimal(null)} className="px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-800">বন্ধ করুন</button>
                 </div>
              </div>
           </div>
         );
       })()}

        {selectedProfileAnimal && (
          <AnimalProfileModal
            animal={selectedProfileAnimal}
            onClose={() => setSelectedProfileAnimal(null)}
            onUpdateAnimal={(updated) => {
              setLivestock(prev => prev.map(a => a.id === updated.id ? updated : a));
              setSelectedProfileAnimal(updated);
            }}
          />
        )}

        <QuickStartModal isOpen={showQuickStartModal} onClose={() => setShowQuickStartModal(false)} />
        <VoiceTourModal isOpen={showVoiceTourModal} onClose={() => setShowVoiceTourModal(false)} />

        {showVaccinationAlertModal && (
          <VaccinationAlertPopupModal
            healthLogs={healthLogs}
            livestock={livestock}
            onClose={() => setShowVaccinationAlertModal(false)}
            onNavigateToVaccine={() => setActiveTab('sector_health')}
          />
        )}
    </div>
  );
};
