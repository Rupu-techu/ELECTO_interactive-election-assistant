const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
const fallbackBaseUrls = ["/api", "http://127.0.0.1:8000", "http://localhost:8000"];

function normalizeBaseUrl(baseUrl) {
  return baseUrl.replace(/\/+$/, "");
}

async function fetchJson(baseUrl, path, options = {}) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const finalUrl = `${normalizedBaseUrl}${path}`;
  console.info("Electo API request:", finalUrl, options);

  const response = await fetch(finalUrl, options);

  if (!response.ok) {
    const message = `API request failed with status ${response.status}`;
    console.warn(message, await response.text().catch(() => ""));
    throw new Error("The backend service returned an unexpected response.");
  }

  const data = await response.json();
  console.info("Electo API response:", data);
  return data;
}

export async function resolveApiBaseUrl() {
  const baseUrls = [configuredBaseUrl, ...fallbackBaseUrls].filter(Boolean);
  const attemptedUrls = [];

  for (const baseUrl of baseUrls) {
    try {
      const normalized = normalizeBaseUrl(baseUrl);
      attemptedUrls.push(normalized);
      console.info("Trying Electo backend at", normalized);
      await fetchJson(baseUrl, "/health");
      console.info("Electo backend reachable at", normalized);
      return baseUrl;
    } catch (error) {
      console.warn("Electo backend not reachable at", baseUrl, error.message);
      continue;
    }
  }

  throw new Error(
    `Unable to connect to the backend service. Tried: ${attemptedUrls.join(", ")}`
  );
}

export async function getHealthStatus() {
  const baseUrl = await resolveApiBaseUrl();
  return fetchJson(baseUrl, "/health");
}

export async function postChatMessage(payload) {
  try {
    const baseUrl = await resolveApiBaseUrl();
    return await fetchJson(baseUrl, "/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    if (error.message === "The backend service returned an unexpected response.") {
      throw error;
    }
    throw error;
  }
}
