export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background pt-20 pb-20">
            <section className="container mx-auto px-6 max-w-3xl">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <p className="text-muted-foreground mb-8">Last updated: October 1, 2025</p>

                <div className="prose prose-invert prose-lg">
                    <p>
                        Please read these Terms of Service ("Terms") carefully before using the TravelMate mobile application and website.
                    </p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>
                        By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
                    </p>

                    <h3>2. User Accounts</h3>
                    <p>
                        When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.
                    </p>

                    <h3>3. Safety Disclaimer</h3>
                    <p>
                        TravelMate provides tools to enhance safety but cannot guarantee safety in all situations. Users are responsible for their own actions and should always follow local laws and official emergency advice.
                    </p>

                    <h3>4. Termination</h3>
                    <p>
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                </div>
            </section>
        </div>
    );
}
