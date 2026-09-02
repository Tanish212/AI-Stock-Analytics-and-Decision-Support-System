import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Code2,
  X,
  TrendingUp,
  BarChart2,
  ShieldCheck,
  Cpu,
  Layers,
  Menu,
  Newspaper
} from 'lucide-react';

import CanvasBackground from './components/CanvasBackground';
import LoginPage from './components/LoginPage';
import FeatureSelectionPage from './components/FeatureSelectionPage';
import NewsPage from './components/NewsPage';
import StockAnalyzePage from './components/StockAnalyzePage';
import StockDashboardPage from './components/StockDashboardPage';
import StockComparePage from './components/StockComparePage';
import StockWatchlistPage from './components/StockWatchlistPage';


const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full bg-transparent">
      <nav className="flex items-center justify-between px-6 sm:px-10 py-6 w-full">

        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Stock Vista Logo"
            className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-cyan-500/30 border border-cyan-500/20"
          />

          <span className="text-2xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent tracking-tighter">
            Stock Vista
          </span>
        </div>


        <div className="flex items-center gap-4">

          <a
            href="/login"
            className="px-5 py-2.5 text-sm font-medium rounded-full border border-blue-500/30 text-slate-200 hover:text-white hover:bg-blue-950/40 hover:border-blue-500/60 transition-all"
          >
            Login
          </a>

          <a
            href="/login"
            className="px-5 py-2.5 text-sm font-medium rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 transition-all shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(56,189,248,0.8)] transform hover:-translate-y-0.5"
          >
            Get Started
          </a>

        </div>

      </nav>


      {mobileMenuOpen && (
        <div className="md:hidden glass-card p-6 border-t border-cyan-500/20 shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200 w-full">

          <div className="pt-2 flex flex-col gap-3">

            <a
              href="/login"
              className="w-full py-2.5 text-center text-sm font-medium rounded-full border border-blue-500/30 text-slate-200 hover:bg-blue-950/40"
            >
              Login
            </a>

            <a
              href="/login"
              className="w-full py-2.5 text-center text-sm font-medium rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/40"
            >
              Get Started
            </a>

          </div>

        </div>
      )}

    </header>
  );
};


const Hero = () => (
  <section
    id="home"
    className="text-center pt-40 pb-20 px-6 sm:px-10 relative z-10 min-h-screen flex flex-col items-center justify-center w-full"
  >

    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none -z-10"></div>

    <div className="relative z-10 w-full">


      <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-[1.1] text-white w-full">

        AI-POWERED <br />

        <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
          STOCK ANALYTICS
        </span>

      </h1>


      <p className="text-slate-300 max-w-4xl mx-auto text-lg md:text-2xl mb-12 font-normal leading-relaxed">
        Analyze Indian stocks with GRU-powered price forecasting, OHLCV data analysis, and data-driven decision support — all in one platform.
      </p>


      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">

        <a
          href="/login"
          className="w-full sm:w-auto px-10 py-4 text-base font-bold rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 transition-all shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:shadow-[0_0_45px_rgba(56,189,248,0.8)] transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          Get Started
          <ArrowUpRight className="w-5 h-5" />
        </a>

      </div>

    </div>

  </section>
);


