import React, { useEffect, useState } from "react";

const CompletedJob = () => {
  const [completedJobs, setCompletedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || "https://dispacher-nu.vercel.app";
  const token = localStorage.getItem("token");


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
  
  const fetchCompletedJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/completed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch completed jobs");
      }

      const data = await res.json();
      setCompletedJobs(data);
    } catch (error) {
      console.error("Fetch completed jobs error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedJobs();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">
          Job History Archive
        </h2>
        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border">
          {completedJobs.length} Records
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {completedJobs.map((job) => (
          <div
            key={job._id}
            className="bg-white rounded-3xl border shadow-sm p-6 hover:shadow-lg transition border-l-4 border-l-emerald-500"
          >
            {/* Top */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  ✓
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Container
                  </p>
                  <p className="font-bold text-slate-800">
                    {job.containerNumber || "N/A"}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                ID: {job._id.slice(-6).toUpperCase()}
              </span>
            </div>

            {/* Job Info */}
            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Pickup</span>
                <span className="font-semibold">{job.uplift || "-"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Delivery</span>
                <span className="font-semibold">{job.offload || "-"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Completed On</span>
                <span className="font-semibold">
                  {job.updatedAt
                    ? new Date(job.updatedAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* PROOF SECTION */}
            {job.proof && (
              <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-500 mb-1">
                  Driver Notes
                </p>
                <p className="text-sm text-slate-700 mb-2">
                  {job.proof.notes || "No notes"}
                </p>

                {job.proof.images && job.proof.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
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
                          className="h-20 w-full object-cover rounded border"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t flex justify-between items-center">
              <div className="flex gap-2">
                {job.size && (
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">
                    {job.size} FT
                  </span>
                )}
                {job.weight && (
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">
                    {job.weight} KG
                  </span>
                )}
              </div>

              <span className="text-[10px] font-bold text-indigo-600 uppercase">
                Driver: {job.assignedTo?.username || "N/A"}
              </span>
            </div>
          </div>
        ))}

        {completedJobs.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed">
            <p className="text-slate-400 font-medium">
              No completed jobs found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedJob;
