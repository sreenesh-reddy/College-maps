import React from "react";
import data from "./unique_programs.json"; // Ensure correct path
import { useState } from "react";
const CourseList = () => {
    const [selected, setSelected]=useState("");
  return (
    <div>
      <ul
       style={{
        position: "absolute",
        top: "100%",
        left: "0",
        marginTop: "5px",
        listStyle: "none",
        padding: "0",
        backgroundColor: "white",
        border: "1px solid white",
        borderRadius: "10px",
        width: "150px",
        boxShadow: "0px 5px 10px rgba(0,0,0,0.3)",
        zIndex:"10000",
        maxHeight: "300px",
        overflowY: "auto",
        color:"gray",
      }}
      
      >
        {Object.entries(data).map(([course, categories]) => (
          <li key={course} style={{ padding: "8px", cursor: "pointer", borderBottom:"1px solid gray" }}
          onClick={() => setSelected(course)}
          
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "blue";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "gray";
          }}>
            {course}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseList;
