import { redirect } from "next/navigation";

export default function RedirectFunction({ params, searchParams }) {
  const value = decodeURIComponent(params.value || "");
  const page  = searchParams?.page ? String(searchParams.page) : "1";
  const limit = searchParams?.limit ? String(searchParams.limit) : "20";

  const qs = new URLSearchParams({ function: value, page, limit, clear: "1" });
  redirect(`/?${qs.toString()}`);
}
