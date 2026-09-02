import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  X,
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
  ArrowUpRight,
  ArrowLeft,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { STOCKS_103 } from '../data/stocksData';
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from '../services/api';
import { getCurrentUser } from '../utils/user';

export default function StockAnalyzePage() {
  const [user, setUser] = useState(getCurrentUser());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedStock, setSelectedStock] = useState(null);
  const [watchlist, setWatchlist] = useState({});

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    async function loadWatchlist() {
      try {
        const res = await fetchWatchlist();
        if (res.success && Array.isArray(res.watchlist)) {
          const map = {};
          res.watchlist.forEach(item => {
            map[item.symbol] = true;
          });
          setWatchlist(map);
        }
      } catch (err) {
        console.error("Could not fetch user watchlist:", err);
      }
    }
    loadWatchlist();
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('locationchange'));
  };

  // Unique list of sectors for category filter pills
  const sectors = useMemo(() => {
    const set = new Set(STOCKS_103.map(s => s.sector));
    return ['All', ...Array.from(set)];
  }, []);

  // Filter 103 stocks based on search query and sector filter
  const filteredStocks = useMemo(() => {
    return STOCKS_103.filter(stock => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSector =
        selectedSector === 'All' || stock.sector === selectedSector;

      return matchesSearch && matchesSector;
    });
  }, [searchTerm, selectedSector]);

  // Generate dynamic, realistic indicators based on stock symbol string for consistent preview
  const getStockAnalysis = (stock) => {
    if (!stock) return null;

    // Use char codes sum to generate stable deterministic mock values
    const seed = stock.symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const rsi = (35 + (seed % 45)).toFixed(1);
    const isBullish = seed % 2 === 0;
    const signal = rsi > 65 ? "Strong Buy" : rsi < 40 ? "Consolidating / Neutral" : "Bullish Buy";
    const confidence = (78 + (seed % 19)).toFixed(0);
    const macdStatus = isBullish ? "Bullish Crossover (+2.4)" : "Neutral Crossover (+0.8)";
    const maStatus = isBullish ? "Above 20 & 50-Day EMA" : "Testing 50-Day Support";
    const volatility = (1.2 + ((seed % 25) / 10)).toFixed(2);
    const targetUpside = (6 + (seed % 18)).toFixed(1);

    return {
      rsi,
      signal,
      confidence,
      macdStatus,
      maStatus,
      volatility: `${volatility}%`,
      targetUpside: `+${targetUpside}%`,
      recommendation: isBullish
        ? "Technical models indicate bullish momentum supported by positive volume inflow and technical indicator convergence."
        : "Models suggest short-term consolidation around key support levels with moderate upside potential over medium term."
    };
  };

  const toggleWatchlist = async (symbol, e) => {
    e.stopPropagation();
    const isCurrentlyWatchlisted = !!watchlist[symbol];

    setWatchlist(prev => ({
      ...prev,
      [symbol]: !isCurrentlyWatchlisted
    }));

    try {
      if (isCurrentlyWatchlisted) {
        await removeFromWatchlist(symbol);
      } else {
        await addToWatchlist(symbol);
      }
    } catch (err) {
      console.error('Failed to update backend watchlist:', err);
      // Revert local state on error
      setWatchlist(prev => ({
        ...prev,
        [symbol]: isCurrentlyWatchlisted
      }));
    }
  };

  const currentAnalysis = selectedStock ? getStockAnalysis(selectedStock) : null;

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
          <a className="active" href="/analyze" onClick={(e) => e.preventDefault()}>
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

      {/* Main Content Area - Fully Scrollable Vertical Container */}
      <section className="feature-main-scrollable custom-scrollbar">
        {/* Top Header */}
        <header className="feature-header mb-6">
          <div>
            <p className="feature-eyebrow">AI STOCK ANALYTICS COMMAND CENTER</p>
            <h1>
              Explore & Analyze Stocks <span>✦</span>
            </h1>
            <p>Search or browse through the 103 Indian market stocks to get AI technical analytics.</p>
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

        {/* Search & Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="relative flex items-center w-full max-w-3xl">
            <div className="absolute left-4 text-cyan-400 pointer-events-none">
              <Search size={22} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Ticker (e.g. RELIANCE, TCS, INFY) or Company Name..."
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-blue-950/40 border border-cyan-500/30 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-xl shadow-lg transition-all text-sm font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 text-slate-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Sector Pill Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0 mr-1">
              <Filter size={14} className="text-cyan-400" /> Sectors:
            </span>
            {sectors.slice(0, 8).map(sector => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-3.5 py-1.5 rounded-full border transition-all shrink-0 font-medium ${
                  selectedSector === sector
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/60 border-slate-700/50 text-slate-300 hover:border-cyan-500/40 hover:text-white'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>

          {/* Search Result Summary Counter */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              Showing <strong className="text-cyan-300">{filteredStocks.length}</strong> of <strong>103</strong> stocks available
            </span>
            {searchTerm && (
              <span>
                Matching "<span className="text-cyan-400 font-semibold">{searchTerm}</span>"
              </span>
            )}
          </div>
        </div>

        {/* Stock List Grid */}
        {filteredStocks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-cyan-500/20 glass-card">
            <Search size={40} className="mx-auto text-slate-500 mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-1">No stocks matched your search</h3>
            <p className="text-slate-400 text-sm mb-4">Try searching with a different ticker or company name.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedSector('All'); }}
              className="px-5 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {filteredStocks.map((stock) => {
              const isWatchlisted = watchlist[stock.symbol];
              return (
                <div
                  key={stock.ticker}
                  className="group relative p-5 rounded-2xl glass-card border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-blue-900/50 transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-cyan-950/40 transform hover:-translate-y-0.5"
                >
                  <div>
                    {/* Top Row: Symbol pill & Watchlist star */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs">
                        {stock.ticker}
                      </span>

                      <button
                        onClick={(e) => toggleWatchlist(stock.symbol, e)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isWatchlisted
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'border-slate-700 text-slate-500 hover:text-slate-200 hover:border-slate-600'
                        }`}
                        title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                      >
                        <Star size={15} fill={isWatchlisted ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Stock Name */}
                    <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {stock.symbol}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-1">
                      {stock.name}
                    </p>

                    {/* Sector Tag */}
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 font-medium mb-4">
                      {stock.sector}
                    </div>
                  </div>

                  {/* Action Row with Analyze Button */}
                  <div className="pt-3 border-t border-cyan-500/15 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Activity size={13} /> AI Ready
                    </span>

                    <button
                      onClick={() => navigate(`/stock/${stock.symbol}?from=analyze`)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 font-bold text-xs shadow-md shadow-blue-600/30 hover:shadow-cyan-500/50 flex items-center gap-1.5 transition-all transform active:scale-95"
                    >
                      <BarChart3 size={14} />
                      Analyze
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Analysis Modal Dialog */}
      {selectedStock && currentAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-950 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/80 max-h-[90vh] overflow-y-auto custom-scrollbar">

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-cyan-500/20 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
                    {selectedStock.ticker}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {selectedStock.sector}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {selectedStock.name}
                </h2>
              </div>

              <button
                onClick={() => setSelectedStock(null)}
                className="p-2 rounded-full border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:border-cyan-400 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Signal & Model Score Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/80 to-cyan-950/40 border border-cyan-500/30 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center shrink-0">
                  <Zap size={24} />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-cyan-400 tracking-wider">AI Signal</span>
                  <h4 className="text-lg font-extrabold text-white flex items-center gap-1.5">
                    {currentAnalysis.signal}
                  </h4>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/80 to-indigo-950/40 border border-indigo-500/30 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 flex items-center justify-center shrink-0">
                  <Cpu size={24} />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-indigo-300 tracking-wider">Model Confidence</span>
                  <h4 className="text-lg font-extrabold text-white">
                    {currentAnalysis.confidence}% Precision
                  </h4>
                </div>
              </div>
            </div>

            {/* Indicator Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">RSI (14)</span>
                <strong className="text-base text-cyan-300 font-mono">{currentAnalysis.rsi}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Volatility</span>
                <strong className="text-base text-amber-300 font-mono">{currentAnalysis.volatility}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Est. Target</span>
                <strong className="text-base text-emerald-400 font-mono">{currentAnalysis.targetUpside}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Trend</span>
                <strong className="text-base text-blue-400 font-mono">Bullish</strong>
              </div>
            </div>

            {/* Technical Highlights */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-cyan-400" /> Key Technical Indicators
              </h4>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">MACD Indicator:</span>
                  <span className="text-white font-semibold">{currentAnalysis.macdStatus}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">Exponential Moving Avg:</span>
                  <span className="text-white font-semibold">{currentAnalysis.maStatus}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-medium">Data Model Source:</span>
                  <span className="text-cyan-300 font-semibold">GRU 103 Batch Trained Model</span>
                </div>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-cyan-500/20 mb-6">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-cyan-300 mb-1.5">
                AI Analytics Summary
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentAnalysis.recommendation}
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setSelectedStock(null)}
                className="flex-1 py-3 px-5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-bold transition-all"
              >
                Close Analysis
              </button>

              <button
                onClick={() => navigate('/news')}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:shadow-cyan-500/40 flex items-center justify-center gap-1.5 transition-all"
              >
                View Latest Market News
                <ArrowUpRight size={15} />
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
