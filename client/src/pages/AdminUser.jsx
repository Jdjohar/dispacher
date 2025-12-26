import React, { useState } from "react";

const AdminUser = () => {
  const [userType, setUserType] = useState("container");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userMainId, setUserMainId] = useState("");
  const [message, setMessage] = useState("");
  const [idMessage, setIdMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userType === "container") {
      try {
        const response = await fetch("http://localhost:10000/api/saveUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
            userMainId,
            userType,
          }),
        });

        // Parse the JSON response
        const data = await response.json();

        if (data.success === true) {
          setUserMainId(""),
            setEmail(""),
            setPassword(""),
            setUserName(""),
            setUserType("container"),
            setMessage(""),
            setIdMessage("");
        }
        if (data.code === "ID") {
          setIdMessage(data.message);
        }
        if (data.code !== "ID") {
          setIdMessage("");
        }
        if (data.code === "user") {
          setMessage(data.message);
        }
        if (data.code !== "user") {
          setMessage("");
        }

        // Handle the response (you can log it to the console for now)
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const response = await fetch("http://localhost:10000/api/saveUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password, userType }),
        });

        // Parse the JSON response
        const data = await response.json();

        if (data.success === true) {
          setContainerNumber(""),
            setEmail(""),
            setPassword(""),
            setUserName(""),
            setUserType("container"),
            setMessage(""),
            setIdMessage("");
        }
        if (data.code === "ID") {
          setIdMessage(data.message);
        }
        if (data.code !== "ID") {
          setIdMessage("");
        }
        if (data.code === "user") {
          setMessage(data.message);
        }
        if (data.code !== "user") {
          setMessage("");
        }

        // Handle the response (you can log it to the console for now)
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div>
      <form
        className="m-5 bg-white p-5 rounded-2xl md:m-10 lg:m-16 xl:m-24"
        name="create-form"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-5">
          <div className="mb-3">
            <span className="font-semibold">UserType</span>
            <br />
            <div className="relative flex items-center text-gray-700 mt-2">
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
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>

              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="py-2 pr-3 pl-10 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-full"
              >
                <option value="container">Driver/Container</option>
                <option value="dispatcher">Dispatcher</option>
              </select>
            </div>
          </div>
          {userType === "container" && (
            <div className="mb-3">
              <label htmlFor="container-number" className="font-semibold">
                User ID
              </label>
              <div className="relative flex items-center text-gray-700 mt-2">
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
                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                  />
                </svg>

                <input
                  type="text"
                  id="container-number"
                  value={userMainId}
                  onChange={(e) => setUserMainId(e.target.value)}
                  required
                  placeholder="User ID"
                  className="py-2 pr-3 pl-10 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-full"
                />
              </div>

              <span className="text-red-500">{idMessage}</span>
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="username" className="font-semibold">
              UserName
            </label>
            <div className="relative flex items-center text-gray-700 mt-2">
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
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                id="username"
                required
                placeholder="Username"
                className="py-2 pr-3 pl-10 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-full"
              />
            </div>
            <span className="text-red-500">{message}</span>
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="font-semibold">
              Email
            </label>
            <div className="relative flex items-center text-gray-700 mt-2">
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
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                id="email"
                className="py-2 pr-3 pl-10 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="font-semibold">
              Password
            </label>
            <div className="relative flex items-center text-gray-700 mt-2">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                id="password"
                className="py-2 pr-3 pl-10 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-full"
              />
            </div>
          </div>
        </div>

        <button className="btn my-5 w-50 md:ml-5" type="submit">
         Add User
        </button>
      </form>
    </div>
  );
};

export default AdminUser;
