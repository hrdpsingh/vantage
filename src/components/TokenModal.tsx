import React, { useState } from 'react';
import { Key, CheckCircle2, AlertCircle, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { getStoredToken, setStoredToken, testToken, clearCache } from '../services/githubApi';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenSaved: () => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({ isOpen, onClose, onTokenSaved }) => {
  const [tokenInput, setTokenInput] = useState(getStoredToken());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; user?: string; error?: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!tokenInput.trim()) {
      setTestResult({ valid: false, error: 'Please enter a token first' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testToken(tokenInput.trim());
    setTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    setStoredToken(tokenInput.trim());
    clearCache();
    onTokenSaved();
    onClose();
  };

  const handleRemove = () => {
    setStoredToken('');
    setTokenInput('');
    setTestResult(null);
    clearCache();
    onTokenSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 text-slate-800 dark:text-slate-200 shadow-2xl relative transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 transition-colors p-1"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">GitHub API Access Token</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Increase rate limits from 60 to 5,000 requests/hour</p>
          </div>
        </div>

        <div className="space-y-4 my-5">
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-lg p-3.5 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Your token is stored <strong>locally in your browser</strong> and sent directly in the GitHub API Authorization header. No servers store your key.
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 pl-6">
              For public repositories, a token requires <strong>no extra permissions/scopes</strong> (Fine-grained token with Public Repositories (read-only) or classic token with no scopes checked).
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Personal Access Token (classic or fine-grained)
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                setTestResult(null);
              }}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_xxxx"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:border-indigo-500 font-mono shadow-xs"
            />
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                testResult.valid
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
              }`}
            >
              {testResult.valid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Authenticated successfully as <strong>@{testResult.user}</strong>. Rate limit is 5,000 req/hr.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{testResult.error || 'Token test failed.'}</span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline font-medium"
            >
              Generate a token on GitHub <ExternalLink className="w-3 h-3" />
            </a>
            {getStoredToken() && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline"
              >
                Clear current token
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !tokenInput.trim()}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-transparent disabled:opacity-50 rounded-lg transition-colors shadow-xs"
          >
            {testing ? 'Testing...' : 'Test Token'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
          >
            Save Token
          </button>
        </div>
      </div>
    </div>
  );
};
