import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import SafetyForm from "../components/SafetyForm";

const API_BASE = import.meta.env.VITE_API_URL || "https://dispacher-nu.vercel.app";

const NewJob = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
console.log(typeof user,"sdds");


  const [jobs, setJobs] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  


  /* ================= FETCH JOBS ================= */
  const fetchJobs = async (userId) => {
    console.log(userId,"userMainId");
    
    try {
      const res = await fetch(
        `${API_BASE}/api/jobs/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res,"res");
      

      if (!res.ok) throw new Error("Failed to fetch jobs");

      const data = await res.json();

      console.log(data, "sdsdsdsd");
      
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch jobs error:", err);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= FETCH ADDRESSES ================= */
  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch addresses");

      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch addresses error:", err);
      setAddresses([]);
    }
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (jobId, stage) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/jobs/${jobId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stage }),
        }
      );

      if (!res.ok) throw new Error("Status update failed");

      if (user) {
        fetchJobs(user.userId);
      }
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (!user?.userId || !token) return;

    fetchJobs(user.userId);
    fetchAddresses();

    const lastFilled = localStorage.getItem("lastFilledDate");
    const today = new Date().toISOString().slice(0, 10);

    if (lastFilled !== today) {
      setIsSafetyOpen(true);
    }
  }, [user, token]);

  /* ================= UI HELPERS ================= */
  const statusBadge = (status) => {
    switch (status) {
      case "accept":
        return "bg-emerald-100 text-emerald-700";
      case "uplift":
        return "bg-indigo-100 text-indigo-700";
      case "offload":
        return "bg-amber-100 text-amber-700";
      case "done":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }
  const activeJobId = jobs?.[0]?._id || null;
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SafetyForm
        isOpen={isSafetyOpen}
        jobId={activeJobId}
        handleSafetyFormClose={() => {
          localStorage.setItem(
            "lastFilledDate",
            new Date().toISOString().slice(0, 10)
          );
          setIsSafetyOpen(false);
        }}
        options={addresses}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">
          Current Assignments
        </h2>
        <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold">
          {jobs.length} Active
        </span>
      </div>

      {jobs.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <h4 className="text-lg font-bold text-slate-800">
            No active jobs
          </h4>
          <p className="text-slate-500 mt-1">
            Waiting for dispatcher to assign work.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {jobs.map((job) => {
         
          const currentStatus =
            job.status?.[job.status.length - 1]?.stage || "pending";

          return (
            <div
              key={job._id}
              className="bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Job ID
                    </p>
                    <p className="text-lg font-bold">
                      #{job._id.slice(-6).toUpperCase()}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-xl text-sm font-bold uppercase ${statusBadge(
                      currentStatus
                    )}`}
                  >
                    {currentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400">Uplift</p>
                    <p className="font-semibold">{job.uplift}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Offload</p>
                    <p className="font-semibold">{job.offload}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      Container
                    </p>
                    <p className="font-bold text-indigo-600">
                      {job.containerNumber || "PENDING"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-slate-400">Start</p>
                    <p>{job.jobStart}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">PIN</p>
                    <p className="font-mono">{job.pin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Size</p>
                    <p>{job.size}ft</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Weight</p>
                    <p>{job.weight} kg</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  {currentStatus === "pending" && (
                    <button
                      onClick={() => updateStatus(job._id, "accept")}
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold"
                    >
                      Accept Job
                    </button>
                  )}
                  {currentStatus === "accept" && (
                    <button
                      onClick={() => updateStatus(job._id, "uplift")}
                      className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold"
                    >
                      Uplift Done
                    </button>
                  )}
                  {currentStatus === "uplift" && (
                    <button
                      onClick={() => updateStatus(job._id, "offload")}
                      className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-bold"
                    >
                      Offload Done
                    </button>
                  )}
                  {currentStatus === "offload" && (
                    <button
                      onClick={() => updateStatus(job._id, "done")}
                      className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold"
                    >
                      Job Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewJob;
