import buildings from '../data/buildings.json';

/**
 * Get all buildings.
 * @returns {Array} List of all buildings.
 */
export function getAllBuildings() {
  return buildings;
}

/**
 * Get a building by its ID.
 * @param {string} id - The ID of the building.
 * @returns {Object|null} The building object or null if not found.
 */
export function getBuildingById(id) {
  return buildings.find((building) => building.id === id) || null;
}

/**
 * Generate static parameters for all buildings and floors.
 * @returns {Array} List of static parameters for Next.js.
 */
export function generateBuildingFloorStaticParams() {
  const params = [];
  for (const b of buildings) {
    for (const f of b.floors) {
      params.push({ buildingId: b.id, floorId: f.id });
    }
  }
  console.log("Generated static params:", params); // Debugging log
  return params;
}