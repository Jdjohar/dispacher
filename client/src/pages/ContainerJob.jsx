import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ContainerJob = () => {
  const { user } = useAuth();
  const [completeJob, setCompleteJob] = useState([]);

  const getContainerJob = async (userMainId) => {
    try {
      const response = await fetch(
        `http://localhost:10000/api/container-complete-job?userMainId=${userMainId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const containerJob = await response.json();
      setCompleteJob(containerJob.jobs);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getContainerJob(user.userMainId);
  }, []);
  return (
    <div className="m-5">
      {completeJob.length !== 0 ? (
        completeJob.map((job) => (
          <div
            key={job._id}
            style={{ position: "relative" }}
            className="bg-white p-2 font-semibold rounded-md mt-10"
          >
            {job.userMainId ? (
              <div
                style={{ position: "absolute" }}
                className="top-[-31px] left-0 bg-blue-600 my-2 px-2 rounded-t-md font-semibold text-white"
              >
                <div>User ID {job.userMainId}</div>
              </div>
            ) : (
              ""
            )}
            <div className="grid sm:grid-cols-2 grid-cols-1 px-2 mt-4">
              <div>
                <div>Start Date - <span className="font-normal">{job.jobStart}</span></div>
                <div>
                  PIN - <span className="font-normal">{job.pin}</span>
                </div>
                <div>
                  Commodity Code -{" "}
                  <span className="font-normal">{job.commodityCode}</span>
                </div>
                <div>
                  Doors - <span className="font-normal">{job.doors}</span>
                </div>
                <div>
                  Slot - <span className="font-normal">{job.slot}</span>
                </div>
                <div>
                  DG - <span className='font-normal'>{job.dg}</span> 
                </div>
                <div>
                  Container Number - <span className='font-normal'>{job.containerNumber}</span> 
                </div>
              </div>

              <div>
                <div>
                  Uplift Address -{" "}
                  <span className="font-normal">{job.uplift}</span>
                </div>
                <div>
                  Offload Address -{" "}
                  <span className="font-normal">{job.offload}</span>
                </div>
                <div>
                  Size - <span className="font-normal">{job.size}ft.</span>
                </div>
                <div>
                  Release - <span className="font-normal">{job.release}</span>
                </div>
                <div>
                  Random - <span className="font-normal">{job.random}</span>
                </div>
                <div>
                  Weight - <span className='font-normal'>{job.weight} kg</span> 
                  </div>
              </div>
            </div>
            <div className='px-2 mt-1'>
                 <span className="font-bold">Special Instructions:</span>
                  <br/>
                  <span className='text-lg font-normal'>{job.instructions}</span>
                 </div>
            <div className="px-2 mt-2 font-semibold bg-purple-400 rounded-md text-white">
              <div className="flex items-center justify-center ">Status</div>
              <div className="flex flex-wrap gap-2">
                {job.status.map((e) => (
                  <div key={e.type}>
                    <span className="capitalize">{e.type}</span> -{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      timeZone: "IST", // Adjust this according to your requirements
                    })
                      .format(new Date(e.timestamp))
                      .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$1-$2")}
                    ,
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="items-center">No Job Completed Yet.</div>
      )}
    </div>
  );
};

export default ContainerJob;
