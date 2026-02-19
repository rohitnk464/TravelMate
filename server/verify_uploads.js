const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load .env manually since dotenv might not be working in eval
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
}

const PlaceSchema = new mongoose.Schema({ name: String, image: String });
const GuideSchema = new mongoose.Schema({ name: String, imageUrl: String });

const Place = mongoose.model('Place', PlaceSchema);
const Guide = mongoose.model('Guide', GuideSchema);

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const places = await Place.find({});
        console.log("\n--- Places ---");
        places.forEach(p => console.log(`${p.name}: ${p.image}`));

        const guides = await Guide.find({});
        console.log("\n--- Guides ---");
        guides.forEach(g => console.log(`${g.name}: ${g.imageUrl}`));

        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

verify();
