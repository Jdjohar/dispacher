import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";

/* ===============================
   UTILS
================================ */
const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

/* ===============================
   MAIN COMPONENT
================================ */
const ExcelJob = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "https://dispacher-nu.vercel.app";
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div className="text-center mt-20 text-red-600 font-bold">
        Not authenticated
      </div>
    );
  }

  const decoded = decodeToken(token);

  /* 🔒 HARD ROLE GUARD */
  if (!["admin", "dispatcher"].includes(decoded?.userType)) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
        <h2 className="text-lg font-bold text-rose-800">
          Access Restricted
        </h2>
        <p className="text-sm text-rose-700 mt-2">
          Only Admin or Dispatcher can assign drivers.
        </p>
      </div>
    );
  }

  /* ===============================
     STATE
  ================================ */
  const [jobs, setJobs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [pageNumber, setPageNumber] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  const jobsPerPage = 10;

  /* ===============================
     FETCH DATA
  ================================ */
  const fetchData = async () => {
    try {
      const [jobsRes, driversRes] = await Promise.all([
        fetch(`${API_BASE}/api/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/users/role/container`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const jobsData = await jobsRes.json();
      const driversData = await driversRes.json();
      console.log(driversData,"driversData");
      

      const sorted = jobsData.sort(
        (a, b) => b._id.localeCompare(a._id)
      );
      
      setJobs(sorted);
      setDrivers(driversData.filter((d) => d.userMainId));
    } catch (err) {
      console.error("FETCH ERROR:", err);
      alert("Failed to load jobs or drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    console.log("ASSIGNMENTS STATE:", assignments);
  }, [assignments]);
  /* ===============================
     ASSIGN DRIVER (FIXED)
  ================================ */
  const handleAssign = async (jobId) => {
    const userId = assignments[jobId]; // ✅ THIS IS THE SELECTED DRIVER ID
  
    console.log("JOB:", jobId);
    console.log("ASSIGN DRIVER:", userId);
  
    if (!userId) {
      alert("Select a driver first");
      return;
    }
  
    try {
      const res = await fetch(
        `${API_BASE}/api/jobs/${jobId}/assign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );
  
      const data = await res.json();

      console.log(data,"Data Assign");
      
  
      if (!res.ok) {
        console.error("ASSIGN FAILED:", data);
        alert(data.message || "Assignment failed");
        return;
      }
  
      // Clear selection
      setAssignments((prev) => {
        const copy = { ...prev };
        delete copy[jobId];
        return copy;
      });
  
      fetchData();
    } catch (err) {
      console.error("NETWORK ERROR:", err);
      alert("Server not reachable");
    }
  };
  
  /* ===============================
     CSV EXPORT
  ================================ */
  const exportCSV = () => {
    const headers =
      "Created At,Job Number,Customer,Job Date,PIN,Slot,Doors,Size,Weight,DG,Commodity Code,Uplift,Offload,Container,Release,Driver,Instructions\n";
  
    const rows = [...jobs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((j) => {
        const driver = j.assignedTo?.username || "Unassigned";
  
        return [
          j.createdAt || "",
          j.jobNumber || "",
          j.customer || "",
          j.jobStart || "",
          j.pin || "",
          j.slot || "",
          j.doors || "",
          j.size || "",
          j.weight || "",
          j.dg ? "Yes" : "No",
          j.commodityCode || "",
          j.uplift || "",
          j.offload || "",
          j.containerNumber || "",
          j.release || "",
          driver,
          j.instructions || ""
        ].join(",");
      })
      .join("\n");
  
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobs-export.csv";
    a.click();
  };
  
  
  

  /* ===============================
     HELPERS
  ================================ */
  const urgencyClass = (job) => {
    if (job.assignedTo) return "";
    const diff =
      (new Date(job.jobStart) - new Date()) /
      (1000 * 60 * 60 * 24);
    return diff <= 1 ? "bg-rose-50 text-rose-800" : "";
  };

  /* ===============================
     PAGINATION
  ================================ */
  const pageCount = Math.ceil(jobs.length / jobsPerPage);
  const offset = pageNumber * jobsPerPage;
  const currentJobs = showAll
    ? jobs
    : jobs.slice(offset, offset + jobsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* CONTROLS */}
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 border rounded-xl font-bold text-sm bg-white"
          >
            {showAll ? "Show Paginated" : "Show All"}
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold">Date & PIN</th>
                <th className="px-6 py-4 text-xs font-bold">Route</th>
                <th className="px-6 py-4 text-xs font-bold">Details</th>
                <th className="px-6 py-4 text-xs font-bold">Driver</th>
              </tr>
            </thead>

            <tbody>
              {currentJobs.map((job) => (
                <tr
                  key={job._id}
                  className={`border-b ${urgencyClass(job)}`}
                >
                  <td className="px-6 py-4">
                    <div className="font-bold">{job.jobStart}</div>
                    <div className="text-xs text-slate-500">
                      PIN: {job.pin}
                    </div>
                    <div className="text-xs text-slate-500">
                      ID: {job._id}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-xs">
                    <div>{job.uplift}</div>
                    <div>{job.offload}</div>
                  </td>

                  <td className="px-6 py-4 text-xs">
                  <div>Customer Name: <span className="font-normal">{job.customer || "-"}</span></div>
                    {job.size}FT • {job.weight}KG • DG: {job.dg}
                  </td>

                  <td className="px-6 py-4">
                   
                  <div className="flex gap-2 items-center">
  <select
    value={assignments[job._id] || job.assignedTo?._id || ""}
    onChange={(e) =>
      setAssignments({
        ...assignments,
        [job._id]: e.target.value,
      })
    }
    className="border rounded px-2 py-1 text-xs"
  >
    <option value="">Select Driver</option>
    {drivers.map((d) => (
      <option key={d._id} value={d._id}>
        {d.username} ({d.userMainId})
      </option>
    ))}
  </select>

  <button
    onClick={() => handleAssign(job._id)}
    className="px-3 bg-slate-800 text-white rounded text-xs font-bold"
  >
    {job.assignedTo ? "Reassign" : "Assign"}
  </button>
</div>

                   
                  </td>
                </tr>
              ))}

              {jobs.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-slate-400">
                    No jobs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!showAll && pageCount > 1 && (
          <div className="p-6 border-t">
            <ReactPaginate
              previousLabel="Prev"
              nextLabel="Next"
              pageCount={pageCount}
              onPageChange={({ selected }) =>
                setPageNumber(selected)
              }
              containerClassName="flex justify-center gap-2"
              pageLinkClassName="px-3 py-1 rounded"
              activeLinkClassName="bg-indigo-600 text-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelJob;
