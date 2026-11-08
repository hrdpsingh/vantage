import { useFetch } from "../hooks/useFetch";
import type { Details } from "../types/repository";
import { Card } from "../components/Card";
import { Info } from "../components/Info";
import { ClipLoader } from "react-spinners";
import { Link, Storage } from "@mui/icons-material";

interface Data {
  avatarUrl: string;
  name: string;
  size: number;
  htmlUrl: string;
  starsCount: number;
  forksCount: number;
  issuesCount: number;
  lastUpdate: string;
  topics: string[];
}

export function Overview({ username, repository }: Details) {
  const url = `http://127.0.0.1:8000/${username}/${repository}/overview`;
  const data = useFetch<Data>(url, true);

  return (
    <div className="p-4 bg-gray-900 border-b border-gray-800">
      {data ? (
        <div className="space-y-4">
          <div className="flex space-x-4 items-center">
            <img src={data.avatarUrl} className="w-12 h-12 rounded-md"></img>
            <div className="flex flex-col">
              <h1 className="text-lg">{data.name}</h1>
              <div className="flex items-center space-x-1 text-gray-400 text-sm">
                <Storage fontSize="small"></Storage>
                <p>{data.size} GB</p>
              </div>
            </div>
            <a
              href={data.htmlUrl}
              className="text-white bg-gray-800 px-2 py-1 rounded-md border border-gray-700 flex items-center space-x-1"
            >
              <Link fontSize="small"></Link>
              <span>GitHub</span>
            </a>
          </div>
          <div className="flex gap-4">
            <Card elevated={false}>
              <Info header="Stars" value={String(data.starsCount)} />
            </Card>
            <Card elevated={false}>
              <Info header="Forks" value={String(data.forksCount)} />
            </Card>
            <Card elevated={false}>
              <Info header="Issues" value={String(data.issuesCount)} />
            </Card>
            <Card elevated={false}>
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
