export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background pt-20 pb-20">
            <section className="container mx-auto px-6 max-w-3xl">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">Last updated: October 1, 2025</p>

                <div className="prose prose-invert prose-lg">
                    <p>
                        At TravelMate, we take your privacy seriously. This Privacy Policy describes usage of the TravelMate application.
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>
                        We collect location data to provide safety features, even when the app is closed if "Always Allow" is selected, to support the SOS and Live Monitoring features. We also collect user profile information and usage data.
                    </p>

                    <h3>2. How We Use Your Information</h3>
                    <p>
                        Your data is used to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Provide real-time safety alerts.</li>
                        <li>Connect you with verified guides.</li>
                        <li>Facilitate emergency response services.</li>
                    </ul>

                    <h3>3. Data Security</h3>
                    <p>
                        We use industry-standard encryption to protect your data in transit and at rest. We do not sell your personal location data to third parties.
                    </p>

                    <h3>4. Contact Us</h3>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at privacy@travelmate.ai.
                    </p>
                </div>
            </section>
        </div>
    );
}
