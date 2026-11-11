import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { LivestockItem, GrowthCheckpoint } from '../types';
import { 
  TrendingUp, Calendar, Award, Target, Scale, Clock, Sparkles, 
  ChevronRight, CheckCircle2, BarChart3, LineChart as LineChartIcon,
  BrainCircuit, Zap, ArrowUpRight
} from 'lucide-react';
import { DateRangeState } from './DateRangeFilter';

interface LivestockGrowthChartProps {
  livestock: LivestockItem[];
  selectedAnimalId?: string;
  onSelectAnimal?: (id: string) => void;
  dateRange?: DateRangeState;
}

export const LivestockGrowthChart: React.FC<LivestockGrowthChartProps> = ({
  livestock,
  selectedAnimalId,
  onSelectAnimal,
  dateRange,
}) => {
  // Filter animals that are in farm
  const activeAnimals = useMemo(() => {
    return livestock.filter(item => item.status !== 'বিক্রিত (Sold)');
  }, [livestock]);

  const [currentId, setCurrentId] = useState<string>(
    selectedAnimalId || (activeAnimals.length > 0 ? activeAnimals[0].id : '')
  );

  const [viewEngine, setViewEngine] = useState<'recharts' | 'd3'>('recharts');

  useEffect(() => {
    if (selectedAnimalId && selectedAnimalId !== currentId) {
      setCurrentId(selectedAnimalId);
    }
  }, [selectedAnimalId]);

  const currentAnimal = useMemo(() => {
    return livestock.find(a => a.id === currentId) || activeAnimals[0] || null;
  }, [currentId, livestock, activeAnimals]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    visible: boolean;
    point: GrowthCheckpoint | null;
  }>({ x: 0, y: 0, visible: false, point: null });

  // Generate growth checkpoints if none exists
  const growthData: GrowthCheckpoint[] = useMemo(() => {
    if (!currentAnimal) return [];
    if (currentAnimal.growthHistory && currentAnimal.growthHistory.length > 0) {
      return currentAnimal.growthHistory;
    }

    // Dynamic fallback generation based on initial and current weight
    const initialW = currentAnimal.initialWeight || 30;
    const currentW = currentAnimal.currentWeight || 45;
    const targetW = currentAnimal.targetWeight || Math.round(currentW * 1.25);

    const points: GrowthCheckpoint[] = [
      { month: 0, days: 0, date: currentAnimal.purchaseDate || '2026-01-01', weightKg: initialW, targetExpectedKg: initialW, notes: 'ক্রয়কালীন প্রারম্ভিক পরিমাপ' },
      { month: 1, days: 30, date: '2026-02-01', weightKg: Math.round(initialW + (currentW - initialW) * 0.35), targetExpectedKg: Math.round(initialW + (targetW - initialW) * 0.2), notes: 'প্রথম মাসের পর্যবেক্ষণ' },
      { month: 2, days: 60, date: '2026-03-01', weightKg: Math.round(initialW + (currentW - initialW) * 0.7), targetExpectedKg: Math.round(initialW + (targetW - initialW) * 0.45), notes: 'নিয়মিত সুষম পুষ্টি' },
      { month: 3, days: 90, date: '2026-04-01', weightKg: currentW, targetExpectedKg: Math.round(initialW + (targetW - initialW) * 0.65), notes: 'বর্তমান ওজন রেকর্ড' },
    ];
    return points;
  }, [currentAnimal]);

  // Derived Analytics Metrics
  const targetMonths = currentAnimal?.targetRearingMonths || 6;
  const initialWeight = currentAnimal?.initialWeight || (growthData[0]?.weightKg ?? 30);
  const currentWeight = currentAnimal?.currentWeight || (growthData[growthData.length - 1]?.weightKg ?? 45);
  const targetWeight = currentAnimal?.targetWeight || Math.round(currentWeight * 1.2);
  
  // Elapsed time (months from growth checkpoints)
  const currentMonthElapsed = growthData.length > 0 ? growthData[growthData.length - 1].month : 3;
  const timeProgressPercent = Math.min(100, Math.round((currentMonthElapsed / targetMonths) * 100));
  const totalWeightGain = Math.max(0, currentWeight - initialWeight);
  const expectedTotalGain = Math.max(1, targetWeight - initialWeight);
  const weightProgressPercent = Math.min(100, Math.round((totalWeightGain / expectedTotalGain) * 100));

  // Average Daily Gain (ADG)
  const totalDays = growthData.length > 0 ? growthData[growthData.length - 1].days : 90;
  const adgGrams = totalDays > 0 ? Math.round(((currentWeight - initialWeight) * 1000) / totalDays) : 0;
  const isAheadOfTarget = currentWeight >= (growthData[growthData.length - 1]?.targetExpectedKg || currentWeight);

  // -------------------------------------------------------------
  // Linear Regression Calculation Algorithm
  // Y = m * X + C (Where X = Month, Y = Weight in Kg)
  // -------------------------------------------------------------
  const regressionMetrics = useMemo(() => {
    if (!growthData || growthData.length === 0) {
      return { slope: 0, intercept: 0, rSquared: 0, predictedTargetWeight: 0, adgGramsPerDay: 0, equationStr: 'Y = 0X + 0' };
    }

    const n = growthData.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;

    growthData.forEach(pt => {
      const x = pt.month;
      const y = pt.weightKg;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
      sumYY += y * y;
    });

    const meanX = sumX / n;
    const meanY = sumY / n;

    const denominator = sumXX - (sumX * sumX) / n;
    let slope = denominator !== 0 ? (sumXY - (sumX * sumY) / n) / denominator : 0;
    let intercept = meanY - slope * meanX;

    if (n === 1 || denominator === 0) {
      slope = (targetWeight - initialWeight) / Math.max(1, targetMonths);
      intercept = initialWeight;
    }

    // R-squared (Coefficient of Determination)
    let sst = 0;
    let ssr = 0;
    growthData.forEach(pt => {
      const y = pt.weightKg;
      const yPred = slope * pt.month + intercept;
      sst += Math.pow(y - meanY, 2);
      ssr += Math.pow(y - yPred, 2);
    });

    const rSquared = sst > 0 ? Math.max(0, Math.min(1, 1 - ssr / sst)) : 1;
    const predictedTargetWeight = Math.max(0, Math.round((slope * targetMonths + intercept) * 10) / 10);
    const adgGramsPerDay = Math.round((slope / 30) * 1000);

    const sign = intercept >= 0 ? '+' : '-';
    const equationStr = `Y = ${slope.toFixed(2)}X ${sign} ${Math.abs(intercept).toFixed(1)}`;

    return {
      slope: Number(slope.toFixed(2)),
      intercept: Number(intercept.toFixed(1)),
      rSquared: Math.round(rSquared * 100),
      predictedTargetWeight,
      adgGramsPerDay,
      equationStr,
    };
  }, [growthData, targetMonths, targetWeight, initialWeight]);

  // Combined Chart Dataset for Recharts
  const rechartsData = useMemo(() => {
    const maxMonth = Math.max(targetMonths, growthData[growthData.length - 1]?.month || 3);
    const points = [];

    const historyMap = new Map<number, GrowthCheckpoint>();
    growthData.forEach(pt => historyMap.set(pt.month, pt));

    for (let m = 0; m <= maxMonth; m++) {
      const checkpoint = historyMap.get(m);
      const isFuture = m > (growthData[growthData.length - 1]?.month || 0);

      // Ideal Target Trajectory
      const targetExpected = Math.round(
        initialWeight + ((targetWeight - initialWeight) * (m / Math.max(1, targetMonths)))
      );

      // Linear Regression Prediction: Y = m * m + C
      const predWeight = Math.max(0, Math.round((regressionMetrics.slope * m + regressionMetrics.intercept) * 10) / 10);

      points.push({
        month: m,
        monthLabel: m === 0 ? '০ (প্রারম্ভিক)' : m === targetMonths ? `${m}ম (টার্গেট)` : isFuture ? `${m}ম (পূর্বাভাস)` : `${m}ম মাস`,
        actualWeight: checkpoint ? checkpoint.weightKg : null,
        targetWeight: checkpoint ? checkpoint.targetExpectedKg : targetExpected,
        predictedWeight: predWeight,
        isFuture,
        date: checkpoint?.date,
        notes: checkpoint?.notes || (isFuture ? 'লিনিয়ার রিগ্রেশন মডেল ভিত্তিক ওজন ট্রেন্ড' : undefined)
      });
    }

    return points;
  }, [growthData, targetMonths, targetWeight, initialWeight, regressionMetrics]);

  // D3 Rendering Hook
  useEffect(() => {
    if (viewEngine !== 'd3') return;
    if (!svgRef.current || !containerRef.current || growthData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 720;
    const height = 360;
    const margin = { top: 30, right: 40, bottom: 45, left: 55 };
    const width = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const defs = svg.append('defs');

    // Emerald Target Area Gradient
    const targetGradient = defs
      .append('linearGradient')
      .attr('id', 'target-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    targetGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.28);

    targetGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.0);

    // Actual Growth Area Gradient
    const actualGradient = defs
      .append('linearGradient')
      .attr('id', 'actual-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    actualGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f59e0b')
      .attr('stop-opacity', 0.35);

    actualGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f59e0b')
      .attr('stop-opacity', 0.02);

    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow');
    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Scales
    const maxMonth = Math.max(targetMonths, growthData[growthData.length - 1].month);
    const xScale = d3
      .scaleLinear()
      .domain([0, maxMonth])
      .range([0, width]);

    const maxWeight = Math.max(
      targetWeight,
      d3.max(growthData, d => Math.max(d.weightKg, d.targetExpectedKg)) || targetWeight
    ) * 1.1;

    const minWeight = Math.max(0, Math.min(
      initialWeight * 0.85,
      d3.min(growthData, d => d.weightKg) || initialWeight
    ));

    const yScale = d3
      .scaleLinear()
      .domain([minWeight, maxWeight])
      .range([innerHeight, 0])
      .nice();

    // Gridlines
    const yGrid = d3
      .axisLeft(yScale)
      .tickSize(-width)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', '3 3');

    g.select('.grid .domain').remove();

    // Target Curve & Area
    const targetTrajectory = [
      { month: 0, weightKg: initialWeight },
      ...growthData.map(d => ({ month: d.month, weightKg: d.targetExpectedKg })),
      { month: targetMonths, weightKg: targetWeight },
    ];
    const uniqueTargetTrajectory = Array.from(
      new Map(targetTrajectory.map(item => [item.month, item])).values()
    ).sort((a, b) => a.month - b.month);

    const targetLine = d3
      .line<{ month: number; weightKg: number }>()
      .x(d => xScale(d.month))
      .y(d => yScale(d.weightKg))
      .curve(d3.curveMonotoneX);

    const targetArea = d3
      .area<{ month: number; weightKg: number }>()
      .x(d => xScale(d.month))
      .y0(innerHeight)
      .y1(d => yScale(d.weightKg))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(uniqueTargetTrajectory)
      .attr('fill', 'url(#target-area-gradient)')
      .attr('d', targetArea);

    g.append('path')
      .datum(uniqueTargetTrajectory)
      .attr('fill', 'none')
      .attr('stroke', '#059669')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '6 4')
      .attr('d', targetLine);

    // Actual Growth Curve & Area
    const actualArea = d3
      .area<GrowthCheckpoint>()
      .x(d => xScale(d.month))
      .y0(innerHeight)
      .y1(d => yScale(d.weightKg))
      .curve(d3.curveMonotoneX);

    const actualLine = d3
      .line<GrowthCheckpoint>()
      .x(d => xScale(d.month))
      .y(d => yScale(d.weightKg))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(growthData)
      .attr('fill', 'url(#actual-area-gradient)')
      .attr('d', actualArea);

    g.append('path')
      .datum(growthData)
      .attr('fill', 'none')
      .attr('stroke', '#d97706')
      .attr('stroke-width', 3.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', actualLine);

    // Target Milestone Marker
    const targetX = xScale(targetMonths);
    const targetY = yScale(targetWeight);

    const milestoneGroup = g.append('g').attr('transform', `translate(${targetX}, 0)`);

    milestoneGroup
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#006a4e')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 4')
      .attr('stroke-opacity', 0.85);

    g.append('circle')
      .attr('cx', targetX)
      .attr('cy', targetY)
      .attr('r', 7)
      .attr('fill', '#006a4e')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#glow)');

    g.append('text')
      .attr('x', targetX)
      .attr('y', targetY - 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('fill', '#006a4e')
      .text(`টার্গেট: ${targetWeight} কেজি (${targetMonths} মাস)`);

    // Interactive Checkpoint Nodes
    const nodes = g
      .selectAll('.growth-node')
      .data(growthData)
      .enter()
      .append('g')
      .attr('class', 'growth-node')
      .attr('transform', d => `translate(${xScale(d.month)},${yScale(d.weightKg)})`);

    nodes
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#f59e0b')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#glow)')
      .attr('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 9)
          .attr('fill', '#b45309');

        const [mX, mY] = d3.pointer(event, containerRef.current);
        setTooltipData({
          x: mX,
          y: mY,
          visible: true,
          point: d,
        });
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 6)
          .attr('fill', '#f59e0b');

        setTooltipData(prev => ({ ...prev, visible: false }));
      });

    const lastPoint = growthData[growthData.length - 1];
    if (lastPoint) {
      g.append('text')
        .attr('x', xScale(lastPoint.month) + 10)
        .attr('y', yScale(lastPoint.weightKg) + 4)
        .attr('font-size', '11px')
        .attr('font-weight', '800')
        .attr('fill', '#b45309')
        .text(`বর্তমান: ${lastPoint.weightKg} কেজি`);
    }

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(maxMonth, 10))
      .tickFormat(d => `${d} মাস`);

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', '#cbd5e1');
    xAxisGroup.selectAll('text').attr('font-size', '11px').attr('fill', '#64748b').attr('font-weight', '600');

    g.append('text')
      .attr('x', width / 2)
      .attr('y', innerHeight + 36)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('fill', '#475569')
      .text('পালনকাল সময়রেখা (Rearing Duration / Months)');

    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d} কেজি`);

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.select('.domain').attr('stroke', '#cbd5e1');
    yAxisGroup.selectAll('text').attr('font-size', '11px').attr('fill', '#64748b').attr('font-weight', '600');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('fill', '#475569')
      .text('ওজন (Weight / kg)');

  }, [viewEngine, growthData, targetMonths, targetWeight, initialWeight, currentWeight]);

  if (!currentAnimal) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-stone-200">
        <p className="text-sm font-bold text-slate-500">কোনো পশু বা পালের ডাটা পাওয়া যায়নি।</p>
      </div>
    );
  }

  // Custom Recharts Tooltip
  const CustomRechartsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 max-w-xs space-y-2">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5 font-black">
            <span className="text-amber-400">{data.monthLabel}</span>
            <span className="text-[10px] text-slate-400 font-mono">{data.date || `Month ${data.month}`}</span>
          </div>

          <div className="space-y-1">
            {data.actualWeight !== null && (
              <div className="flex justify-between gap-4">
                <span className="text-amber-300 font-bold">পরিমাপকৃত ওজন:</span>
                <span className="font-extrabold text-white font-mono">{data.actualWeight} কেজি</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-emerald-400 font-bold">আদর্শ টার্গেট:</span>
              <span className="font-extrabold text-emerald-300 font-mono">{data.targetWeight} কেজি</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-purple-400 font-bold">লিনিয়ার রিগ্রেশন পূর্বাভাস:</span>
              <span className="font-extrabold text-purple-300 font-mono">{data.predictedWeight} কেজি</span>
            </div>
            {data.notes && (
              <p className="text-[10px] text-slate-300 italic pt-1 border-t border-slate-800">
                {data.notes}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-purple-600" />

      {/* Header, Switcher and Animal Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recharts + D3 ভিজ্যুয়াল অ্যান্ড রিগ্রেশন অ্যানালিটিক্স</span>
            </span>
            {dateRange && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                {dateRange.labelBn}
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>পশুর শারীরিক বৃদ্ধি ও লিনিয়ার রিগ্রেশন প্রেডিক্টিভ ট্রেন্ড</span>
          </h3>
        </div>

        {/* Engine Toggle & Animal Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Engine Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setViewEngine('recharts')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewEngine === 'recharts'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recharts (প্রেডিক্টিভ)</span>
            </button>
            <button
              onClick={() => setViewEngine('d3')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewEngine === 'd3'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>D3 (ইন্টারঅ্যাক্টিভ)</span>
            </button>
          </div>

          {/* Animal Dropdown Selector */}
          <select
            value={currentAnimal.id}
            onChange={e => {
              setCurrentId(e.target.value);
              if (onSelectAnimal) onSelectAnimal(e.target.value);
            }}
            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {activeAnimals.map(animal => (
              <option key={animal.id} value={animal.id}>
                [{animal.id}] {animal.name} - {animal.type.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Benchmark Stats Cards & Linear Regression Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1: Time Elapsed */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">পালন সময়</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {currentMonthElapsed}
            </span>
            <span className="text-xs font-bold text-slate-500">/ {targetMonths} মাস</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${timeProgressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-1">{timeProgressPercent}% সময় অতিবাহিত</p>
        </div>

        {/* Metric 2: Current vs Target Weight */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">ওজন অর্জন</span>
            <Scale className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {currentWeight}
            </span>
            <span className="text-xs font-bold text-slate-500">/ {targetWeight} কেজি</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${weightProgressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-1">
            +{totalWeightGain.toFixed(1)} কেজি মোট বৃদ্ধি ({weightProgressPercent}%)
          </p>
        </div>

        {/* Metric 3: Linear Regression Predicted Target Weight */}
        <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-1">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-300">
            <span className="text-[11px] font-black uppercase tracking-wider">রিগ্রেশন পূর্বাভাস</span>
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-purple-700 dark:text-purple-300 tabular-nums">
              {regressionMetrics.predictedTargetWeight}
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">কেজি (লক্ষ্য {targetWeight})</span>
          </div>
          <p className="text-[10px] text-purple-700 dark:text-purple-300 font-bold pt-1 flex items-center gap-1">
            <span>মডেল অ্যাকুরেসি R²: {regressionMetrics.rSquared}%</span>
          </p>
        </div>

        {/* Metric 4: Daily Gain Rate (ADG) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">দৈনিক প্রবৃদ্ধি (ADG)</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {adgGrams >= 1000 ? `${(adgGrams / 1000).toFixed(2)} কেজি` : `${adgGrams} গ্রাম`}
            </span>
            <span className="text-xs font-bold text-slate-500">/দিন</span>
          </div>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black pt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{isAheadOfTarget ? '🚀 টার্গেটের চেয়ে দ্রুত প্রবৃদ্ধি' : 'সুস্থ স্বাভাবিক বৃদ্ধি'}</span>
          </p>
        </div>
      </div>

      {/* Linear Regression Formula Info Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/90 via-indigo-950 to-slate-900 text-white border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">লিনিয়ার রিগ্রেশন গণিত এলগোরিদম</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white font-mono font-black text-[9px]">
                {regressionMetrics.equationStr}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-300 mt-0.5">
              ঐতিহাসিক ওজন বৃদ্ধির হারের উপর ভিত্তি করে সরলরেখিক রিগ্রেশন (Linear Regression Equation) পদ্ধতিতে আগামী মাসগুলোর গ্রোথ অনুমান।
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-purple-300 font-bold block">দৈনিক প্রত্যাশিত স্লোপ</span>
          <span className="text-sm font-black font-mono text-amber-300">
            +{regressionMetrics.slope} কেজি/মাস (+{(regressionMetrics.slope / 30).toFixed(3)} কেজি/দিন)
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      {viewEngine === 'recharts' ? (
        <div className="w-full bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
            <span>Recharts Composed Trend Chart (পরিমাপকৃত ওজন vs টার্গেট vs লিনিয়ার রিগ্রেশন)</span>
            <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">-- 💜 ড্যাশড লাইন = প্রেডিকশন</span>
          </div>

          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rechartsData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                <defs>
                  <linearGradient id="rechartsActualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="monthLabel" 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  dy={8}
                />
                <YAxis 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  unit=" kg"
                />
                <Tooltip content={<CustomRechartsTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: '700' }}
                />
                
                {/* 1. Shaded Area & Line for Actual Measured Weight */}
                <Area 
                  type="monotone" 
                  dataKey="actualWeight" 
                  name="পরিমাপকৃত ওজন (Actual Weight)" 
                  stroke="#d97706" 
                  strokeWidth={3} 
                  fill="url(#rechartsActualGradient)" 
                  connectNulls={false}
                  dot={{ r: 5, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: '#b45309' }}
                />

                {/* 2. Ideal Target Trajectory Line */}
                <Line 
                  type="monotone" 
                  dataKey="targetWeight" 
                  name="আদর্শ টার্গেট গ্রোথ পথ (Ideal Target)" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  strokeDasharray="6 4" 
                  dot={{ r: 4, fill: '#10b981' }}
                />

                {/* 3. Linear Regression Predictive Line */}
                <Line 
                  type="monotone" 
                  dataKey="predictedWeight" 
                  name="লিনিয়ার রিগ্রেশন প্রেডিক্টিভ লাইন (Regression Forecast)" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  strokeDasharray="4 4" 
                  dot={{ r: 4, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 1.5 }}
                />

                {/* Reference Line for Target Rearing Month */}
                <ReferenceLine 
                  x={`${targetMonths}ম (টার্গেট)`} 
                  stroke="#059669" 
                  strokeDasharray="3 3" 
                  label={{ value: 'টার্গেট মাইলফলক', fill: '#059669', fontSize: 10, fontWeight: 800, position: 'top' }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* D3 Interactive Visualization Container */
        <div ref={containerRef} className="relative w-full overflow-hidden bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
          <svg ref={svgRef} className="w-full h-auto overflow-visible select-none" />

          {/* D3 Interactive Tooltip Box */}
          {tooltipData.visible && tooltipData.point && (
            <div
              className="absolute z-20 pointer-events-none p-3 rounded-2xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 max-w-xs animate-in fade-in duration-150"
              style={{
                left: `${tooltipData.x + 12}px`,
                top: `${tooltipData.y - 45}px`,
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-1 mb-1.5 font-bold">
                <span className="text-amber-400">
                  {tooltipData.point.month === 0 ? 'প্রারম্ভিক অবস্থা' : `${tooltipData.point.month}ম মাস (${tooltipData.point.days} দিন)`}
                </span>
                <span className="text-[10px] text-slate-400">{tooltipData.point.date}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">প্রকৃত ওজন:</span>
                  <span className="font-extrabold text-white font-mono">{tooltipData.point.weightKg} কেজি</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">টার্গেট নির্ধারিত:</span>
                  <span className="font-extrabold text-emerald-400 font-mono">{tooltipData.point.targetExpectedKg} কেজি</span>
                </div>
                {tooltipData.point.notes && (
                  <p className="text-[10px] text-slate-300 italic pt-1 border-t border-slate-800">
                    {tooltipData.point.notes}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart Legend & Insights Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-amber-500 rounded-full inline-block" />
            <span className="font-bold text-slate-700 dark:text-slate-300">পরিমাপকৃত ওজন (Actual Weight)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-600 inline-block" />
            <span className="font-bold text-slate-700 dark:text-slate-300">আদর্শ টার্গেট পথ (Target Rearing Trajectory)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-purple-600 inline-block" />
            <span className="font-bold text-slate-700 dark:text-slate-300">লিনিয়ার রিগ্রেশন প্রেডিক্টিভ লাইন (Linear Regression Line)</span>
          </div>
        </div>

        <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
          <span>দৈনিক ডায়েট: {currentAnimal.dailyDietPlan}</span>
        </div>
      </div>
    </div>
  );
};
