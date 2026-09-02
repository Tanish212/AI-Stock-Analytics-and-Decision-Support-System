import os
import requests
import xml.etree.ElementTree as ET
import email.utils
import datetime
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

INDIAN_API_URL = "https://stock.indianapi.in/news"


def fetch_rss_news():
    rss_url = "https://news.google.com/rss/search?q=Indian+stock+market+Nifty+Sensex&hl=en-IN&gl=IN&ceid=IN:en"
    articles = []
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        req = requests.get(rss_url, headers=headers, timeout=10)
        if req.status_code == 200:
            root = ET.fromstring(req.content)
            for item in root.findall(".//item"):
                title_elem = item.find("title")
                title = title_elem.text if title_elem is not None else ""

                link_elem = item.find("link")
                link = link_elem.text if link_elem is not None else ""

                pub_elem = item.find("pubDate")
                pub_str = pub_elem.text if pub_elem is not None else ""
                try:
                    dt = email.utils.parsedate_to_datetime(pub_str)
                    iso_date = dt.strftime("%Y-%m-%dT%H:%M:%S")
                except Exception:
                    iso_date = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S")

                source_elem = item.find("source")
                source = source_elem.text if source_elem is not None else "Market News"

                if title and link:
                    articles.append({
                        "title": title,
                        "summary": title,
                        "url": link,
                        "image_url": "",
                        "pub_date": iso_date,
                        "source": source,
                        "topics": ["Indian Markets", "Live Updates"]
                    })
    except Exception as e:
        print("RSS fetch error:", e)

    return articles


def get_latest_news(page_no=1, size=20):
    api_key = os.getenv("INDIAN_API_KEY")
    api_articles = []

    if api_key:
        try:
            headers = {
                "x-api-key": api_key,
                "accept": "application/json"
            }
            params = {
                "page_no": page_no,
                "size": size
            }
            response = requests.get(
                INDIAN_API_URL,
                headers=headers,
                params=params,
                timeout=10
            )

            print("INDIAN API STATUS:", response.status_code)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    api_articles = data
                elif isinstance(data, dict):
                    api_articles = data.get("news", data.get("data", []))
        except Exception as e:
            print("Indian API fetch error:", e)

    rss_articles = fetch_rss_news()

    # Combine both sources
    combined = rss_articles + api_articles

    # Deduplicate by title
    seen = set()
    unique_articles = []
    for item in combined:
        title_key = item.get("title", "").strip().lower()
        if title_key and title_key not in seen:
            seen.add(title_key)
            unique_articles.append(item)

    # Helper to parse pub_date string for sorting
    def parse_pub_date(item):
        pd = item.get("pub_date", "")
        if pd:
            try:
                clean_pd = pd.replace("Z", "+00:00")
                return datetime.datetime.fromisoformat(clean_pd).timestamp()
            except Exception:
                pass
        return 0

    unique_articles.sort(key=parse_pub_date, reverse=True)
    return unique_articles[:size]