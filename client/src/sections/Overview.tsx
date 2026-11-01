import { useFetch } from "../hooks/useFetch";
import type { Details } from "../types/repository";
import { Card } from "../components/Card";
import { Info } from "../components/Info";
import { ClipLoader } from "react-spinners";

interface Data {
  avatarUrl: string;
  name: string;
  starsCount: number;
  forksCount: number;
  issuesCount: number;
  lastUpdate: string;
  topics: string[];
}

export function Overview({ username, repository }: Details) {
  const url = `http://127.0.0.1:8000/${username}/${repository}/overview`;
  const data = useFetch<Data>(url);

  return (
    <div className="p-4 bg-gray-900 border-b border-gray-800">
      {data ? (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <img src={data.avatarUrl} className="w-6 h-6"></img>
            <h1 className="text-white">{data.name}</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Card>
              <Info header="Stars" value={String(data.starsCount)} />
            </Card>
            <Card>
              <Info header="Forks" value={String(data.forksCount)} />
            </Card>
            <Card>
              <Info header="Issues" value={String(data.issuesCount)} />
            </Card>
            <Card>
              <Info header="Last Update" value={data.lastUpdate} />
            </Card>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-4">
            {data.topics.map((topic) => (
              <p className="text-white">#{topic}</p>
            ))}
          </div>
        </div>
      ) : (
        <ClipLoader></ClipLoader>
      )}
    </div>
  );
}
