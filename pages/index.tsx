import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("../components/map"), { ssr: false });

// const DynamicMap = dynamic(() => import("../components/programmes_finder"), { ssr: false });

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection:"column", justifyContent: "center", alignItems: "center"}}>
      {/* <h1 style={{position:"absolute", top:"20px", right:"20px", zIndex:"100000", padding:"0px 20px",borderRadius:"20px", fontSize:"30px", marginBottom:"20px", 
      backgroundColor:"white"}}>Made by Sreenesh Reddy</h1> */}
      <DynamicMap />
    </div>
  );
}
