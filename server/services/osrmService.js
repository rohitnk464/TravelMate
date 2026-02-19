const axios = require('axios');

const OSRM_BASE_URL = 'https://router.project-osrm.org';

class OSRMService {
    /**
     * Get optimized route between multiple points
     * @param {Array<Array<number>>} coordinates - Array of [lon, lat] pairs
     * @returns {Promise<{distance: number, duration: number, geometry: object}>}
     */
    async getRoute(coordinates) {
        try {
            if (!coordinates || coordinates.length < 2) {
                throw new Error('At least 2 coordinates required for routing');
            }

            // Format coordinates for OSRM: lon,lat;lon,lat;...
            const coordString = coordinates
                .map(coord => `${coord[0]},${coord[1]}`)
                .join(';');

            console.log(`🛣️  Calculating route for ${coordinates.length} points via OSRM...`);

            const url = `${OSRM_BASE_URL}/route/v1/driving/${coordString}`;

            const response = await axios.get(url, {
                params: {
                    overview: 'full',
                    geometries: 'geojson',
                    steps: 'false'
                },
                timeout: 15000
            });

            if (!response.data || response.data.code !== 'Ok') {
                throw new Error(response.data?.message || 'Route calculation failed');
            }

            const route = response.data.routes[0];

            const result = {
                distance: route.distance, // meters
                duration: route.duration, // seconds
                geometry: route.geometry, // GeoJSON LineString
                legs: route.legs.map(leg => ({
                    distance: leg.distance,
                    duration: leg.duration
                }))
            };

            console.log(`✅ Route calculated: ${(result.distance / 1000).toFixed(2)} km, ${(result.duration / 60).toFixed(0)} min`);
            return result;

        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.error('OSRM timeout - route calculation took too long');
                throw new Error('Route calculation timeout');
            }
            console.error('OSRM Routing Error:', error.message);
            throw new Error(`Failed to calculate route: ${error.message}`);
        }
    }

    /**
     * Get route with trip optimization (traveling salesman problem)
     * Useful for multi-stop itineraries
     * @param {Array<Array<number>>} coordinates - Array of [lon, lat] pairs
     * @param {string} source - 'first' or 'any' (default: 'first')
     * @param {string} destination - 'last' or 'any' (default: 'last')
     * @returns {Promise<{distance: number, duration: number, geometry: object, waypoints: Array}>}
     */
    async getOptimizedTrip(coordinates, source = 'first', destination = 'last') {
        try {
            if (!coordinates || coordinates.length < 2) {
                throw new Error('At least 2 coordinates required for trip optimization');
            }

            const coordString = coordinates
                .map(coord => `${coord[0]},${coord[1]}`)
                .join(';');

            console.log(`🛣️  Optimizing trip for ${coordinates.length} points via OSRM...`);

            const url = `${OSRM_BASE_URL}/trip/v1/driving/${coordString}`;

            const response = await axios.get(url, {
                params: {
                    overview: 'full',
                    geometries: 'geojson',
                    source: source,
                    destination: destination,
                    roundtrip: 'false'
                },
                timeout: 15000
            });

            if (!response.data || response.data.code !== 'Ok') {
                throw new Error(response.data?.message || 'Trip optimization failed');
            }

            const trip = response.data.trips[0];

            const result = {
                distance: trip.distance,
                duration: trip.duration,
                geometry: trip.geometry,
                waypoints: response.data.waypoints.map(wp => ({
                    location: wp.location,
                    waypoint_index: wp.waypoint_index,
                    trips_index: wp.trips_index
                }))
            };

            console.log(`✅ Trip optimized: ${(result.distance / 1000).toFixed(2)} km, ${(result.duration / 60).toFixed(0)} min`);
            return result;

        } catch (error) {
            console.error('OSRM Trip Optimization Error:', error.message);
            // Fallback to regular route if trip optimization fails
            console.log('⚠️  Falling back to regular route...');
            return this.getRoute(coordinates);
        }
    }

    /**
     * Get distance matrix between multiple points
     * @param {Array<Array<number>>} coordinates - Array of [lon, lat] pairs
     * @returns {Promise<{distances: Array<Array<number>>, durations: Array<Array<number>>}>}
     */
    async getDistanceMatrix(coordinates) {
        try {
            if (!coordinates || coordinates.length < 2) {
                throw new Error('At least 2 coordinates required for distance matrix');
            }

            const coordString = coordinates
                .map(coord => `${coord[0]},${coord[1]}`)
                .join(';');

            console.log(`🛣️  Calculating distance matrix for ${coordinates.length} points...`);

            const url = `${OSRM_BASE_URL}/table/v1/driving/${coordString}`;

            const response = await axios.get(url, {
                timeout: 15000
            });

            if (!response.data || response.data.code !== 'Ok') {
                throw new Error(response.data?.message || 'Distance matrix calculation failed');
            }

            return {
                distances: response.data.distances, // 2D array in meters
                durations: response.data.durations  // 2D array in seconds
            };

        } catch (error) {
            console.error('OSRM Distance Matrix Error:', error.message);
            throw new Error(`Failed to calculate distance matrix: ${error.message}`);
        }
    }
}

module.exports = new OSRMService();
