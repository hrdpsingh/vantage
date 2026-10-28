import {
  GitHubRepo,
  RepoLanguages,
  GitHubCommit,
  GitHubIssue,
  GitHubContributor,
  GitHubRelease,
  GitHubReadme,
  CommunityProfile,
  RateLimitInfo,
} from '../types/github';

const TOKEN_KEY = 'repopulse_github_token';
const API_BASE = 'https://api.github.com';

// In-memory cache with 5 minute expiration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 5 * 60 * 1000;

let currentRateLimit: RateLimitInfo = {
  limit: 60,
  remaining: 60,
  reset: Math.floor(Date.now() / 1000) + 3600,
  used: 0,
};

type RateLimitListener = (info: RateLimitInfo) => void;
const listeners = new Set<RateLimitListener>();

export function getStoredToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredToken(token: string) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token.trim());
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage issues
  }
}

export function subscribeRateLimit(listener: RateLimitListener) {
  listeners.add(listener);
  listener(currentRateLimit);
  return () => {
    listeners.delete(listener);
  };
}

function updateRateLimitFromHeaders(headers: Headers) {
  const limit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  const reset = headers.get('x-ratelimit-reset');
  const used = headers.get('x-ratelimit-used');

  if (limit !== null && remaining !== null && reset !== null) {
    currentRateLimit = {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10),
      used: used ? parseInt(used, 10) : parseInt(limit, 10) - parseInt(remaining, 10),
    };
    listeners.forEach((fn) => fn(currentRateLimit));
  }
}

export function getCurrentRateLimit(): RateLimitInfo {
  return currentRateLimit;
}

export function clearCache() {
  cache.clear();
}

async function apiRequest<T>(endpoint: string, options: { bypassCache?: boolean } = {}): Promise<T> {
  const cacheKey = endpoint;
  const now = Date.now();

  if (!options.bypassCache && cache.has(cacheKey)) {
    const entry = cache.get(cacheKey) as CacheEntry<T>;
    if (now - entry.timestamp < CACHE_TTL) {
      return entry.data;
    }
  }

  const token = getStoredToken();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const response = await fetch(url, { headers });

  updateRateLimitFromHeaders(response.headers);

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      const resetTime = currentRateLimit.reset
        ? new Date(currentRateLimit.reset * 1000).toLocaleTimeString()
        : 'soon';
      throw new Error(
        `GitHub API rate limit exceeded (${currentRateLimit.remaining}/${currentRateLimit.limit}). Resets at ${resetTime}. Add a Personal Access Token in the top bar to increase your limit to 5,000 requests/hr.`
      );
    }
    if (response.status === 404) {
      throw new Error(`Repository or resource not found on GitHub. Verify the owner and repository name.`);
    }
    if (response.status === 401) {
      throw new Error(`Invalid GitHub Personal Access Token. Please check or remove your token in Settings.`);
    }
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `GitHub API error: HTTP ${response.status}`);
  }

  const data = (await response.json()) as T;
  cache.set(cacheKey, { data, timestamp: now });
  return data;
}

export async function fetchRepository(owner: string, repo: string): Promise<GitHubRepo> {
  return apiRequest<GitHubRepo>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function fetchLanguages(owner: string, repo: string): Promise<RepoLanguages> {
  return apiRequest<RepoLanguages>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`);
}

export async function fetchCommits(owner: string, repo: string, perPage = 30): Promise<GitHubCommit[]> {
  return apiRequest<GitHubCommit[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=${perPage}`
  );
}

export async function fetchIssues(owner: string, repo: string, perPage = 30): Promise<GitHubIssue[]> {
  return apiRequest<GitHubIssue[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues?state=all&per_page=${perPage}&sort=updated`
  );
}

export async function fetchPullRequests(owner: string, repo: string, perPage = 30): Promise<GitHubIssue[]> {
  return apiRequest<GitHubIssue[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=all&per_page=${perPage}&sort=updated`
  );
}

export async function fetchContributors(owner: string, repo: string, perPage = 25): Promise<GitHubContributor[]> {
  return apiRequest<GitHubContributor[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=${perPage}`
  );
}

export async function fetchReleases(owner: string, repo: string, perPage = 15): Promise<GitHubRelease[]> {
  return apiRequest<GitHubRelease[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases?per_page=${perPage}`
  );
}

export async function fetchReadme(owner: string, repo: string): Promise<GitHubReadme> {
  return apiRequest<GitHubReadme>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`);
}

export async function fetchCommunityProfile(owner: string, repo: string): Promise<CommunityProfile | null> {
  try {
    return await apiRequest<CommunityProfile>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/community/profile`
    );
  } catch {
    return null;
  }
}

export async function fetchCommitActivity(owner: string, repo: string): Promise<any[] | null> {
  try {
    const data = await apiRequest<any[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stats/commit_activity`
    );
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export async function fetchPunchCard(owner: string, repo: string): Promise<[number, number, number][] | null> {
  try {
    const data = await apiRequest<[number, number, number][]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stats/punch_card`
    );
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export async function fetchRateLimit(): Promise<RateLimitInfo> {
  try {
    const res = await apiRequest<{
      rate: {
        limit: number;
        remaining: number;
        reset: number;
        used: number;
      };
    }>('/rate_limit', { bypassCache: true });
    currentRateLimit = res.rate;
    listeners.forEach((fn) => fn(currentRateLimit));
    return currentRateLimit;
  } catch {
    return currentRateLimit;
  }
}

export async function searchRepositories(query: string): Promise<{ items: GitHubRepo[]; total_count: number }> {
  if (!query.trim()) return { items: [], total_count: 0 };
  return apiRequest<{ items: GitHubRepo[]; total_count: number }>(
    `/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=8`
  );
}

export async function testToken(token: string): Promise<{ valid: boolean; user?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/user`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${token.trim()}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return { valid: true, user: data.login };
    } else {
      return { valid: false, error: 'Token rejected by GitHub API (HTTP ' + response.status + ')' };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network failure';
    return { valid: false, error: message };
  }
}
