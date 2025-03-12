import React, { useState, useEffect } from "react";
import Papa from "papaparse";

// Define the structure of each CSV row
interface CollegeRecord {
  college: string;
  Program: string;
}

const CourseFinder: React.FC = () => {
  const [course, setCourse] = useState<string>("MBA");
  const [colleges, setColleges] = useState<string[]>([]);

  useEffect(() => {
    if (course.trim() !== "") {
      fetchAndFilterColleges();
    }
  }, [course]);

  const fetchAndFilterColleges = async () => {
    try {
      const response = await fetch("/programmes.csv"); // Ensure the CSV is inside public/
      if (!response.ok) throw new Error("Failed to load CSV file");

      const csvText = await response.text();

      Papa.parse<CollegeRecord>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          console.log("CSV Data:", result.data); // Debugging

          if (!result.data.length) {
            console.error("No data found in CSV");
            return;
          }

          // Filter and remove duplicate college names
          const filteredColleges: string[] = Array.from(
            new Set(
              result.data
                .filter((row) => row.Program?.trim().toLowerCase() === course.trim().toLowerCase())
                .map((row) => row.college.trim()) // Trim spaces to avoid duplicates with spacing differences
            )
          );

          setColleges(filteredColleges);
          console.log(`Colleges offering "${course}":`, filteredColleges);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error.message);
        },
      });
    } catch (error) {
      console.error("Error fetching CSV:", error.message);
    }
  };

  return (
    <div>
      <h2>Find Colleges by Course</h2>
      <input
        type="text"
        placeholder="Enter course name"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
      />
      <ul>
        {colleges.length > 0 ? (
          colleges.map((college, index) => <li key={index}>{college}</li>)
        ) : (
          <li>No colleges found</li>
        )}
      </ul>
    </div>
  );
};

export default CourseFinder;
