import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import SafetyForm from "../components/SafetyForm";

const API_BASE = import.meta.env.VITE_API_URL || "https://dispacher-nu.vercel.app";

const NewJob = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  console.log(typeof user, "sdds");

  const [jobs, setJobs] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [containerNumber, setContainerNumber] = useState("");
  // proof
  const [proofNotes, setProofNotes] = useState("");
  const [proofImages, setProofImages] = useState([]);
  const [activeJob, setActiveJob] = useState(null);

  /* ================= FETCH JOBS ================= */
  const fetchJobs = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch jobs error:", err);
      setJobs([]);
    } finally {
      setIsLoading(false);
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

  /* ================= FETCH ADDRESSES ================= */
  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stage }),
      });

      if (!res.ok) throw new Error("Status update failed");
      if (user) fetchJobs(user.userId);
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  /* ================= OPEN MODAL ================= */
  const openProofModal = (jobId) => {
    setActiveJob(jobId);
  };

  /* ================= SUBMIT PROOF ================= */
  const submitProof = async () => {
    if (proofNotes.trim() === "" && proofImages.length === 0) {
      alert("Please add notes or at least one image");
      return;
    }
  
    try {
      // 1. Upload images first
      const formData = new FormData();
      for (let file of proofImages) {
        formData.append("images", file);
      }
  
      const uploadRes = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
  
      if (!uploadRes.ok) {
        alert("Image upload failed");
        return;
      }
  
      const uploadJson = await uploadRes.json();
      console.log("UPLOAD RESPONSE:", uploadJson);
  
      // 2. Extract URLs safely (works with ANY backend format)
      let urls = [];
  
      if (Array.isArray(uploadJson)) urls = uploadJson;
      else if (Array.isArray(uploadJson.urls)) urls = uploadJson.urls;
      else if (Array.isArray(uploadJson.files)) urls = uploadJson.files;
      else if (Array.isArray(uploadJson.paths)) urls = uploadJson.paths;
      else if (uploadJson.url) urls = [uploadJson.url];
  
      if (!urls.length && proofImages.length) {
        alert("Upload failed: backend returned no image URLs");
        return;
      }
  
      // 3. Save proof to job
      const proofRes = await fetch(
        `${API_BASE}/api/jobs/${activeJob}/proof`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notes: proofNotes,
            images: urls,
          }),
        }
      );
  
      if (!proofRes.ok) {
        alert("Failed to save proof");
        return;
      }
  
      // 4. Reset UI
      setActiveJob(null);
      setProofNotes("");
      setProofImages([]);
      fetchJobs(user.userId);
    } catch (err) {
      console.error("Submit proof error:", err);
      alert("Something went wrong");
    }
  };
  
 /* ================= SAVE CONTAINER ================= */
 const saveContainerNumber = async (jobId, value) => {
  if (!value || value.trim().length < 4) {
    alert("Enter valid container number");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/jobs/${jobId}/container`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ containerNumber: value }),
    });

    if (!res.ok) throw new Error("Failed");

    fetchJobs(user.userId);
  } catch (err) {
    console.error(err);
    alert("Failed to save container");
  }
};
  
  

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (!user?.userId || !token) return;

    fetchJobs(user.userId);
    fetchAddresses();

    const lastFilled = localStorage.getItem("lastFilledDate");
    const today = new Date().toISOString().slice(0, 10);

    if (lastFilled !== today) setIsSafetyOpen(true);
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
                      #{job.jobNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Customer Name
                    </p>
                    <p className="text-lg font-bold">
                      #{job.customer}
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
                    {job.containerNumber ? (
                <span className="text-indigo-600 font-bold">
                  {job.containerNumber}
                </span>
              ) : (
                <div className="flex gap-2 mt-2">
                  <input
                    value={job._tempContainer}
                    onChange={(e) =>
                      setJobs((prev) =>
                        prev.map((j) =>
                          j._id === job._id
                            ? { ...j, _tempContainer: e.target.value }
                            : j
                        )
                      )
                    }
                    placeholder="Enter Container"
                    className="border px-2 py-1 rounded"
                  />
                  <button
                    onClick={() =>
                      saveContainerNumber(job._id, job._tempContainer)
                    }
                    className="bg-indigo-600 text-white px-3 rounded"
                  >
                    Save
                  </button>
                </div>
              )}

                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {console.log(job, "job sdsd")}
                  <div>
                    <p className="text-xs text-slate-400">Start</p>
                    <p>{formatNZDate(job.jobStart)}</p>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-slate-400">VBS Slot</p>
                    <p>{job.slot}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Door</p>
                    <p className="font-mono">{job.doors}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">C Code</p>
                    <p>{job.commodityCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">DG</p>
                    <p>{job.dg ? "Yes" : "No"}</p>
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
                    disabled={!job.containerNumber}
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
                      onClick={() => openProofModal(job._id)}
                      className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold"
                    >
                      Complete Job
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PROOF MODAL */}
         {activeJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg">Job Completion</h3>

            <textarea
              placeholder="Driver notes..."
              value={proofNotes}
              onChange={(e) => setProofNotes(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              type="file"
              multiple
              onChange={(e) =>
                setProofImages(Array.from(e.target.files || []))
              }
            />

            <button
              onClick={submitProof}
              className="w-full bg-indigo-600 text-white py-2 rounded font-bold"
            >
              Submit Proof & Finish
            </button>

            <button
              onClick={() => setActiveJob(null)}
              className="w-full border py-2 rounded font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewJob;
