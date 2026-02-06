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

  if (!["admin", "dispatcher"].includes(decoded?.userType)) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
        <h2 className="text-lg font-bold text-rose-800">
          Access Restricted
        </h2>
        <p className="text-sm text-rose-700 mt-2">
          Only Admin or Dispatcher can access this page.
        </p>
      </div>
    );
  }

  /* ===============================
     STATE
  ================================ */
  const [jobs, setJobs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [pageNumber, setPageNumber] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  // EDIT / DELETE
  const [editJob, setEditJob] = useState(null);
  const [editForm, setEditForm] = useState({});

  const jobsPerPage = 10;

  /* ===============================
     FETCH DATA
  ================================ */
  const fetchData = async () => {
    try {
      const [jobsRes, driversRes, addressRes] = await Promise.all([
        fetch(`${API_BASE}/api/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/users/role/container`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const jobsData = await jobsRes.json();
      const driversData = await driversRes.json();
      const addressData = await addressRes.json();

      const sorted = jobsData.sort((a, b) =>
        b._id.localeCompare(a._id)
      );

      setJobs(sorted);
      setDrivers(driversData.filter((d) => d.userMainId));
      setAddresses(addressData);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ===============================
     ASSIGN DRIVER
  ================================ */
  const handleAssign = async (jobId) => {
    const userId = assignments[jobId];
    if (!userId) return alert("Select a driver first");

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

      if (!res.ok) throw new Error();
      setAssignments((prev) => {
        const c = { ...prev };
        delete c[jobId];
        return c;
      });
      fetchData();
    } catch {
      alert("Assignment failed");
    }
  };

  /* ===============================
     EDIT JOB
  ================================ */
  const openEditModal = (job) => {
    setEditJob(job);
    setEditForm({
      jobNumber: job.jobNumber || "",
      customer: job.customer || "",
      uplift: job.uplift || "",
      offload: job.offload || "",
      jobStart: job.jobStart || "",
      size: job.size || "20",
      release: job.release || "",
      containerNumber: job.containerNumber || "",
      slot: job.slot || "",
      pin: job.pin || "",
      doors: job.doors || "",
      weight: job.weight || "",
      commodityCode: job.commodityCode || "",
      dg: job.dg ? "true" : "false",
      random: job.random || "",
      instructions: job.instructions || "",
    });
  };

  const handleUpdateJob = async () => {
    try {
      const payload = {
        ...editForm,
        dg: editForm.dg === "true",
      };

      const res = await fetch(
        `${API_BASE}/api/jobs/${editJob._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();

      const updated = await res.json();
      setJobs((prev) =>
        prev.map((j) => (j._id === updated._id ? updated : j))
      );
      setEditJob(null);
    } catch {
      alert("Failed to update job");
    }
  };

  /* ===============================
     DELETE JOB
  ================================ */
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Delete this job permanently?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch {
      alert("Failed to delete job");
    }
  };

  /* ===============================
     HELPERS
  ================================ */
  const urgencyClass = (job) => {
    if (job.assignedTo) return "";
    const diff =
      (new Date(job.jobStart) - new Date()) /
      (1000 * 60 * 60 * 24);
    return diff <= 1 ? "bg-rose-50" : "";
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
      <div className="flex gap-2">
        <button
          onClick={() => setShowAll(!showAll)}
          className="px-4 py-2 border rounded-xl font-bold text-sm"
        >
          {showAll ? "Show Paginated" : "Show All"}
        </button>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-3 py-2">Job#</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Uplift</th>
                <th className="px-3 py-2">Offload</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">FT</th>
                <th className="px-3 py-2">Rel / Cont</th>
                <th className="px-3 py-2">Slot</th>
                <th className="px-3 py-2">PIN</th>
                <th className="px-3 py-2">Doors</th>
                <th className="px-3 py-2">Weight</th>
                <th className="px-3 py-2">C-Code</th>
                <th className="px-3 py-2">DG</th>
                <th className="px-3 py-2">Random</th>
                <th className="px-3 py-2">Driver</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentJobs.map((job) => (
                <tr key={job._id} className={`border-b ${urgencyClass(job)}`}>
                  <td className="px-3 py-2">{job.jobNumber || "—"}</td>
                  <td className="px-3 py-2">{job.customer || "—"}</td>
                  <td className="px-3 py-2">{job.uplift || "—"}</td>
                  <td className="px-3 py-2">{job.offload || "—"}</td>
                  <td className="px-3 py-2">
                    {job.jobStart
                      ? new Date(job.jobStart).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2">{job.size || "—"}</td>
                  <td className="px-3 py-2">
                    {job.release || job.containerNumber || "—"}
                  </td>
                  <td className="px-3 py-2">{job.slot || "—"}</td>
                  <td className="px-3 py-2">{job.pin || "—"}</td>
                  <td className="px-3 py-2">{job.doors || "—"}</td>
                  <td className="px-3 py-2">{job.weight || "—"}</td>
                  <td className="px-3 py-2">{job.commodityCode || "—"}</td>
                  <td className="px-3 py-2">{job.dg ? "Yes" : "No"}</td>
                  <td className="px-3 py-2">{job.random || "—"}</td>

                  <td className="px-3 py-2">
                    <div className="flex gap-2">
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
                        <option value="">Select</option>
                        {drivers.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.username} ({d.userMainId})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(job._id)}
                        className="px-2 bg-slate-800 text-white rounded text-xs"
                      >
                        Assign
                      </button>
                    </div>
                  </td>

                  <td className="px-3 py-2 flex gap-1">
                    <button
                      onClick={() => openEditModal(job)}
                      className="px-2 py-1 bg-indigo-600 text-white rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="px-2 py-1 bg-rose-600 text-white rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!showAll && (
        <ReactPaginate
          pageCount={pageCount}
          onPageChange={({ selected }) => setPageNumber(selected)}
          containerClassName="flex justify-center gap-2 pt-4"
          activeLinkClassName="bg-indigo-600 text-white px-2 rounded"
          pageLinkClassName="px-2"
        />
      )}

      {/* EDIT MODAL */}
      {editJob && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl space-y-3 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold">Edit Job</h3>

            {Object.entries(editForm).map(([key, value]) => (
              <div key={key}>
                <label className="text-xs font-bold capitalize">{key}</label>

                {key === "uplift" || key === "offload" ? (
                  <select
                    value={value}
                    onChange={(e) =>
                      setEditForm({ ...editForm, [key]: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select Address</option>
                    {addresses.map((a) => (
                      <option key={a._id} value={a.address}>
                        {a.address}
                      </option>
                    ))}
                  </select>
                ) : key === "dg" ? (
                  <select
                    value={value}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dg: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                ) : (
                  <input
                    value={value}
                    onChange={(e) =>
                      setEditForm({ ...editForm, [key]: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setEditJob(null)}
                className="px-6 py-2 border rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateJob}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelJob;
