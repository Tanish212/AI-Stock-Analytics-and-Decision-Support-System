import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Clock, RefreshCw } from "lucide-react";
import { getMarketNews } from "../services/api";

function getTimeAgo(dateString) {
  const published = new Date(dateString);
  const now = new Date();

  const difference = Math.floor(
    (now.getTime() - published.getTime()) / 1000
  );

  if (difference < 60) {
    return `${difference} seconds ago`;
  }

  const minutes = Math.floor(difference / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  return published.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const goToOptions = () => {
    window.history.pushState({}, "", "/options");
    window.dispatchEvent(new Event("locationchange"));
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMarketNews(1, 20);

      // Make sure we always work with an array
      const articles = Array.isArray(data)
        ? data
        : data.news || data.data || [];

      // Newest articles first
      const sortedNews = [...articles].sort(
        (a, b) =>
          new Date(b.pub_date).getTime() -
          new Date(a.pub_date).getTime()
      );

      setNews(sortedNews.slice(0, 20));
    } catch (err) {
      console.error("News fetch error:", err);
      setError("Unable to load market news.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <main className="news-page">

      <div className="news-header">
        <div>
          <p className="news-label">INDIAN MARKETS</p>

          <h1>
            Latest Market News
          </h1>

          <p className="news-description">
            Stay updated with the latest developments across Indian
            stock markets and financial markets.
          </p>
        </div>

        <div className="news-actions">
          <button className="news-back" onClick={goToOptions}>
            <ArrowLeft size={17} />
            Back
          </button>

          <button
            className="news-refresh"
            onClick={fetchNews}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? "Updating..." : "Refresh News"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="news-status">
          Loading latest market news...
        </div>
      )}

      {error && (
        <div className="news-error">
          {error}
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="news-status">
          No market news available right now.
        </div>
      )}

      <section className="news-list">

        {news.map((article, index) => (
          <article
            className="news-card"
            key={`${article.url}-${index}`}
          >

            {article.image_url && (
              <div className="news-image-wrapper">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="news-image"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="news-content">

              <div className="news-meta">
                <span className="news-source">
                  {article.source || "Market News"}
                </span>

                <span className="news-time">
                  <Clock size={14} />
                  {getTimeAgo(article.pub_date)}
                </span>
              </div>

              <h2 className="news-title">
                {article.title}
              </h2>

              {article.summary && (
                <p className="news-summary">
                  {article.summary}
                </p>
              )}

              <div className="news-bottom">
                {article.topics?.length > 0 && (
                  <div className="news-topics">
                    {article.topics.slice(0, 2).map((topic, topicIndex) => (
                      <span key={topicIndex}>
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-read-more"
                >
                  Read Article
                  <ArrowUpRight size={16} />
                </a>
              </div>

            </div>

          </article>
        ))}

      </section>

    </main>
  );
}
