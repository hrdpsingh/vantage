import { useFetch } from "../hooks/useFetch";
import { ClipLoader } from "react-spinners";
import type { Details } from "../types/repository";
import { Card } from "./Card";

interface Topics {
  names: string[];
}

export function Topics({ username, repository }: Details) {
  const url = `http://127.0.0.1:8000/repository/${username}/${repository}/commit-patterns`;
  const data = useFetch<Topics>(username, repository, url);

  return (
    <div>
      {data ? (
        <Card>
          <h3>Topics</h3>
          <ul>
            {data.names.map((topic, index) => (
              <li key={index}>{topic}</li>
            ))}
          </ul>
        </Card>
      ) : (
        <ClipLoader></ClipLoader>
      )}
    </div>
  );
}
