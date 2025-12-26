import React, { useState } from "react";
/*import TimePicker from "react-time-picker";
import finish from "../assets/finish.svg";*/
import address from "../assets/location.svg";
import safety from "../assets/list.svg";
import comments from "../assets/comments.svg";
import declaration from "../assets/declaration.svg";

/*import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';*/

const SafetyForm = ({ isOpen, handleSafetyFormClose, options }) => {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [jobNumber, setJobNumber] = useState("");
  const [fitForDuty, setFitForDuty] = useState("")
  const [PPE, setPPE] = useState("")
  const [mealBreak, setMealBreak] = useState("")
  const [message, setMessage] = useState("")
  /* const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [finishDate, setFinishDate] = useState("");*/
  const [addressSite, setAddressSite] = useState("");

  /* const handleTimeChangeStart = (time) => {
    setStartTime(time);
  };
  const handleTimeChangeFinish = (time) => {
    setFinishTime(time);
  };*/

  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:10000/api/safetyForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({firstName, surname, addressSite, jobNumber, fitForDuty, mealBreak, PPE, message}),
      });

      // Parse the JSON response
      const data = await response.json();
      console.log(data);
      if (data.success === true) {
        handleSafetyFormClose()
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`fixed inset-0 z-[1001] ${isOpen ? "block" : "hidden"}`}>
      <div className="modal-overlay fixed inset-0 bg-black opacity-65"></div>
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="modal-content z-[1002] relative bg-white rounded-lg shadow-lg p-4 mt-5 mb-5 overflow-y-auto"
          style={{ width: "90%", maxHeight: "80vh" }}
        >
          <h2 className="text-lg font-bold mb-2">Safety-Form : Driver</h2>
          <div className="mb-4 bg-yellow-200 p-2 rounded-md font-bold">
            ⚠ Complete this form BEFORE you start Work
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="bg-gray-800 p-1 rounded-md text-white flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mt-0.5 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>{" "}
              Driver
            </div>

            <div>
              <h2 className="mt-2 font-semibold">
                Worker's Name<span className="text-red-600">*</span>
              </h2>
              <input
                type="text"
                value={firstName}
                required
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Arshdeep"
                className="py-2 pl-3 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-full"
              />
              <span className="text-sm pl-1">First Name</span>
              <input
                type="text"
                value={surname}
                required
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Singh"
                className="py-2 mt-1 pl-3 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-full"
              />
              <span className="text-sm pl-1">Surname</span>
            </div>
            {/*
            <div className="bg-blue-800 p-1 rounded-md text-white flex mt-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#ffffff"
                className="w-5 h-5 mt-0.5 mr-1"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M12 7V12L14.5 13.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                </g>
              </svg>
              Start Time
            </div>

            <div>
              <h2 className="font-semibold mt-2">
                I Started Work at<span className="text-red-600">*</span>
              </h2>
              <TimePicker
                value={startTime}
                onChange={handleTimeChangeStart}
                format="h:mm aa"
                clearIcon={null} // Hide the clear icon
                className="w-full"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="py-2 px-2 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-50 mt-2"
              />
              <br />
              <span className="text-gray-500">
                * Enter the time and date, that you actually started work
              </span>
            </div>

            <div className="bg-blue-800 p-1 rounded-md text-white flex mt-3">
              <img src={finish} alt="logo" className="w-6 h-6 mr-1" />
              Estimated finish
            </div>

            <div>
              <h2 className="font-semibold mt-2">
                I Plan to finish Work at
              </h2>
              <TimePicker
                value={finishTime}
                onChange={handleTimeChangeFinish}
                format="h:mm aa"
                clearIcon={null} // Hide the clear icon
                className="w-full"
              />
              <input
                type="date"
                value={finishDate}
                onChange={(e) => setFinishDate(e.target.value)}
                className="py-2 px-2 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-50 mt-2"
              />
              <br />
              <span className="text-gray-500">
                * Enter the time and date, that you are expecting to finish work.
              </span>
            </div>
*/}
            <div className="bg-blue-800 p-1 rounded-md text-white flex mt-3">
              <img src={address} alt="logo" className="w-6 h-6 mr-1" />
              Work Address
            </div>

            <div>
              <h2 className="font-semibold mt-2">Select the Work/Job Site</h2>
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
                <select
                  value={addressSite}
                  onChange={(e) => setAddressSite(e.target.value)}
                  className="py-2 pr-3 pl-10 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-full"
                >
                  <option value="" disabled>
                    Work Address
                  </option>
                  {options &&
                    options.map((option) => (
                      <option key={option._id} value={option.address}>
                        {option.address}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mt-2">
              <span className="font-semibold">Job Number</span>
              <br />
              <input
                type="text"
                value={jobNumber}
                onChange={(e) => setJobNumber(e.target.value)}
                className="py-2 mt-1 pl-3 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-full"
              />
              <br />
              <span>* Optional</span>
            </div>

            <div className="bg-red-600 p-1 rounded-md text-white flex mt-3">
              <img src={safety} alt="logo" className="w-6 h-6 mr-1" />
              Safety Checks
            </div>
            <div className="mt-2">
              <span className="font-semibold">
                Answer All of the following Questions, truthfully{" "}
                <span className="text-red-600">*</span>
              </span>
              <hr className="border-t-3 border-black mt-1" />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="font-semibold">
                I am 100% 'FIT for DUTY' today.
              </span>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-checkbox h-5 w-5 text-indigo-600"
                    value='yes'
                    checked={fitForDuty === "yes"}
                    onChange={() => setFitForDuty("yes")}
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-checkbox h-5 w-5 text-indigo-600"
                    value='no'
                    checked={fitForDuty === "no"} 
                    onChange={() => setFitForDuty("no")}
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
            <hr className="border-t-3 border-black mt-2" />

            <div className="flex items-center justify-between bg-slate-200">
              <span className="font-semibold">
                I do have the CORRECT Personal Protective Equipment (PPE) for the Work/job I am doing today.
              </span>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-checkbox h-5 w-5 text-indigo-600"
                    value='yes'
                    checked={PPE === "yes"}
                    onChange={() => setPPE("yes")}
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-checkbox h-5 w-5 text-indigo-600"
                    value='no'
                    checked={PPE === "no"} 
                    onChange={() => setPPE("no")}
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
            <hr className="border-t-3 border-black" />

            <div className="mt-2">
              <span className="font-semibold text-gray-700">
                Take Note:
                To be 100% 'FIT FOR DUTY' today, you must not be under the influence of, or suffering from after-effects of, Drugs, Alcohal, or other substances. And you must have had enough SLEEP in the last 24 hours (ideally, at least 7 hours){" "}
                <span className="text-red-600">*</span>
              </span>
              <hr className="border-t-3 border-black mt-1" />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="font-semibold">
                I am aware that I need to take regular REST and MEAL BREAKS throughout my work period (i.e, 1x 30-minute break, after 5 and 1/2 hours of driving); and I need to have enough WATER and FOOD available, to last me while I am working.
              </span>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-checkbox h-5 w-5 text-indigo-600"
                    value='yes'
                    checked={mealBreak === "yes"}
                    onChange={() => setMealBreak("yes")}
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-checkbox h-5 w-5 text-indigo-600"
                    value='no'
                    checked={mealBreak === "no"} 
                    onChange={() => setMealBreak("no")}
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
            <hr className="border-t-3 border-black mt-2" />

            <div className="mb-4 bg-yellow-200 p-2 rounded-md font-bold mt-2">
            ⚠ TAKE NOTE - If you are NOT sure about any of the questions below, please ask your Supervisor !
          </div>

          <div className="bg-black p-1 rounded-md text-white flex mt-3">
              <img src={comments} alt="logo" className="w-6 h-6 mr-1" />
             Comments
          </div>

          <div>
            <h2 className="font-semibold mt-1">Any Notes/Comments/Message ?</h2>
            <input type="text" placeholder="* Optional" className="py-2 mt-1 pl-3 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-full" value={message} onChange={(e)=>setMessage(e.target.value)}/>
          </div>

          <div className="bg-black p-1 rounded-md text-white flex mt-3">
              <img src={declaration} alt="logo" className="w-6 h-6 mr-1" />
             Declaration
          </div>

          <div>  
            <h2 className="font-semibold mt-1"><input type="checkbox" required/>  {" "}
             I declare the information that I have provided in this form, to be true and correct to the best of my knowledge. <span className="text-red-600">*</span> </h2>
          </div>

            <button type="submit" className="btn w-50 mt-2">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default SafetyForm;
