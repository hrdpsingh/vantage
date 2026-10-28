export interface GitHubRepo {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    type: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string | null;
  } | null;
  allow_forking: boolean;
  is_template: boolean;
  topics: string[];
  visibility: string;
  default_branch: string;
  subscribers_count?: number;
  network_count?: number;
}

export type RepoLanguages = Record<string, number>;

export interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    comment_count: number;
  };
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  body: string | null;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
  labels: {
    id: number;
    name: string;
    color: string;
    description: string | null;
  }[];
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  pull_request?: {
    url: string;
    html_url: string;
    diff_url: string;
  };
}

export interface GitHubContributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  target_commitish: string;
  name: string | null;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  body: string | null;
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
  assets: {
    id: number;
    name: string;
    size: number;
    download_count: number;
    browser_download_url: string;
    content_type: string;
  }[];
}

export interface GitHubReadme {
  name: string;
  path: string;
  sha: string;
  size: number;
  content?: string;
  encoding?: string;
  download_url: string;
  html_url: string;
}

export interface CommunityProfile {
  health_percentage: number;
  description: string | null;
  documentation: string | null;
  files: {
    code_of_conduct: { name: string; url: string; html_url: string } | null;
    contributing: { name: string; url: string; html_url: string } | null;
    issue_template: { name: string; url: string; html_url: string } | null;
    pull_request_template: { name: string; url: string; html_url: string } | null;
    license: { name: string; key: string; url: string; html_url: string } | null;
    readme: { name: string; url: string; html_url: string } | null;
  };
  updated_at: string | null;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  used: number;
}

export interface WeeklyCommitActivity {
  total: number;
  week: number; // Unix timestamp
  days: number[]; // 7 numbers for Sun..Sat
}

export type PunchCardData = [number, number, number][]; // [day, hour, count]
