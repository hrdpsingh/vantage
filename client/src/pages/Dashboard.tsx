import { useLocation } from "react-router-dom";
import { CommitActivity } from "../sections/CommitActivity";
import { Contributors } from "../sections/Contributors";
import { PunchCard } from "../sections/PunchCard";
import { Overview } from "../sections/Overview";
import { Languages } from "../sections/Languages";

export function Dashboard() {
  const location = useLocation();
  const username = location.state?.username;
  const repository = location.state?.repository;

  return (
    <main className="bg-gray-950 min-h-screen text-white">
      <Overview username={username} repository={repository}></Overview>
      <CommitActivity
        username={username}
        repository={repository}
      ></CommitActivity>
      <Contributors username={username} repository={repository}></Contributors>
      <PunchCard username={username} repository={repository}></PunchCard>
      <Languages username={username} repository={repository}></Languages>
    </main>
  );
}
