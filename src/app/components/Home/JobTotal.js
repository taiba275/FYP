"use client";

import { useEffect, useState } from "react";

export default function JobTotal({ className = "" }) {
  const [count, setCount] = useState(null);

  async function load() {
    try {
      const res = await fetch("/api/jobs/count", { cache: "no-store" });
      const data = await res.json();
      setCount(data.total ?? 0);
    } catch {
      setCount(0);
    }
  }

  useEffect(() => {
    load();

    // refresh every 60s just in case
    const id = setInterval(load, 60_000);

    // listen for a custom event fired after posting a job
    const handler = () => load();
    window.addEventListener("job:created", handler);

    return () => {
      clearInterval(id);
      window.removeEventListener("job:created", handler);
    };
  }, []);

    return (
      <span className={className}>
        {count == null ? "…" : (
          <>
            <strong className="font-bold">
              {Number(count).toLocaleString()}
            </strong>{" "}
            job opportunities waiting.
          </>
        )}
      </span>
    );
}
