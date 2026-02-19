const { generateResponse } = require('../services/aiService');

const orchestrateRequest = async (user, prompt) => {
    // 1. Analyze Context (Identity, Location, Safety Status)
    const context = {
        userRole: user.role,
        location: user.currentState?.location || 'Unknown',
        safetyMode: user.currentState?.safetyMode || false,
    };

    // 2. Route to appropriate 'agent' via AI Service
    // In a real system, this would determine which tool to call.
    // Here we let the AI Service handle the logic for MVP.

    try {
        const response = await generateResponse(prompt, context);
        return response;
    } catch (error) {
        console.error("Orchestrator Error:", error);
        throw new Error("AI Service Unavailable");
    }
};

module.exports = { orchestrateRequest };
