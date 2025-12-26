import React, {useState, useRef} from 'react'
import { DownloadTableExcel } from 'react-export-table-to-excel';

const ReportSection = () => {
  const [reportData, setReportData] = useState([]);
  const [jobDate, setJobDate] = useState('')
  const tableRef = useRef(null);

  const reportJobs = async () => {
    try {
      const response = await fetch(`http://localhost:10000/api/reportJobs?date=${jobDate}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data.data);
      setReportData(data.data)
    } catch (error) {
      console.log(error);
    }
  }

  // Example data (replace with actual data fetching logic)


  const handleReportButtonClick = () => {
    reportJobs();
  };

  return (
    <div>
      <div className='mx-5 mt-2 p-2 bg-white rounded-md flex justify-between'>
        
        <h1 className='font-bold text-lg mt-1'>Report Section</h1>
        
        <div className='flex justify-between'>
        <input type="date" value={jobDate}
                onChange={(e) => setJobDate(e.target.value)}
                placeholder="Enter Job Date"
                required
                className="p-2 font-semibold placeholder-gray-500 rounded-xl border-none outline-none bg-purple-70 w-50" />
                <button className="bg-black ml-1 text-white px-1 rounded-md" onClick={handleReportButtonClick}>Search</button>
        </div>
      </div>

      <div className='m-5 bg-white border border-black overflow-auto'>
         {reportData && reportData.length === 0 ? (
          <h1 className='text-center'>No Job found</h1>
        ) : (
          <table ref={tableRef} className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">
             From
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">
              To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">
              Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">
              Container No.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">
              Release No.
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reportData && reportData.map((row) => (
            <tr key={row._id}>
              <td className="px-6 py-4">{row.uplift}</td>
              <td className="px-6 py-4">{row.offload}</td>
              <td className="px-6 py-4 whitespace-nowrap">{row.size}</td>
              <td className="px-6 py-4 whitespace-nowrap">{row.containerNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap">{row.release}</td>
            </tr>
          ))}
        </tbody>
      </table>
        )}
      </div>
      <DownloadTableExcel
                    filename="Report Section"
                    sheet="jobs"
                    currentTableRef={tableRef.current}
                >
                   <button className='btn ml-5'>Export Jobs</button>
       </DownloadTableExcel>
    </div>
  )
}

export default ReportSection