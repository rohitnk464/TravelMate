export interface Translator {
    id: string;
    name: string;
    languages: string[];
    rating: number;
    reviews: number;
    location: string;
    imageUrl: string;
    hourlyRate: number;
    bio: string;
    verified: boolean;
}

export const mockTranslators: Translator[] = [
    {
        id: "1",
        name: "Sakura Tanaka",
        languages: ["Japanese", "English", "Mandarin"],
        rating: 4.9,
        reviews: 124,
        location: "Tokyo, Japan",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop",
        hourlyRate: 35,
        bio: "Certified tour guide and interpreter with 5 years of experience. I love showing people the hidden gems of Tokyo!",
        verified: true,
    },
    {
        id: "2",
        name: "Marco Rossi",
        languages: ["Italian", "English", "French"],
        rating: 4.8,
        reviews: 89,
        location: "Rome, Italy",
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2576&auto=format&fit=crop",
        hourlyRate: 40,
        bio: "Passionate about history and food. Let me help you navigate Rome like a local.",
        verified: true,
    },
    {
        id: "3",
        name: "Elena Rodriguez",
        languages: ["Spanish", "English"],
        rating: 5.0,
        reviews: 56,
        location: "Barcelona, Spain",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop",
        hourlyRate: 30,
        bio: "Friendly and energetic local guide. Specializing in architecture and nightlife tours.",
        verified: true,
    },
    {
        id: "4",
        name: "Wei Chen",
        languages: ["Mandarin", "English", "Cantonese"],
        rating: 4.7,
        reviews: 210,
        location: "Shanghai, China",
        imageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=2576&auto=format&fit=crop",
        hourlyRate: 25,
        bio: "Expert translator for business and leisure. I ensure smooth communication in any situation.",
        verified: true,
    },
];
