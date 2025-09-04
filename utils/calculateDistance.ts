/**
 * Calculates the distance between two geographical coordinates using the Haversine formula.
 * @param lat1 - Latitude of the first point.
 * @param lon1 - Longitude of the first point.
 * @param lat2 - Latitude of the second point.
 * @param lon2 - Longitude of the second point.
 * @returns The distance between the two points in meters.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const del1 = (lat2 - lat1) * Math.PI / 180;
    const del2 = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(del1 / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(del2 / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
