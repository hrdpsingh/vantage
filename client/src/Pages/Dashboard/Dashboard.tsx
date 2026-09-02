import { useState } from "react";
import Input from "../../Components/Input";

type RepositoryStarsResponse = {
  owner: string;
  repository: string;
  stargazers_count: number;
};

export function Dashboard() {
  const [owner, setOwner] = useState("");
  const [repository, setRepository] = useState("");
  const [stars, setStars] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchStars() {
    setError(null);
    setStars(null);

    const url =
      `http://127.0.0.1:8000/repository/` +
      `${encodeURIComponent(owner)}/` +
      `${encodeURIComponent(repository)}/stars`;

    const response = await fetch(url);
    const data: RepositoryStarsResponse = await response.json();

    if (!data.stargazers_count) {
      setError("Repository not found.");
    }

    setStars(data.stargazers_count);
  }

  return (
    <main className="p-4">
      <div className="flex flex-col gap-4 w-64">
        <Input
          placeholder="Owner"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
        />
        <Input
          placeholder="Repository"
          value={repository}
          onChange={(event) => setRepository(event.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-full py-1 px-3"
          onClick={fetchStars}
          disabled={!owner || !repository}
        >
          Fetch
        </button>

        {stars !== null && <p>Stars: {stars}</p>}
        {error !== null && <p>{error}</p>}
      </div>
    </main>
  );
}
