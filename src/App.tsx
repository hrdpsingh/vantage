import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchRepository,
  fetchLanguages,
  fetchCommits,
  fetchIssues,
  fetchContributors,
  fetchReleases,
  fetchReadme,
  fetchCommunityProfile,
  fetchRateLimit,
  fetchCommitActivity,
  fetchPunchCard,
} from './services/githubApi';
import {
  GitHubRepo,
  RepoLanguages,
  GitHubCommit,
  GitHubIssue,
  GitHubContributor,
  GitHubRelease,
  GitHubReadme,
  CommunityProfile,
  WeeklyCommitActivity,
} from './types/github';
import { Header } from './components/Header';
import { RepoHeader } from './components/RepoHeader';
import { OverviewTab } from './components/OverviewTab';
import { IssuesTab } from './components/IssuesTab';
import { ContributorsTab } from './components/ContributorsTab';
import { ReleasesTab } from './components/ReleasesTab';
import { RepoSearchModal } from './components/RepoSearchModal';
import { TokenModal } from './components/TokenModal';
import { CompareModal } from './components/CompareModal';
import { ExportModal } from './components/ExportModal';
import { InitialLaunchView } from './components/InitialLaunchView';
import {
  LayoutDashboard,
  AlertCircle,
  Users,
  Tag,
  RefreshCw,
  Search,
  Key,
} from 'lucide-react';

const RECENT_REPOS_KEY = 'repopulse_recent_repos';

