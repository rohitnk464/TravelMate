const axios = require('axios');

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'TravelMate/1.0'; // Required by Nominatim usage policy

class NominatimService {
    constructor() {
        this.cache = new Map();
        this.lastRequestTime = 0;
        this.MIN_REQUEST_INTERVAL = 1000; // 1 second between requests (Nominatim policy)
    }

    /**
     * Rate limiting to respect Nominatim's 1 request/second policy
     */
    async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
    }

    /**
     * Geocode a city name to coordinates
     * @param {string} cityName - Name of the city to geocode
     * @returns {Promise<{lat: number, lon: number, display_name: string}>}
     */
    async geocode(cityName) {
        try {
            // Check cache first
            const cacheKey = `geocode:${cityName.toLowerCase()}`;
            if (this.cache.has(cacheKey)) {
                console.log(`📍 Nominatim cache hit for: ${cityName}`);
                return this.cache.get(cacheKey);
            }

            // Rate limiting
            await this.waitForRateLimit();

            console.log(`📍 Geocoding "${cityName}" via Nominatim...`);

            const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
                params: {
                    q: cityName,
                    format: 'json',
                    limit: 1,
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': USER_AGENT
                },
                timeout: 10000
            });

            if (!response.data || response.data.length === 0) {
                throw new Error(`Location "${cityName}" not found`);
            }

            const result = {
                lat: parseFloat(response.data[0].lat),
                lon: parseFloat(response.data[0].lon),
                display_name: response.data[0].display_name
            };

            // Cache for 1 hour
            this.cache.set(cacheKey, result);
            setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);

            console.log(`✅ Geocoded: ${result.display_name}`);
            return result;

        } catch (error) {
            console.error('Nominatim Geocoding Error:', error.message);
            throw new Error(`Failed to geocode "${cityName}": ${error.message}`);
        }
    }

    /**
     * Reverse geocode coordinates to address
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<{address: object, display_name: string}>}
     */
    async reverseGeocode(lat, lon) {
        try {
            // Check cache first
            const cacheKey = `reverse:${lat},${lon}`;
            if (this.cache.has(cacheKey)) {
                console.log(`📍 Nominatim reverse cache hit for: ${lat},${lon}`);
                return this.cache.get(cacheKey);
            }

            // Rate limiting
            await this.waitForRateLimit();

            console.log(`📍 Reverse geocoding ${lat},${lon} via Nominatim...`);

            const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
                params: {
                    lat,
                    lon,
                    format: 'json',
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': USER_AGENT
                },
                timeout: 10000
            });

            if (!response.data) {
                throw new Error('No address found for coordinates');
            }

            const result = {
                address: response.data.address,
                display_name: response.data.display_name
            };

            // Cache for 1 hour
            this.cache.set(cacheKey, result);
            setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);

            console.log(`✅ Reverse geocoded: ${result.display_name}`);
            return result;

        } catch (error) {
            console.error('Nominatim Reverse Geocoding Error:', error.message);
            throw new Error(`Failed to reverse geocode: ${error.message}`);
        }
    }
}

module.exports = new NominatimService();
