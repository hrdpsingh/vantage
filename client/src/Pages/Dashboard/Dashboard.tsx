import { CommitGraph } from "../../Components/CommitGraph";
import { useLocation } from "react-router-dom";
import { Contributors } from "../../Components/Contributors";
import { Heatmap } from "../../Components/Heatmap";
import { Overview } from "../../Components/Overview";

export function Dashboard() {
  const location = useLocation();
  const username = location.state?.username;
  const repository = location.state?.repository;

  return (
    <main className="p-4 bg-blue-100 min-h-screen gap-8">
      <Overview username={username} repository={repository}></Overview>
      <CommitGraph username={username} repository={repository}></CommitGraph>
      <Contributors username={username} repository={repository}></Contributors>
      <Heatmap username={username} repository={repository}></Heatmap>
    </main>
  );
}
