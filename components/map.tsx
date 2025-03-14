"use client";
import dynamic from "next/dynamic";
import data from "./unique_programs.json"; // Ensure correct path
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import L from "leaflet";
import { useRouter } from "next/router";
import { fetchFilteredColleges } from "./courses_finder";
import { IoMdClose } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
import { fetchProgramFilteredColleges } from "./programmes_finder";


const Collegelist = dynamic(() => import("../components/college_finder"), { ssr: false })
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
  const [selectedCollege, setSelectedCollege] = useState<College[] | null>([]);
  const [selectedColleges, setSelectedColleges] = useState<College[]>([])
  const [showModal, setShowModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const mapRef = useRef<L.Map | null>(null);
  const [suggestions, setSuggestions] = useState<College[]>([]);
  const router = useRouter();
  const [selectedProgram, setSelectedProgram] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [isStateOpen, setIsStateOpen] = useState(false)
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [selectedState, setSelectedState] = useState("");
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const [Courseresults,setCourseResults]=useState<string[]>([])
  const states = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
    "Bihar", "Chandigarh", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala",
    "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "The Dadra and Nagar Haveli and Daman and Diu", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];


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
                aisheCode: college["AISHE ID"] || "",
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
    console.log('function called')
    const found = colleges.find(
      (college) => college.name.toLowerCase() === search.toLowerCase()
    );
    if (found) {
      setSelectedColleges([found]);

      if (mapRef.current) {
        mapRef.current.setView([found.lat, found.long], 12, { animate: true });
      }
    } else {
      alert("College not found!");
    }
  };

  // Function to handle click on marker or label
  const handleMarkerClick = (college) => {
    setSelectedCollege(college)

    setShowModal(true);
  };


  const ChangeMapCenter = ({ lat, long, zoom }: { lat: number; long: number, zoom: number }) => {
    const map = useMap();
    useEffect(() => {
      map.setView([lat, long], zoom, { animate: true });
    }, [lat, long, zoom, map]);

    return null;
  };

  const [selectedCourse, setSelectedCourse] = useState("");
  const handleRateSubmit = () => {
    console.log(`Rating: ${rating} stars`);
    console.log(`Feedback: ${feedback}`);
    setShowRateModal(false);
    setRating(0);
    setFeedback("");
  };





  const handleNavigate = () => {
    console.log("Selected College:", selectedCollege);
    console.log("College Name:", selectedCollege?.aisheCode);
    if (selectedCollege?.aisheCode) {
      router.push(`/Additional?aisheCode=${encodeURIComponent(selectedCollege.aisheCode)}`);
    } else {
      alert("College name is missing!");
    }
  };




  const handleProgramSelected = async (program) => {
    setSelectedProgram(program);
    setIsProgramsOpen(false);
    const results = await fetchProgramFilteredColleges(selectedCourse, program);
    setSelectedColleges(results)
    const filteredColleges = colleges.filter(college => results.includes(college.aisheCode));
    setSelectedColleges(filteredColleges);
    console.log(filteredColleges);
  }

 

  const handleSelectedState = (state: string) => {
    setSelectedState(state);
    setIsStateOpen(false);
  };


  const handleSelectedCourse = (course) => {
    setSelectedCourse(course);
    setIsCoursesOpen(false);
    console.log("course filter selected:", course);
  };
  
  // Run fetchFilteredColleges only AFTER selectedCourse updates
  useEffect(() => {
    if (selectedCourse) {
      const fetchData = async () => {
        console.log("Fetching data for:", selectedCourse);
        const temp = await fetchFilteredColleges(selectedCourse);
        console.log("temp:", temp);
        setCourseResults(temp);
      };
      fetchData();
    }
  }, [selectedCourse]);

  const handleLocationSelected = (location: string) => {
    setSelectedLocation(location);
    setIsLocationOpen(false);
    console.log('location filter selected')
  }


  const handleFilters = () => {
    console.log('handlefilters called')
    let flag=false

    let filteredColleges = colleges; // Start from full list
  
    if (selectedCourse!=="") {
      flag=true
      console.log('Filtering by course:', selectedCourse);
      console.log(Courseresults)
      filteredColleges = filteredColleges.filter(college => Courseresults.includes(college.aisheCode));
      console.log(filteredColleges)

      
    }
    if (selectedState!=="") {
      flag=true

      console.log('Filtering by state:', selectedState);
      filteredColleges = filteredColleges.filter(college => college.state === selectedState);
      console.log(filteredColleges)
    }
    if (selectedLocation!=="") {
      flag=true

      console.log('Filtering by location:', selectedLocation);
      filteredColleges = filteredColleges.filter(college => college.location === selectedLocation);
      console.log(filteredColleges)

    }
    if(flag===true){ 
      console.log(flag)
      setSelectedColleges(filteredColleges);
    }
    else{
      console.log(flag)
      setSelectedColleges([])
      console.log(selectedColleges)
    }
  }

  useEffect(() => {
    handleFilters();
  }, [selectedState, Courseresults, selectedLocation, selectedCourse]);



  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width:"fit-content",position:"absolute", top:"10px", zIndex:"100000", backdropFilter:"blur(1px)", backgroundColor:"white",borderRadius:"20px", marginBottom: "50px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: "10px", boxShadow:"5px 5px 5px rgba(0,0,0,0.5)" }}>
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
              onSelect={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "blue" }}
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
              onClick={() => setIsCoursesOpen(!isCoursesOpen)}
              style={{
                width: "max-content",
                padding: "8px 10px",
                border: "1px solid gray",
                color: "gray",
                borderRadius: "0px 0px 0px 0px",
                borderLeft: "0px",
                borderRight: "0px",
                cursor: "pointer",
                backgroundColor: "white",
                display:"flex",
                alignItems:"center",
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
              {selectedCourse === "" ? <span>Courses </span> : (
                <div style={{display: "flex",gap:'6px', flexDirection:"row",width:"fit-content" }}>
                 
                    {selectedCourse}
                  
                  <button
                    onClick={(e) => {
                      setSelectedCourse("");
                      setIsCoursesOpen(false)
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "gray",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "blue";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "gray";
                    }}
                  >
                    <IoMdClose size={20} />
                  </button>
                </div>
              )}
            </span>
            {isCoursesOpen && (
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
                    zIndex: "10000",
                    maxHeight: "300px",
                    overflowY: "auto",
                    color: "gray",
                  }}

                >

                  {Object.entries(data).map(([course, categories]) => (
                    <li key={course} style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid gray" }}
                      onClick={() => handleSelectedCourse(course)}

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
              onClick={() => setIsProgramsOpen(!isProgramsOpen)}
              style={{
                width: "max-content",
                padding: "8px 10px",
                border: "1px solid gray",
                color: "gray",
                borderRadius: "0px 0px 0px 0px",
                borderLeft: "0px",
                borderRight: "0px",
                cursor: "pointer",
                backgroundColor: "white",
                display:"flex",
                alignItems:"center",
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
              {selectedProgram === "" ? <span>Programs </span> :<div style={{display: "flex", gap:'6px',flexDirection:"row",width:"fit-content" }}> <span>{selectedProgram}</span> <button
                onClick={() => setSelectedProgram("")}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "gray",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "blue";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "gray";
                }}
              >
                <IoMdClose size={20} />

              </button>
              </div>}
            </span>
            {isProgramsOpen && (
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
                    zIndex: "10000",
                    maxHeight: "300px",
                    overflowY: "auto",
                    color: "gray",
                  }}

                >
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
                          }}
                          onClick={() => handleProgramSelected(category)}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "blue")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "gray")}
                        >
                          {category}
                        </li>
                      ))
                    )}
                </ul>
              </div>

            )}
          </div>
          <div style={{ position: "relative", display: "inline-block" }}>
            <span
              onClick={() => setIsStateOpen(!isStateOpen)}
              style={{
                width: "max-content",
                padding: "8px 10px",
                border: "1px solid gray",
                color: "gray",
                borderRadius: "0px 0px 0px 0px",
                borderLeft: "0px",
                borderRight: "0px",
                cursor: "pointer",
                backgroundColor: "white",
                display:"flex",
                alignItems:"center",
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
              {selectedState === "" ? (
                <span>States </span>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{selectedState}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedState("");
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "gray",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "blue";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "gray";
                    }}
                  >
                    <IoMdClose size={20} />
                  </button>
                </div>
              )}
            </span>

            {isStateOpen && (
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
                    width: "200px",
                    boxShadow: "0px 5px 10px rgba(0,0,0,0.3)",
                    zIndex: "10000",
                    maxHeight: "300px",
                    overflowY: "auto",
                    color: "gray",
                  }}
                >
                  {states.map((state) => (
                    <li
                      key={state}
                      style={{
                        padding: "8px",
                        cursor: "pointer",
                        borderBottom: "1px solid gray",
                      }}
                      onClick={() => handleSelectedState(state)}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "blue";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "gray";
                      }}
                    >
                      {state}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div style={{ position: "relative", display: "inline-block" }}>
            <span
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              style={{
                width: "max-content",
                padding: "8px 10px",
                paddingRight:"25px",
                border: "1px solid gray",
                color: "gray",
                borderRadius: "0px 10px 10px 0px",
                borderLeft: "0px",
                borderRight: "1px",
                cursor: "pointer",
                backgroundColor: "white",
                display:"flex",
                alignItems:"center",
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
              {selectedLocation === "" ? <span>Location</span> : <div style={{display: "flex",gap:'6px', flexDirection:"row",width:"fit-content" }}><span>{selectedLocation}</span>
                <button
                  onClick={() => {
                    setSelectedLocation("")
                    setIsLocationOpen(false)
                  }
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "gray",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "blue";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "gray";
                  }}
                >
                  <IoMdClose size={20} />

                </button></div>}
            </span>
            {isLocationOpen && (
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
                    zIndex: "10000",
                    maxHeight: "300px",
                    overflowY: "auto",
                    color: "gray",
                  }}

                >
                  <li
                    style={{
                      padding: "8px",
                      cursor: "pointer",
                      borderBottom: "1px solid gray",
                    }}
                    onClick={() => handleLocationSelected('Rural')}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "blue")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "gray")}
                  >Rural
                  </li>
                  <li
                    style={{
                      padding: "8px",
                      cursor: "pointer",
                      borderBottom: "1px solid gray",
                    }}
                    onClick={() => handleLocationSelected('Urban')}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "blue")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "gray")}
                  >Urban
                  </li>
                </ul>
              </div>

            )}
          </div>

        </div>
        <div>
          {suggestions.length > 0 && (
            <div style={{
              boxShadow: "0px 4px 10px rgba(154, 145, 145, 0.3)", zIndex: "1000", position: "absolute", top: "119px", left: "47.6%",
              transform: "translateX(-52.5%)", width: "500px", background: "white", borderRadius: "10px", maxHeight: "200px", overflowY: "auto"
            }}>
              {suggestions.map((college) => (
                <div
                  key={college.name}
                  onClick={() => {
                    setSearch(college.name);
                    setSuggestions([]);
                  }}
                  style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #ccc", borderRadius: "10px", borderLeft: "0px", borderRight: "0px" }}
                >
                  {college.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100vw", height:"100vh", minWidth: "fit-content", padding: '0px', margin: '0px',}}>
        <MapContainer
          center={[17.70405, 83.30119]}
          zoom={5}
          style={{ width: "100vw", height:"100vh" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {Array.isArray(selectedColleges) && selectedColleges.length > 0 && selectedColleges.map((college) => (
            <React.Fragment>
              {selectedColleges.length <= 1 ?
                <ChangeMapCenter lat={college.lat} long={college.long} zoom={12} /> : <ChangeMapCenter lat={17.70405} long={83.30119} zoom={4} />}

              {/* Marker with Click Event */}
              <Marker position={[college.lat, college.long]} icon={customIcon} eventHandlers={{ click: handleMarkerClick }}>
                <Popup>{college.name}</Popup>
              </Marker>

              {/* Clickable Label */}
              <Marker
                position={[college.lat, college.long]}
                icon={L.divIcon({
                  className: "college-label",
                  html: `<div style="
          cursor: pointer;
          width: fit-content;
          height: fit-content;
          margin-top: 10px;
          background: rgba(154, 145, 145, 0.6);
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 10px; 
          font-weight: bold; 
          box-shadow: 2px 2px 5px rgba(154, 145, 145, 0.3);
        ">${college.name}</div>`,
                })}
                eventHandlers={{ click: () => handleMarkerClick(college) }}
              />
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Modal for College Info */}
        {showModal && selectedCollege && (
          <div
            style={{
              width: "650px",
              height:"800px",
              display: "flex",
              flexDirection: "column",
              position: "fixed",
              top: "10%",
              right: "1%",
              transform: "scale(0.7,0.8)",
              background: "white",
              padding: "22px",
              borderRadius: "30px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              zIndex: "1000",
              fontSize:"25px",
            }}
          >

            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "30px",
                cursor: "pointer",
              }}
            >
              <IoMdClose size={50} />

            </button>

            <h2 style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}>
              <strong>Name:</strong>
              <span style={{ marginLeft: "5px", maxWidth: "80%", wordWrap: "break-word", overflowWrap: "break-word" }}>
                {selectedCollege.name}
              </span>
            </h2>
            <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>Aishe Code:</strong> <span style={{ marginLeft: "5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.aisheCode}</span></p>
            <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>State:</strong> <span style={{ marginLeft: "5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.state}</span></p>
            <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>District:</strong> <span style={{ marginLeft: "5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.district}</span></p>
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
            <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>Year Of Establishment:</strong> <span style={{ marginLeft: "5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.yearOfEstablishment}</span></p>
            <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>Location:</strong> <span style={{ marginLeft: "5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.location}</span></p>
            <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>College Type:</strong> <span style={{ marginLeft: "5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.collegeType}</span></p>
            <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>Management:</strong> <span style={{ marginLeft: "5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.management}</span></p>
            <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>University Name:</strong> <span style={{ marginLeft: "5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.universityName}</span></p>
            <p style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline" }}><strong>University Type:</strong> <span style={{ marginLeft: "5px", maxWidth: "80%", display: "inline-block", wordWrap: "break-word" }}>{selectedCollege.universityType}</span></p>



            <div>
              <div style={{ alignItems: "baseline" }}>
                Rating:
                <span style={{ marginLeft: "5px" }}>
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
                style={{ width: "100%", height: "80px", marginTop: "10px", border: "1px solid black", borderRadius: "20px", padding: "10px" }}
              />
            </div>
            <button onClick={handleRateSubmit} style={{ cursor: "pointer", marginTop: "10px", padding: "5px 10px", border: "1px solid black", borderRadius: "10px", marginRight: "5px" }}>Submit</button>
            <button onClick={() => handleNavigate()} style={{ cursor: "pointer", marginTop: "10px", padding: "5px 10px", border: "1px solid black", borderRadius: "10px", marginRight: "5px" }}>Additional details</button>
          </div>
        )}

      </div>

    </div>
  );
};

export default Map;
