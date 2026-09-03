const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export async function loginUser(email, password) {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Login failed");
    }

    return data;
}

export async function registerUser(username, email, password) {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                email,
                password,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
    }

    return data;
}

export async function getMarketNews(pageNo = 1, size = 20) {
  const response = await fetch(
    `${API_BASE_URL}/api/news?page_no=${pageNo}&size=${size}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch market news");
  }

  return await response.json();
}

export async function compareStocks(stock1, stock2) {
  const response = await fetch(
    `${API_BASE_URL}/api/stocks/compare?stock1=${encodeURIComponent(stock1)}&stock2=${encodeURIComponent(stock2)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to load comparison data.");
  }

  return data;
}

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
}

export async function fetchWatchlist() {
  const response = await fetch(`${API_BASE_URL}/api/watchlist`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error("Failed to fetch watchlist");
  }
  return await response.json();
}

export async function addToWatchlist(symbol) {
  const response = await fetch(`${API_BASE_URL}/api/watchlist`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ symbol })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to add to watchlist");
  }
  return data;
}

export async function removeFromWatchlist(symbol) {
  const response = await fetch(`${API_BASE_URL}/api/watchlist/${encodeURIComponent(symbol)}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to remove from watchlist");
  }
  return data;
}