import { createGetHandler } from "../../Backend/controllers/vercelHandler.js";
import { findActiveTramTrips } from "../../Backend/repositories/driverRepository.js";

export default createGetHandler(findActiveTramTrips);
