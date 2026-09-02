import { useEffect, useState } from 'react';
import { BarChart3, Bell, ChevronRight, Home, LogOut, Newspaper, Scale, Search, Star, TrendingUp } from 'lucide-react';
import { getCurrentUser } from '../utils/user';

const features = [
  { title: 'Analyze Stocks', description: 'Get AI-powered analysis and actionable insights for any stock.', icon: BarChart3, color: 'from-cyan-400 to-blue-500' },
  { title: 'Stock Comparison', description: 'Compare multiple stocks side by side and make confident decisions.', icon: Scale, color: 'from-violet-400 to-indigo-500' },
  { title: 'Watchlist', description: 'Track your favourite stocks and stay on top of price movements.', icon: Star, color: 'from-sky-400 to-cyan-500' },
  { title: 'News', description: 'Keep up with the latest market news and company updates.', icon: Newspaper, color: 'from-blue-400 to-violet-500' },
];

export default function FeatureSelectionPage() {
  const [user, setUser] = useState(getCurrentUser());
  const navigate = (path) => { window.history.pushState({}, '', path); window.dispatchEvent(new Event('locationchange')); };

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <main className="feature-page">
      <aside className="feature-sidebar">
        <button className="feature-brand" onClick={() => navigate('/')} aria-label="Go to home">
          <img src="/logo.png" alt="Stock Vista" className="w-9 h-9 object-contain rounded-lg shadow-md shadow-cyan-500/20 border border-cyan-500/20" />
          <span className="text-xl font-bold tracking-tight text-white">Stock Vista</span>
        </button>
        <div className="feature-user"><div className="feature-avatar">{user.initial}</div><div><strong>Welcome, {user.firstName}</strong><small>Market explorer</small></div></div>
        <nav className="feature-nav">
          <a className="active" href="/options"><Home size={18} />Home</a>
          <a href="/analyze" onClick={(event) => { event.preventDefault(); navigate('/analyze'); }}><Search size={18} />Analyze Stocks</a>
          <a href="/compare" onClick={(event) => { event.preventDefault(); navigate('/compare'); }}><Scale size={18} />Stock Comparison</a>
          <a href="/watchlist" onClick={(event) => { event.preventDefault(); navigate('/watchlist'); }}><Star size={18} />Watchlist</a>
          <a href="/news" onClick={(event) => { event.preventDefault(); navigate('/news'); }}><Newspaper size={18} />News</a>
        </nav>
        <div className="feature-sidebar-bottom">
          <button onClick={() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            navigate('/login');
          }}>
            <LogOut size={18} />Log out
          </button>
        </div>
      </aside>
      <section className="feature-main">
        <header className="feature-header"><div><p className="feature-eyebrow">MARKET COMMAND CENTER</p><h1>Hello, {user.firstName} <span>✦</span></h1><p>What would you like to explore today?</p></div><button className="feature-notifications" aria-label="Notifications"><Bell size={20} /></button></header>
        <section className="feature-grid" aria-label="Choose a feature">
          {features.map(({ title, description, icon: Icon, color }) => {
            const targetPath = title === 'Analyze Stocks' ? '/analyze' : title === 'News' ? '/news' : title === 'Stock Comparison' ? '/compare' : title === 'Watchlist' ? '/watchlist' : '#';
            return (
              <a
                key={title}
                id={title === 'Analyze Stocks' ? 'analyze' : title === 'Stock Comparison' ? 'compare' : title.toLowerCase()}
                href={targetPath}
                onClick={targetPath !== '#' ? (event) => { event.preventDefault(); navigate(targetPath); } : undefined}
                className="feature-card"
              >
                <div className={`feature-card-icon bg-gradient-to-br ${color}`}><Icon size={29} strokeWidth={1.9} /></div>
                <div className="feature-card-copy"><h2>{title}</h2><p>{description}</p></div>
                <span className="feature-card-arrow"><ChevronRight size={20} /></span>
              </a>
            );
          })}
        </section>
      </section>
    </main>
  );
}