const TrustBar = () => (
  <section className="pb-32 px-6 sm:px-10 relative z-10 w-full">

    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-7 rounded-3xl border border-cyan-500/25 bg-slate-950/70 px-8 py-9 shadow-2xl shadow-blue-950/50 backdrop-blur-xl md:flex-row md:gap-10">

      <div className="flex items-center">

        <div className="flex flex-col">

          <div className="text-3xl md:text-4xl font-extrabold text-white flex items-baseline gap-2">
            11+
            <span className="text-xs text-cyan-300 uppercase tracking-wider font-semibold">
              years of data
            </span>
          </div>

        </div>

      </div>


      <div className="hidden h-12 w-px bg-cyan-500/30 md:block"></div>


      <div className="flex flex-wrap items-center justify-center gap-7 md:gap-10">

        <div className="flex flex-col">

          <div className="text-3xl md:text-4xl font-extrabold text-white flex items-baseline gap-2">
            2800+
            <span className="text-xs text-cyan-300 uppercase tracking-wider font-semibold">
              Trading days
            </span>
          </div>

        </div>


        <div className="hidden h-12 w-px bg-cyan-500/30 md:block"></div>


        <div className="flex flex-col">

          <div className="text-3xl md:text-4xl font-extrabold text-white flex items-baseline gap-2">
            100+
            <span className="text-xs text-cyan-300 uppercase tracking-wider font-semibold">
              Stocks support
            </span>
          </div>

        </div>

      </div>

    </div>

  </section>
);


const Services = () => {

  const services = [
    {
      title: "AI Analytics",
      desc: "Machine learning for intelligent stock analysis.",
      active: false,
      icon: Cpu
    },
    {
      title: "Model Performance",
      desc: "Evaluate prediction accuracy with RMSE, R², and other performance metrics.",
      active: true,
      icon: Code2
    },
    {
      title: "News & Insights",
      desc: "Stay updated with relevant market news and financial insights.",
      active: false,
      icon: Newspaper
    },
    {
      title: "Stock Comparison",
      desc: "Compare stocks and uncover market differences.",
      active: false,
      icon: Layers
    },
    {
      title: "Decision Support",
      desc: "Data-driven insights for smarter decisions.",
      active: false,
      icon: ShieldCheck
    },
    {
      title: "Interactive Insights",
      desc: "Explore market data through dynamic visualizations.",
      active: false,
      icon: TrendingUp
    },
  ];


  return (
    <section
      id="features"
      className="px-6 sm:px-10 pb-32 w-full relative z-10"
    >

      <div className="text-center mb-16 w-full">

        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-4">
          Core Capabilities
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">
          Intelligent Analysis.
          <span className="text-cyan-400">
            Data-Driven Decisions.
          </span>
        </h2>

        <p className="text-slate-300 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
          Harness AI, machine learning, and technical market data to understand stock trends and make informed decisions across the Indian stock market.
        </p>

      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">

        {services.map((service, i) => {

          const Icon = service.icon;

          return (
            <div
              key={i}
              className="p-8 sm:p-10 rounded-3xl border transition-all duration-300 relative group cursor-pointer w-full glass-card hover:border-cyan-400/70 hover:bg-blue-900/75 hover:shadow-2xl hover:shadow-cyan-950/60 hover:-translate-y-1"
            >

              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-colors bg-blue-950/80 border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-400/20 group-hover:text-white group-hover:border-cyan-300">
                <Icon className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-bold mb-3 text-slate-100 group-hover:text-cyan-300">
                {service.title}
              </h3>

              <p className="text-base leading-relaxed text-slate-300 group-hover:text-cyan-100">
                {service.desc}
              </p>

            </div>
          );

        })}

      </div>

    </section>
  );
};


