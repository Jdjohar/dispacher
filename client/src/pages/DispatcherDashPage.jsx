import React, { useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import DispatcherSidebar from "../components/DispatcherSidebar";

const DispatcherDashPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

  /* ================= AUTH + ROLE GUARD ================= */
  useEffect(() => {
    if (!token || !userInfo) {
      navigate("/login", { replace: true });
      return;
    }

    if (userInfo.userType !== "dispatcher") {
      navigate("/unauthorized", { replace: true });
    }
  }, [token, userInfo, navigate]);

  const isRootDashboard =
    location.pathname === "/dispatcher-dashboard" ||
    location.pathname === "/dispatcher-dashboard/";

  /* ================= NESTED ROUTES ================= */
  if (!isRootDashboard) {
    return (
      <div className="flex">
        <DispatcherSidebar />
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    );
  }

  /* ================= DASHBOARD ================= */
  return (
    <div className="flex">
      <DispatcherSidebar />

      <div className="flex-1 max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Job */}
          <Link
            to="/dispatcher-dashboard/create-job"
            className="group bg-white p-8 rounded-3xl border shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all border-b-4 border-b-indigo-500"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                +
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">
              Create New Job
            </h3>
            <p className="text-slate-500 text-sm">
              Assign routes, container details, and instructions.
            </p>
          </Link>

          {/* Job List */}
          <Link
            to="/dispatcher-dashboard/job-lists"
            className="group bg-white p-8 rounded-3xl border shadow-sm hover:shadow-xl hover:shadow-emerald-100 transition-all border-b-4 border-b-emerald-500"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                ≡
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">
              Active Job List
            </h3>
            <p className="text-slate-500 text-sm">
              Assign drivers and track job progress.
            </p>
          </Link>
        </div>

        {/* Reports */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">
                Operational Reports
              </h3>
              <p className="text-slate-400 text-sm max-w-md">
                Review completed jobs and logistics history.
              </p>
            </div>
            <Link
              to="/dispatcher-dashboard/report-section"
              className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-indigo-50"
            >
              View Reports
            </Link>
          </div>

          {/* Background */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default DispatcherDashPage;
