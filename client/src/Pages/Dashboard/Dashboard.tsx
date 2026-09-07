import { useState } from "react";
import { Input } from "../../Components/Input";
import { Card } from "../../Components/Card";
import { Info } from "../../Components/Info";

export function Dashboard() {
  const [username, setUsername] = useState("");
  const [repository, setRepository] = useState("");
  const [stars, setStars] = useState<number | null>(null);
  const [forks, setForks] = useState<number | null>(null);
  const [issues, setIssues] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchOverview() {
    setStars(null);
    setForks(null);
    setIssues(null);
    setLastUpdate(null);
    setError(null);

    const url = `http://127.0.0.1:8000/repository/${username}/${repository}/overview`;

    const response = await fetch(url);
    const data = await response.json();

    if (response.status == 404) {
      setError(await data.detail);
      return;
    }

    setStars(data.star_count);
    setForks(data.fork_count);
    setIssues(data.issues);
    setLastUpdate(data.last_update);
  }

  return (
    <main className="p-4 bg-blue-100 min-h-screen">
      <div className="flex flex-col gap-4 w-64">
        <Input
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <Input
          placeholder="Repository"
          value={repository}
          onChange={(event) => setRepository(event.target.value)}
        />
        <button
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 disabled:cursor-default disabled:bg-blue-400 text-white rounded-full py-1 px-3"
          onClick={fetchOverview}
          disabled={!username || !repository}
        >
          Fetch
        </button>

        <div className="flex flex-col sm:flex-row gap-4">
          {stars !== null && (
            <Card content=<Info header="Stars" value={String(stars)} /> />
          )}
          {forks !== null && (
            <Card content=<Info header="Forks" value={String(forks)} /> />
          )}
          {issues !== null && (
            <Card content=<Info header="Issues" value={String(issues)} /> />
          )}
          {lastUpdate !== null && (
            <Card content=<Info header="Last Update" value={lastUpdate} /> />
          )}
        </div>
        {error !== null && <p>{error}</p>}
      </div>
    </main>
  );
}
