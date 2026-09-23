import { useEffect, useState } from "react";

export function useFetch<T>(username: string, repository: string, url: string) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(url);
      const data = await response.json();

      setData(data);
    }

    fetchData();
  }, [repository, username, url]);

  return data;
}
