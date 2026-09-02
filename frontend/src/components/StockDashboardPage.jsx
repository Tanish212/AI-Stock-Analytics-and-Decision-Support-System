import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/user';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Search,
  Home,
  Scale,
  Star,
  Newspaper,
  LogOut,
  Bell,
  Cpu,
  ShieldAlert,
  Activity,
  Calendar,
  Sparkles,
  RefreshCw,
  Info,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function StockDashboardPage({ symbol }) {
  const [user, setUser] = useState(getCurrentUser());
  const [stockSymbol, setStockSymbol] = useState(symbol || 'SBIN');
  const [showMetricsInfo, setShowMetricsInfo] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('locationchange'));
  };

  const fetchAnalysis = async (targetSymbol) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/stocks/${targetSymbol}/analysis`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.message || 'Failed to fetch prediction data');
      }
    } catch (err) {
      console.error('Error loading stock analysis:', err);
      setError(err.message || 'Unable to load stock analysis. Please verify backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      setStockSymbol(symbol);
      fetchAnalysis(symbol);
    }
  }, [symbol]);

  // SVG Chart Calculation Helpers
  const renderSvgChart = (chartData) => {
    if (!chartData || chartData.length === 0) return null;

    const width = 800;
    const height = 300;
    const padding = 40;

    const prices = chartData.map(d => d.close);
    const minPrice = Math.min(...prices) * 0.98;
    const maxPrice = Math.max(...prices) * 1.02;
    const priceRange = maxPrice - minPrice || 1;

    const getX = (index) => padding + (index / (chartData.length - 1)) * (width - 2 * padding);
    const getY = (price) => height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding);

    // Points string for historical (all except last prediction)
    const points = chartData.map((d, i) => `${getX(i)},${getY(d.close)}`).join(' ');

    // Area path for gradient under line
    const areaPoints = [
      `${getX(0)},${height - padding}`,
      ...chartData.map((d, i) => `${getX(i)},${getY(d.close)}`),
      `${getX(chartData.length - 1)},${height - padding}`
    ].join(' ');

    const lastHistoricalIdx = chartData.length - 2;
    const predIdx = chartData.length - 1;

    const lastHistPoint = chartData[lastHistoricalIdx];
    const predPoint = chartData[predIdx];

    const isUp = ['BUY', 'UP'].includes(data?.prediction?.direction);
    const isDown = ['SELL', 'DOWN'].includes(data?.prediction?.direction);
    const forecastColor = isUp ? '#10b981' : isDown ? '#f43f5e' : '#f59e0b';

    return (
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Main historical gradient */}
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>

            {/* Forecast glow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio, idx) => {
            const y = height - padding - ratio * (height - 2 * padding);
            const val = (minPrice + ratio * priceRange).toFixed(1);
            return (
              <g key={idx}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
                <text x={padding - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">
                  ₹{val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <polygon points={areaPoints} fill="url(#chartGradient)" />

          {/* Main Historical Line */}
          <polyline
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Forecast Line Segment (Connecting last close to prediction) */}
          {lastHistPoint && predPoint && (
            <line
              x1={getX(lastHistoricalIdx)}
              y1={getY(lastHistPoint.close)}
              x2={getX(predIdx)}
              y2={getY(predPoint.close)}
              stroke={forecastColor}
              strokeWidth="3"
              strokeDasharray="6 4"
              filter="url(#glow)"
            />
          )}

          {/* Data Points */}
          {chartData.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.close);
            const isPred = d.is_prediction;
            const isLastHist = i === lastHistoricalIdx;

            return (
              <g
                key={i}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredPoint({ ...d, x: cx, y: cy })}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {isPred ? (
                  <>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="9"
                      fill={forecastColor}
                      fillOpacity="0.3"
                      className="animate-ping"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6"
                      fill={forecastColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </>
                ) : isLastHist ? (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="5"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                ) : (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="3"
                    fill="#0284c7"
                    className="hover:r-5 hover:fill-cyan-300 transition-all"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none px-3 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-xs shadow-xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`
            }}
          >
            <div className="font-bold text-white mb-0.5">
              {hoveredPoint.is_prediction ? "★ GRU Forecast" : hoveredPoint.date}
            </div>
            <div className="text-cyan-300 font-mono font-semibold">
              Price: ₹{hoveredPoint.close.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getReliabilityStars = (reliability) => {
    switch (reliability) {
      case 'Excellent': return { stars: 5, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      case 'Good': return { stars: 4, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' };
      case 'Moderate': return { stars: 3, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
      default: return { stars: 2, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
    }
  };

  const handleBack = () => {
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get('from');
    if (fromParam === 'watchlist') {
      navigate('/watchlist');
    } else if (fromParam === 'analyze') {
      navigate('/analyze');
    } else if (fromParam === 'compare') {
      navigate('/compare');
    } else {
      // Default: go back to home options page (not login)
      navigate('/options');
    }
  };

  const fromSource = new URLSearchParams(window.location.search).get('from');

  return (
    <main className="feature-page min-h-screen flex text-slate-100 bg-[#030712]">
      {/* Sidebar Navigation */}
      <aside className="feature-sidebar">
        <button
          className="feature-brand"
          onClick={() => navigate('/options')}
          aria-label="Go to options"
        >
          <img src="/logo.png" alt="Stock Vista" className="w-9 h-9 object-contain rounded-lg shadow-md shadow-cyan-500/20 border border-cyan-500/20" />
          <span className="text-xl font-bold tracking-tight text-white">Stock Vista</span>
        </button>

        <div className="feature-user">
          <div className="feature-avatar">{user.initial}</div>
          <div>
            <strong>Welcome, {user.firstName}</strong>
            <small>Market Explorer</small>
          </div>
        </div>

        <nav className="feature-nav">
          <a href="/options" onClick={(e) => { e.preventDefault(); navigate('/options'); }}>
            <Home size={18} />
            Home
          </a>
          <a href="/analyze" onClick={(e) => { e.preventDefault(); navigate('/analyze'); }}>
            <Search size={18} />
            Analyze Stocks
          </a>
          <a href="/compare" onClick={(e) => { e.preventDefault(); navigate('/compare'); }}>
            <Scale size={18} />
            Stock Comparison
          </a>
          <a href="/watchlist" onClick={(e) => { e.preventDefault(); navigate('/watchlist'); }}>
            <Star size={18} />
            Watchlist
          </a>
          <a href="/news" onClick={(e) => { e.preventDefault(); navigate('/news'); }}>
            <Newspaper size={18} />
            News
          </a>
        </nav>

        <div className="feature-sidebar-bottom">
          <button onClick={() => navigate('/login')}>
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Scrollable Dashboard Body */}
      <section className="feature-main-scrollable custom-scrollbar">
        {/* Top Bar with Navigation & Stock Info */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-5">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2.5 rounded-2xl bg-slate-900 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:text-white transition-all shadow-lg flex items-center gap-1.5 text-xs font-semibold"
              title={fromSource === 'watchlist' ? 'Back to Watchlist' : fromSource === 'analyze' ? 'Back to Analyze' : fromSource === 'compare' ? 'Back to Compare' : 'Back to Home'}
            >
              <ArrowLeft size={18} />
              <span>{fromSource === 'watchlist' ? 'Watchlist' : fromSource === 'analyze' ? 'Analyze' : fromSource === 'compare' ? 'Compare' : 'Home'}</span>
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-extrabold tracking-wide">
                  {data?.stock?.symbol || stockSymbol}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {data?.stock?.ticker || `${stockSymbol}.NS`}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
                  {data?.stock?.sector || 'Indian Market'}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                {data?.stock?.name || stockSymbol}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAnalysis(stockSymbol)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 text-xs font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh AI Forecast
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-24 text-center glass-card rounded-3xl border border-cyan-500/20 my-6">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping"></div>
              <div className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center">
                <Cpu size={24} className="text-cyan-300" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI is analyzing {stockSymbol}...</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Fetching historical prices, initializing GRU neural network model, and computing next trading day price target.
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-16 px-6 text-center glass-card rounded-3xl border border-rose-500/30 bg-rose-950/10 my-6">
            <ShieldAlert size={48} className="mx-auto text-rose-400 mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-2">Unable to load stock analysis</h3>
            <p className="text-slate-300 text-sm mb-6 max-w-lg mx-auto">{error}</p>
            <button
              onClick={() => fetchAnalysis(stockSymbol)}
              className="px-6 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-all inline-flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Retry Analysis
            </button>
          </div>
        )}

        {/* Main Dashboard Dashboard Content */}
        {!loading && !error && data && (
          <div className="space-y-6 pb-12">
            {/* Hero Prediction Banner */}
            <div className="relative p-6 md:p-8 rounded-3xl glass-card border border-cyan-500/40 bg-gradient-to-r from-blue-950/60 via-slate-950 to-cyan-950/40 shadow-2xl overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-widest">
                    <Sparkles size={14} className="animate-spin text-cyan-400" /> AI PRICE FORECAST
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white font-mono">
                    ₹{data.prediction.predicted_close.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    Predicted Closing Price for Next Trading Session (Based on 60-Day Lookback)
                  </p>
                </div>

                {/* Direction Highlight Box */}
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-right">
                    <span className="text-[11px] text-slate-400 uppercase font-bold block mb-0.5">Expected Change</span>
                    <span className={`text-xl font-extrabold font-mono ${
                      data.prediction.price_change > 0 ? 'text-emerald-400' : data.prediction.price_change < 0 ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {data.prediction.price_change >= 0 ? '+' : ''}₹{data.prediction.price_change.toFixed(2)} ({data.prediction.percentage_change >= 0 ? '+' : ''}{data.prediction.percentage_change.toFixed(2)}%)
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center min-w-[120px] ${
                    data.prediction.direction === 'UP'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-950/50'
                      : data.prediction.direction === 'DOWN'
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-400 shadow-lg shadow-rose-950/50'
                      : 'bg-amber-950/40 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-950/50'
                  }`}>
                    {data.prediction.direction === 'UP' && <TrendingUp size={28} className="mb-1 animate-pulse" />}
                    {data.prediction.direction === 'DOWN' && <TrendingDown size={28} className="mb-1 animate-pulse" />}
                    {data.prediction.direction === 'NEUTRAL' && <Minus size={28} className="mb-1" />}
                    <span className="text-xs font-black uppercase tracking-wider">{data.prediction.direction}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-2xl glass-card border border-cyan-500/20 hover:border-cyan-400/50 transition-all">
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Current Close</span>
                <strong className="text-lg text-white font-mono block">
                  ₹{data.prediction.last_close.toLocaleString('en-IN')}
                </strong>
                <span className="text-[10px] text-slate-500">As of {data.prediction.last_date}</span>
              </div>

              <div className="p-4 rounded-2xl glass-card border border-cyan-500/20 hover:border-cyan-400/50 transition-all">
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Target Close</span>
                <strong className="text-lg text-cyan-300 font-mono block">
                  ₹{data.prediction.predicted_close.toLocaleString('en-IN')}
                </strong>
                <span className="text-[10px] text-slate-500">GRU Forecast</span>
              </div>

              <div className="p-4 rounded-2xl glass-card border border-cyan-500/20 hover:border-cyan-400/50 transition-all">
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Price Change</span>
                <strong className={`text-lg font-mono block ${data.prediction.price_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.prediction.price_change >= 0 ? '+' : ''}₹{data.prediction.price_change}
                </strong>
                <span className="text-[10px] text-slate-500">Absolute difference</span>
              </div>

              <div className="p-4 rounded-2xl glass-card border border-cyan-500/20 hover:border-cyan-400/50 transition-all">
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Return %</span>
                <strong className={`text-lg font-mono block ${data.prediction.percentage_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.prediction.percentage_change >= 0 ? '+' : ''}{data.prediction.percentage_change}%
                </strong>
                <span className="text-[10px] text-slate-500">Expected percentage</span>
              </div>

              <div className="p-4 rounded-2xl glass-card border border-cyan-500/20 hover:border-cyan-400/50 transition-all">
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Signal Direction</span>
                <strong className={`text-lg font-bold block ${
                  data.prediction.direction === 'UP' ? 'text-emerald-400' : data.prediction.direction === 'DOWN' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {data.prediction.direction}
                </strong>
                <span className="text-[10px] text-slate-500">ML Forecast Signal</span>
              </div>

              <div className="p-4 rounded-2xl glass-card border border-cyan-500/20 hover:border-cyan-400/50 transition-all">
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Last Data Date</span>
                <strong className="text-sm text-slate-200 font-mono block mt-1">
                  {data.prediction.last_date}
                </strong>
                <span className="text-[10px] text-slate-500">Processed CSV</span>
              </div>
            </div>

            {/* Price Chart Section */}
            <div className="p-6 rounded-3xl glass-card border border-cyan-500/25 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Activity size={20} className="text-cyan-400" />
                    Historical Price Trend & GRU Target Forecast
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real 30-day historical closing prices leading up to the GRU predicted price target.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block"></span>
                    Historical Close
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                    Predicted Next Close
                  </span>
                </div>
              </div>

              {renderSvgChart(data.chart_data)}
            </div>

            {/* Bottom Two Columns: Model Performance & Analysis Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Model Information & Performance Card */}
              <div className="p-6 rounded-3xl glass-card border border-cyan-500/20 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Cpu size={20} className="text-indigo-400" />
                      AI Model Performance
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
                      GRU Neural Net
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4">
                    Trained on over 2,300 historical trading sessions using a 60-day lookback window. Metrics evaluated on test partition.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                      <span className="text-[11px] text-slate-400 block font-medium">MAE</span>
                      <strong className="text-base text-cyan-300 font-mono">₹{data.model_performance.mae}</strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                      <span className="text-[11px] text-slate-400 block font-medium">RMSE</span>
                      <strong className="text-base text-indigo-300 font-mono">₹{data.model_performance.rmse}</strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                      <span className="text-[11px] text-slate-400 block font-medium">MAPE</span>
                      <strong className="text-base text-emerald-400 font-mono">{data.model_performance.mape}%</strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                      <span className="text-[11px] text-slate-400 block font-medium">R² Score</span>
                      <strong className="text-base text-sky-300 font-mono">{data.model_performance.r2}</strong>
                    </div>
                  </div>

                  {/* Collapsible Understanding Model Metrics Section */}
                  <div className="mb-5">
                    <button
                      type="button"
                      onClick={() => setShowMetricsInfo(!showMetricsInfo)}
                      aria-expanded={showMetricsInfo}
                      aria-controls="understanding-model-metrics-content"
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/25 hover:border-cyan-400/60 hover:bg-blue-950/40 text-cyan-300 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    >
                      <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                          ⓘ
                        </span>
                        <span className="text-white group-hover:text-cyan-300 transition-colors">
                          Understanding Model Metrics
                        </span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-cyan-400 transition-transform duration-300 ${
                          showMetricsInfo ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <div
                      id="understanding-model-metrics-content"
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        showMetricsInfo ? 'max-h-[900px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                      }`}
                    >
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 text-xs space-y-4 shadow-inner">
                        {/* Metric Definitions */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-extrabold text-indigo-300 text-xs mb-1 tracking-wide uppercase">RMSE</h4>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              Measures the typical size of prediction errors, with larger errors having a greater impact.
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80">
                            <h4 className="font-extrabold text-sky-300 text-xs mb-1 tracking-wide uppercase">R² Score</h4>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              Indicates how well the model explains variation in the actual stock prices. A value closer to 1 generally indicates a better fit.
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80">
                            <h4 className="font-extrabold text-cyan-300 text-xs mb-1 tracking-wide uppercase">MAE</h4>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              Shows the average absolute difference between the predicted and actual stock prices.
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80">
                            <h4 className="font-extrabold text-emerald-400 text-xs mb-1 tracking-wide uppercase">MAPE</h4>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              Shows the average prediction error as a percentage, making it easier to compare prediction accuracy across stocks.
                            </p>
                          </div>
                        </div>

                        {/* Subsection: Model Reliability */}
                        <div className="pt-3 border-t border-cyan-500/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-black text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 size={14} className="text-cyan-400" />
                              Model Reliability
                            </h4>
                            <span className="text-[10px] text-slate-400">Based on MAPE metric</span>
                          </div>

                          <p className="text-slate-300 text-xs leading-relaxed">
                            Reliability classification based on historical test MAPE:
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {(() => {
                              const currentMape = parseFloat(data.model_performance.mape);

                              const tiers = [
                                { range: 'MAPE < 2%', label: 'Excellent', color: 'emerald', isMatch: currentMape < 2.0 },
                                { range: 'MAPE 2% to <3%', label: 'Good', color: 'cyan', isMatch: currentMape >= 2.0 && currentMape < 3.0 },
                                { range: 'MAPE 3% to <4%', label: 'Moderate', color: 'amber', isMatch: currentMape >= 3.0 && currentMape < 4.0 },
                                { range: 'MAPE ≥4%', label: 'Lower Reliability', color: 'rose', isMatch: currentMape >= 4.0 }
                              ];

                              return tiers.map(tier => (
                                <div
                                  key={tier.label}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                                    tier.isMatch
                                      ? 'bg-blue-950/80 border-cyan-400 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40'
                                      : 'bg-slate-900/50 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                      tier.color === 'emerald' ? 'bg-emerald-400' :
                                      tier.color === 'cyan' ? 'bg-cyan-400' :
                                      tier.color === 'amber' ? 'bg-amber-400' : 'bg-rose-400'
                                    }`}></span>
                                    <span className="font-medium text-xs text-slate-200">{tier.range}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`font-bold text-xs ${
                                      tier.color === 'emerald' ? 'text-emerald-400' :
                                      tier.color === 'cyan' ? 'text-cyan-300' :
                                      tier.color === 'amber' ? 'text-amber-400' : 'text-rose-400'
                                    }`}>
                                      {tier.label}
                                    </span>
                                    {tier.isMatch && (
                                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-[9px] text-cyan-300 font-extrabold uppercase">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Model Reliability Indicator */}
                {(() => {
                  const rel = getReliabilityStars(data.model_performance.reliability);
                  return (
                    <div className={`p-4 rounded-2xl border ${rel.bg} flex items-center justify-between`}>
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">
                          Model Reliability
                        </span>
                        <strong className={`text-base font-extrabold ${rel.color}`}>
                          {data.model_performance.reliability}
                        </strong>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={i < rel.stars ? rel.color : 'text-slate-700'}
                            fill={i < rel.stars ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* AI Market Summary & Financial Disclaimer */}
              <div className="p-6 rounded-3xl glass-card border border-cyan-500/20 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles size={20} className="text-cyan-400" />
                    AI-Generated Market Summary
                  </h3>

                  <div className="p-5 rounded-2xl bg-blue-950/40 border border-cyan-500/30 mb-4 space-y-3">
                    <p className="text-sm text-slate-200 leading-relaxed font-normal">
                      {data.ai_summary}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-cyan-300 font-semibold pt-1 border-t border-cyan-500/20">
                      <CheckCircle2 size={14} className="text-cyan-400" />
                      Evaluated with 60-day historical sequence memory
                    </div>
                  </div>
                </div>

                {/* Financial Disclaimer */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
                  <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Financial Disclaimer:</strong> {data.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
