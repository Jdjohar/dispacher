import React, { useState, useEffect } from "react";
import address from "../assets/location.svg";
import safety from "../assets/list.svg";
import comments from "../assets/comments.svg";
import declaration from "../assets/declaration.svg";

const SafetyForm = ({ isOpen, handleSafetyFormClose, options, jobId }) => {
  const API_BASE = import.meta.env.VITE_API_URL || "https://dispacher-nu.vercel.app";
  const token = localStorage.getItem("token");

  // 🔒 Hooks MUST be unconditional
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [jobNumber, setJobNumber] = useState("");
  const [addressSite, setAddressSite] = useState("");
  const [addressOptions, setAddressOptions] = useState([]);
  const [fitForDuty, setFitForDuty] = useState("");
  const [PPE, setPPE] = useState("");
  const [mealBreak, setMealBreak] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ ALWAYS RUN EFFECT
  useEffect(() => {
    if (!isOpen || !token) return;

    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load addresses");
        const data = await res.json();
        setAddressOptions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Address fetch error:", err);
      }
    };

    fetchAddresses();
  }, [isOpen, token]);

  // ✅ SAFE CONDITIONAL RENDERING
  if (!isOpen) return null;

  if (!jobId) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[1001]">
        <div className="bg-white p-6 rounded-xl font-bold text-red-600">
          No active job found. Cannot submit safety form.
        </div>
      </div>
    );
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fitForDuty || !PPE || !mealBreak) {
      alert("Please answer all safety questions.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/safetyForms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          firstName,
          surname,
          addressSite,
          jobNumber,
          fitForDuty,
          PPE,
          mealBreak,
          message,
        }),
      });

      if (!res.ok) throw new Error("Submit failed");

      handleSafetyFormClose();

      // reset
      setFirstName("");
      setSurname("");
      setJobNumber("");
      setAddressSite("");
      setFitForDuty("");
      setPPE("");
      setMealBreak("");
      setMessage("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit safety form");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-[1001]">
      <div className="fixed inset-0 bg-black/60" />
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative bg-white rounded-lg shadow-lg p-4 w-[90%] max-h-[80vh] overflow-y-auto z-[1002]">
          <h2 className="text-lg font-bold mb-2">Safety Form – Driver</h2>

          <div className="mb-4 bg-yellow-200 p-2 rounded-md font-bold">
            ⚠ Complete this form BEFORE you start work
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME */}
            <div>
              <label className="font-semibold">Worker's Name *</label>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full py-2 px-3 rounded-xl bg-purple-70"
              />
              <input
                required
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Surname"
                className="w-full py-2 px-3 rounded-xl bg-purple-70 mt-2"
              />
            </div>

            {/* ADDRESS */}
            <div className="bg-blue-800 p-1 rounded-md text-white flex">
              <img src={address} className="w-6 h-6 mr-1" />
              Work Address
            </div>

            <select
  value={addressSite}
  onChange={(e) => setAddressSite(e.target.value)}
  required
  className="py-2 pr-3 pl-10 font-semibold rounded-xl bg-purple-70 w-full"
>
  <option value="">Select Work Address</option>
{console.log(addressOptions,"sdsdsd")}
{console.log(
  "addressOptions type:",
  Array.isArray(addressOptions),
  addressOptions
)}
  {Array.isArray(addressOptions) && addressOptions.length === 0 && (
    <option disabled>No addresses found</option>
  )}

  {Array.isArray(addressOptions) &&
    addressOptions.map((opt) => (
      <option key={opt._id} value={opt.address}>
        {opt.address}
      </option>
    ))}
</select>



            {/* JOB NUMBER */}
            <div>
              <label className="font-semibold">Job Number (Optional)</label>
              <input
                value={jobNumber}
                onChange={(e) => setJobNumber(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-purple-70"
              />
            </div>

            {/* SAFETY */}
            <div className="bg-red-600 p-1 rounded-md text-white flex">
              <img src={safety} className="w-6 h-6 mr-1" />
              Safety Checks
            </div>

            {[
              {
                label: "I am 100% FIT FOR DUTY today.",
                value: fitForDuty,
                setter: setFitForDuty,
              },
              {
                label: "I have correct PPE for this job.",
                value: PPE,
                setter: setPPE,
              },
              {
                label: "I will take required rest & meal breaks.",
                value: mealBreak,
                setter: setMealBreak,
              },
            ].map((q, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="font-semibold text-sm">{q.label}</span>
                <div className="flex gap-4">
                  <label>
                    <input
                      type="radio"
                      name={`q-${i}`}
                      checked={q.value === "yes"}
                      onChange={() => q.setter("yes")}
                    />{" "}
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`q-${i}`}
                      checked={q.value === "no"}
                      onChange={() => q.setter("no")}
                    />{" "}
                    No
                  </label>
                </div>
              </div>
            ))}

            {/* COMMENTS */}
            <div className="bg-black p-1 rounded-md text-white flex">
              <img src={comments} className="w-6 h-6 mr-1" />
              Comments
            </div>

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Optional notes"
              className="w-full py-2 px-3 rounded-xl bg-purple-70"
            />

            {/* DECLARATION */}
            <div className="bg-black p-1 rounded-md text-white flex">
              <img src={declaration} className="w-6 h-6 mr-1" />
              Declaration
            </div>

            <label className="font-semibold">
              <input type="checkbox" required /> I declare this information is
              correct *
            </label>

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Safety Form"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SafetyForm;
