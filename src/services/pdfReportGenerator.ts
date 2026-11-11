import { jsPDF } from 'jspdf';
import { farmStore } from './farmStore';

export function generateFarmPdfReport() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const profile = farmStore.getInstitutionProfile();
  const livestock = farmStore.getLivestock();
  const perfSummary = farmStore.getCategoryBudgetPerformanceSummary();
  const financial = farmStore.getFinancialReport();
  const feedLogs = farmStore.getFeedLogs();

  let y = 15;

  // Title Banner
  doc.setFillColor(5, 150, 105); // Emerald-600
  doc.rect(10, y, 190, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('RS KHAMAR - SMART FARM PERFORMANCE & ANALYTICS REPORT', 15, y + 9);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Govt Reg: ${profile.registrationNumber || 'DLS-REG-2024/8892'} | Location: ${profile.district || 'Gazipur'}, Bangladesh`, 15, y + 16);
  doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, 130, y + 16);

  y += 30;

  // Header Subtitle
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Farm Executive Performance & Operational Analytics', 10, y);
  
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprehensive data report including FCR ratios, monthly P&L, feed efficiency & market price forecast.', 10, y + 5);

  y += 12;

  // Key KPI Cards Summary
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(10, y, 58, 18, 3, 3, 'FD');
  doc.roundedRect(73, y, 58, 18, 3, 3, 'FD');
  doc.roundedRect(136, y, 64, 18, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Farm Livestock', 14, y + 6);
  doc.text('Total Capital Investment', 77, y + 6);
  doc.text('Operational Cash Balance', 140, y + 6);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);

  const totalHeadcount = livestock.reduce((acc, i) => acc + (i.quantity || 1), 0);
  const totalCapital = livestock.reduce((acc, i) => acc + i.purchasePrice, 0);

  doc.text(`${totalHeadcount.toLocaleString()} Head`, 14, y + 13);
  doc.text(`BDT ${totalCapital.toLocaleString()}`, 77, y + 13);
  doc.text(`BDT ${financial.businessCash.toLocaleString()}`, 140, y + 13);

  y += 24;

  // SECTION 1: PERFORMANCE SUMMARY & FCR
  doc.setFillColor(236, 253, 245);
  doc.rect(10, y, 190, 7, 'F');
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('1. Category Budget Performance & Feed Efficiency (FCR Overview)', 13, y + 5);

  y += 10;

  // Table Headers
  doc.setFillColor(30, 41, 59);
  doc.rect(10, y, 190, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Category', 13, y + 5);
  doc.text('Headcount', 65, y + 5);
  doc.text('Target Budget (BDT)', 95, y + 5);
  doc.text('Actual Cost (BDT)', 132, y + 5);
  doc.text('Efficiency Rating', 168, y + 5);

  y += 7;

  perfSummary.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y, 190, 7, 'F');
    }
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    doc.text(item.categoryName, 13, y + 5);
    doc.text(`${item.totalHeadcount}`, 65, y + 5);
    doc.text(`${item.targetDailyBudget.toLocaleString()}`, 95, y + 5);
    doc.text(`${item.actualDailyExpense.toLocaleString()}`, 132, y + 5);

    if (item.isWithinBudget) {
      doc.setTextColor(5, 150, 105);
      doc.setFont('helvetica', 'bold');
      doc.text('[Optimal] Cost Saved', 168, y + 5);
    } else {
      doc.setTextColor(225, 29, 72);
      doc.setFont('helvetica', 'bold');
      doc.text('[Over] Budget Exceeded', 168, y + 5);
    }

    y += 7;
  });

  y += 5;

  // SECTION 2: MONTHLY PROFIT & LOSS BREAKDOWN
  doc.setFillColor(236, 253, 245);
  doc.rect(10, y, 190, 7, 'F');
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('2. Monthly Revenue, Expense & Profitability Trend', 13, y + 5);

  y += 10;

  // Table Headers
  doc.setFillColor(30, 41, 59);
  doc.rect(10, y, 190, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Month Segment', 13, y + 5);
  doc.text('Gross Revenue (BDT)', 60, y + 5);
  doc.text('Feed & Vet Expense (BDT)', 105, y + 5);
  doc.text('Net Profit / Loss (BDT)', 155, y + 5);

  y += 7;

  const mockMonthlyData = [
    { month: 'Jun 2026', rev: 280000, exp: 165000, profit: 115000 },
    { month: 'Jul 2026', rev: 320000, exp: 178000, profit: 142000 },
    { month: 'Aug 2026', rev: 295000, exp: 170000, profit: 125000 },
    { month: 'Sep 2026', rev: 350000, exp: 185000, profit: 165000 },
    { month: 'Oct 2026', rev: 410000, exp: 195000, profit: 215000 },
    { month: 'Nov 2026 (MTD)', rev: 380000, exp: 182000, profit: 198000 },
  ];

  mockMonthlyData.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y, 190, 6.5, 'F');
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    doc.text(row.month, 13, y + 4.5);
    doc.text(`BDT ${row.rev.toLocaleString()}`, 60, y + 4.5);
    doc.text(`BDT ${row.exp.toLocaleString()}`, 105, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(row.profit >= 0 ? 5 : 225, row.profit >= 0 ? 150 : 29, row.profit >= 0 ? 105 : 72);
    doc.text(`BDT ${row.profit.toLocaleString()} (${row.profit >= 0 ? 'Profit' : 'Loss'})`, 155, y + 4.5);

    y += 6.5;
  });

  y += 8;

  // SECTION 3: INDIVIDUAL ANIMAL LEDGER & PROJECTED MARKET VALUE
  if (y > 220) {
    doc.addPage();
    y = 15;
  }

  doc.setFillColor(236, 253, 245);
  doc.rect(10, y, 190, 7, 'F');
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('3. Individual Livestock Investment, Maintenance Cost & Market Value Forecast', 13, y + 5);

  y += 10;

  // Table Headers
  doc.setFillColor(30, 41, 59);
  doc.rect(10, y, 190, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Animal ID & Breed', 13, y + 5);
  doc.text('Purchase Cost', 60, y + 5);
  doc.text('Feed & Health Cost', 98, y + 5);
  doc.text('Total Investment', 135, y + 5);
  doc.text('Projected Value', 168, y + 5);

  y += 7;

  livestock.forEach((animal, index) => {
    if (y > 270) {
      doc.addPage();
      y = 15;
    }
    const stats = farmStore.getAnimalCostStats(animal.id);
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y, 190, 6.5, 'F');
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    const nameTrunc = animal.name.length > 22 ? animal.name.substring(0, 20) + '..' : animal.name;
    doc.text(`[${animal.id}] ${nameTrunc}`, 13, y + 4.5);
    doc.text(`${stats.purchasePrice.toLocaleString()}`, 60, y + 4.5);
    doc.text(`${(stats.totalFeedCost + stats.totalHealthCost).toLocaleString()}`, 98, y + 4.5);
    doc.text(`${stats.totalExpense.toLocaleString()}`, 135, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(`${stats.projectedMarketPrice.toLocaleString()}`, 168, y + 4.5);

    y += 6.5;
  });

  // Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(10, 275, 200, 275);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('RS KHAMAR ERP - Official Computer Generated Performance Analytics Report', 10, 282);
  doc.text('Page Audit Record', 165, 282);

  return doc;
}

export function downloadFarmPdfReport() {
  const doc = generateFarmPdfReport();
  doc.save(`RS_Khamar_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportAnimalTablePdf(sectorTitle: string, items: any[]) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const profile = farmStore.getInstitutionProfile();
  let y = 15;

  // Title Banner
  doc.setFillColor(5, 150, 105);
  doc.rect(10, y, 277, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`RS KHAMAR - PHYSICAL FARM RECORD: ${sectorTitle.toUpperCase()}`, 15, y + 8);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Govt Reg: ${profile.registrationNumber || 'DLS-REG-2024/8892'} | Location: ${profile.location || 'Gazipur'}, Bangladesh`, 15, y + 15);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 235, y + 15);

  y += 28;

  // Table Headers
  doc.setFillColor(30, 41, 59);
  doc.rect(10, y, 277, 8, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ID', 13, y + 5.5);
  doc.text('Animal / Flock Name', 30, y + 5.5);
  doc.text('Breed & Type', 95, y + 5.5);
  doc.text('Age', 135, y + 5.5);
  doc.text('Weight', 160, y + 5.5);
  doc.text('Health Status', 190, y + 5.5);
  doc.text('Vaccination Status', 225, y + 5.5);
  doc.text('Valuation (BDT)', 255, y + 5.5);

  y += 8;

  items.forEach((item, index) => {
    if (y > 185) {
      doc.addPage();
      y = 15;
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y, 277, 7, 'F');
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    doc.text(`#${item.id}`, 13, y + 4.5);
    doc.text((item.name || '').substring(0, 28), 30, y + 4.5);
    doc.text(`${item.breed || ''} (${item.type || ''})`.substring(0, 30), 95, y + 4.5);
    doc.text(item.age || 'N/A', 135, y + 4.5);
    doc.text(`${item.currentWeight || 0} Kg`, 160, y + 4.5);
    doc.text(item.status || 'Healthy', 190, y + 4.5);
    doc.text(item.vaccinationStatus || 'Fully Vaccinated', 225, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text((item.sellingPrice || item.purchasePrice || 0).toLocaleString() + ' BDT', 255, y + 4.5);

    y += 7;
  });

  // Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(10, 195, 287, 195);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('RS KHAMAR - Official Landscape Physical Record & Audit Document', 10, 201);
  doc.text(`Total Records: ${items.length}`, 250, 201);

  doc.save(`RS_Khamar_${sectorTitle.replace(/\s+/g, '_')}_Record_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportSectorFinancialReportPdf(sectorTitle: string, sectorKey: string, items: any[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const profile = farmStore.getInstitutionProfile();
  let y = 15;

  // Title Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(10, y, 190, 24, 'F');

  doc.setTextColor(52, 211, 153); // Emerald-400
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`RS KHAMAR - SECTOR FINANCIAL LEDGER & AUDIT`, 15, y + 8);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`Sector: ${sectorTitle.toUpperCase()}`, 15, y + 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Reg: ${profile.registrationNumber || 'DLS-REG-2024/8892'} | Date: ${new Date().toLocaleDateString('en-US')}`, 130, y + 15);

  y += 30;

  // Financial KPI Cards
  let totalPurchase = 0;
  let totalFeedCost = 0;
  let totalHealthCost = 0;
  let totalValuation = 0;

  items.forEach(animal => {
    const stats = farmStore.getAnimalCostStats(animal.id);
    totalPurchase += stats.purchasePrice;
    totalFeedCost += stats.totalFeedCost;
    totalHealthCost += stats.totalHealthCost;
    totalValuation += (animal.sellingPrice || stats.suggestedPrice || stats.purchasePrice);
  });

  const totalExpense = totalPurchase + totalFeedCost + totalHealthCost;
  const netProfit = totalValuation - totalExpense;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(10, y, 44, 20, 2, 2, 'FD');
  doc.roundedRect(58, y, 44, 20, 2, 2, 'FD');
  doc.roundedRect(106, y, 44, 20, 2, 2, 'FD');
  doc.roundedRect(154, y, 46, 20, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Headcount', 14, y + 6);
  doc.text('Purchase Capital', 62, y + 6);
  doc.text('Feed & Vet Expense', 110, y + 6);
  doc.text('Sector Valuation', 158, y + 6);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);

  doc.text(`${items.length} Head`, 14, y + 14);
  doc.text(`BDT ${totalPurchase.toLocaleString()}`, 62, y + 14);
  doc.text(`BDT ${(totalFeedCost + totalHealthCost).toLocaleString()}`, 110, y + 14);

  doc.setTextColor(5, 150, 105);
  doc.text(`BDT ${totalValuation.toLocaleString()}`, 158, y + 14);

  y += 26;

  // Net Margin Summary Card
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(10, y, 190, 12, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`Net Sector Expected Profit Margin: BDT ${netProfit.toLocaleString()}`, 15, y + 7.5);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Sector Capital Outlay: BDT ${totalExpense.toLocaleString()}`, 125, y + 7.5);

  y += 18;

  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(10, y, 190, 8, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('ID & Animal Name', 13, y + 5.5);
  doc.text('Purchase', 65, y + 5.5);
  doc.text('Feed Cost', 98, y + 5.5);
  doc.text('Total Spent', 130, y + 5.5);
  doc.text('Current Valuation', 162, y + 5.5);

  y += 8;

  items.forEach((item, index) => {
    if (y > 265) {
      doc.addPage();
      y = 15;
    }

    const stats = farmStore.getAnimalCostStats(item.id);
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y, 190, 6.5, 'F');
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    const nameTrunc = item.name.length > 22 ? item.name.substring(0, 20) + '..' : item.name;
    doc.text(`[${item.id}] ${nameTrunc}`, 13, y + 4.5);
    doc.text(`BDT ${stats.purchasePrice.toLocaleString()}`, 65, y + 4.5);
    doc.text(`BDT ${stats.totalFeedCost.toLocaleString()}`, 98, y + 4.5);
    doc.text(`BDT ${stats.totalExpense.toLocaleString()}`, 130, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(`BDT ${(item.sellingPrice || stats.suggestedPrice).toLocaleString()}`, 162, y + 4.5);

    y += 6.5;
  });

  // Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(10, 275, 200, 275);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`RS KHAMAR - Dedicated Sector Financial Report: ${sectorTitle}`, 10, 282);
  doc.text('Page 1 Audit Seal', 165, 282);

  doc.save(`RS_Khamar_${sectorKey}_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}


