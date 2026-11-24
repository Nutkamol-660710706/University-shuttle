import { createGetHandler } from "../Backend/controllers/vercelHandler.js";
import { findWaitingStopCounts } from "../Backend/repositories/waitingStopRepository.js";

export default createGetHandler(findWaitingStopCounts);
