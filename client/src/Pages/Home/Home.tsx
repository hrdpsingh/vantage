import { useState } from "react";
import { Input } from "../../Components/Input";
import { useNavigate } from "react-router-dom";

export function Home() {
  const [username, setUsername] = useState("");
  const [repository, setRepository] = useState("");

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/dashboard", {
      state: { username: username, repository: repository },
    });
  };

  return (
    <main className="p-4 bg-blue-100 min-h-screen">
      <div className="flex flex-col gap-4 w-80">
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
          onClick={handleClick}
          disabled={!username || !repository}
        >
          Fetch
        </button>
      </div>
    </main>
  );
}
