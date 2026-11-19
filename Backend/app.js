import express from "express";
import healthRoutes from "./routes/healthRoutes.js";
import tramRoutes from "./routes/tramRoutes.js";

const app = express();

app.use("/api", healthRoutes);
app.use("/api", tramRoutes);
app.use("/api", (_request, response) => {
  response.status(404).json({ error: "API endpoint not found" });
});

app.use((error, request, response, _next) => {
  console.error("API request failed", {
    method: request.method,
    path: request.path,
    error: error.message,
  });
  response.status(500).json({ error: "Unable to load campus tram data" });
});

export default app;
