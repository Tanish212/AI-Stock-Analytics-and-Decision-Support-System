import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Search,
  Home,
  Scale,
  Newspaper,
  LogOut,
  Bell,
  TrendingUp,
  TrendingDown,
  Minus,
  Cpu,
  Activity,
  ArrowUpRight,
  ArrowLeft,
  Trash2,
  RefreshCw,
  Sparkles,
  BarChart3,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { STOCKS_103 } from '../data/stocksData';
import { getCurrentUser } from '../utils/user';
import { fetchWatchlist, removeFromWatchlist } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function StockWatchlistPage() {
  const [user, setUser] = useState(getCurrentUser());
  const [watchlistSymbols, setWatchlistSymbols] = useState([]);
  const [stockDetailsMap, setStockDetailsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('locationchange'));
  };

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // Fetch watchlist symbols and then load individual live stock analyses
  const loadWatchlistData = async () => {
    setLoading(true);
    try {
      const res = await fetchWatchlist();
      if (res.success && Array.isArray(res.watchlist)) {
        const symbols = res.watchlist.map(item => item.symbol);
        setWatchlistSymbols(symbols);

        // Fetch live GRU predictions for each watchlisted stock in parallel
        const map = {};
        await Promise.all(
          symbols.map(async (sym) => {
            try {
              const resp = await fetch(`${API_BASE_URL}/api/stocks/${sym}/analysis`);
              if (resp.ok) {
                const json = await resp.json();
                if (json.success && json.data) {
                  map[sym] = json.data;
                }
              }
            } catch (e) {
              console.warn(`Could not fetch analysis for watchlisted stock ${sym}:`, e);
            }
          })
        );
        setStockDetailsMap(map);
      }
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlistData();
  }, []);

  // Handle removing a stock from watchlist
  const handleRemove = async (symbol, e) => {
    e.stopPropagation();
    try {
      await removeFromWatchlist(symbol);
      setWatchlistSymbols(prev => prev.filter(s => s !== symbol));
    } catch (err) {
      console.error('Failed to remove stock from watchlist:', err);
    }
  };

  // Combine watchlisted symbols with STOCKS_103 metadata and loaded analysis
  const watchlistedStocks = useMemo(() => {
    return watchlistSymbols.map(symbol => {
      const meta = STOCKS_103.find(s => s.symbol === symbol) || {
        ticker: `${symbol}.NS`,
        symbol: symbol,
        name: symbol,
        sector: 'Indian Market'
      };
      const analysis = stockDetailsMap[symbol] || null;
      return { meta, analysis };
    });
  }, [watchlistSymbols, stockDetailsMap]);

  // Unique list of sectors present in the user's saved watchlist
  const sectors = useMemo(() => {
    const set = new Set(watchlistedStocks.map(item => item.meta.sector));
    return ['All', ...Array.from(set).sort()];
  }, [watchlistedStocks]);

  // Filter saved stocks by search query and sector
  const filteredWatchlist = useMemo(() => {
    return watchlistedStocks.filter(item => {
      const matchesSearch =
        item.meta.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meta.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meta.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSector =
        selectedSector === 'All' || item.meta.sector === selectedSector;

      return matchesSearch && matchesSector;
    });
  }, [watchlistedStocks, searchTerm, selectedSector]);

  // Helper for Signal Badge Styling
  const getSignalBadge = (direction) => {
    const dir = (direction || 'HOLD').toUpperCase();
    if (dir === 'BUY' || dir === 'UP') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <TrendingUp size={14} /> BUY ↑
        </span>
      );
    } else if (dir === 'SELL' || dir === 'DOWN') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
          <TrendingDown size={14} /> SELL ↓
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <Minus size={14} /> HOLD →
        </span>
      );
    }
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
          <a href="/compare" onClick={(e) => { e.preventDefault(); navigate('/compare'); }}>
            <Scale size={18} />
            Stock Comparison
          </a>
          <a className="active" href="/watchlist" onClick={(e) => e.preventDefault()}>
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
        {/* Top Header */}
        <header className="feature-header mb-8">
          <div>
            <p className="feature-eyebrow">SAVED STOCKS TRACKING CENTER</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              MY WATCHLIST <span>✦</span>
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Track and analyze your saved favorited stocks with live GRU neural network predictions.
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
            <button
              onClick={loadWatchlistData}
              className="p-2.5 rounded-xl border border-cyan-500/30 bg-slate-900/60 text-cyan-300 hover:bg-cyan-500/20 transition-all text-xs font-semibold flex items-center gap-1.5"
              title="Refresh Watchlist"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="feature-notifications" aria-label="Notifications">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Search & Filter Controls */}
        {watchlistSymbols.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex items-center w-full sm:w-96">
                <div className="absolute left-4 text-cyan-400 pointer-events-none">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter your watchlist..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-blue-950/40 border border-cyan-500/30 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Sector Filter */}
              {sectors.length > 1 && (
                <div className="flex items-center gap-2 text-xs bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                  <Filter size={14} className="text-cyan-400" />
                  <span className="text-slate-300 font-semibold">Sector:</span>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="bg-slate-800 text-cyan-300 font-medium px-2 py-0.5 rounded-md border border-cyan-500/30 focus:outline-none"
                  >
                    {sectors.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Skeleton State */}
        {loading && watchlistSymbols.length === 0 && (
          <div className="p-12 text-center rounded-3xl glass-card border border-cyan-500/20 animate-pulse min-h-[300px] flex flex-col items-center justify-center">
            <RefreshCw size={32} className="text-cyan-400 animate-spin mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Loading your saved watchlist...</h3>
            <p className="text-xs text-slate-400">Syncing favorited stocks and fetching GRU price predictions</p>
          </div>
        )}

        {/* Empty Watchlist State */}
        {!loading && watchlistSymbols.length === 0 && (
          <div className="p-12 text-center rounded-3xl glass-card border border-cyan-500/20 min-h-[320px] flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-4 shadow-lg shadow-amber-500/10">
              <Star size={32} fill="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">YOUR WATCHLIST IS EMPTY</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              You haven't favorited any stocks yet. Go to Analyze Stocks and click the star icon on stocks you want to track here.
            </p>
            <button
              onClick={() => navigate('/analyze')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <BarChart3 size={16} /> Explore & Analyze Stocks
            </button>
          </div>
        )}

        {/* Saved Stocks Grid / List */}
        {!loading && filteredWatchlist.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
            {filteredWatchlist.map(({ meta, analysis }) => {
              const pred = analysis?.prediction;
              const perf = analysis?.model_performance;

              return (
                <div
                  key={meta.symbol}
                  className="glass-card p-5 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 flex flex-col justify-between shadow-xl transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-xl rounded-full pointer-events-none"></div>

                  <div>
                    {/* Top Row: Symbol & Remove Button */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs">
                        {meta.ticker}
                      </span>

                      <div className="flex items-center gap-2">
                        {pred && getSignalBadge(pred.direction)}
                        
                        <button
                          onClick={(e) => handleRemove(meta.symbol, e)}
                          className="p-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 text-amber-300 hover:bg-rose-500/30 hover:border-rose-500/50 hover:text-rose-300 transition-colors"
                          title="Remove from watchlist"
                        >
                          <Star size={15} fill="currentColor" />
                        </button>
                      </div>
                    </div>

                    {/* Stock Name & Sector */}
                    <h3 className="text-xl font-extrabold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {meta.symbol}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-1">{meta.name}</p>

                    {/* Price & Prediction Summary */}
                    {pred ? (
                      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Current Price:</span>
                          <span className="text-white font-bold">₹{pred.last_close.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">GRU Forecast:</span>
                          <span className="text-cyan-300 font-bold">₹{pred.predicted_close.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                          <span className="text-slate-400">Expected Change:</span>
                          <span className={pred.price_change >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {pred.price_change >= 0 ? '+' : ''}₹{pred.price_change} ({pred.percentage_change >= 0 ? '+' : ''}{pred.percentage_change}%)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 mb-4 italic">
                        Loading GRU prediction data...
                      </div>
                    )}
                  </div>

                  {/* Analyze Stock Action Button */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">{meta.sector}</span>
                    <button
                      onClick={() => navigate(`/stock/${meta.symbol}?from=watchlist`)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-md hover:shadow-cyan-500/40 hover:scale-105 transition-all flex items-center gap-1.5"
                    >
                      <BarChart3 size={14} /> Analyze Stock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
