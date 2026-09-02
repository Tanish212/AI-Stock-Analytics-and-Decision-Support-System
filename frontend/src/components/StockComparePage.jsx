import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Home,
  Scale,
  Star,
  Newspaper,
  LogOut,
  Bell,
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Filter,
  BarChart2,
  LineChart,
  ArrowLeft,
  ArrowRight,
  Info
} from 'lucide-react';
import { STOCKS_103 } from '../data/stocksData';
import { getCurrentUser } from '../utils/user';
import { compareStocks } from '../services/api';

export default function StockComparePage() {
  const [user, setUser] = useState(getCurrentUser());
  const [stock1Symbol, setStock1Symbol] = useState('RELIANCE');
  const [stock2Symbol, setStock2Symbol] = useState('TCS');
  const [selectedSector, setSelectedSector] = useState('All');
  
  // Custom dropdown search query state
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [openDropdown1, setOpenDropdown1] = useState(false);
  const [openDropdown2, setOpenDropdown2] = useState(false);

  // API comparison state
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState('');

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('locationchange'));
  };

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // Unique list of sectors from stock metadata
  const sectors = useMemo(() => {
    const set = new Set(STOCKS_103.map(s => s.sector));
    return ['All', ...Array.from(set).sort()];
  }, []);

  // Filter available stocks by selected sector and search query
  const availableStocks1 = useMemo(() => {
    return STOCKS_103.filter(stock => {
      const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
      const matchesSearch =
        stock.symbol.toLowerCase().includes(search1.toLowerCase()) ||
        stock.ticker.toLowerCase().includes(search1.toLowerCase()) ||
        stock.name.toLowerCase().includes(search1.toLowerCase());
      return matchesSector && matchesSearch;
    });
  }, [selectedSector, search1]);

  const availableStocks2 = useMemo(() => {
    return STOCKS_103.filter(stock => {
      const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
      const matchesSearch =
        stock.symbol.toLowerCase().includes(search2.toLowerCase()) ||
        stock.ticker.toLowerCase().includes(search2.toLowerCase()) ||
        stock.name.toLowerCase().includes(search2.toLowerCase());
      return matchesSector && matchesSearch;
    });
  }, [selectedSector, search2]);

  // Handle stock selection
  const handleSelectStock1 = (stock) => {
    setStock1Symbol(stock.symbol);
    setSearch1('');
    setOpenDropdown1(false);
    setValidationError('');
  };

  const handleSelectStock2 = (stock) => {
    setStock2Symbol(stock.symbol);
    setSearch2('');
    setOpenDropdown2(false);
    setValidationError('');
  };

  // Perform backend comparison API call
  const handleCompare = async () => {
    if (!stock1Symbol || !stock2Symbol) {
      setValidationError('Please select two stocks to compare.');
      return;
    }

    if (stock1Symbol.toUpperCase() === stock2Symbol.toUpperCase()) {
      setValidationError('Please select two different stocks.');
      return;
    }

    setValidationError('');
    setLoading(true);
    setError(null);

    try {
      const res = await compareStocks(stock1Symbol, stock2Symbol);
      if (res.success) {
        setComparisonData(res);
      } else {
        throw new Error(res.message || 'Comparison failed');
      }
    } catch (err) {
      console.error('Error fetching stock comparison:', err);
      setError(err.message || 'Unable to load comparison data.');
    } finally {
      setLoading(false);
    }
  };

  // Helper for Signal Badge Styling
  const getSignalBadge = (direction) => {
    const dir = (direction || 'HOLD').toUpperCase();
    if (dir === 'BUY' || dir === 'UP') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
          <TrendingUp size={14} /> BUY ↑
        </span>
      );
    } else if (dir === 'SELL' || dir === 'DOWN') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20">
          <TrendingDown size={14} /> SELL ↓
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20">
          <Minus size={14} /> HOLD →
        </span>
      );
    }
  };

  // Helper for Reliability Grade Badge Styling
  const getReliabilityBadge = (reliability) => {
    const rel = reliability || 'Good';
    let colorClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (rel === 'Excellent') {
      colorClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    } else if (rel === 'Good') {
      colorClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    } else if (rel === 'Moderate') {
      colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    } else {
      colorClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${colorClass}`}>
        {rel}
      </span>
    );
  };

  // Get selected stock objects from STOCKS_103
  const s1Meta = useMemo(() => STOCKS_103.find(s => s.symbol === stock1Symbol) || { symbol: stock1Symbol, name: stock1Symbol, sector: 'Indian Market' }, [stock1Symbol]);
  const s2Meta = useMemo(() => STOCKS_103.find(s => s.symbol === stock2Symbol) || { symbol: stock2Symbol, name: stock2Symbol, sector: 'Indian Market' }, [stock2Symbol]);

  // Render SVG Grouped Bar Chart for Current vs Predicted Price
  const renderCurrentVsPredictedChart = () => {
    if (!comparisonData) return null;
    const { stock1, stock2 } = comparisonData;

    const s1Curr = stock1.prediction.last_close;
    const s1Pred = stock1.prediction.predicted_close;
    const s2Curr = stock2.prediction.last_close;
    const s2Pred = stock2.prediction.predicted_close;

    const maxVal = Math.max(s1Curr, s1Pred, s2Curr, s2Pred) * 1.15 || 1;

    const getBarHeight = (val) => Math.max(12, (val / maxVal) * 180);

    return (
      <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <BarChart2 size={16} /> CURRENT VS PREDICTED PRICE COMPARISON
            </h3>
            <p className="text-xs text-slate-400 mt-1">Side-by-side comparison of latest closing prices vs next session GRU forecasts</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
              <span className="text-slate-300">Current Price</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-400 inline-block"></span>
              <span className="text-slate-300">Predicted Price</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Stock 1 Bar Group */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-base font-bold text-white">{stock1.stock.symbol}</span>
                <span className="text-xs text-slate-400 ml-2">({stock1.stock.name})</span>
              </div>
              <span className="text-xs text-slate-400">{stock1.stock.sector}</span>
            </div>

            <div className="h-52 flex items-end justify-center gap-8 border-b border-slate-800 pb-2 pt-4 px-4">
              {/* Current Price Bar */}
              <div className="flex flex-col items-center gap-2 w-20 group">
                <span className="text-xs font-bold text-blue-400 group-hover:scale-105 transition-transform">
                  ₹{s1Curr.toLocaleString('en-IN')}
                </span>
                <div
                  style={{ height: `${getBarHeight(s1Curr)}px` }}
                  className="w-full bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-lg shadow-lg shadow-blue-500/20 group-hover:brightness-125 transition-all"
                ></div>
                <span className="text-[11px] text-slate-400 font-medium mt-1">Current</span>
              </div>

              {/* Predicted Price Bar */}
              <div className="flex flex-col items-center gap-2 w-20 group">
                <span className="text-xs font-bold text-cyan-300 group-hover:scale-105 transition-transform">
                  ₹{s1Pred.toLocaleString('en-IN')}
                </span>
                <div
                  style={{ height: `${getBarHeight(s1Pred)}px` }}
                  className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg shadow-lg shadow-cyan-400/30 group-hover:brightness-125 transition-all"
                ></div>
                <span className="text-[11px] text-slate-400 font-medium mt-1">Predicted</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>Expected Change:</span>
              <span className={stock1.prediction.price_change >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {stock1.prediction.price_change >= 0 ? '+' : ''}₹{stock1.prediction.price_change} ({stock1.prediction.percentage_change >= 0 ? '+' : ''}{stock1.prediction.percentage_change}%)
              </span>
            </div>
          </div>

          {/* Stock 2 Bar Group */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-base font-bold text-white">{stock2.stock.symbol}</span>
                <span className="text-xs text-slate-400 ml-2">({stock2.stock.name})</span>
              </div>
              <span className="text-xs text-slate-400">{stock2.stock.sector}</span>
            </div>

            <div className="h-52 flex items-end justify-center gap-8 border-b border-slate-800 pb-2 pt-4 px-4">
              {/* Current Price Bar */}
              <div className="flex flex-col items-center gap-2 w-20 group">
                <span className="text-xs font-bold text-indigo-400 group-hover:scale-105 transition-transform">
                  ₹{s2Curr.toLocaleString('en-IN')}
                </span>
                <div
                  style={{ height: `${getBarHeight(s2Curr)}px` }}
                  className="w-full bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-lg shadow-lg shadow-indigo-500/20 group-hover:brightness-125 transition-all"
                ></div>
                <span className="text-[11px] text-slate-400 font-medium mt-1">Current</span>
              </div>

              {/* Predicted Price Bar */}
              <div className="flex flex-col items-center gap-2 w-20 group">
                <span className="text-xs font-bold text-violet-300 group-hover:scale-105 transition-transform">
                  ₹{s2Pred.toLocaleString('en-IN')}
                </span>
                <div
                  style={{ height: `${getBarHeight(s2Pred)}px` }}
                  className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg shadow-lg shadow-violet-400/30 group-hover:brightness-125 transition-all"
                ></div>
                <span className="text-[11px] text-slate-400 font-medium mt-1">Predicted</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>Expected Change:</span>
              <span className={stock2.prediction.price_change >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {stock2.prediction.price_change >= 0 ? '+' : ''}₹{stock2.prediction.price_change} ({stock2.prediction.percentage_change >= 0 ? '+' : ''}{stock2.prediction.percentage_change}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render SVG Line Chart for Normalized Relative Historical Performance
  const renderRelativeHistoricalChart = () => {
    if (!comparisonData || !comparisonData.comparison?.relative_historical) return null;

    const points = comparisonData.comparison.relative_historical;
    if (points.length === 0) return null;

    const width = 800;
    const height = 300;
    const padding = 40;

    const norm1Vals = points.map(p => p.stock1_norm);
    const norm2Vals = points.map(p => p.stock2_norm);
    const allNorms = [...norm1Vals, ...norm2Vals];

    const minNorm = Math.min(...allNorms) * 0.98;
    const maxNorm = Math.max(...allNorms) * 1.02;
    const normRange = maxNorm - minNorm || 1;

    const getX = (index) => padding + (index / (points.length - 1)) * (width - 2 * padding);
    const getY = (norm) => height - padding - ((norm - minNorm) / normRange) * (height - 2 * padding);

    const path1 = points.map((p, i) => `${getX(i)},${getY(p.stock1_norm)}`).join(' ');
    const path2 = points.map((p, i) => `${getX(i)},${getY(p.stock2_norm)}`).join(' ');

    const baselineY = getY(100);

    const s1Symbol = comparisonData.stock1.stock.symbol;
    const s2Symbol = comparisonData.stock2.stock.symbol;

    const lastP = points[points.length - 1];
    const s1Pct = lastP ? (lastP.stock1_norm - 100).toFixed(2) : '0.00';
    const s2Pct = lastP ? (lastP.stock2_norm - 100).toFixed(2) : '0.00';

    return (
      <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <LineChart size={16} /> RELATIVE HISTORICAL PERFORMANCE
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Both stocks normalized to base 100 at start of 60-day period for direct relative growth comparison
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-cyan-400 rounded-full inline-block"></span>
              <span className="text-white font-bold">{s1Symbol}</span>
              <span className={parseFloat(s1Pct) >= 0 ? 'text-emerald-400 text-[11px]' : 'text-rose-400 text-[11px]'}>
                ({parseFloat(s1Pct) >= 0 ? '+' : ''}{s1Pct}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-violet-400 rounded-full inline-block"></span>
              <span className="text-white font-bold">{s2Symbol}</span>
              <span className={parseFloat(s2Pct) >= 0 ? 'text-emerald-400 text-[11px]' : 'text-rose-400 text-[11px]'}>
                ({parseFloat(s2Pct) >= 0 ? '+' : ''}{s2Pct}%)
              </span>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[340px] overflow-visible">
            <defs>
              <linearGradient id="grid-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Background horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const yVal = padding + ratio * (height - 2 * padding);
              const labelVal = (maxNorm - ratio * normRange).toFixed(1);
              return (
                <g key={i}>
                  <line
                    x1={padding}
                    y1={yVal}
                    x2={width - padding}
                    y2={yVal}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text x={padding - 8} y={yVal + 4} fill="#64748b" fontSize="10" textAnchor="end">
                    {labelVal}
                  </text>
                </g>
              );
            })}

            {/* Baseline 100 reference line */}
            {baselineY >= padding && baselineY <= height - padding && (
              <g>
                <line
                  x1={padding}
                  y1={baselineY}
                  x2={width - padding}
                  y2={baselineY}
                  stroke="#38bdf8"
                  strokeOpacity="0.4"
                  strokeDasharray="2 2"
                  strokeWidth="1.5"
                />
                <text x={width - padding + 6} y={baselineY + 4} fill="#38bdf8" fontSize="10" fontWeight="bold">
                  Base 100
                </text>
              </g>
            )}

            {/* Stock 1 Line Path */}
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={path1}
            />

            {/* Stock 2 Line Path */}
            <polyline
              fill="none"
              stroke="#a78bfa"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={path2}
            />

            {/* Date X-Axis labels */}
            {points.map((p, i) => {
              if (i % Math.ceil(points.length / 6) === 0 || i === points.length - 1) {
                return (
                  <text
                    key={i}
                    x={getX(i)}
                    y={height - 12}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {p.date.slice(5)}
                  </text>
                );
              }
              return null;
            })}
          </svg>
        </div>
      </div>
    );
  };

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
          <a className="active" href="/compare" onClick={(e) => e.preventDefault()}>
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

      {/* Main Scrollable Content */}
      <section className="feature-main-scrollable custom-scrollbar">
        {/* Header */}
        <header className="feature-header mb-8">
          <div>
            <p className="feature-eyebrow">STOCK ANALYTICS COMPARISON MODULE</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              STOCK COMPARISON <span>✦</span>
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Compare two Indian stocks using AI-powered analysis, GRU forecasts, and historical model metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/options')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all text-xs font-semibold shadow-md"
              aria-label="Back to Home"
            >
              <ArrowLeft size={15} />
              Back to Home
            </button>
            <button className="feature-notifications" aria-label="Notifications">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Section 1 & 2: Stock Selectors & Compare by Sector */}
        <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale size={20} className="text-cyan-400" /> SELECT TWO STOCKS TO COMPARE
              </h2>
              <p className="text-xs text-slate-400">Search 103 available stocks or filter by sector</p>
            </div>

            {/* Compare by Sector Option */}
            <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs">
              <Filter size={14} className="text-cyan-400" />
              <span className="text-slate-300 font-semibold shrink-0">Compare by Sector:</span>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-slate-800 text-cyan-300 font-medium px-2.5 py-1 rounded-lg border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
              >
                {sectors.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Validation Warning Alert */}
          {validationError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <AlertTriangle size={16} /> {validationError}
            </div>
          )}

          {/* Stock Selectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Selector 1 */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                First Stock
              </label>
              <div
                onClick={() => setOpenDropdown1(!openDropdown1)}
                className="w-full px-4 py-3 bg-slate-900/90 border border-cyan-500/30 rounded-xl flex items-center justify-between cursor-pointer hover:border-cyan-400 transition-all"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Search size={16} className="text-cyan-400 shrink-0" />
                  <span className="font-bold text-white text-sm">{s1Meta.symbol}</span>
                  <span className="text-xs text-slate-400 truncate">- {s1Meta.name}</span>
                </div>
                <span className="text-xs text-cyan-400 font-semibold shrink-0">▼</span>
              </div>

              {/* Dropdown Menu 1 */}
              {openDropdown1 && (
                <div className="absolute z-30 left-0 right-0 mt-2 bg-[#081329] border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden max-h-64 flex flex-col">
                  <div className="p-2 border-b border-slate-800">
                    <input
                      type="text"
                      value={search1}
                      onChange={(e) => setSearch1(e.target.value)}
                      placeholder="Search stock ticker or name..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {availableStocks1.length === 0 ? (
                      <div className="p-3 text-xs text-slate-400 text-center">No stocks found</div>
                    ) : (
                      availableStocks1.map(stock => (
                        <div
                          key={stock.symbol}
                          onClick={() => handleSelectStock1(stock)}
                          className={`px-4 py-2 text-xs flex items-center justify-between cursor-pointer hover:bg-cyan-500/20 transition-colors ${stock.symbol === stock1Symbol ? 'bg-cyan-500/30 font-bold text-cyan-300' : 'text-slate-200'}`}
                        >
                          <div>
                            <span className="font-bold">{stock.symbol}</span>
                            <span className="text-slate-400 ml-2">{stock.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{stock.sector}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-blue-500/40">
                VS
              </div>
            </div>

            {/* Selector 2 */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Second Stock
              </label>
              <div
                onClick={() => setOpenDropdown2(!openDropdown2)}
                className="w-full px-4 py-3 bg-slate-900/90 border border-violet-500/30 rounded-xl flex items-center justify-between cursor-pointer hover:border-violet-400 transition-all"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Search size={16} className="text-violet-400 shrink-0" />
                  <span className="font-bold text-white text-sm">{s2Meta.symbol}</span>
                  <span className="text-xs text-slate-400 truncate">- {s2Meta.name}</span>
                </div>
                <span className="text-xs text-violet-400 font-semibold shrink-0">▼</span>
              </div>

              {/* Dropdown Menu 2 */}
              {openDropdown2 && (
                <div className="absolute z-30 left-0 right-0 mt-2 bg-[#081329] border border-violet-500/40 rounded-xl shadow-2xl overflow-hidden max-h-64 flex flex-col">
                  <div className="p-2 border-b border-slate-800">
                    <input
                      type="text"
                      value={search2}
                      onChange={(e) => setSearch2(e.target.value)}
                      placeholder="Search stock ticker or name..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-400"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {availableStocks2.length === 0 ? (
                      <div className="p-3 text-xs text-slate-400 text-center">No stocks found</div>
                    ) : (
                      availableStocks2.map(stock => (
                        <div
                          key={stock.symbol}
                          onClick={() => handleSelectStock2(stock)}
                          className={`px-4 py-2 text-xs flex items-center justify-between cursor-pointer hover:bg-violet-500/20 transition-colors ${stock.symbol === stock2Symbol ? 'bg-violet-500/30 font-bold text-violet-300' : 'text-slate-200'}`}
                        >
                          <div>
                            <span className="font-bold">{stock.symbol}</span>
                            <span className="text-slate-400 ml-2">{stock.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{stock.sector}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compare Button */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-blue-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Analyzing Selected Stocks...
                </>
              ) : (
                <>
                  <Scale size={18} /> Compare Stocks
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 12: Empty State */}
        {!comparisonData && !loading && !error && (
          <div className="glass-card p-12 rounded-2xl border border-cyan-500/20 text-center flex flex-col items-center justify-center min-h-[320px]">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
              <Scale size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">COMPARE TWO STOCKS</h3>
            <p className="text-sm text-slate-400 max-w-md">
              Select two stocks above to compare their AI predictions, model performance metrics, and historical trends side by side.
            </p>
          </div>
        )}

        {/* Section 14: Loading State */}
        {loading && (
          <div className="glass-card p-12 rounded-2xl border border-cyan-500/20 text-center flex flex-col items-center justify-center min-h-[360px] animate-pulse">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white mb-6 shadow-xl shadow-cyan-500/30 animate-spin">
              <RefreshCw size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">AI is analyzing the selected stocks...</h3>
            <p className="text-xs text-slate-400">Loading GRU trained models, historical dataset, and performance benchmarks</p>
            <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-400 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Section 14: Error State */}
        {error && !loading && (
          <div className="glass-card p-10 rounded-2xl border border-rose-500/30 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Unable to load comparison data.</h3>
            <p className="text-xs text-slate-400 max-w-md mb-6">{error}</p>
            <button
              onClick={handleCompare}
              className="px-6 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 text-white font-semibold text-xs transition-all flex items-center gap-2"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        )}

        {/* Dashboard Comparison Results */}
        {comparisonData && !loading && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Section 3: Stock Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock 1 Summary Card */}
              <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full pointer-events-none"></div>
                
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-white">{comparisonData.stock1.stock.symbol}</h3>
                      <p className="text-xs text-slate-400 font-medium">{comparisonData.stock1.stock.name}</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-800/80 rounded-full text-xs font-semibold text-cyan-300 border border-cyan-500/20">
                      {comparisonData.stock1.stock.sector}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-end justify-between">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Current Price
                      </span>
                      <span className="text-2xl font-bold text-white">
                        ₹{comparisonData.stock1.prediction.last_close.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1 text-right">
                        AI Signal
                      </span>
                      {getSignalBadge(comparisonData.stock1.prediction.direction)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock 2 Summary Card */}
              <div className="glass-card p-6 rounded-2xl border border-violet-500/30 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-2xl rounded-full pointer-events-none"></div>

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-white">{comparisonData.stock2.stock.symbol}</h3>
                      <p className="text-xs text-slate-400 font-medium">{comparisonData.stock2.stock.name}</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-800/80 rounded-full text-xs font-semibold text-violet-300 border border-violet-500/20">
                      {comparisonData.stock2.stock.sector}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-end justify-between">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Current Price
                      </span>
                      <span className="text-2xl font-bold text-white">
                        ₹{comparisonData.stock2.prediction.last_close.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1 text-right">
                        AI Signal
                      </span>
                      {getSignalBadge(comparisonData.stock2.prediction.direction)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: AI Prediction Comparison Table */}
            <div className="glass-card p-6 rounded-2xl border border-cyan-500/20">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
                <Cpu size={16} /> AI PREDICTION COMPARISON TABLE
              </h3>
              
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Metric</th>
                      <th className="py-3 px-4 text-cyan-300 font-extrabold text-sm">{comparisonData.stock1.stock.symbol}</th>
                      <th className="py-3 px-4 text-violet-300 font-extrabold text-sm">{comparisonData.stock2.stock.symbol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    <tr>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">Current Price</td>
                      <td className="py-3.5 px-4 text-white font-bold">₹{comparisonData.stock1.prediction.last_close.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-white font-bold">₹{comparisonData.stock2.prediction.last_close.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">Predicted Price</td>
                      <td className="py-3.5 px-4 text-cyan-300 font-bold">₹{comparisonData.stock1.prediction.predicted_close.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-violet-300 font-bold">₹{comparisonData.stock2.prediction.predicted_close.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">Expected Change</td>
                      <td className={comparisonData.stock1.prediction.price_change >= 0 ? 'py-3.5 px-4 text-emerald-400 font-bold' : 'py-3.5 px-4 text-rose-400 font-bold'}>
                        {comparisonData.stock1.prediction.price_change >= 0 ? '+' : ''}₹{comparisonData.stock1.prediction.price_change}
                      </td>
                      <td className={comparisonData.stock2.prediction.price_change >= 0 ? 'py-3.5 px-4 text-emerald-400 font-bold' : 'py-3.5 px-4 text-rose-400 font-bold'}>
                        {comparisonData.stock2.prediction.price_change >= 0 ? '+' : ''}₹{comparisonData.stock2.prediction.price_change}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">Expected Change %</td>
                      <td className={comparisonData.stock1.prediction.percentage_change >= 0 ? 'py-3.5 px-4 text-emerald-400 font-bold' : 'py-3.5 px-4 text-rose-400 font-bold'}>
                        {comparisonData.stock1.prediction.percentage_change >= 0 ? '+' : ''}{comparisonData.stock1.prediction.percentage_change}%
                      </td>
                      <td className={comparisonData.stock2.prediction.percentage_change >= 0 ? 'py-3.5 px-4 text-emerald-400 font-bold' : 'py-3.5 px-4 text-rose-400 font-bold'}>
                        {comparisonData.stock2.prediction.percentage_change >= 0 ? '+' : ''}{comparisonData.stock2.prediction.percentage_change}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">AI Signal</td>
                      <td className="py-3.5 px-4">{getSignalBadge(comparisonData.stock1.prediction.direction)}</td>
                      <td className="py-3.5 px-4">{getSignalBadge(comparisonData.stock2.prediction.direction)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 5: Model Performance Comparison Table */}
            <div className="glass-card p-6 rounded-2xl border border-cyan-500/20">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
                <Activity size={16} /> MODEL PERFORMANCE COMPARISON (gru_all_103_results.csv)
              </h3>
              
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Evaluation Metric</th>
                      <th className="py-3 px-4 text-cyan-300 font-extrabold text-sm">{comparisonData.stock1.stock.symbol}</th>
                      <th className="py-3 px-4 text-violet-300 font-extrabold text-sm">{comparisonData.stock2.stock.symbol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    <tr>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">MAE (Mean Absolute Error)</td>
                      <td className="py-3.5 px-4 text-white font-bold">₹{comparisonData.stock1.model_performance.mae}</td>
                      <td className="py-3.5 px-4 text-white font-bold">₹{comparisonData.stock2.model_performance.mae}</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">RMSE (Root Mean Squared Error)</td>
                      <td className="py-3.5 px-4 text-white font-bold">₹{comparisonData.stock1.model_performance.rmse}</td>
                      <td className="py-3.5 px-4 text-white font-bold">₹{comparisonData.stock2.model_performance.rmse}</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">MAPE (Mean Absolute % Error)</td>
                      <td className="py-3.5 px-4 text-white font-bold">{comparisonData.stock1.model_performance.mape}%</td>
                      <td className="py-3.5 px-4 text-white font-bold">{comparisonData.stock2.model_performance.mape}%</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">R² Score (Coefficient of Determination)</td>
                      <td className="py-3.5 px-4 text-white font-bold">{comparisonData.stock1.model_performance.r2}</td>
                      <td className="py-3.5 px-4 text-white font-bold">{comparisonData.stock2.model_performance.r2}</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">Model Reliability</td>
                      <td className="py-3.5 px-4">{getReliabilityBadge(comparisonData.stock1.model_performance.reliability)}</td>
                      <td className="py-3.5 px-4">{getReliabilityBadge(comparisonData.stock2.model_performance.reliability)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 6: Current vs Predicted Price Chart */}
            {renderCurrentVsPredictedChart()}

            {/* Section 7: Historical Performance Comparison Chart */}
            {renderRelativeHistoricalChart()}

            {/* Section 8 & 9: AI Comparison Summary & Stronger Signal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Section 8: AI Comparison Summary */}
              <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-cyan-500/30 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
                    <Zap size={16} /> AI COMPARISON SUMMARY
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    "{comparisonData.comparison.ai_summary}"
                  </p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 italic flex items-center gap-1.5">
                  <Info size={14} className="text-cyan-400 shrink-0" />
                  <span>Dynamically derived from actual GRU neural network predictions and test MAPE metrics.</span>
                </div>
              </div>

              {/* Section 9: Stronger Model Signal */}
              <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                    <ShieldCheck size={16} /> STRONGER CURRENT SIGNAL
                  </h3>
                  
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-500/20 mb-3">
                    <div className="text-xl font-extrabold text-white">
                      {comparisonData.comparison.stronger_signal_stock}
                    </div>
                    <div className="mt-1">
                      {getSignalBadge(comparisonData.comparison.stronger_signal_direction)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-normal">
                    {comparisonData.comparison.stronger_signal_reason}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 leading-tight">
                  {comparisonData.comparison.disclaimer}
                </div>
              </div>
            </div>

          </div>
        )}
      </section>
    </main>
  );
}
