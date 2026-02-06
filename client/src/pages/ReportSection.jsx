import React, { useState } from "react";

const ReportSection = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "https://dispacher-nu.vercel.app";
  const token = localStorage.getItem("token");

  /* ================= STATUS HELPER ================= */
  const getStatus = (job) =>
    job.status?.[job.status.length - 1]?.stage || "accept";

  const getStatusBadge = (stage) => {
    switch (stage) {
      case "accept":
        return { label: "Accepted", class: "bg-slate-100 text-slate-700" };
      case "uplift":
        return { label: "Uplift", class: "bg-blue-100 text-blue-700" };
      case "offload":
        return { label: "Offload", class: "bg-orange-100 text-orange-700" };
      case "done":
        return { label: "Completed", class: "bg-emerald-100 text-emerald-700" };
      default:
        return { label: "Unknown", class: "bg-gray-100 text-gray-600" };
    }
  };

  /* ================= FETCH ALL JOBS ================= */
  const fetchReports = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const [activeRes, completedRes] = await Promise.all([
        fetch(`${API_BASE}/api/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/jobs/completed`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!activeRes.ok || !completedRes.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const activeJobs = await activeRes.json();
      const completedJobs = await completedRes.json();

      const allJobs = [...activeJobs, ...completedJobs];
      setJobs(allJobs);
      applyFilters(allJobs);
    } catch (err) {
      console.error("Report fetch error:", err);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= APPLY FILTERS ================= */
  const applyFilters = (data) => {
    let result = [...data];

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      result = result.filter((job) => {
        const date = new Date(job.updatedAt);
        return date >= from && date <= to;
      });
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (job) => getStatus(job) === statusFilter
      );
    }

    setFilteredJobs(result);
  };

  /* ================= EXPORT CSV ================= */
  const exportCSV = () => {
    if (!filteredJobs.length) return;

    const headers =
      "Date,Job Number,Customer,Status,Uplift,Offload,Size,Container,Release,Driver\n";

    const rows = filteredJobs
      .map((j) => {
        const date = new Date(j.updatedAt).toLocaleDateString();
        return `"${date}","${j.jobNumber || ""}","${j.customer || ""}","${
          getStatusBadge(getStatus(j)).label
        }","${j.uplift || ""}","${j.offload || ""}","${j.size || ""}","${
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
    a.download = `Jobs_Report.csv`;
    a.click();
  };

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold">Jobs Report</h2>
          <p className="text-sm text-slate-500">
            View all jobs with status and filters
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-4 py-2 rounded-xl border text-sm"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-4 py-2 rounded-xl border text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border text-sm"
          >
            <option value="all">All Status</option>
            <option value="accept">Accepted</option>
            <option value="uplift">Uplift</option>
            <option value="offload">Offload</option>
            <option value="done">Completed</option>
          </select>

          <button
            onClick={fetchReports}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold"
          >
            Search
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
                <th className="px-6 py-4 text-xs font-bold">Status</th>
                <th className="px-6 py-4 text-xs font-bold">Uplift</th>
                <th className="px-6 py-4 text-xs font-bold">Offload</th>
                <th className="px-6 py-4 text-xs font-bold text-center">Size</th>
                <th className="px-6 py-4 text-xs font-bold">Driver</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    Loading jobs...
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredJobs.map((job) => {
                  const status = getStatusBadge(getStatus(job));
                  return (
                    <tr key={job._id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-4">
                        {new Date(job.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">{job.jobNumber}</td>
                      <td className="px-6 py-4">{job.customer}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${status.class}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">{job.uplift}</td>
                      <td className="px-6 py-4">{job.offload}</td>
                      <td className="px-6 py-4 text-center">
                        {job.size} FT
                      </td>
                      <td className="px-6 py-4 font-semibold text-indigo-600">
                        {job.assignedTo?.username || "Unassigned"}
                      </td>
                    </tr>
                  );
                })}

              {!isLoading && filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredJobs.length > 0 && (
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
