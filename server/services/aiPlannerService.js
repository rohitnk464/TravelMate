const { GoogleGenerativeAI } = require("@google/generative-ai");
const nominatimService = require("./nominatimService");
const overpassService = require("./overpassService");
const osrmService = require("./osrmService");

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

class AIPlannerService {
    /**
     * Detect intent from user query
     * @param {string} query - User's message
     * @returns {Array<string>} Array of place types to search
     */
    detectIntent(query) {
        const lowerQuery = query.toLowerCase();
        const types = [];

        // Food-related
        if (lowerQuery.match(/food|eat|restaurant|dining|lunch|dinner|breakfast/)) {
            types.push('restaurant');
        }
        if (lowerQuery.match(/cafe|coffee|tea/)) {
            types.push('cafe');
        }

        // Safety-related
        if (lowerQuery.match(/safe|safety|secure|police|emergency/)) {
            types.push('police', 'hospital');
        }

        // Attractions
        if (lowerQuery.match(/plan|day|itinerary|visit|tour|sightseeing|tourist|attraction/)) {
            types.push('attraction', 'museum', 'viewpoint');
            if (!types.includes('restaurant')) {
                types.push('restaurant'); // Add food for full-day plans
            }
        }

        // Romantic/scenic
        if (lowerQuery.match(/romantic|date|scenic|view|park|nature/)) {
            types.push('park', 'viewpoint');
        }

        // Default: if no specific intent, show attractions
        if (types.length === 0) {
            types.push('attraction', 'restaurant');
        }

        return [...new Set(types)]; // Remove duplicates
    }

    async generateItinerary(query, locationName, safetyMode = false, providedCoordinates = null) {
        try {
            console.log(`\n🎯 Generating itinerary for: "${query}" in ${locationName}`);
            console.log(`🛡️  Safety Mode: ${safetyMode ? 'ON' : 'OFF'}`);

            let lat, lon, displayName;

            // Server-side known coordinates fallback (belt-and-suspenders safety net)
            const KNOWN_COORDINATES = {
                'goa': { lat: 15.2993, lon: 74.1240 },
                'goa beach': { lat: 15.2993, lon: 74.1240 },
                'bangalore': { lat: 12.9716, lon: 77.5946 },
                'bengaluru': { lat: 12.9716, lon: 77.5946 },
                'delhi': { lat: 28.6139, lon: 77.2090 },
                'mumbai': { lat: 19.0760, lon: 72.8777 },
                'jaipur': { lat: 26.9124, lon: 75.7873 }
            };

            // 1. Use provided coordinates if available
            if (providedCoordinates && providedCoordinates.lat && providedCoordinates.lon) {
                console.log(`📍 Using provided coordinates: ${providedCoordinates.lat}, ${providedCoordinates.lon}`);
                lat = providedCoordinates.lat;
                lon = providedCoordinates.lon;
                displayName = locationName;
            } else {
                // 2. Check server-side known coordinates
                const locationLower = locationName.toLowerCase().trim();
                const knownKey = Object.keys(KNOWN_COORDINATES).find(k =>
                    locationLower.includes(k) || k.includes(locationLower)
                );

                if (knownKey) {
                    console.log(`📍 Using known coordinates for "${locationName}" -> ${knownKey}`);
                    lat = KNOWN_COORDINATES[knownKey].lat;
                    lon = KNOWN_COORDINATES[knownKey].lon;
                    displayName = locationName;
                } else {
                    // 3. Geocode the location using Nominatim (FREE) - last resort
                    console.log(`📍 Geocoding "${locationName}" via Nominatim...`);
                    const location = await nominatimService.geocode(locationName);
                    if (!location) throw new Error(`Could not find location: ${locationName}`);
                    lat = location.lat;
                    lon = location.lon;
                    displayName = location.display_name;
                }
            }

            // 2. Detect intent and determine what types of places to search
            const placeTypes = this.detectIntent(query);
            console.log(`🔍 Detected intent: ${placeTypes.join(', ')}`);

            // 3. Add safety infrastructure if safety mode is enabled
            if (safetyMode && !placeTypes.includes('police')) {
                placeTypes.push('police', 'hospital');
            }

            // 4. Search for places using Overpass API (FREE)
            const placesResults = await overpassService.searchMultipleTypes(
                lat,
                lon,
                placeTypes,
                5000 // 5km radius
            );

            // 5. Combine and filter results
            let allPlaces = [];
            for (const [type, places] of Object.entries(placesResults)) {
                allPlaces.push(...places.map(p => ({ ...p, type })));
            }

            // Safety Mode Filtering
            if (safetyMode) {
                // Filter out nightlife
                allPlaces = allPlaces.filter(p =>
                    p.type !== 'bar' && p.type !== 'nightclub'
                );

                // Prioritize places with names (more established)
                allPlaces = allPlaces.filter(p =>
                    p.name && !p.name.startsWith('Unnamed')
                );
            }

            console.log(`📍 Found ${allPlaces.length} total places`);

            // 6. If we have no places, return mock data
            if (allPlaces.length === 0) {
                console.log('⚠️  No places found - returning mock data');
                return this.getMockItinerary(query, locationName, safetyMode);
            }

            // 7. Generate AI itinerary (if Gemini is available)
            let timeline;
            if (genAI) {
                timeline = await this.generateAIItinerary(allPlaces, locationName, safetyMode, query);
            } else {
                // Fallback: create simple timeline from places
                timeline = this.createSimpleTimeline(allPlaces, safetyMode);
            }

            // 8. Calculate route using OSRM (FREE)
            let routeGeometry = null;
            if (timeline.length >= 2) {
                try {
                    const coordinates = timeline.map(stop => [stop.lon, stop.lat]);
                    const route = await osrmService.getRoute(coordinates);
                    routeGeometry = route.geometry; // GeoJSON format
                    console.log(`🛣️  Route: ${(route.distance / 1000).toFixed(2)} km, ${(route.duration / 60).toFixed(0)} min`);
                } catch (error) {
                    console.error('Route calculation failed:', error.message);
                }
            }

            // 9. Return structured response
            return {
                summary: this.generateSummary(timeline, locationName, safetyMode),
                timeline,
                routeGeometry, // GeoJSON instead of encoded polyline
                location: { lat, lon, display_name: displayName || locationName }
            };

        } catch (error) {
            console.error('AI Planner Error:', error.message);
            // Fallback to mock data on error
            return this.getMockItinerary(query, locationName, safetyMode);
        }
    }

