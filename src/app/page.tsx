"use client";

import { useState } from "react";
import useSWR from "swr";
import { supabase } from "./lib/supabaseClient";

// Fetch templates from Supabase
const fetcher = async () => {
  const { data, error } = await supabase
    .from("ptemplates")
    .select("id, title, niche, video_url, views, likes, comments")
    .order("views", { ascending: false })
    .limit(200);

  if (error) throw error;
  return data;
};

export default function Page() {
  const { data: templates, error, isValidating, mutate } = useSWR("ptemplates", fetcher, { revalidateOnFocus: false });
  const [selectedNiche, setSelectedNiche] = useState("All");

  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;
  if (!templates) return <div className="p-6">Loading...</div>;

  // Extract all unique niches
  const niches = Array.from(new Set(templates.map((t) => t.niche))).filter(Boolean).sort();

  // Filter by selected niche
  const filteredTemplates =
    selectedNiche === "All"
      ? templates
      : templates.filter((t) => t.niche === selectedNiche);

  // CSV Download
  const handleDownload = () => {
    if (!filteredTemplates.length) {
      alert("No data to download!");
      return;
    }

    const headers = ["Title", "Niche", "Likes", "Views", "Comments", "Video URL"];
    const rows = filteredTemplates.map((t) => [
      t.title || "Untitled",
      t.niche || "",
      t.likes ?? 0,
      t.views ?? 0,
      t.comments ?? 0,
      t.video_url || "",
    ]);

    const csvContent =
      [headers, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "trendify_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50 text-black">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-1 text-gray-900">Trendify Ad Intelligence</h1>
        <p className="text-gray-700 text-sm">
          Browse refined ad templates directly from Supabase — auto-refreshed daily.
        </p>
      </header>

      {/* Filter + Actions */}
      <section className="mb-6 flex flex-wrap items-center gap-4">
        <label className="text-sm text-gray-800">Filter by niche</label>
        <select
          value={selectedNiche}
          onChange={(e) => setSelectedNiche(e.target.value)}
          className="px-3 py-2 border rounded bg-white"
        >
          <option value="All">All</option>
          {niches.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <button
          onClick={() => mutate()}
          className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
        >
          Refresh
        </button>

        {/* ✅ Download CSV Button */}
        <button
          onClick={handleDownload}
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Download CSV
        </button>

        {isValidating && <span className="text-sm text-gray-500 ml-2">Refreshing...</span>}
      </section>

      {/* Data Table */}
      <section className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 border-b text-gray-800">Title</th>
              <th className="text-left p-3 border-b text-gray-800">Niche</th>
              <th className="text-left p-3 border-b text-gray-800">Views 👁️</th>
              <th className="text-left p-3 border-b text-gray-800">Likes 👍</th>
              <th className="text-left p-3 border-b text-gray-800">Comments 💬</th>
              <th className="text-left p-3 border-b text-gray-800">YouTube Link 🔗</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="p-3 border-b text-gray-900">{t.title || "Untitled"}</td>
                <td className="p-3 border-b text-gray-800">{t.niche}</td>
                <td className="p-3 border-b text-gray-800">{t.views ?? 0}</td>
                <td className="p-3 border-b text-gray-800">{t.likes ?? 0}</td>
                <td className="p-3 border-b text-gray-800">{t.comments ?? 0}</td>
                <td className="p-3 border-b">
                  <a
                    href={t.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    Open Video
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
