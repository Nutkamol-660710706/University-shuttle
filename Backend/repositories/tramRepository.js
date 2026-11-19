import { pool } from "../db/pool.js";

export async function findStops() {
  const { rows } = await pool.query(`
    SELECT
      stop_number AS number,
      name,
      latitude,
      longitude,
      srid
    FROM bus_stops
    ORDER BY stop_number
  `);

  return rows.map((stop) => ({
    number: stop.number,
    name: stop.name,
    position: [stop.latitude, stop.longitude],
    srid: stop.srid,
  }));
}

export async function findActiveRoutes() {
  const { rows } = await pool.query(`
    SELECT
      r.route_code AS id,
      r.name,
      r.color,
      r.geometry_geojson,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'number', s.stop_number,
            'name', s.name,
            'position', jsonb_build_array(s.latitude, s.longitude),
            'order', rs.stop_order
          )
          ORDER BY rs.stop_order
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::jsonb
      ) AS stops
    FROM routes AS r
    LEFT JOIN route_stops AS rs ON rs.route_id = r.id
    LEFT JOIN bus_stops AS s ON s.id = rs.stop_id
    WHERE r.is_active
    GROUP BY r.id
    ORDER BY r.name
  `);

  return rows.map((route) => {
    if (route.geometry_geojson?.type !== "LineString") {
      throw new Error(`Route ${route.id} has invalid GeoJSON geometry`);
    }

    return {
      id: route.id,
      name: route.name,
      color: route.color,
      path: route.geometry_geojson.coordinates.map(([longitude, latitude]) => [
        latitude,
        longitude,
      ]),
      stops: route.stops,
    };
  });
}
