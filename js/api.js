// api.js — Frontend ↔ Backend bridge
// Signs every request with HMAC-SHA256 so raw API calls fail.
// The secret lives in the Cloudflare Worker / Netlify function proxy —
// never in the browser. For GitHub Pages, use a tiny proxy worker.

const API_BASE = "https://your-backend.onrender.com"; // Change to your backend URL

/**
 * Make a signed request to the backend.
 * @param {string} path - e.g. "/api/redeem"
 * @param {object} opts - fetch options (method, body, etc.)
 */
async function apiCall(path, opts = {}) {
  const ts   = String(Date.now() / 1000 | 0);
  const body = opts.body || "";

  // Signature computed by the proxy worker (not browser)
  // The browser calls /proxy?path=... and the worker signs it
  const res = await fetch(`${API_BASE}/proxy`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, method: opts.method || "GET", body: body ? JSON.parse(body) : undefined }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "unknown" }));
    throw err;
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function getMe() {
  return fetch(`${API_BASE}/auth/me`, { credentials: "include" }).then(r => r.json());
}

export function loginWithDiscord() {
  window.location.href = `${API_BASE}/auth/login`;
}

export function logout() {
  window.location.href = `${API_BASE}/auth/logout`;
}

// ── Code Redeem ───────────────────────────────────────────────────────────────

export async function redeemCode(code) {
  return apiCall("/api/redeem", { method: "POST", body: JSON.stringify({ code }) });
}

// ── Event 1 Trivia ────────────────────────────────────────────────────────────

export async function getTriviaQuestions() {
  return apiCall("/api/trivia/questions");
}

export async function submitTrivia(answers) {
  return apiCall("/api/trivia/submit", { method: "POST", body: JSON.stringify({ answers }) });
}

export async function getTriviaLeaderboard() {
  return fetch(`${API_BASE}/api/trivia/leaderboard`, { credentials: "include" }).then(r => r.json());
}

// ── Event 2 Boss Raid ─────────────────────────────────────────────────────────

export async function getBossState() {
  return fetch(`${API_BASE}/api/boss/state`, { credentials: "include" }).then(r => r.json());
}

export async function joinBoss(cls) {
  return apiCall("/api/boss/join", { method: "POST", body: JSON.stringify({ class: cls }) });
}

export async function bossAction(action, extra = {}) {
  return apiCall("/api/boss/action", { method: "POST", body: JSON.stringify({ action, ...extra }) });
}

export async function getBossLeaderboard() {
  return fetch(`${API_BASE}/api/boss/leaderboard`, { credentials: "include" }).then(r => r.json());
}

// ── Event 3 Guessing ──────────────────────────────────────────────────────────

export async function getGuessingQuestions() {
  return apiCall("/api/guessing/questions");
}

export async function submitGuessing(answers) {
  return apiCall("/api/guessing/submit", { method: "POST", body: JSON.stringify({ answers }) });
}

// ── Event 4 ───────────────────────────────────────────────────────────────────

export async function redeemEvent4Code(code) {
  return apiCall("/api/event4/redeem", { method: "POST", body: JSON.stringify({ code }) });
}

// ── Event 5 Casino ────────────────────────────────────────────────────────────

export async function playCoinFlip(bet) {
  return apiCall("/api/casino/coinflip", { method: "POST", body: JSON.stringify({ bet }) });
}

export async function playRoulette(bet, solo = true) {
  return apiCall("/api/casino/roulette", { method: "POST", body: JSON.stringify({ bet, solo }) });
}

export async function playDice(bet) {
  return apiCall("/api/casino/dice", { method: "POST", body: JSON.stringify({ bet }) });
}

export async function playSlots(bet) {
  return apiCall("/api/casino/slots", { method: "POST", body: JSON.stringify({ bet }) });
}

// ── Tickets ───────────────────────────────────────────────────────────────────

export async function getMyTickets() {
  return fetch(`${API_BASE}/api/tickets/me`, { credentials: "include" }).then(r => r.json());
}

export async function getTicketLeaderboard() {
  return fetch(`${API_BASE}/api/tickets/leaderboard`, { credentials: "include" }).then(r => r.json());
}
