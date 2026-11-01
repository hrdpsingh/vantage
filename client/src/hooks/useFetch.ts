import { useEffect, useState } from "react";
import camelcaseKeys from "camelcase-keys";

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(url);
      const data = await response.json();
      const convertedData = camelcaseKeys(data, { deep: true });

      setData(convertedData);
    }

    fetchData();
  }, [url]);

  return data;
}
