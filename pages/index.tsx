import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("../components/map"), { ssr: false });


export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection:"column", justifyContent: "center", alignItems: "center"}}>
      <h1 style={{fontSize:"30px", marginBottom:"20px"}}>Collegevita</h1>
      <DynamicMap />
    </div>
  );
}
