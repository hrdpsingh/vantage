import { useFetch } from "../hooks/useFetch";
import type { Details } from "../types/repository";
import { ClipLoader } from "react-spinners";
import { ProfileCard } from "../components/ProfileCard";

interface Data {
  documentation: string;
  codeOfConduct: string;
  license: string;
  readme: string;
  issueTemplate: string;
  pullRequestTemplate: string;
}

export function Profile({ username, repository }: Details) {
  const url = `http://127.0.0.1:8000/${username}/${repository}/profile`;
  const data = useFetch<Data>(url);

  return (
    <div>
      {data ? (
        <div className="flex flex-wrap gap-6">
          <ProfileCard
            url={data.documentation}
            text="Documentation"
          ></ProfileCard>
          <ProfileCard
            url={data.codeOfConduct}
            text="Code of Conduct"
          ></ProfileCard>
          <ProfileCard url={data.license} text="License"></ProfileCard>
          <ProfileCard url={data.readme} text="README"></ProfileCard>
          <ProfileCard
            url={data.issueTemplate}
            text="Issue Template"
          ></ProfileCard>
          <ProfileCard
            url={data.pullRequestTemplate}
            text="Pull Request Template"
          ></ProfileCard>
        </div>
      ) : (
        <ClipLoader></ClipLoader>
      )}
    </div>
  );
}
