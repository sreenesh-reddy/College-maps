import Papa from "papaparse";

interface College {
  "AISHE ID"?: string;
  Program?: string;
  Department?: string;
}

// Function to fetch and return filtered AISHE IDs
export const fetchProgramFilteredColleges = async (
  selectedCourse: string,
  selectedDepartment: string
): Promise<string[]> => {
  try {
    // Fetch both CSV files in parallel
    const [programmesRes, collegesRes] = await Promise.all([
      fetch("/programmes.csv"),
      fetch("/colleges.csv"),
    ]);

    if (!programmesRes.ok || !collegesRes.ok) {
      throw new Error("Failed to load CSV files");
    }

    // Read CSV content
    const [programmesCsv, collegesCsv] = await Promise.all([
      programmesRes.text(),
      collegesRes.text(),
    ]);

    return new Promise((resolve, reject) => {
      // Parse programmes.csv
      Papa.parse<College>(programmesCsv, {
        header: true,
        skipEmptyLines: true,
        complete: (programmesResult) => {
          // Parse colleges.csv
          Papa.parse<{ "AISHE ID"?: string }>(collegesCsv, {
            header: true,
            skipEmptyLines: true,
            complete: (collegesResult) => {
              if (!programmesResult.data.length || !collegesResult.data.length) {
                console.error("No data found in CSV files");
                resolve([]);
                return;
              }

              // Extract valid AISHE IDs from `colleges.csv`
              const validAisheIds = new Set(
                collegesResult.data
                  .map((row) => row["AISHE ID"]?.trim().toUpperCase()) // Normalize case
                  .filter(Boolean) // Remove undefined/null values
              );

              // Filter AISHE IDs based on course and department
              const filteredAisheIds = Array.from(
                new Set(
                  programmesResult.data
                    .filter(
                      (college) =>
                        college.Program?.trim().toLowerCase() === selectedCourse.trim().toLowerCase() &&
                        college.Department?.trim().toLowerCase() === selectedDepartment.trim().toLowerCase() &&
                        validAisheIds.has(college["AISHE ID"]?.trim().toUpperCase() || "")
                    )
                    .map((college) => college["AISHE ID"]?.trim() || "")
                    .filter(Boolean) // Remove empty values
                )
              );

              console.log(`Filtered AISHE IDs for "${selectedCourse}" & "${selectedDepartment}":`, filteredAisheIds);
              resolve(filteredAisheIds);
            },
            error: (error) => {
              console.error("Error parsing colleges.csv:", error.message);
              reject(error);
            },
          });
        },
        error: (error) => {
          console.error("Error parsing programmes.csv:", error.message);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("Error fetching CSV files:", error.message);
    return [];
  }
};
