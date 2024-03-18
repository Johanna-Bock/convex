"use client";import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';

export default function Main() {
    const [isLoading, setIsLoading] = useState(false);
    const createAdventureMutation = useMutation(api.adventure.createAdventure);
    const router = useRouter();
    const [selectedCharacter, setSelectedCharacter] = useState("warrior");

    const handleStartAdventure = async () => {
        setIsLoading(true);
        // Übergeben Sie das ausgewählte Character an die Mutation
        const adventureId = await createAdventureMutation({
            character: selectedCharacter,
        });
        router.push(`/adventures/${adventureId}`);
    };

    return (
        <div className='flex flex-col items-center justify-center w-full h-screen' style={{ 
            backgroundImage: `url('/karte.png')`, 
            color: 'white', 
            fontSize: '30px', 
            fontFamily: 'Courier', 
            fontWeight: 'bold', 
            textShadow: '0 0 5px white',
            backgroundSize: 'cover', // Hintergrundbild so skalieren, dass es den gesamten Bereich abdeckt
            backgroundPosition: 'center', // Hintergrundbild zentrieren
            }}>
            <h1 className="mb-8">Willkommen zum Textadventure Game! Bitte wähle ein Szenario:</h1>

            <div className="grid grid-cols-3 gap-8" style={{ width: '1000px' }}>
                {['warrior', 'wizard', 'archer'].map(character => {
                    return (
                        <div
                            key={character}
                            className="flex flex-col items-center gap-2 text-2xl">

                            <img
                                onClick={() => setSelectedCharacter(character)}
                                src={`/${character}.png`}
                                className={`cursor-pointer ${selectedCharacter === character ? 'border border-white-500' : ''}`}
                            />
                            {character}
                        </div>
                    );
                })}
            </div>

            <button
                className="bg-gray-500 hover:bg-gray-400 px-2 py-1 rounded-md mt-8"
                onClick={handleStartAdventure}
                disabled={isLoading}
            >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Start Adventure"}
            </button>
        </div>
    );
};
