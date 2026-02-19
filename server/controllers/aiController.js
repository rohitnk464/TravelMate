const { orchestrateRequest } = require('../agents/orchestrator');

// @desc    Process user query via AI Orchestrator
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
    const { prompt, location } = req.body;
    console.log(`[AI Controller] Received prompt: "${prompt}" for location: "${location}"`);
    const user = req.user; // Assumes auth middleware populates req.user

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        const response = await orchestrateRequest({ ...(user || { role: 'guest' }), currentState: { location } }, prompt);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { chatWithAI };
