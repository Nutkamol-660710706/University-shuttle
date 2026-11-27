import { findActiveTramTrips } from "../repositories/driverRepository.js";
import { findActiveRoutes, findStops } from "../repositories/tramRepository.js";

export async function getStops(_request, response, next) {
  try {
    response.json(await findStops());
  } catch (error) {
    next(error);
  }
}

export async function getRoutes(_request, response, next) {
  try {
    response.json(await findActiveRoutes());
  } catch (error) {
    next(error);
  }
}

export async function getActiveTramTrips(_request, response, next) {
  try {
    response.json(await findActiveTramTrips());
  } catch (error) {
    next(error);
  }
}
