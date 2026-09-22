import { useEffect, useState } from "react";
import { Card } from "../../Components/Card";
import { Info } from "../../Components/Info";
import { CommitGraph } from "../../Components/CommitGraph";
import { useLocation } from "react-router-dom";
import { ClipLoader } from "react-spinners";

export function Dashboard() {
  const [stars, setStars] = useState<number | null>(null);
  const [forks, setForks] = useState<number | null>(null);
  const [issues, setIssues] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const username = location.state?.username;
  const repository = location.state?.repository;

  useEffect(() => {
    const fetchData = async () => {
      setStars(null);
      setForks(null);
      setIssues(null);
      setError(null);
      setLastUpdate("");

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
      setLoading(false);
      setShowDashboard(true);
    };

    fetchData();
  }, [username, repository]);

  return (
    <main className="p-4 bg-blue-100 min-h-screen gap-8">
      <div className="flex flex-col sm:flex-row gap-4">
        {showDashboard && (
          <Card content=<Info header="Stars" value={String(stars)} /> />
        )}
        {showDashboard && (
          <Card content=<Info header="Forks" value={String(forks)} /> />
        )}
        {showDashboard && (
          <Card content=<Info header="Issues" value={String(issues)} /> />
        )}
        {showDashboard && (
          <Card content=<Info header="Last Update" value={lastUpdate} /> />
        )}
      </div>
      {showDashboard && (
        <CommitGraph username={username} repository={repository}></CommitGraph>
      )}
      {error !== null && <p>{error}</p>}
      {loading && <ClipLoader loading={loading}></ClipLoader>}
    </main>
  );
}
