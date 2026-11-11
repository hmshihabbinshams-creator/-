import { LivestockItem } from '../types';

export interface EnvironmentalSensorData {
  id: string;
  buildingName: string;
  speciesType: string;
  temperatureC: number;
  humidityPercent: number;
  ammoniaPpm: number;
  fanStatus: 'Active (স্বাভাবিক)' | 'High Speed (উচ্চগতি)' | 'Optimal (আদর্শ)';
  status: 'Optimal' | 'Warning' | 'Alert';
  lastReadingTime: string;
}

export const INITIAL_ENVIRONMENTAL_SENSORS: EnvironmentalSensorData[] = [
  {
    id: 'ENV-101',
    buildingName: 'কেন্দ্রীয় গোশালা কমপ্লেক্স',
    speciesType: 'গরু (Cattle)',
    temperatureC: 25.4,
    humidityPercent: 62,
    ammoniaPpm: 8,
    fanStatus: 'Active (স্বাভাবিক)',
    status: 'Optimal',
    lastReadingTime: 'আজ ১০:১৫ মিনিট'
  },
  {
    id: 'ENV-102',
    buildingName: 'যমুনাপারি ছাগল শেড',
    speciesType: 'ছাগল (Goat)',
    temperatureC: 26.1,
    humidityPercent: 58,
    ammoniaPpm: 11,
    fanStatus: 'Optimal (আদর্শ)',
    status: 'Optimal',
    lastReadingTime: 'আজ ১০:১৪ মিনিট'
  },
  {
    id: 'ENV-103',
    buildingName: 'পদ্মপুকুর সংলগ্ন হাঁস শেড',
    speciesType: 'হাঁস (Duck)',
    temperatureC: 24.8,
    humidityPercent: 71,
    ammoniaPpm: 14,
    fanStatus: 'Active (স্বাভাবিক)',
    status: 'Optimal',
    lastReadingTime: 'আজ ১০:১৬ মিনিট'
  },
  {
    id: 'ENV-104',
    buildingName: 'সোনালী মুরগি লেয়ার হাউজ',
    speciesType: 'মুরগি (Chicken)',
    temperatureC: 27.8,
    humidityPercent: 65,
    ammoniaPpm: 19,
    fanStatus: 'High Speed (উচ্চগতি)',
    status: 'Warning',
    lastReadingTime: 'আজ ১০:১২ মিনিট'
  },
  {
    id: 'ENV-105',
    buildingName: 'হাই-টেক পাখি কেজ ইউনিট',
    speciesType: 'পাখি (Birds)',
    temperatureC: 28.3,
    humidityPercent: 60,
    ammoniaPpm: 9,
    fanStatus: 'Optimal (আদর্শ)',
    status: 'Optimal',
    lastReadingTime: 'আজ ১০:১৫ মিনিট'
  }
];
export const exportLivestockCsv = (livestock: LivestockItem[]) => {
  const headers = [
    'ID', 'Name', 'Type', 'Breed', 'Age', 'Quantity', 
    'Purchase Date', 'Purchase Price (৳)', 'Initial Weight (kg)', 
    'Current Weight (kg)', 'Target Weight (kg)', 'Health Status', 
    'Selling Price (৳)', 'Status'
  ];

  const rows = livestock.map(item => [
    item.id,
    item.name,
    item.type,
    item.breed,
    item.age,
    item.quantity,
    item.purchaseDate,
    item.purchasePrice,
    item.initialWeight,
    item.currentWeight,
    item.targetWeight || '',
    item.healthStatus,
    item.sellingPrice || '',
    item.status
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `livestock_database_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportGrowthAndEnvCsv = (livestock: LivestockItem[]) => {
  // Existing functionality or placeholder for consistency
  console.log('Exporting growth and env data...');
};