const Stats = () => {

  const stats = [
    {
      num: "✗",
      isNegative: true,
      title: "Traditional Market Analysis",
      bottomStatement: "Manual market analysis can lead to missed opportunities and inconsistent decisions.",
      points: [
        {
          title: "Limited Data Perspective",
          desc: "Manually reviewing large amounts of OHLCV data can be difficult."
        },
        {
          title: "Human Bias",
          desc: "Emotions and personal opinions can influence investment decisions."
        },
        {
          title: "Time-Consuming Process",
          desc: "Analyzing historical prices and comparing stocks manually takes time and effort."
        }
      ]
    },
    {
      num: "✓",
      isNegative: false,
      title: "AI-Powered Market Analysis",
      bottomStatement: "AI models analyze OHLCV data to deliver reliable forecasts, actionable signals, and data-driven insights for better stock analysis.",
      points: [
        {
          title: "OHLCV-Based Data Processing",
          desc: "Analyze Open, High, Low, Close, and Volume (OHLCV) data to capture historical market patterns."
        },
        {
          title: "GRU Deep Learning Models",
          desc: "GRU models learn patterns from historical OHLCV data to forecast future stock prices."
        },
        {
          title: "Price Predictions & Signals",
          desc: "Generate future price forecasts and BUY / SELL / HOLD signals."
        }
      ]
    },
  ];


  return (
    <section
      id="analyze"
      className="py-32 px-6 sm:px-10 relative z-10 w-full"
    >

      <div className="w-full">

        <div className="text-center mb-16 w-full">

          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-4">
            Comparison Matrix
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">
            Human Intuition vs. AI Precision
          </h2>

          <p className="text-cyan-200/90 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
            Why automated intelligence outperforms traditional manual analysis.
          </p>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">

          {stats.map((stat, i) => (

            <div
              key={i}
              className={`p-8 sm:p-12 rounded-3xl border transition-all duration-300 glass-card text-left relative group hover:border-cyan-500/50 flex flex-col w-full ${stat.isNegative
                  ? 'border-rose-500/20 bg-rose-950/10'
                  : 'border-cyan-500/40 bg-blue-950/40 shadow-xl shadow-blue-950/50'
                }`}
            >

              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black mb-8 ${stat.isNegative
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                  }`}
              >
                {stat.num}
              </div>

              <h3 className="text-3xl font-extrabold text-white mb-8">
                {stat.title}
              </h3>

              {stat.points && (
                <div className="space-y-6 mt-auto">

                  {stat.points.map((point, idx) => (

                    <div
                      key={idx}
                      className="border-l-2 border-cyan-500/30 pl-4 py-1"
                    >

                      <h4 className="text-cyan-300 font-bold mb-1 text-base">
                        {point.title}
                      </h4>

                      <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                        {point.desc}
                      </p>

                    </div>

                  ))}

                </div>
              )}

              {stat.bottomStatement && (
                <div className={`mt-8 pt-4 border-t text-sm md:text-base font-semibold leading-relaxed ${stat.isNegative ? 'border-rose-500/20 text-rose-300/90' : 'border-cyan-500/30 text-cyan-200'
                  }`}>
                  {stat.bottomStatement}
                </div>
              )}

            </div>

          ))}

        </div>

      </div>

    </section>
  );
};


const Portfolio = () => {

  const projects = [
    {
      category: "All-in-One",
      title: "Complete Market View",
      desc: "Bring stock data, market trends, and AI analysis together in one platform."
    },
    {
      category: "Explainable",
      title: "Understand the Analysis",
      desc: "Go beyond the result and explore the market factors and indicators behind the AI-driven analysis."
    },
    {
      category: "DL-Driven",
      title: "Deep Learning Intelligence",
      desc: "GRU deep learning models analyze historical OHLCV patterns to forecast stock prices and support informed decisions."
    },
  ];


  return (
    <section
      id="compare"
      className="py-32 px-6 sm:px-10 w-full relative z-10"
    >

      <div className="text-center mb-16 w-full">

        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-4">
          Core Advantage
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
          Why This Platform
        </h2>

        <p className="text-slate-300 max-w-2xl mx-auto text-lg">
          Built specifically for standard and modern traders to streamline financial decision-making.
        </p>

      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 w-full">

        {projects.map((proj, i) => (

          <div
            key={i}
            className="p-8 sm:p-10 rounded-3xl glass-card hover:border-cyan-500/50 hover:bg-blue-950/40 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 w-full"
          >

            <div className="text-cyan-400 text-xs font-extrabold uppercase tracking-widest mb-6">
              {proj.category}
            </div>

            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-300 transition-colors">
              {proj.title}
            </h3>

            <p className="text-slate-300 text-base leading-relaxed">
              {proj.desc}
            </p>

          </div>

        ))}

      </div>


      <div className="text-center">
        <a
          href="/login"
          className="inline-block px-9 py-4 text-base font-bold rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(56,189,248,0.7)] cursor-pointer"
        >
          View All Services
        </a>
      </div>

    </section>
  );
};


const Testimonials = () => {

  return (
    <section
      id="about"
      className="py-28 w-full text-center relative z-10"
    >

      <div className="p-12 md:p-20 glass-card border-y border-cyan-500/30 shadow-2xl relative overflow-hidden w-full">

        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/25 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-600/25 blur-[100px] rounded-full pointer-events-none"></div>


        <h2 className="text-3xl md:text-6xl font-black leading-tight w-full text-white mb-6">
          Empowering every investor with{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400 bg-clip-text text-transparent">
            intelligent Market Analytics
          </span>
        </h2>

        <p className="text-slate-300 max-w-3xl mx-auto text-lg md:text-xl">
          Join thousands of traders leveraging artificial intelligence to gain real-time clarity into market dynamics.
        </p>

      </div>

    </section>
  );
};


const Footer = () => (

  <footer className="border-t border-blue-950/80 py-12 px-6 sm:px-10 relative z-10 bg-slate-950/90 backdrop-blur-md w-full">

    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-400">

      <div className="flex items-center gap-3">

        <img
          src="/logo.png"
          alt="Stock Vista Logo"
          className="w-8 h-8 object-contain rounded-lg border border-cyan-500/20 shadow-md shadow-cyan-500/20"
        />

        <span className="text-xl font-black text-white tracking-tighter">
          Stock Vista
        </span>

      </div>


      <p className="text-xs text-slate-300">
        © {new Date().getFullYear()} 𝖲𝗍𝗈𝖼𝗄 𝖵𝗂𝗌𝗍𝖺. All rights reserved. Indian Stock Market Analytics platform.
      </p>


      <div className="flex gap-6 text-xs text-slate-400 font-medium">

        <a href="#" className="hover:text-cyan-400 transition-colors">
          Privacy Policy
        </a>

        <a href="#" className="hover:text-cyan-400 transition-colors">
          Terms of Service
        </a>

        <a href="#" className="hover:text-cyan-400 transition-colors">
          Contact Support
        </a>

      </div>

    </div>

  </footer>
);


export default function App() {

  const [path, setPath] = useState(window.location.pathname);


  useEffect(() => {
    const onLocationChange = (e) => {
      const currentPath = window.location.pathname;

      // Handle browser back button (popstate)
      if (e && e.type === 'popstate') {
        // If back button pressed while on Login page (/login), go directly to Landing Page (/)
        if (path === '/login' || currentPath === '/login') {
          window.history.replaceState({}, '', '/');
          setPath('/');
          return;
        }
      }

      setPath(currentPath);
    };

    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('locationchange', onLocationChange);

    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('locationchange', onLocationChange);
    };
  }, [path]);


  /*
   * Manual routing used by the existing application.
   * No React Router is required.
   */

  if (path === '/login') {
    return <LoginPage />;
  }

  if (path === '/options') {
    return <FeatureSelectionPage />;
  }

  if (path === '/analyze') {
    return <StockAnalyzePage />;
  }

  if (path === '/news') {
    return <NewsPage />;
  }

  if (path === '/compare') {
    return <StockComparePage />;
  }

  if (path === '/watchlist') {
    return <StockWatchlistPage />;
  }

  if (path.startsWith('/stock/')) {
    const symbol = path.split('/stock/')[1];
    return <StockDashboardPage symbol={symbol} />;
  }


  return (

    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-cyan-500/30 relative w-full max-w-full overflow-x-hidden p-0 m-0">

      <CanvasBackground />

      <div className="relative z-10 w-full max-w-full p-0 m-0">

        <Navbar />

        <main className="w-full max-w-full p-0 m-0">

          <Hero />

          <TrustBar />

          <Services />

          <Stats />

          <Portfolio />

          <Testimonials />

        </main>

        <Footer />

      </div>

    </div>

  );
}