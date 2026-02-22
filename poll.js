const poll = async () => {
    console.log("Starting poll...");
    for (let i = 0; i < 60; i++) {
        try {
            const r = await fetch('https://travelmate-backend.onrender.com/api/places/fix-images');
            if (r.ok) {
                const text = await r.text();
                console.log("SUCCESS:", text);
                return;
            } else {
                console.log("Polling...", r.status);
            }
        } catch (e) {
            console.log("Error:", e.message);
        }
        await new Promise(res => setTimeout(res, 5000));
    }
    console.log("Timeout waiting for Render to deploy.");
};
poll();
