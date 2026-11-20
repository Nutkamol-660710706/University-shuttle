import { userLocationHandlers } from "../../Backend/controllers/userLocationHandlers.js";

const handlers = {
  GET: userLocationHandlers.get,
  PUT: userLocationHandlers.update,
  DELETE: userLocationHandlers.remove,
};

export default function handleUserLocation(request, response) {
  const handler = handlers[request.method];
  if (!handler) {
    response.setHeader("Allow", "GET, PUT, DELETE");
    return response.status(405).json({ error: "Method not allowed" });
  }
  return handler(request, response);
}
