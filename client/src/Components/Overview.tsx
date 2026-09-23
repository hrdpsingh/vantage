import { Card } from "./Card";
import { Info } from "./Info";
import { useFetch } from "../Helpers/useFetch";
import ClipLoader from "react-spinners/ClipLoader";

interface Details {
  username: string;
  repository: string;
}

interface Data {
  star_count: number;
  fork_count: number;
  issues: number;
  last_update: string;
}

export function Overview({ username, repository }: Details) {
  const url = `http://127.0.0.1:8000/repository/${username}/${repository}/overview`;
  const data = useFetch<Data>(username, repository, url);

  return (
    <div>
      {data ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <Card
            content=<Info header="Stars" value={String(data.star_count)} />
          />
          <Card
            content=<Info header="Forks" value={String(data.fork_count)} />
          />
          <Card content=<Info header="Issues" value={String(data.issues)} /> />
          <Card
            content=<Info header="Last Update" value={data.last_update} />
          />
        </div>
      ) : (
        <ClipLoader></ClipLoader>
      )}
    </div>
  );
}
