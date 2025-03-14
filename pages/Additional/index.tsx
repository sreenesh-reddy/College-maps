import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Papa from "papaparse";

interface CollegeData {
  [key: string]: string; // Allows dynamic column names
}

interface ProgramData{
  [key:string]:string;
}

const Additional: React.FC = () => {
  const router = useRouter();
  const [collegeCode, setCollegeCode] = useState<string | null>(null);
  const [collegeDetails, setCollegeDetails] = useState<CollegeData | null>(null);
  const [programDetails, setprogramDetails] = useState<ProgramData[] | null>(null);


  // Get college code from query
  useEffect(() => {
    if (router.isReady && router.query.aisheCode) {
      setCollegeCode(router.query.aisheCode as string);
      console.log("College Code from Query:", router.query.aisheCode);
    }
  }, [router.isReady, router.query.aisheCode]);

  // Fetch CSV and find college details
  useEffect(() => {
    if (!collegeCode) return; // Wait for collegeCode to be set

    const fetchCollegeData = async () => {
      try {
        const response = await fetch("/final_yellow.csv"); // Ensure path is correct
        const csvText = await response.text();
        const response2 = await fetch("/programmes.csv");
        const csvText2 = await response2.text();

        Papa.parse(csvText2, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            console.log("Programmes CSV Parsed Data:", result.data);
            const data: ProgramData[] = result.data as ProgramData[];
        
            // Filter all matching programs
            const foundPrograms = data.filter((program) => program["AISHE ID"] === collegeCode);
        
            console.log("Matching Program Details:", foundPrograms);
            setprogramDetails(foundPrograms.length > 0 ? foundPrograms : null);
          },
        });

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const data: CollegeData[] = result.data as CollegeData[];

            // Find college details using state collegeCode
            const foundCollege = data.find((college) => college["AISHE ID"] === collegeCode);
            setCollegeDetails(foundCollege || null);
          },
        });
      } catch (error) {
        console.error("Error fetching CSV:", error);
      }
    };

    fetchCollegeData();
  }, [collegeCode]); // Run when collegeCode is updated

  return (
    <div>
      {collegeDetails ? (
        <div>
          <h2>{collegeDetails["Name of the College"]}</h2>
          
          <p>Date of establishment of IQAC: {collegeDetails["Date of establishment of IQAC"]}</p>
          <p>Is the institution recognised as an Autonomous\nCollege by the UGC?:{collegeDetails["Is the institution recognised as an Autonomous\nCollege by the UGC?"]}</p>


          <p>Head of Institution: {collegeDetails["Name of the Head of the Institution"]}</p>
          <p>Designation: {collegeDetails["Designation"]}</p>
          <p>Address of the College: {collegeDetails["Address of the College"]}</p>
          <p>State/UT: {collegeDetails["State/UT"]}</p>
          <p>District: {collegeDetails["District"]}</p>
          <p>Pin: {collegeDetails["Pin"]}</p>
          <p>Phone No: {collegeDetails["Phone No"]}</p>
          <p>Alternate Phone No: {collegeDetails["Mobile No"]}</p>

          <p>Registered Email: {collegeDetails["Registered Email"]}</p>
          
          <p>Alternate Email: {collegeDetails["Alternate Email"]}</p>
          <p>Website: {collegeDetails["Website"]}</p>
          <p>Nature of the college: {collegeDetails["Nature of the college"]}</p>
          <p>College Affiliation: {collegeDetails["College Affiliation"]}</p>

          <p>University Name: {collegeDetails["University Name"]}</p>

          <p>Male: {collegeDetails["Male"]}</p>
          <p>Female: {collegeDetails["Female"]}</p>
          <p>Total: {collegeDetails["Total"]}</p>
          {/* <p>Other details: {JSON.stringify(collegeDetails)}</p> */}
          {programDetails && programDetails.length > 0 ? (
  <div>
    <h3>Program Details</h3>
    <table style={{ borderCollapse: "collapse", width: "40%", border: "1px solid black", alignItems:"center", justifyContent:"center" }}>
      <thead>
        <tr>
          <th>Program</th>
          <th>Department</th>
          <th>University Affiliation</th>
          <th>SRA Recognition</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {programDetails.map((program, index) => (
          <tr key={index}>
            <td>{program["Program"] || "N/A"}</td>
            <td>{program["Department"] || "N/A"}</td>
            <td>{program["University Affiliation"] || "N/A"}</td>
            <td>{program["SRA Recognition"] || "N/A"}</td>
            <td>{program["Status"] || "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : (
  <p>No program details found.</p>
)}
          </div>
      ) : (
        <p>{collegeCode ? "College not found." : "Loading..."}</p>
      )}
    </div>
  );
};

export default Additional;
