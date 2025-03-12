"use client";
import dynamic from "next/dynamic";
import data from "./unique_programs.json"; // Ensure correct path
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import L from "leaflet";
import { useRouter } from "next/router";

import { IoMdClose } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
const Collegelist = dynamic(()=>import("../components/college_finder"), {ssr:false} )
// Fix missing marker icon
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface College {
  name: string;
  state: string;
  district: string;
  website: string;
  yearOfEstablishment: string;
  location: string;
  collegeType: string;
  management: string;
  universityName: string;
  universityType: string;
  lat: number;
  long: number;
}

interface CollegeRecord {
  college: string;
  Program: string;
}

const Map = () => {

  const [colleges, setColleges] = useState<College[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [showModal, setShowModal] = useState(false); // State for modal
  const [showRateModal, setShowRateModal] = useState(false); // State for modal
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const mapRef = useRef<L.Map | null>(null);
  const [suggestions, setSuggestions] = useState<College[]>([]);
  const router = useRouter();

  const handleNavigate = () => {
    console.log("Selected College:", selectedCollege); 
    console.log("College Name:", selectedCollege?.name);
    if (selectedCollege?.name) {
      router.push(`/Additional?college_name=${encodeURIComponent(selectedCollege.name)}`);
    } else {
      alert("College name is missing!");
    }  };

  useEffect(() => {
    fetch("/colleges.csv")
      .then((res) => res.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data.map((college: any) => {
              const [lat, long] = (college["lat,long"] || "")
                .split(",")
                .map(Number);

              return {
                aisheCode: college["Aishe Code"] || "",
                name: college["Name"] || "",
                state: college["State"] || "",
                district: college["District"] || "",
                website: college["Website"] || "",
                yearOfEstablishment: college["Year Of Establishment"] || "",
                location: college["Location"] || "",
                collegeType: college["College Type"] || "",
                management: college["Manegement"] || "",
                universityName: college["University Name"] || "",
                universityType: college["University Type"] || "",
                lat: lat || 0,
                long: long || 0,
              };
            });

            setColleges(parsedData);
          },
        });
      });
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = colleges.filter((college) =>
        college.name.toLowerCase().startsWith(search.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [search, colleges]);

  const handleSearch = () => {
    setSuggestions([]);

    const found = colleges.find(
      (college) => college.name.toLowerCase() === search.toLowerCase()
    );

    if (found) {
      setSelectedCollege(found);

      if (mapRef.current) {
        mapRef.current.setView([found.lat, found.long], 12, { animate: true });
      }
    } else {
      alert("College not found!");
    }
  };

  // Function to handle click on marker or label
  const handleMarkerClick = () => {
    setShowModal(true);
  };


  const ChangeMapCenter = ({ lat, long }: { lat: number; long: number }) => {
    const map = useMap();
    useEffect(() => {
      map.setView([lat, long], 12, { animate: true });
    }, [lat, long, map]);

    return null;
  };

  const [selected, setSelected]=useState("");
  const handleRateSubmit = () => {
    console.log(`Rating: ${rating} stars`);
    console.log(`Feedback: ${feedback}`);
    setShowRateModal(false);
    setRating(0);
    setFeedback("");
  };

  const [isOpen, setIsOpen] = useState(false);



  const [selectedColleges, setSelectedColleges]=useState([])

  const handleSelected = async (course) => {
    setSelected(course);
    setIsOpen(false);
    const handleCollegesList = (colleges: string[]) => {
      console.log("Filtered colleges:", colleges);
    };
  };
  

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}> 
      <div style={{ marginBottom: "50px", display: "flex", flexDirection:"column", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
        <div >
        <div style={{ position: "relative", display: "inline-block" }}>
      <input
        type="text"
        placeholder="Search college..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "500px",
          padding: "8px 40px 8px 12px", // Extra padding to avoid text overlapping the icon
          border: "1px solid gray",
          borderRadius: "10px 0px 0px 10px",

          outline: "none",
        }}
        onSelect={(e)=>{(e.currentTarget as HTMLElement).style.borderColor="blue"}}
        onBlur={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = "gray"; // Reset when deselected
        }}
      />
      <IoIosSearch
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "20px",
          color: "gray",
          cursor: "pointer",
  
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as SVGElement).style.color = "blue";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as SVGElement).style.color = "gray";
        }}
        onClick={handleSearch}
      />
    </div>
    <div style={{ position: "relative", display: "inline-block" }}>
      <span
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "150px",
          padding: "11px 10px",
          border: "1px solid gray",
          color:"gray",
          borderRadius: "0px 0px 0px 0px",
          borderLeft:"0px",
          borderRight:"0px",
          cursor: "pointer",
          backgroundColor: "white",
        }}

    
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "blue";
          (e.currentTarget as HTMLElement).style.borderColor = "blue";

        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "gray";
          (e.currentTarget as HTMLElement).style.borderColor = "gray";

        }}
      >
        {selected===""?<span>Courses ▼</span>:<span>{selected} <button
    onClick={() => setSelected("")}
    style={{
      position: "absolute",
      top: "11px",
      right: "20px",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.color = "blue";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.color = "gray";
    }}
  >
   <IoMdClose size={20}/>

  </button></span>}
      </span>
      {isOpen && (
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
                        onClick={() => handleSelected(course)}
                        
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

      )}
    </div>
    <div style={{ position: "relative", display: "inline-block" }}>
      <span
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "150px",
          padding: "11px 10px",
          border: "1px solid gray",
          color:"gray",
          borderRadius: "0px 10px 10px 0px",
          cursor: "pointer",
          backgroundColor: "white",
        }}

    
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "blue";
          (e.currentTarget as HTMLElement).style.borderColor = "blue";

        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "gray";
          (e.currentTarget as HTMLElement).style.borderColor = "gray";

        }}
      >
        {selected===""?<span>Programs ▼</span>:<span>{selected} <button
    onClick={() => setSelected("")}
    style={{
      position: "absolute",
      top: "11px",
      right: "20px",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.color = "blue";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.color = "gray";
    }}
  >
   <IoMdClose size={20}/>

  </button></span>}
      </span>
      {isOpen && (
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
                        onClick={() => handleSelected(course)}
                        
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

      )}
    </div>
        </div>
        <div>
        {suggestions.length > 0 && (
          <div style={{  boxShadow: "0px 4px 10px rgba(154, 145, 145, 0.3)", zIndex: "1000",position:"absolute",top: "119px",left: "47.6%", 
            transform: "translateX(-52.5%)",width:"500px", background: "white", borderRadius: "10px", maxHeight: "200px", overflowY: "auto" }}>
            {suggestions.map((college) => (
              <div
                key={college.name}
                onClick={() => setSearch(college.name)}
                style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #ccc", borderRadius:"10px", borderLeft:"0px", borderRight:"0px" }}
              >
                {college.name}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      <div style={{overflow: "hidden",display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "1000px", minWidth: "fit-content", padding: '0px', margin: '0px' , borderRadius:"40px"}}>
        <MapContainer
          center={[17.70405, 83.30119]}
          zoom={5}
          style={{ height: "450px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {selectedCollege && (
            <>
              <ChangeMapCenter lat={selectedCollege.lat} long={selectedCollege.long} />
              {/* Marker with Click Event */}
              <Marker position={[selectedCollege.lat, selectedCollege.long]} icon={customIcon} eventHandlers={{ click: handleMarkerClick }}>
                <Popup>{selectedCollege.name}</Popup>
              </Marker>

              {/* Clickable Label */}
              <Marker
                position={[selectedCollege.lat, selectedCollege.long]}
                icon={L.divIcon({
                  className: "college-label",
                  html: `<div style="
                  cursor: pointer;
                  width: max-content;
                  height: fit-content;
                  margin-top: 10px;
                  background: rgba(154, 145, 145, 0.6);
                  padding: 4px 8px; 
                  border-radius: 4px; 
                  font-size: 12px; 
                  font-weight: bold; 
                  box-shadow: 2px 2px 5px rgba(154, 145, 145, 0.3);
                ">${selectedCollege.name}</div>`,
                })}
                eventHandlers={{ click: handleMarkerClick }}
              />
            </>
          )}
        </MapContainer>

        {/* Modal for College Info */}
        {showModal && selectedCollege && (
          <div
            style={{
              width:"430px",
              display: "flex",
              flexDirection: "column",
              position: "fixed",
              top: "20.3%",
              left: "57%",
              transform: "scale(0.7,0.8)",
              background: "white",
              padding: "22px",
              borderRadius: "30px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              zIndex: "1000",
            }}
          >

<button
    onClick={() => setShowModal(false)}
    style={{
      position: "absolute",
      top: "10px",
      right: "10px",
      cursor: "pointer",
    }}
  >
   <IoMdClose size={25}/>

  </button>

  <h2 style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}>
    <strong>Name:</strong> 
    <span style={{ marginLeft:"5px", maxWidth: "80%", wordWrap: "break-word", overflowWrap: "break-word" }}>
      {selectedCollege.name}
    </span>
  </h2>
  <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>Aishe Code:</strong> <span style={{ marginLeft:"5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.aisheCode}</span></p>
  <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>State:</strong> <span style={{marginLeft:"5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.state}</span></p>
  <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>District:</strong> <span style={{marginLeft:"5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.district}</span></p>
  <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>Website:</strong> 
    <a 
      style={{ color: "blue", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }} 
      href={selectedCollege.website.startsWith("http") ? selectedCollege.website : `https://${selectedCollege.website}`} 
      target="_blank" 
      rel="noopener noreferrer"
    >
      {selectedCollege.website}
    </a>
  </p>
  <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>Year Of Establishment:</strong> <span style={{marginLeft:"5px",maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.yearOfEstablishment}</span></p>
  <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>Location:</strong> <span style={{marginLeft:"5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.location}</span></p>
  <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>College Type:</strong> <span style={{marginLeft:"5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.collegeType}</span></p>
  <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>Management:</strong> <span style={{marginLeft:"5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.management}</span></p>
  <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>University Name:</strong> <span style={{marginLeft:"5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.universityName}</span></p>
  <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>University Type:</strong> <span style={{ marginLeft:"5px",maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.universityType}</span></p>


 
          <div>
          <div style={{alignItems:"baseline"}}>
            Rating:  
            <span style={{marginLeft:"5px"}}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{ cursor: "pointer", fontSize: "24px", color: rating >= star ? "gold" : "gray" }}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
            </span>
          </div>
          <textarea
            placeholder="Write your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            style={{ width: "100%", height: "80px", marginTop: "10px", border:"1px solid black", borderRadius:"20px", padding:"10px" }}
          />
        </div>
        <button onClick={handleRateSubmit}style={{ cursor: "pointer", marginTop: "10px", padding: "5px 10px", border: "1px solid black", borderRadius: "10px", marginRight:"5px" }}>Submit</button>
        <button onClick={()=>handleNavigate()}style={{ cursor: "pointer", marginTop: "10px", padding: "5px 10px", border: "1px solid black", borderRadius: "10px", marginRight:"5px" }}>Additional details</button>
          </div>
        )}

      </div>

    </div>
  );
};

export default Map;
