import { waitingStopHandlers } from "../../Backend/controllers/waitingStopHandlers.js";

const handlers = {
  GET: waitingStopHandlers.get,
  PUT: waitingStopHandlers.update,
  DELETE: waitingStopHandlers.remove,
};

export default function handleMyWaitingStop(request, response) {
  const handler = handlers[request.method];
  if (!handler) {
    response.setHeader("Allow", "GET, PUT, DELETE");
    return response.status(405).json({ error: "Method not allowed" });
  }
  return handler(request, response);
}
