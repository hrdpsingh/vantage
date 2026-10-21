import { ClipLoader } from "react-spinners";
import { useFetch } from "../hooks/useFetch";
import type { Details } from "../types/repository";

interface User {
  commits_count: number;
  author: {
    username: string;
    avatar_url: string;
  } | null;
}

export function Contributors({ username, repository }: Details) {
  const url = `http://127.0.0.1:8000/${username}/${repository}/contributors`;
  const data = useFetch<User[]>(username, repository, url);

  return (
    <div>
      {data ? (
        <div className="max-h-80 overflow-y-auto">
          {data.map((item) => (
            <div>
              {item.author ? (
                <div>
                  <img
                    src={item.author.avatar_url}
                    className="h-10 w-10 rounded-full"
                  ></img>
                  <span>{item.author.username}</span>
                  <span>Commits: {item.commits_count}</span>
                </div>
              ) : (
                <span>Unknown</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <ClipLoader></ClipLoader>
      )}
    </div>
  );
}
