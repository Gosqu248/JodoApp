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