"use client";

export default function Home() {
  return (
    <body>
      <div
        style={{
          backgroundImage: "url('/images/map_blured.png')",
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="lightbox">
          <h1>404</h1>
          <p>Page Not Found - עמוד לא נמצא </p>
        </div>
      </div>
      <style>{`
    body {
      margin: 0;
      background: black;
    }
    .lightbox {
      color: black;
      background: rgba(255, 255, 255, 0.95);
      padding: 50px;
      text-align: center;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }
  .lightbox h1 {
      font-size: 200px;
      margin: 0;
  }
  .lightbox p {
      font-size: 30px;
      margin: 10px 0 0;
  }
    `}</style>
    </body>
  );
}
