import "dotenv/config";

export const config = {
  apiHost: process.env.API_HOST || "127.0.0.1",
  apiPort: Number(process.env.API_PORT || 3001),
};

if (!Number.isInteger(config.apiPort) || config.apiPort < 1 || config.apiPort > 65535) {
  throw new Error("API_PORT must be a valid port number");
}
