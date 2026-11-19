export function createGetHandler(loadData) {
  return async function handler(request, response) {
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      return response.status(405).json({ error: "Method not allowed" });
    }

    try {
      return response.status(200).json(await loadData());
    } catch (error) {
      console.error("API request failed", {
        path: request.url,
        code: error.code,
      });
      return response
        .status(500)
        .json({ error: "Unable to load campus tram data" });
    }
  };
}
