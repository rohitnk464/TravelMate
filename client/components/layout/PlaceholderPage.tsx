import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

interface PlaceholderPageProps {
    title: string;
    description?: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Construction className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                {title}
            </h1>
            <p className="text-xl text-gray-400 max-w-lg mb-8">
                {description || "This page is currently under construction. Please check back later!"}
            </p>
            <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
            </Link>
        </div>
    );
};

export default PlaceholderPage;
