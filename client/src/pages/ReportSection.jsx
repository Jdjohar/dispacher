import React, { useState } from "react";

const ReportSection = () => {
  const [reportData, setReportData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "https://dispacher-nu.vercel.app";
  const token = localStorage.getItem("token");

  /* ================= FETCH REPORTS ================= */
  const fetchReports = async () => {
    if (!fromDate || !toDate || !token) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch jobs");

      const data = await res.json();

      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      const completedJobs = data.filter((job) => {
        const lastStage =
          job.status?.[job.status.length - 1]?.stage === "offload";
        const completedAt = new Date(job.updatedAt);
        return lastStage && completedAt >= from && completedAt <= to;
      });

      setReportData(completedJobs);
    } catch (err) {
      console.error("Report fetch error:", err);
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= EXPORT CSV ================= */
  const exportCSV = () => {
    if (!reportData.length) return;

    const headers =
      "Completed Date,Job Number,Customer,Uplift,Offload,Size,Container,Release,Driver\n";

    const rows = reportData
      .map((j) => {
        const date = new Date(j.updatedAt).toLocaleDateString();
        return `"${date}","${j.jobNumber || ""}","${j.customer || ""}","${
          j.uplift || ""
        }","${j.offload || ""}","${j.size || ""}","${
          j.containerNumber || "N/A"
        }","${j.release || "N/A"}","${
          j.assignedTo?.username || "Unassigned"
        }"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Completed_Jobs_${fromDate}_to_${toDate}.csv`;
    a.click();
  };

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row gap-6 justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Completed Jobs Report
          </h2>
          <p className="text-sm text-slate-500">
            View completed jobs by date range.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-4 py-2 rounded-xl border text-sm"
          />
          <span className="text-slate-400 font-bold">→</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-4 py-2 rounded-xl border text-sm"
          />
          <button
            onClick={fetchReports}
            disabled={!fromDate || !toDate || isLoading}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold">Date</th>
                <th className="px-6 py-4 text-xs font-bold">Job #</th>
                <th className="px-6 py-4 text-xs font-bold">Customer</th>
                <th className="px-6 py-4 text-xs font-bold">Uplift</th>
                <th className="px-6 py-4 text-xs font-bold">Offload</th>
                <th className="px-6 py-4 text-xs font-bold text-center">Size</th>
                <th className="px-6 py-4 text-xs font-bold">Container</th>
                <th className="px-6 py-4 text-xs font-bold">Release</th>
                <th className="px-6 py-4 text-xs font-bold">Driver</th>
              </tr>
            </thead>

            <tbody>
              {reportData.map((job) => (
                <tr key={job._id} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4">
                    {new Date(job.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{job.jobNumber}</td>
                  <td className="px-6 py-4">{job.customer}</td>
                  <td className="px-6 py-4">{job.uplift}</td>
                  <td className="px-6 py-4">{job.offload}</td>
                  <td className="px-6 py-4 text-center">
                    {job.size} FT
                  </td>
                  <td className="px-6 py-4">
                    {job.containerNumber || "N/A"}
                  </td>
                  <td className="px-6 py-4">{job.release || "N/A"}</td>
                  <td className="px-6 py-4 font-semibold text-indigo-600">
                    {job.assignedTo?.username || "N/A"}
                  </td>
                </tr>
              ))}

              {!isLoading && reportData.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    No completed jobs found for this date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {reportData.length > 0 && (
          <div className="p-6 border-t flex justify-end">
            <button
              onClick={exportCSV}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold"
            >
              Export CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportSection;
