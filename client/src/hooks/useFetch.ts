import { useEffect, useState } from "react";
import camelcaseKeys from "camelcase-keys";

export function useFetch<T>(url: string, changeCase: boolean) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(url);
      const data = await response.json();

      if (changeCase) {
        const convertedData = camelcaseKeys(data, { deep: true });
        setData(convertedData);
      } else {
        setData(data);
      }
    }

    fetchData();
  }, [url, changeCase]);

  return data;
}
