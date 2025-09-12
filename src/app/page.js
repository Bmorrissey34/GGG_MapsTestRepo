import Legend from "../components/legend";

function TempLegend() {
  return (
    <div style={{
      position: "fixed",
      top: "1rem",
      left: "1rem",
      background: "magenta",
      color: "white",
      padding: "12px",
      borderRadius: "10px",
      zIndex: 2147483647   // max value
    }}>
      TEMP LEGEND
    </div>
  );
}

export default function Page() {
  return (
    <main>
      <h1>Welcome to GGC Maps</h1>
      {/* Your map code here */}
      
      {/* 👇 This adds the legend box */}
      <TempLegend />
    </main>
  );
}
