import { createGetHandler } from "../Backend/controllers/vercelHandler.js";
import { findStops } from "../Backend/repositories/tramRepository.js";

export default createGetHandler(findStops);
