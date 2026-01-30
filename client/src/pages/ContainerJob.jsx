import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const ContainerJob = () => {
  const { user } = useAuth();
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || "https://dispacher-nu.vercel.app";
  const token = localStorage.getItem("token");

  const getContainerJobs = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/jobs/user/${userId}/completed`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch jobs");

      const result = await res.json();

      const jobs = Array.isArray(result)
        ? result
        : Array.isArray(result?.totaljobs)
        ? result.totaljobs
        : [];

      const completed = jobs.filter((job) => job.isCompleted === true);
      setCompletedJobs(completed);
    } catch (error) {
      console.error("Container jobs error:", error);
      setCompletedJobs([]);
    } finally {
      setLoading(false);
    }
  };
  const formatNZDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-NZ", {
      timeZone: "Pacific/Auckland",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  useEffect(() => {
    if (!user?.userId || !token) {
      setLoading(false);
      return;
    }

    getContainerJobs(user.userId);
  }, [user?.userId, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!completedJobs.length) {
    return (
      <div className="m-6 text-center text-slate-400 font-semibold">
        No jobs completed yet.
      </div>
    );
  }

  return (
    <div className="m-5 space-y-10">
      {completedJobs.map((job) => (
        <div
          key={job._id}
          className="relative bg-white p-4 rounded-2xl shadow-sm border"
        >
          {/* Assigned Driver */}
          {job.assignedTo?.username && (
            <div className="absolute -top-6 left-0 bg-indigo-600 px-3 py-1 rounded-t-xl text-white text-sm font-bold">
              Driver: {job.assignedTo.username}
            </div>
          )}

          {/* Job Info */}
          <div className="grid md:grid-cols-2 gap-6 mt-4 text-sm">
            <div className="space-y-1">
            <div>Customer: <span className="font-normal">{job.customer || "-"}</span></div>

            <div>Start Date: <span className="font-normal">{formatNZDate(job.jobStart)}</span></div>
              <div>PIN: <span className="font-normal">{job.pin}</span></div>
              <div>Commodity Code: <span className="font-normal">{job.commodityCode}</span></div>
              <div>Slot: <span className="font-normal">{job.slot}</span></div>
              <div>DG: <span className="font-normal">{job.dg ? "Yes" : "No"}</span></div>
              <div>Container No: <span className="font-normal">{job.containerNumber || "-"}</span></div>
            </div>

            <div className="space-y-1">
              <div>Uplift: <span className="font-normal">{job.uplift}</span></div>
              <div>Offload: <span className="font-normal">{job.offload}</span></div>
              <div>Size: <span className="font-normal">{job.size} ft</span></div>
              <div>Release: <span className="font-normal">{job.release || "-"}</span></div>
              <div>Random: <span className="font-normal">{job.random || "-"}</span></div>
              <div>Weight: <span className="font-normal">{job.weight} kg</span></div>
            </div>
          </div>

          {/* Instructions */}
          {job.instructions && (
            <div className="mt-4 text-sm">
              <span className="font-bold">Special Instructions:</span>
              <p className="font-normal">{job.instructions}</p>
            </div>
          )}

          {/* STATUS TIMELINE */}
          <div className="mt-4 bg-indigo-500 text-white rounded-xl p-3 text-sm">
            <div className="font-bold text-center mb-2">Status Timeline</div>
            <div className="flex flex-wrap gap-3">
              {job.status?.length ? (
                job.status.map((s, idx) => (
                  <div key={idx} className="capitalize">
                    {s.stage} —{" "}
                    {s.timestamp
                      ? new Date(s.timestamp).toLocaleString()
                      : "-"}
                  </div>
                ))
              ) : (
                <div>No status updates</div>
              )}
            </div>
          </div>

          {/* PROOF SECTION */}
          {job.proof && (
            <div className="mt-6 border-t pt-4">
              <div className="font-bold text-sm mb-2">
                Driver Proof
              </div>

              {job.proof.submittedAt && (
                <div className="text-xs text-slate-500 mb-2">
                  Submitted: {new Date(job.proof.submittedAt).toLocaleString()}
                </div>
              )}

              {job.proof.notes && (
                <div className="mb-3 text-sm">
                  <span className="font-semibold">Notes:</span>
                  <p>{job.proof.notes}</p>
                </div>
              )}

              {job.proof.images?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {job.proof.images.map((img, i) => (
                    <a
                      key={i}
                      href={img}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={img}
                        alt="Proof"
                        className="w-full h-32 object-cover rounded-lg border hover:opacity-80"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContainerJob;
