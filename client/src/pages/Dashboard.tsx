import { useLocation } from "react-router-dom";
import { Overview } from "../sections/Overview";
import { Profile } from "../sections/Profile";
import { Languages } from "../sections/Languages";

export function Dashboard() {
  const location = useLocation();
  const username = location.state?.username;
  const repository = location.state?.repository;

  return (
    <main className="bg-gray-950 min-h-screen text-white">
      <Overview username={username} repository={repository}></Overview>
      <div className="p-8 space-y-8">
        <Profile username={username} repository={repository}></Profile>
        <Languages username={username} repository={repository}></Languages>
      </div>
    </main>
  );
}
