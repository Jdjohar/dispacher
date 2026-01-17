import React, { useState } from "react";

const AdminUser = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "https://dispacher-nu.vercel.app";
  const token = localStorage.getItem("token");

  const [userType, setUserType] = useState("container");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userMainId, setUserMainId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const payload =
      userType === "container"
        ? { username, email, password, userType, userMainId }
        : { username, email, password, userType };

    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      setFeedback({
        type: "success",
        msg: "User account created successfully",
      });

      // reset
      setUserName("");
      setEmail("");
      setPassword("");
      setUserMainId("");
      setUserType("container");
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        msg: err.message || "Server error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b">
          <h2 className="text-2xl font-bold text-slate-800">
            Add New User
          </h2>
          <p className="text-slate-500 text-sm">
            Create driver or dispatcher accounts
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* User Type */}
          <div>
            <label className="block text-sm font-bold mb-3">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              {["container", "dispatcher"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUserType(type)}
                  className={`p-4 rounded-2xl border-2 font-bold ${
                    userType === type
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  {type === "container" ? "Driver" : "Dispatcher"}
                </button>
              ))}
            </div>
          </div>

          {/* Driver ID */}
          {userType === "container" && (
            <div>
              <label className="block text-sm font-bold mb-2">
                Driver ID (Unique)
              </label>
              <input
                required
                value={userMainId}
                onChange={(e) => setUserMainId(e.target.value)}
                placeholder="DRIVER-001"
                className="w-full px-4 py-3 rounded-xl border"
              />
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-bold mb-2">Username</label>
            <input
              required
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-4 py-3 rounded-xl border"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold mb-2">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@company.com"
              className="w-full px-4 py-3 rounded-xl border"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold mb-2">
              Temporary Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border"
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-4 rounded-xl font-semibold ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {feedback.msg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminUser;