export default function App() {
  const [currentOwner, setCurrentOwner] = useState<string>('');
  const [currentRepoName, setCurrentRepoName] = useState<string>('');

  // Data states
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [languages, setLanguages] = useState<RepoLanguages>({});
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [contributors, setContributors] = useState<GitHubContributor[]>([]);
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [readme, setReadme] = useState<GitHubReadme | null>(null);
  const [communityProfile, setCommunityProfile] = useState<CommunityProfile | null>(null);
  const [commitActivity, setCommitActivity] = useState<WeeklyCommitActivity[] | null>(null);
  const [punchCard, setPunchCard] = useState<[number, number, number][] | null>(null);

  // Loading & error states
  const [loading, setLoading] = useState<boolean>(false);
  const [readmeLoading, setReadmeLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active view
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'contributors' | 'releases'>('overview');

  // Modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // History
  const [recentRepos, setRecentRepos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_REPOS_KEY);
      return saved ? JSON.parse(saved) : ['facebook/react', 'vercel/next.js', 'torvalds/linux'];
    } catch {
      return ['facebook/react', 'vercel/next.js', 'torvalds/linux'];
    }
  });

  // On mount: fetch rate limit only (do not auto-load any repository)
  useEffect(() => {
    fetchRateLimit();
  }, []);

  // Save recent repos
  const saveRecent = useCallback((fullName: string) => {
    setRecentRepos((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== fullName.toLowerCase());
      const updated = [fullName, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_REPOS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const loadRepositoryData = useCallback(
    async (owner: string, repoName: string) => {
      if (!owner.trim() || !repoName.trim()) return;
      setLoading(true);
      setError(null);
      setReadme(null);
      setReadmeLoading(true);

      try {
        // Fetch core repo first
        const repoData = await fetchRepository(owner, repoName);
        setRepo(repoData);
        saveRecent(repoData.full_name);

        // Fetch parallel analytical data safely with Promise.allSettled
        const [
          langResult,
          commitsResult,
          issuesResult,
          contribResult,
          releasesResult,
          readmeResult,
          commProfileResult,
          activityResult,
          punchResult,
        ] = await Promise.allSettled([
          fetchLanguages(owner, repoName),
          fetchCommits(owner, repoName, 30),
          fetchIssues(owner, repoName, 30),
          fetchContributors(owner, repoName, 25),
          fetchReleases(owner, repoName, 15),
          fetchReadme(owner, repoName),
          fetchCommunityProfile(owner, repoName),
          fetchCommitActivity(owner, repoName),
          fetchPunchCard(owner, repoName),
        ]);

        if (langResult.status === 'fulfilled') setLanguages(langResult.value);
        if (commitsResult.status === 'fulfilled') setCommits(commitsResult.value);
        if (issuesResult.status === 'fulfilled') setIssues(issuesResult.value);
        if (contribResult.status === 'fulfilled') setContributors(contribResult.value);
        if (releasesResult.status === 'fulfilled') setReleases(releasesResult.value);
        if (readmeResult.status === 'fulfilled') setReadme(readmeResult.value);
        if (commProfileResult.status === 'fulfilled') setCommunityProfile(commProfileResult.value);
        if (activityResult.status === 'fulfilled') setCommitActivity(activityResult.value);
        if (punchResult.status === 'fulfilled') setPunchCard(punchResult.value);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load repository.';
        setError(msg);
      } finally {
        setLoading(false);
        setReadmeLoading(false);
      }
    },
    [saveRecent]
  );

  useEffect(() => {
    if (currentOwner && currentRepoName) {
      loadRepositoryData(currentOwner, currentRepoName);
    }
  }, [currentOwner, currentRepoName, loadRepositoryData]);

  const handleSelectRepo = (owner: string, repoName: string) => {
    setCurrentOwner(owner);
    setCurrentRepoName(repoName);
  };

  const handleResetHome = () => {
    setCurrentOwner('');
    setCurrentRepoName('');
    setRepo(null);
    setError(null);
    setLoading(false);
  };

  const handleClearRecent = () => {
    setRecentRepos([]);
    try {
      localStorage.removeItem(RECENT_REPOS_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        currentRepo={repo ? `${currentOwner}/${currentRepoName}` : ''}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenToken={() => setTokenModalOpen(true)}
        onOpenCompare={() => setCompareModalOpen(true)}
        onOpenExport={() => setExportModalOpen(true)}
        onQuickSelect={handleSelectRepo}
        onResetHome={handleResetHome}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {loading && !repo ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-200 dark:bg-slate-900 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-slate-200 dark:bg-slate-900 rounded w-1/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-900 rounded w-1/2" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-900 rounded-xl" />
              ))}
            </div>
            <div className="h-80 bg-slate-200 dark:bg-slate-900 rounded-xl" />
          </div>
        ) : error && !repo ? (
          <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Repository Load Error</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">{error}</p>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => loadRepositoryData(currentOwner, currentRepoName)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Another Repository</span>
              </button>
              {error.includes('rate limit') && (
                <button
                  type="button"
                  onClick={() => setTokenModalOpen(true)}
                  className="px-4 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Add Personal Token</span>
                </button>
              )}
            </div>
          </div>
        ) : repo ? (
          <div>
            {/* Repository Top Profile Strip */}
            <RepoHeader
              repo={repo}
              onTopicClick={() => setSearchModalOpen(true)}
            />

            {/* Error Notification if partial fetch failed */}
            {error && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/50 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                  <span>Notice: {error}</span>
                  <button
                    onClick={() => setTokenModalOpen(true)}
                    className="underline hover:text-amber-900 dark:hover:text-white"
                  >
                    Configure API Token
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Tabs Bar */}
            <div className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/50 backdrop-blur-xs sticky top-[57px] z-30 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6 overflow-x-auto overflow-y-hidden py-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2 px-1 ${
                      activeTab === 'overview'
                        ? 'border-indigo-500 text-slate-900 dark:text-white font-semibold'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Overview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('issues')}
                    className={`flex items-center gap-2 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2 px-1 ${
                      activeTab === 'issues'
                        ? 'border-indigo-500 text-slate-900 dark:text-white font-semibold'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Issues & PRs</span>
                    <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
                      {repo.open_issues_count}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('contributors')}
                    className={`flex items-center gap-2 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2 px-1 ${
                      activeTab === 'contributors'
                        ? 'border-indigo-500 text-slate-900 dark:text-white font-semibold'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Contributors</span>
                    {contributors.length > 0 && (
                      <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
                        {contributors.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('releases')}
                    className={`flex items-center gap-2 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2 px-1 ${
                      activeTab === 'releases'
                        ? 'border-indigo-500 text-slate-900 dark:text-white font-semibold'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Releases</span>
                    {releases.length > 0 && (
                      <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
                        {releases.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Viewport */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              {activeTab === 'overview' && (
                <OverviewTab
                  repo={repo}
                  languages={languages}
                  communityProfile={communityProfile}
                  commits={commits}
                  contributors={contributors}
                  commitActivity={commitActivity}
                  punchCard={punchCard}
                  onSelectTab={(tab) => setActiveTab(tab as any)}
                />
              )}

              {activeTab === 'issues' && (
                <IssuesTab
                  issues={issues}
                  repo={repo}
                  loading={loading}
                />
              )}

              {activeTab === 'contributors' && (
                <ContributorsTab
                  contributors={contributors}
                  communityProfile={communityProfile}
                  repo={repo}
                  loading={loading}
                />
              )}

              {activeTab === 'releases' && (
                <ReleasesTab
                  releases={releases}
                  repo={repo}
                  loading={loading}
                />
              )}
            </div>
          </div>
        ) : (
          <InitialLaunchView
            onSelectRepo={handleSelectRepo}
            recentRepos={recentRepos}
            onOpenToken={() => setTokenModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Vantage · Powered directly by GitHub REST API v3
          </div>
          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => setCompareModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Compare
            </button>
            <button
              onClick={() => setTokenModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              API Token
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <RepoSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectRepo={handleSelectRepo}
        recentRepos={recentRepos}
        onClearRecent={handleClearRecent}
      />

      <TokenModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        onTokenSaved={() => {
          fetchRateLimit();
          loadRepositoryData(currentOwner, currentRepoName);
        }}
      />

      {repo && (
        <>
          <CompareModal
            isOpen={compareModalOpen}
            onClose={() => setCompareModalOpen(false)}
            baseRepo={repo}
            onSwitchRepo={handleSelectRepo}
          />

          <ExportModal
            isOpen={exportModalOpen}
            onClose={() => setExportModalOpen(false)}
            repo={repo}
            languages={languages}
            contributors={contributors}
            releases={releases}
            communityProfile={communityProfile}
          />
        </>
      )}
    </div>
  );
}
