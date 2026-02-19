const tryRequire = (path) => {
    try {
        console.log(`Loading ${path}...`);
        require(path);
        console.log(`Successfully loaded ${path}`);
    } catch (error) {
        console.error(`FAILED to load ${path}:`);
        console.error(error);
    }
};

console.log('--- Starting Debug Require ---');
tryRequire('../models/User');
tryRequire('../services/incidentService');
tryRequire('../controllers/authController');
tryRequire('../controllers/adminController');
tryRequire('../middleware/authMiddleware');
tryRequire('../routes/authRoutes');
tryRequire('../routes/adminRoutes');
tryRequire('../routes/aiRoutes');
tryRequire('../routes/placesRoutes');
tryRequire('../routes/guidesRoutes');
tryRequire('../routes/bookingRoutes');
tryRequire('../routes/aiPlannerRoutes');
tryRequire('../routes/openMapRoutes');
tryRequire('../services/cronService');
console.log('--- Finished Debug Require ---');
