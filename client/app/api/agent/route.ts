import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// City coordinates map (subset of popular cities)
const CITY_COORDS: Record<string, [number, number]> = {
  "bangalore": [12.9716, 77.5946],
  "bengaluru": [12.9716, 77.5946],
  "mumbai": [19.0760, 72.8777],
  "delhi": [28.7041, 77.1025],
  "goa": [15.2993, 74.1240],
  "karwar": [14.8150, 74.1290],
  "paris": [48.8566, 2.3522],
  "london": [51.5074, -0.1278],
  "new york": [40.7128, -74.0060],
  "tokyo": [35.6762, 139.6503],
  "dubai": [25.2048, 55.2708]
};

function getCityCoords(location: string): [number, number] {
  const normalized = location.toLowerCase().trim().split(' ')[0]; // Get first word
  return CITY_COORDS[normalized] || [14.8150, 74.1290]; // Default fallback
}

// Fallback mock data generator
function generateMockRestaurants(location: string) {
  return {
    type: 'restaurants',
    city: location,
    results: [
      {
        id: 'r1',
        name: `${location} Local Cuisine`,
        rating: 4.6,
        cuisine: 'Local Specialties',
        distance: '1.2 km',
        lat: getCityCoords(location)[0],
        lng: getCityCoords(location)[1]
      },
      {
        id: 'r2',
        name: `Coastal Delights - ${location}`,
        rating: 4.7,
        cuisine: 'Seafood',
        distance: '2.5 km',
        lat: getCityCoords(location)[0] + 0.005,
        lng: getCityCoords(location)[1] + 0.006
      },
      {
        id: 'r3',
        name: `Traditional ${location} Restaurant`,
        rating: 4.5,
        cuisine: 'Regional',
        distance: '1.8 km',
        lat: getCityCoords(location)[0] - 0.005,
        lng: getCityCoords(location)[1] - 0.004
      }
    ],
    message: `Here are some popular dining spots in ${location}! 🍽️`
  };
}

function generateMockItinerary(location: string) {
  return {
    type: 'itinerary',
    city: location,
    timeline: [
      {
        time: '09:00 AM',
        title: `Breakfast at ${location} Cafe`,
        description: 'Start your day with local breakfast specialties',
        category: 'food',
        lat: getCityCoords(location)[0],
        lng: getCityCoords(location)[1]
      },
      {
        time: '10:30 AM',
        title: `${location} Beach Visit`,
        description: 'Enjoy the scenic coastal views and morning breeze',
        category: 'attraction',
        lat: getCityCoords(location)[0] + 0.005,
        lng: getCityCoords(location)[1] + 0.006
      },
      {
        time: '01:00 PM',
        title: 'Local Market Exploration',
        description: 'Experience local culture and cuisine',
        category: 'shopping',
        lat: getCityCoords(location)[0] + 0.003,
        lng: getCityCoords(location)[1] + 0.003
      },
      {
        time: '04:00 PM',
        title: `${location} Temple/Fort`,
        description: 'Explore historical landmarks',
        category: 'attraction',
        lat: getCityCoords(location)[0] - 0.005,
        lng: getCityCoords(location)[1] - 0.004
      }
    ],
    message: `I've planned a perfect day for you in ${location}! 🌟`
  };
}

