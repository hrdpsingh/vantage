import { ClipLoader } from "react-spinners";
import { useFetch } from "../hooks/useFetch";
import type { Details } from "../types/repository";
import { Card } from "../components/Card";
import { OpenInNew } from "@mui/icons-material";

export interface Author {
  username: string;
  htmlUrl: string;
  avatarUrl: string;
}

export interface Contributor {
  commitsCount: number;
  author: Author | null;
}

export function Contributors({ username, repository }: Details) {
  const url = `http://127.0.0.1:8000/${username}/${repository}/contributors`;
  const data = useFetch<Contributor[]>(url, true);

  return (
    <Card elevated={true}>
      <div>
        <h2 className="text-2xl font-bold">Top Contributors</h2>
      </div>
      {data ? (
        <div className="flex flex-wrap space-x-4 space-y-4">
          {data.map((item) => (
            <Card elevated={false}>
              {item.author ? (
                <div className="flex items-center space-x-4">
                  <img
                    src={item.author.avatarUrl}
                    className="h-12 w-12 rounded-full"
                  ></img>
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <span>{item.author.username}</span>
                      <a
                        href={item.author.htmlUrl}
                        className="text-blue-500"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <OpenInNew
                          color="inherit"
                          fontSize="inherit"
                        ></OpenInNew>
                      </a>
                    </div>
                    <span>Commits: {item.commitsCount}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <span>Commits: {item.commitsCount}</span>
                  <span>Could not find account.</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <ClipLoader></ClipLoader>
      )}
    </Card>
  );
}
