import { useFetch } from "../hooks/useFetch";
import type { Details } from "../types/repository";
import { Pill } from "../components/Pill";
import { Card } from "../components/Card";
import { Info } from "../components/Info";
import { ClipLoader } from "react-spinners";

interface Data {
  stars_count: number;
  forks_count: number;
  issues_count: number;
  last_update: string;
  topics: string[];
}

export function Overview({ username, repository }: Details) {
  const url = `http://127.0.0.1:8000/${username}/${repository}/overview`;
  const data = useFetch<Data>(username, repository, url);

  return (
    <div>
      {data ? (
        <div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Card>
              <Info header="Stars" value={String(data.stars_count)} />
            </Card>
            <Card>
              <Info header="Forks" value={String(data.forks_count)} />
            </Card>
            <Card>
              <Info header="Issues" value={String(data.issues_count)} />
            </Card>
            <Card>
              <Info header="Last Update" value={data.last_update} />
            </Card>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-2">
            {data.topics.map((topic, index) => (
              <Pill key={index}>
                <p>{topic}</p>
              </Pill>
            ))}
          </div>
        </div>
      ) : (
        <ClipLoader></ClipLoader>
      )}
    </div>
  );
}
