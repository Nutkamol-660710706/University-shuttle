import { createGetHandler } from "../Backend/controllers/vercelHandler.js";
import { findActiveRoutes } from "../Backend/repositories/tramRepository.js";

export default createGetHandler(findActiveRoutes);
