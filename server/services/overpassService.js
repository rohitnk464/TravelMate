const axios = require('axios');

const OVERPASS_BASE_URL = 'https://overpass-api.de/api/interpreter';
const TIMEOUT = 25000; // 25 seconds (Overpass can be slow)

class OverpassService {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Map common place types to OSM tags
     */
    getOSMTags(type) {
        const tagMap = {
            'restaurant': { amenity: 'restaurant' },
            'cafe': { amenity: 'cafe' },
            'attraction': { tourism: 'attraction' },
            'police': { amenity: 'police' },
            'hospital': { amenity: 'hospital' },
            'park': { leisure: 'park' },
            'museum': { tourism: 'museum' },
            'viewpoint': { tourism: 'viewpoint' },
            'hotel': { tourism: 'hotel' },
            'bar': { amenity: 'bar' },
            'nightclub': { amenity: 'nightclub' }
        };

        return tagMap[type] || { amenity: type };
    }

    /**
     * Build Overpass QL query
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {string} type - Place type
     * @param {number} radius - Search radius in meters
     * @returns {string} Overpass QL query
     */
    buildQuery(lat, lon, type, radius = 5000) {
        const tags = this.getOSMTags(type);
        const tagKey = Object.keys(tags)[0];
        const tagValue = tags[tagKey];

        // Build Overpass QL query - search for nodes, ways, and relations
        // using 'out center' to get coordinates for polygons/relations
        const query = `
[out:json][timeout:25];
(
  node["${tagKey}"="${tagValue}"](around:${radius},${lat},${lon});
  way["${tagKey}"="${tagValue}"](around:${radius},${lat},${lon});
  relation["${tagKey}"="${tagValue}"](around:${radius},${lat},${lon});
);
out center 20;
        `.trim();

        return query;
    }

    /**
     * Search for places near coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {string} type - Place type (restaurant, cafe, attraction, etc.)
     * @param {number} radius - Search radius in meters (default: 5000)
     * @returns {Promise<Array>} Array of places
     */
    async searchPlaces(lat, lon, type, radius = 5000) {
        try {
            // Check cache first
            const cacheKey = `${type}:${lat},${lon}:${radius}`;
            if (this.cache.has(cacheKey)) {
                console.log(`🗺️  Overpass cache hit for: ${type} near ${lat},${lon}`);
                return this.cache.get(cacheKey);
            }

            console.log(`🗺️  Searching for ${type} via Overpass API...`);

            const query = this.buildQuery(lat, lon, type, radius);

            const response = await axios.post(
                OVERPASS_BASE_URL,
                query,
                {
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    timeout: TIMEOUT
                }
            );

            if (!response.data || !response.data.elements) {
                console.log(`⚠️  No results from Overpass for ${type}`);
                return [];
            }

            // Transform Overpass data to our format
            const places = response.data.elements
                .map(element => {
                    // Get coordinates (handle both nodes and ways)
                    const elementLat = element.lat || element.center?.lat;
                    const elementLon = element.lon || element.center?.lon;

                    if (!elementLat || !elementLon) return null;

                    return {
                        id: element.id,
                        name: element.tags?.name || `Unnamed ${type}`,
                        lat: elementLat,
                        lon: elementLon,
                        type: type,
                        tags: element.tags || {},
                        // Extract useful metadata
                        cuisine: element.tags?.cuisine,
                        opening_hours: element.tags?.opening_hours,
                        phone: element.tags?.phone,
                        website: element.tags?.website,
                        wheelchair: element.tags?.wheelchair
                    };
                })
                .filter(place => place !== null)
                .slice(0, 10); // Limit to 10 results

            // Cache for 30 minutes
            this.cache.set(cacheKey, places);
            setTimeout(() => this.cache.delete(cacheKey), 30 * 60 * 1000);

            console.log(`✅ Found ${places.length} ${type}(s) via Overpass`);
            return places;

        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.error('Overpass API timeout - server may be overloaded');
                throw new Error('Search timeout - please try again');
            }
            console.error('Overpass API Error:', error.message);
            throw new Error(`Failed to search for ${type}: ${error.message}`);
        }
    }

    /**
     * Search multiple place types at once
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {Array<string>} types - Array of place types
     * @param {number} radius - Search radius in meters
     * @returns {Promise<Object>} Object with results grouped by type
     */
    async searchMultipleTypes(lat, lon, types, radius = 5000) {
        try {
            console.log(`🗺️  Searching for multiple types: ${types.join(', ')}`);

            const results = {};

            // Search sequentially to avoid overwhelming Overpass API
            for (const type of types) {
                try {
                    results[type] = await this.searchPlaces(lat, lon, type, radius);
                    // Small delay between requests
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error(`Failed to fetch ${type}:`, error.message);
                    results[type] = [];
                }
            }

            return results;

        } catch (error) {
            console.error('Overpass Multiple Search Error:', error.message);
            throw error;
        }
    }
}

module.exports = new OverpassService();