function generateMockSafety(location: string) {
  return {
    type: 'safety',
    city: location,
    alerts: [
      { level: 'low', message: `${location} is generally safe for travelers` }
    ],
    safe_zones: [
      {
        id: 's1',
        name: `${location} Police Station`,
        type: 'police',
        lat: getCityCoords(location)[0],
        lng: getCityCoords(location)[1],
        distance: '0.5 km'
      },
      {
        id: 's2',
        name: `${location} Tourist Help Center`,
        type: 'safe_zone',
        lat: getCityCoords(location)[0] + 0.003,
        lng: getCityCoords(location)[1] + 0.003,
        distance: '1.0 km'
      }
    ],
    message: `I've marked safe zones in ${location}. Stay safe! 🛡️`
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, location } = body;

    // Simple Intent Detection
    const lowerPrompt = prompt.toLowerCase();

    let intent = 'general_query';
    if (lowerPrompt.includes('eat') || lowerPrompt.includes('food') || lowerPrompt.includes('restaurant') || lowerPrompt.includes('dinner') || lowerPrompt.includes('lunch') || lowerPrompt.includes('vegetarian')) {
      intent = 'find_food';
    } else if (lowerPrompt.includes('plan') || lowerPrompt.includes('itinerary') || lowerPrompt.includes('trip') || lowerPrompt.includes('day')) {
      intent = 'plan_day';
    } else if (lowerPrompt.includes('safe') || lowerPrompt.includes('help') || lowerPrompt.includes('police') || lowerPrompt.includes('danger') || lowerPrompt.includes('walking') || lowerPrompt.includes('route')) {
      intent = 'safe_places';
    }

    // Try Gemini AI first, fallback to mock data
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        if (intent === 'find_food') {
          const aiPrompt = `You are a travel assistant. The user is in ${location} and wants: "${prompt}".
            
Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "type": "restaurants",
  "city": "${location}",
  "results": [
    {
      "id": "r1",
      "name": "Restaurant Name",
      "rating": 4.5,
      "cuisine": "Cuisine Type",
      "distance": "X km",
      "lat": latitude_number,
      "lng": longitude_number
    }
  ],
  "message": "Brief message about the recommendations"
}

Provide 3-4 real restaurants in ${location} with accurate GPS coordinates.`;

          const result = await model.generateContent(aiPrompt);
          const responseText = result.response.text();
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return NextResponse.json(JSON.parse(jsonMatch[0]));
          }
        }

        if (intent === 'plan_day') {
          const aiPrompt = `You are a travel assistant. The user is in ${location} and wants: "${prompt}".
            
Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "type": "itinerary",
  "city": "${location}",
  "timeline": [
    {
      "time": "09:00 AM",
      "title": "Activity Name",
      "description": "Brief description",
      "category": "food|attraction|shopping",
      "lat": latitude_number,
      "lng": longitude_number
    }
  ],
  "message": "Brief message about the plan"
}

Create a 4-5 stop itinerary for ${location} with real places and accurate GPS coordinates.`;

          const result = await model.generateContent(aiPrompt);
          const responseText = result.response.text();
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return NextResponse.json(JSON.parse(jsonMatch[0]));
          }
        }

        if (intent === 'safe_places') {
          const aiPrompt = `You are a travel assistant. The user is in ${location} and wants: "${prompt}".
            
Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "type": "safety",
  "city": "${location}",
  "alerts": [
    { "level": "low|medium|high", "message": "Alert message" }
  ],
  "safe_zones": [
    {
      "id": "s1",
      "name": "Location Name",
      "type": "police|safe_zone",
      "lat": latitude_number,
      "lng": longitude_number,
      "distance": "X km"
    }
  ],
  "message": "Brief safety message"
}

Provide 2-3 real safe zones/police stations in ${location} with accurate GPS coordinates.`;

          const result = await model.generateContent(aiPrompt);
          const responseText = result.response.text();
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return NextResponse.json(JSON.parse(jsonMatch[0]));
          }
        }
      } catch (aiError) {
        console.error('Gemini API Error, falling back to mock data:', aiError);
      }
    }

    // Fallback to mock data
    if (intent === 'find_food') {
      return NextResponse.json(generateMockRestaurants(location));
    }

    if (intent === 'plan_day') {
      return NextResponse.json(generateMockItinerary(location));
    }

    if (intent === 'safe_places') {
      return NextResponse.json(generateMockSafety(location));
    }

    // DEFAULT / GENERAL QUERY
    return NextResponse.json({
      type: 'text',
      message: `I can help you explore ${location}! Try asking me to find food 🍽️, plan your day 📅, or find safe places 🛡️.`
    });

  } catch (error) {
    console.error("Agent API Error:", error);
    return NextResponse.json({
      type: 'text',
      message: "I'm having trouble processing that request. Please try again!"
    }, { status: 200 });
  }
}
