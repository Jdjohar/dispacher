import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const AdminDashPage = () => {
  const [users, setUsers] = useState([]);
  const { pathname } = useLocation();
  const [selectedTab, setSelectedTab] = useState("container");

  const fetchAllUsers = async () => {
    try {
      const response = await fetch("http://localhost:10000/api/allUsers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const allUsers = await response.json();
      console.log(allUsers.users);
      setUsers(allUsers.users);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (pathname !== '/admin-dashboard') {
      setSelectedTab("");
    }
     // Reset selectedTab to empty string when URL changes
  }, [pathname]);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <Sidebar />
      </div>
      {pathname !== "/admin-dashboard" ? (
        <Outlet />
      ) : (
        <div className="flex justify-center items-center mt-8">
          <button
            className={`px-4 py-2 mr-4 rounded-tl-lg font-semibold rounded-bl-lg focus:outline-none ${
              selectedTab === "container"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700"
            }`}
            onClick={() => handleTabChange("container")}
          >
            Container (
            {users.filter((user) => user.userType === "container").length})
          </button>
          <button
            className={`px-4 py-2 mr-4 font-semibold rounded-tr-lg rounded-br-lg focus:outline-none ${
              selectedTab === "dispatcher"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700"
            }`}
            onClick={() => handleTabChange("dispatcher")}
          >
            Dispatcher (
            {users.filter((user) => user.userType === "dispatcher").length})
          </button>
        </div>
      )}
      {/* Conditionally render based on the selected tab */}
      {selectedTab === "container" && (
        <div className="container-tab m-5 p-2 bg-white rounded-md">
          {users.map((user) => {
            if (user.userType === "container") {
              return (
                <div key={user._id} className="bg-purple-70 m-2 p-2 rounded-md">
                <span>UserName - {user.username}</span> <br/>
                <span>UserID - {user.userMainId}</span> <br/>
                <span>Email - {user.email}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
      {selectedTab === "dispatcher" && (
        <div className="dispatcher-tab m-5 p-2 bg-white rounded-md">
          {users.map((user) => {
            if (user.userType === "dispatcher") {
              return (
                <div key={user._id} className="bg-purple-70 m-2 p-2 rounded-md">
                <span>UserName - {user.username}</span> <br/>
                <span>Email - {user.email}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default AdminDashPage;
