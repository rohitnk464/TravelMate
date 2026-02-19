const axios = require('axios');

// Placeholder for AI Service
// In production, this would call OpenAI or Gemini API
const generateResponse = async (prompt, context = {}) => {
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // console.log(`[AI Service] Generating response for: "${prompt}"`);

    const lowerPrompt = prompt.toLowerCase().trim();
    // console.log(`[AI Service] Processing: "${lowerPrompt}"`);

    // 1. TRIP PLANNING INTENT
    if (lowerPrompt.includes('plan') || lowerPrompt.includes('plann') || lowerPrompt.includes('itinerary') || lowerPrompt.includes('trip')) {
        const city = context.location || "Tokyo";

        if (city.toLowerCase().includes("bangalore") || city.toLowerCase().includes("bengaluru")) {
            return {
                message: `I've created a 3-stop itinerary for you in **${city}**:
1. **Bangalore Palace** (Heritage)
2. **Commercial Street** (Shopping & Lunch)
3. **Lalbagh Botanical Garden** (Nature)

I've marked these on your map! 🗺️`,
                locations: [
                    { id: "p1", name: "Bangalore Palace", lat: 12.9988, lng: 77.5921, type: "attraction" },
                    { id: "p2", name: "Commercial Street", lat: 12.9822, lng: 77.6083, type: "food" },
                    { id: "p3", name: "Lalbagh Garden", lat: 12.9507, lng: 77.5848, type: "attraction" }
                ]
            };
        }

        // Default to Tokyo if loc not matched (Mock)
        return {
            message: `I've created a 3-stop itinerary for you in **${city}** based on popular spots:
1. **Senso-ji Temple** (Sightseeing)
2. **Tsukiji Outer Market** (Lunch)
3. **Tokyo Skytree** (Observation)

I've marked these on your map! 🗺️`,
            locations: [
                { id: "p1", name: "Senso-ji Temple", lat: 35.7147, lng: 139.7967, type: "attraction" },
                { id: "p2", name: "Tsukiji Outer Market", lat: 35.6655, lng: 139.7704, type: "food" },
                { id: "p3", name: "Tokyo Skytree", lat: 35.7100, lng: 139.8107, type: "attraction" }
            ]
        };
    }

    // 2. FOOD & DINING INTENT
    if (lowerPrompt.includes('food') || lowerPrompt.includes('eat') || lowerPrompt.includes('restaurant') || lowerPrompt.includes('dinner')) {
        const city = context.location || "Tokyo";

        if (city.toLowerCase().includes("bangalore") || city.toLowerCase().includes("bengaluru")) {
            if (context.safetyMode) {
                return {
                    message: `I've found 3 **Safe & Verified** dining options in **${city}**:
1. **Sunny's** (Lavelle Road - Verified Safe)
2. **Ebony** (MG Road - Secure)
3. **Truffles** (St. Marks Road - Popular)

These areas are well-lit and have high safety ratings. 🛡️`,
                    locations: [
                        { id: "f1", name: "Sunny's", lat: 12.9719, lng: 77.5993, type: "safety" },
                        { id: "f2", name: "Ebony", lat: 12.9745, lng: 77.6074, type: "safety" },
                        { id: "f3", name: "Truffles", lat: 12.9715, lng: 77.6009, type: "food" }
                    ]
                };
            }
            return {
                message: `Here are top-rated dining spots in **${city}**:
1. **MTR (Mavalli Tiffin Room)** (Legendary South Indian)
2. **Toit** (Indiranagar - Brewery/Food)
3. **Nagarjuna** (Andhra Style)

Check the map for directions! 🍜`,
                locations: [
                    { id: "f1", name: "MTR", lat: 12.9507, lng: 77.5848, type: "food" },
                    { id: "f2", name: "Toit", lat: 12.9793, lng: 77.6406, type: "food" },
                    { id: "f3", name: "Nagarjuna", lat: 12.9737, lng: 77.6105, type: "food" }
                ]
            };
        }

        // Default Tokyo fallback
        if (context.safetyMode) {
            return {
                message: `I've found 3 **Safe & Verified** dining options for you:
1. **Safe Haven Cafe** (Verified Safe)
2. **Hotel Grand Dining** (Secure)
3. **Family Bistro** (Popular)

These areas are well-lit and have high safety ratings. 🛡️`,
                locations: [
                    { id: "f1", name: "Safe Haven Cafe", lat: 35.6620, lng: 139.7020, type: "safety" },
                    { id: "f2", name: "Hotel Grand Dining", lat: 35.6600, lng: 139.7080, type: "safety" },
                    { id: "f3", name: "Family Bistro", lat: 35.6590, lng: 139.7010, type: "food" }
                ]
            };
        }
        return {
            message: `Here are top-rated dining spots near your location:
1. **Sushi Dai** (Sushi, 4.8⭐)
2. **Afuri Ramen** (Ramen, 4.6⭐)
3. **Narisawa** (Fine Dining, 4.9⭐)

Check the map for directions! 🍜`,
            locations: [
                { id: "f1", name: "Sushi Dai", lat: 35.6640, lng: 139.7050, type: "food" },
                { id: "f2", name: "Afuri Ramen", lat: 35.6465, lng: 139.7100, type: "food" },
                { id: "f3", name: "Narisawa", lat: 35.6680, lng: 139.7200, type: "food" }
            ]
        };
    }

    // 3. SAFETY & EMERGENCY INTENT
    if (lowerPrompt.includes('safe') || lowerPrompt.includes('help') || lowerPrompt.includes('police') || lowerPrompt.includes('emergency')) {
        return {
            message: `🚨 **SAFETY ALERT**: I've marked the nearest help points:
1. **Shibuya Police Station** (0.5km)
2. **Hikarie Safe Zone** (Secure Complex)

Please head to the nearest green marker if you feel unsafe.`,
            locations: [
                { id: "s1", name: "Shibuya Police Station", lat: 35.6580, lng: 139.7017, type: "safety" },
                { id: "s2", name: "Hikarie Safe Zone", lat: 35.6590, lng: 139.7035, type: "safety" }
            ]
        };
    }

    // 4. DISCOVERY / PLACES INTENT
    if (lowerPrompt.includes('visit') || lowerPrompt.includes('place') || lowerPrompt.includes('go') || lowerPrompt.includes('see')) {
        return {
            message: `I recommend these trending spots for you:
1. **Tokyo Tower** (Iconic Views)
2. **Meiji Shrine** (Culture & Nature)

Added to your map! 📍`,
            locations: [
                { id: "d1", name: "Tokyo Tower", lat: 35.6586, lng: 139.7454, type: "attraction" },
                { id: "d2", name: "Meiji Shrine", lat: 35.6764, lng: 139.6993, type: "attraction" }
            ]
        };
    }

    // DEFAULT CHAT INTENT
    return {
        message: "I can help you plan a trip, find food, or ensure your safety. Try asking 'Plan my day' or 'Find restaurants'.",
        locations: []
    };
};

module.exports = { generateResponse };
