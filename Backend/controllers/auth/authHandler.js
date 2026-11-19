import { AuthError } from "../../services/authErrors.js";

export function createAuthHandler(method, operation) {
  return async function handler(request, response) {
    if (request.method !== method) {
      response.setHeader("Allow", method);
      return response.status(405).json({ error: "Method not allowed" });
    }

    try {
      const result = await operation(request, response);
      return response.status(200).json(result ?? {});
    } catch (error) {
      if (error instanceof AuthError) {
        return response.status(error.status).json({ error: error.message });
      }

      console.error("Authentication request failed", {
        path: request.url,
        code: error.code,
      });
      return response.status(500).json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    }
  };
}