    /**
     * Generate AI-powered itinerary using Gemini
     */
    async generateAIItinerary(places, locationName, safetyMode, query) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompt = `You are a professional travel planner.

Given these real places in ${locationName}:
${JSON.stringify(places.slice(0, 15), null, 2)}

User query: "${query}"
Safety Mode: ${safetyMode ? 'ON (prioritize safety, avoid isolated areas)' : 'OFF'}

Create a structured 1-day itinerary. Return ONLY valid JSON in this exact format:
{
  "timeline": [
    {
      "time": "09:00 AM",
      "title": "Place Name",
      "description": "Brief description",
      "lat": 0.0,
      "lon": 0.0,
      "type": "attraction",
      "safetyScore": 8.5
    }
  ]
}

Rules:
- Use ONLY places from the provided list
- Logical time ordering (morning to evening)
- Alternate attractions and food
- 4-6 stops maximum
- Realistic pacing (1-2 hours per stop)
- Safety scores: 9-10 (very safe), 7-8 (safe), <7 (caution)
- Return ONLY the JSON, no markdown, no explanations`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in AI response');
            }

            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.timeline || [];

        } catch (error) {
            console.error('AI Generation Error:', error.message);
            // Fallback to simple timeline
            return this.createSimpleTimeline(places, safetyMode);
        }
    }

    /**
     * Create simple timeline without AI
     */
    createSimpleTimeline(places, safetyMode) {
        const timeline = [];
        const times = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];

        // Separate by type
        const attractions = places.filter(p => ['attraction', 'museum', 'viewpoint', 'park'].includes(p.type));
        const restaurants = places.filter(p => ['restaurant', 'cafe'].includes(p.type));

        // Alternate attractions and food
        let timeIndex = 0;
        for (let i = 0; i < Math.min(5, attractions.length + restaurants.length); i++) {
            const isFood = i % 2 === 1;
            const source = isFood ? restaurants : attractions;

            if (source.length > Math.floor(i / 2)) {
                const place = source[Math.floor(i / 2)];
                timeline.push({
                    time: times[timeIndex++],
                    title: place.name,
                    description: `Visit ${place.name}${place.cuisine ? ` - ${place.cuisine} cuisine` : ''}`,
                    lat: place.lat,
                    lon: place.lon,
                    type: place.type,
                    safetyScore: safetyMode ? 9.0 : 8.5
                });
            }
        }

        return timeline;
    }

    /**
     * Generate summary message
     */
    generateSummary(timeline, locationName, safetyMode) {
        const safetyBadge = safetyMode ? '🛡️ **Guardian Mode Active** - ' : '';
        return `${safetyBadge}Here's your personalized itinerary for ${locationName} with ${timeline.length} stops. All data from OpenStreetMap. 🗺️`;
    }

    /**
     * Mock itinerary for demo/fallback
     */
    getMockItinerary(query, locationName, safetyMode) {
        const mockTimeline = [
            {
                time: "09:00 AM",
                title: `Welcome to ${locationName}!`,
                description: `Start your day exploring ${locationName}. (Demo data - real places will appear when services are available)`,
                type: "attraction",
                lat: 15.2993,
                lng: 74.1240,
                lon: 74.1240,
                place_id: "mock_1",
                safetyScore: safetyMode ? 9.5 : 8.5
            },
            {
                time: "12:00 PM",
                title: "Local Cuisine Experience",
                description: "Enjoy authentic local dishes at a highly-rated restaurant. (Mock data)",
                type: "restaurant",
                lat: 15.3000,
                lng: 74.1250,
                lon: 74.1250,
                place_id: "mock_2",
                safetyScore: safetyMode ? 9.0 : 8.8
            },
            {
                time: "03:00 PM",
                title: "Cultural Landmark Visit",
                description: "Explore the rich history and architecture. (Mock data)",
                type: "attraction",
                lat: 15.3020,
                lng: 74.1260,
                lon: 74.1260,
                place_id: "mock_3",
                safetyScore: safetyMode ? 8.8 : 8.5
            },
            {
                time: "06:00 PM",
                title: "Sunset Viewpoint",
                description: "End your day with breathtaking views. (Mock data)",
                type: "viewpoint",
                lat: 15.3040,
                lng: 74.1280,
                lon: 74.1280,
                place_id: "mock_4",
                safetyScore: safetyMode ? 9.2 : 8.7
            }
        ];

        const safetyNote = safetyMode ? '🛡️ **Guardian Mode Active** - ' : '';
        return {
            summary: `${safetyNote}🎭 **Demo Mode** - Here's a sample itinerary for ${locationName}. Real places will appear when OpenStreetMap services are available.`,
            timeline: mockTimeline,
            routeGeometry: null
        };
    }
}

module.exports = new AIPlannerService();
