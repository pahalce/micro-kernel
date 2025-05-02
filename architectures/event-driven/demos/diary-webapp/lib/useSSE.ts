import { useEffect, useState } from "react";

export function useSSE<T = unknown>(url: string) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const ev = new EventSource(url);
    ev.onmessage = (e) => setData(JSON.parse(e.data));
    ev.onerror = () => console.error("SSE disconnected");
    return () => ev.close();
  }, [url]);

  return data;
}
