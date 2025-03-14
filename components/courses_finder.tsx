import Papa from "papaparse";

interface CollegeRecord {
  "AISHE ID"?: string; // Marked as optional to handle missing values
  Program?: string;
}

// Function to fetch and return filtered colleges
export const fetchFilteredColleges = async (courseName: string): Promise<string[]> => {
  try {
    // Fetch both CSVs
    console.log('COURSE FINDER PARAMTER:')
    console.log(typeof courseName)
    const programmesResponse = await fetch("/programmes.csv");
    const collegesResponse = await fetch("/colleges.csv");

    if (!programmesResponse.ok || !collegesResponse.ok) {
      throw new Error("Failed to load CSV files");
    }

    const programmesCsv = await programmesResponse.text();
    const collegesCsv = await collegesResponse.text();

    return new Promise((resolve, reject) => {
      // Parse `programmes.csv`
      Papa.parse<CollegeRecord>(programmesCsv, {
        header: true,
        skipEmptyLines: true,
        complete: (programmesResult) => {
          // Parse `colleges.csv`
          Papa.parse<{ "AISHE ID"?: string; college?: string }>(collegesCsv, {
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
                  .filter(Boolean) // Remove undefined/null/empty values
              );

              // Filter colleges based on `AISHE ID` & courseName
              const filteredColleges = Array.from(
                new Set(
                  programmesResult.data
                    .filter((row) => {
                      const program = row.Program?.trim().toLowerCase() || "";
                      const aisheId = row["AISHE ID"]?.trim().toUpperCase() || ""; // Normalize case
                      return (
                        program === courseName.trim().toLowerCase() &&
                        validAisheIds.has(aisheId) // Match by AISHE ID
                      );
                    })
                    .map((row) => row["AISHE ID"]?.trim() || "") // Return AISHE IDs
                    .filter(Boolean) // Remove empty values
                )
              );

              console.log(`Filtered AISHE IDs for "${courseName}":`, filteredColleges);
              resolve(filteredColleges);
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
