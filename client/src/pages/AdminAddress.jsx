import React, { useState } from "react";

const AdminAddress = () => {
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://dispacher-nu.vercel.app/api/saveAddress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, address, email }),
      });

      // Parse the JSON response
      const data = await response.json();
      console.log(data);
      setAddress("");
      setEmail("");
      setName("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <form
        className="m-5 bg-white p-5 rounded-2xl md:m-10 lg:m-16 xl:m-24"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-5">
          <div className="mb-3">
            <label htmlFor="username" className="font-semibold">
              Name
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name of owner"
                className="py-2 pr-3 pl-10 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-full"
                id="username"
                
              />
            </div>
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
                className="py-2 pr-3 pl-10 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-full"
                id="email"
                
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="address" className="font-semibold">
              Address
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
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>

              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Type Address Here"
                className="py-2 pr-3 pl-10 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-full"
                id="address"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn my-5 w-50 md:ml-5">
          Add Address
        </button>
      </form>
    </div>
  );
};

export default AdminAddress;
