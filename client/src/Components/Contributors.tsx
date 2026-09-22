import { useEffect, useState } from "react";

interface Details {
  username: string;
  repository: string;
}

interface User {
  total: number;
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export function Contributors({ username, repository }: Details) {
  const [data, setData] = useState<User[]>([]);

  useEffect(() => {
    async function fetchCommitHistory() {
      const url = `http://127.0.0.1:8000/repository/${username}/${repository}/contributors`;

      const response = await fetch(url);
      const data = await response.json();
      setData(data);
    }

    fetchCommitHistory();
  }, [repository, username]);

  return (
    <div className="max-h-80 overflow-y-auto">
      {data.map((item) => (
        <div>
          {item.author ? (
            <div>
              <img
                src={item.author.avatar_url}
                className="h-10 w-10 rounded-full"
              ></img>
              <span>{item.author.login}</span>
              <span>Commits: {item.total}</span>
            </div>
          ) : (
            <span>Unknown</span>
          )}
        </div>
      ))}
    </div>
  );
}
