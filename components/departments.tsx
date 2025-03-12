import React,{ useState } from "react";
import data from "./unique_programs.json"; // Ensure correct path

interface ProgramListprops{
    selectedCourse:string;
}

const ProgramList:React.FC<ProgramListprops> = ({selectedCourse})=>{
    const [selected, setSelected]=useState("");
    return (
        <ul>
          {Object.entries(data)
            .filter(([course]) => course === selectedCourse) // Filter before mapping
            .flatMap(([course, categories]) =>
              categories.map((category, index) => (
                <li
                  key={course + index}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    borderBottom: "1px solid gray",
                    color: selected === category ? "blue" : "black",
                  }}
                  onClick={() => setSelected(category)}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "blue")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "gray")}
                >
                  {category}
                </li>
              ))
            )}
        </ul>
      );
}

export default ProgramList