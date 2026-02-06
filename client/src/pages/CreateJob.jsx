import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
const CreateJob = () => {
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || "https://dispacher-nu.vercel.app";
  const token = localStorage.getItem("token");
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!token || !userInfo) {
      navigate("/login");
      return;
    }
    if (!["admin", "dispatcher"].includes(userInfo.userType)) {
      navigate("/unauthorized");
    }
  }, [token, userInfo, navigate]);

  /* ================= STATE ================= */
  const [uplift, setUplift] = useState("");
  const [offload, setOffload] = useState("");
  const [jobStart, setJobStart] = useState("");
  const [jobNumber, setjobNumber] = useState("");
  const [customer, setcustomer] = useState("");
  const [size, setSize] = useState("20");

  const [idType, setIdType] = useState(""); // release | container
  const [release, setRelease] = useState("");
  const [containerNumber, setContainerNumber] = useState("");

  const [slot, setSlot] = useState("");
  const [pin, setPin] = useState("");
  const [dg, setDg] = useState("false");
  const [weight, setWeight] = useState("");
  const [random, setRandom] = useState("");
  const [doors, setDoors] = useState("");
  const [commodityCode, setCommodityCode] = useState("");
  const [instructions, setInstructions] = useState("");
  const [addresses, setAddresses] = useState([]);
  const addressOptions = addresses.map(a => ({
    value: a.address,
    label: a.address
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);


  const getJobStatus = (job) => {
    const stage = job.status?.[job.status.length - 1]?.stage;

    switch (stage) {
      case "accept":
        return { label: "Accepted", color: "bg-slate-100 text-slate-700" };
      case "uplift":
        return { label: "Uplift", color: "bg-blue-700 text-white" };
      case "offload":
        return { label: "Offload", color: "bg-orange-100 text-orange-700" };
      case "done":
        return { label: "Completed", color: "bg-emerald-100 text-emerald-700" };
      default:
        return { label: "Unknown", color: "bg-gray-100 text-gray-600" };
    }
  };


  /* ================= FETCH ADDRESSES ================= */
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load addresses");
        setAddresses(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchAddresses();
  }, [API_BASE, token]);
  /* ================= FETCH JOBS ================= */
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);

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

        setJobs([...activeJobs, ...completedJobs]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [API_BASE, token]);


  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!idType) {
      setMessage({ type: "error", text: "Select Release or Container number" });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      uplift,
      offload,
      jobStart,
      jobNumber,
      customer,
      size,
      slot,
      pin,
      random,
      doors,
      commodityCode,
      dg,
      instructions,
      weight,
      ...(idType === "release"
        ? { release }
        : { containerNumber }),
    };

    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Job creation failed");
      console.log(payload, "payload");

      setMessage({ type: "success", text: "Job created successfully" });

      /* RESET */
      setUplift("");
      setjobNumber("");
      setcustomer("");
      setOffload("");
      setJobStart("");
      setSize("20");
      setRelease("");
      setContainerNumber("");
      setSlot("");
      setPin("");
      setRandom("");
      setDoors("");
      setCommodityCode("");
      setInstructions("");
      setDg("false");
      setWeight("");
      setIdType("");
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to create job" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="bg-white rounded-3xl border shadow-sm">
        <div className="p-8 border-b">
          <h2 className="text-2xl font-bold">Assign New Job</h2>
          <p className="text-slate-500 text-sm">
            Enter shipping details to generate a work order
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          <div className="grid md:grid-cols-3 gap-6">
            <input
              value={jobNumber}
              onChange={(e) => setjobNumber(e.target.value)}
              placeholder="Job Number"
              className="px-4 py-3 rounded-xl border"
            />
            <input
              value={customer}
              onChange={(e) => setcustomer(e.target.value)}
              placeholder="Customer Name"
              className="px-4 py-3 rounded-xl border"
            />

          </div>


          {/* LOCATIONS */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* <select
              required
              value={uplift}
              onChange={(e) => setUplift(e.target.value)}
              className="px-4 py-3 rounded-xl border"
            >
              <option value="">Select uplift</option>
              {addresses.map((a) => (
                <option key={a._id} value={a.address}>
                  {a.address}
                </option>
              ))}
            </select> */}
            <Select
              options={addressOptions}
              value={addressOptions.find(o => o.value === offload)}
              onChange={(opt) => setUplift(opt.value)}
              placeholder="Search offload address..."
              isClearable
            />




            {/* <select
              required
              value={offload}
              onChange={(e) => setOffload(e.target.value)}
              className="px-4 py-3 rounded-xl border"
            >
              <option value="">Select offload</option>
              {addresses.map((a) => (
                <option key={a._id} value={a.address}>
                  {a.address}
                </option>
              ))}
            </select> */}
            <Select
              options={addressOptions}
              value={addressOptions.find(o => o.value === offload)}
              onChange={(opt) => setOffload(opt.value)}
              placeholder="Search offload address..."
              isClearable
            />

          </div>

          {/* DATE & SIZE */}
          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="date"
              required
              value={jobStart}
              onChange={(e) => setJobStart(e.target.value)}
              className="px-4 py-3 rounded-xl border"
            />

            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="px-4 py-3 rounded-xl border"
            >
              <option value="20">20 ft</option>
              <option value="40">40 ft</option>
            </select>
          </div>

          {/* RELEASE / CONTAINER */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIdType("release")}
              className={`px-6 py-2 rounded-xl font-bold ${idType === "release"
                ? "bg-indigo-600 text-white"
                : "border"
                }`}
            >
              Release #
            </button>
            <button
              type="button"
              onClick={() => setIdType("container")}
              className={`px-6 py-2 rounded-xl font-bold ${idType === "container"
                ? "bg-indigo-600 text-white"
                : "border"
                }`}
            >
              Container #
            </button>
          </div>

          {idType === "release" && (
            <input
              required
              value={release}
              onChange={(e) => setRelease(e.target.value)}
              placeholder="Release Number"
              className="px-4 py-3 rounded-xl border"
            />
          )}

          {idType === "container" && (
            <input
              required
              value={containerNumber}
              onChange={(e) => setContainerNumber(e.target.value)}
              placeholder="Container Number"
              className="px-4 py-3 rounded-xl border"
            />
          )}

          {/* EXTRA FIELDS */}
          <div className="grid md:grid-cols-3 gap-6">
            <input
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              placeholder="VBS Slot"
              className="px-4 py-3 rounded-xl border"
            />
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className="px-4 py-3 rounded-xl border"
            />
            <input
              value={doors}
              onChange={(e) => setDoors(e.target.value)}
              placeholder="Doors"
              className="px-4 py-3 rounded-xl border"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight (kg)"
              className="px-4 py-3 rounded-xl border"
            />
            <input
              value={commodityCode}
              onChange={(e) => setCommodityCode(e.target.value)}
              placeholder="Commodity Code"
              className="px-4 py-3 rounded-xl border"
            />
            <select
              value={dg}
              onChange={(e) => setDg(e.target.value)}
              className="px-4 py-3 rounded-xl border"
            >
              <option>Select Option</option>
              <option value="false">DG No</option>
              <option value="true">DG Yes</option>
            </select>
          </div>

          <input
            value={random}
            onChange={(e) => setRandom(e.target.value)}
            placeholder="Random"
            className="px-4 py-3 rounded-xl border w-full"
          />

          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Special instructions"
            className="px-4 py-3 rounded-xl border w-full"
          />

          {message && (
            <div
              className={`p-4 rounded-xl font-semibold ${message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
                }`}
            >
              {message.text}
            </div>
          )}

          <button
            disabled={isSubmitting}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Job"}
          </button>
        </form>

        {/* ================= JOB STATUS TABLE ================= */}

      </div>
      <div className="bg-white rounded-3xl mt-5 border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">All Jobs Status</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Job #</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Driver</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingJobs && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center">Loading jobs...</td>
                </tr>
              )}

              {!loadingJobs && jobs.map(job => (
                <tr key={job._id} className="border-b">
                  <td className="px-4 py-3">{job.jobNumber || "-"}</td>
                  <td className="px-4 py-3">{job.customer || "-"}</td>
                  <td className="px-4 py-3">{job.assignedTo?.username || "Unassigned"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${job.isCompleted
                          ? "bg-emerald-100 text-emerald-700"
                          : "text-amber-700"
                        }`}
                    >
                      {(() => {
                        const status = getJobStatus(job);
                        return (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}
                          >
                            {status.label}
                          </span>
                        );
                      })()}

                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
