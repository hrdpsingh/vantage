// Language color palette based on github-colors specification
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  Bash: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Lua: '#000080',
  R: '#198CE7',
  Scala: '#c22d40',
  Elixir: '#6e4a7e',
  Clojure: '#db5855',
  Haskell: '#5e5086',
  Zig: '#ec915c',
  Nix: '#7e7eff',
  Markdown: '#083fa1',
  Dockerfile: '#384d54',
  Solidity: '#AA6746',
  Julia: '#a270ba',
  OCaml: '#3be133',
  Perl: '#0298c3',
  Assembly: '#6E4C13',
  Vim: '#199f4b',
  SQL: '#e38c00',
};

export function getLanguageColor(lang: string): string {
  return LANGUAGE_COLORS[lang] || '#64748b';
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'k';
  }
  return num.toLocaleString();
}

export function formatExactNumber(num: number): string {
  return num.toLocaleString();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// GitHub repo sizes are returned in Kilobytes
export function formatRepoSize(kb: number): string {
  return formatBytes(kb * 1024);
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes}m ago`;
    }
    if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours}h ago`;
    }
    if (diffSeconds < 2592000) {
      const days = Math.floor(diffSeconds / 86400);
      return `${days}d ago`;
    }
    if (diffSeconds < 31536000) {
      const months = Math.floor(diffSeconds / 2592000);
      return `${months}mo ago`;
    }
    const years = Math.floor(diffSeconds / 31536000);
    return `${years}y ago`;
  } catch {
    return dateString;
  }
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function calculateLanguagePercentages(languages: Record<string, number>): Array<{
  name: string;
  bytes: number;
  percentage: number;
  color: string;
}> {
  const total = Object.values(languages).reduce((acc, curr) => acc + curr, 0);
  if (total === 0) return [];

  return Object.entries(languages)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Number(((bytes / total) * 100).toFixed(1)),
      color: getLanguageColor(name),
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

export function decodeBase64Utf8(base64Str: string): string {
  try {
    const cleanStr = base64Str.replace(/\s/g, '');
    const binary = atob(cleanStr);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  } catch {
    try {
      return atob(base64Str.replace(/\s/g, ''));
    } catch {
      return 'Unable to decode content.';
    }
  }
}
