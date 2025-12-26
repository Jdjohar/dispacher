import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import image1 from "../assets/image 1.png";
import truck from "../assets/truck.jpg";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const {setUser} = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:10000/api/userlogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        setUsername("");
        setPassword("");
        if (data.user.userType === "admin") {
          // Redirect to the admin dashboard
          navigate("/admin-dashboard");
        }
        if (data.user.userType === "dispatcher") {
          // Redirect to the dispatcher dashboard
          navigate("/dispatcher-dashboard");
        }
        if (data.user.userType === "container") {
          navigate("/container-dashboard");
        }
        console.log("Login successful:", data);
        // Handle successful login, e.g., store the token in local storage
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData.message);
        // Handle login failure, e.g., show an error message
      }
    } catch (error) {
      console.error("Error during login:", error.message);
      // Handle other errors, e.g., network issues
    }
  };

  const checkLocalStorageLogin = () => {
    const userInfoString = localStorage.getItem("userInfo");
    const userInfo = JSON.parse(userInfoString);
    setUser(userInfo)   
    if (userInfo) {
      navigate(`/${userInfo.userType.toLowerCase()}-dashboard`);
    }
  };

useEffect(()=>{
  checkLocalStorageLogin();
}, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col m-6 space-y-8 bg-white rounded-2xl md:flex-row md:space-y-0">
        <div className="flex flex-col justify-center p-8 md:p-14">
          <div className="mb-5 mt-[-12px]">
            <img src={image1} alt="logo" className="w-100" />
          </div>

          <h1 className="font-bold">LOGIN</h1>
          <h3 className="text-gray-500">Malwa Transport Ltd</h3>

          <form onSubmit={handleLogin}>
            <div className="relative flex items-center text-gray-700 mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 absolute ml-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              <input
                type="text"
                placeholder="Username"
                className="py-2 pr-3 pl-10 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70"
                required
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="relative flex items-center text-gray-700 mt-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 ml-3 absolute"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
              <input
                type="password"
                placeholder="Password"
                className="py-2 pr-3 pl-10 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70"
                required
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn mt-5">
              Login Now
            </button>
          </form>
        </div>
        <div>
          <img
            src={truck}
            alt="transport"
            className="hidden object-cover md:block w-[400px] h-full rounded-r-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
