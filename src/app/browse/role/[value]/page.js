"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Posts from "@/app/components/Home/Posts";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const value = decodeURIComponent(params.value || "");
  const page  = Math.max(1, parseInt(searchParams.get("page")  || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  const [state, setState] = useState({ jobs: [], total: 0, loading: true, error: "" });

  useEffect(() => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    const url = `/api/browse/jobs?facet=role&value=${encodeURIComponent(value)}&page=${page}&limit=${limit}`;
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.success) throw new Error(data?.message || "Failed");
        setState({ jobs: data.jobs || [], total: data.total || 0, loading: false, error: "" });
      })
      .catch((e) => setState({ jobs: [], total: 0, loading: false, error: e.message || "Failed" }));
  }, [value, page, limit]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((state.total || 0) / limit)), [state.total, limit]);

  return (
    <div className="min-h-screen px-4 md:px-8 py-6">
      <h2 className="text-2xl font-semibold mb-2">
        Role: <span className="font-bold">{value}</span>
      </h2>

      {state.loading && <p className="text-sm text-gray-600">Loading…</p>}
      {state.error   && <p className="text-sm text-red-600">Error: {state.error}</p>}
      {!state.loading && !state.error && (
        <Posts
        jobs={state.jobs}
        totalsOverride={
            <>
            <strong>{state.total}</strong> job opportunities waiting
            </>
        }
        />
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => router.push(`?page=${page - 1}&limit=${limit}`)}
          >
            Prev
          </button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => router.push(`?page=${page + 1}&limit=${limit}`)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
