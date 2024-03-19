"use client";import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';

export default function Main() {
    const [isLoading, setIsLoading] = useState(false);
    const createAdventure = useMutation(api.adventure.createAdventure);
    const router = useRouter();
    const [selectedScenario, setSelectedScenario] = useState("fantasy");

    const handleStartAdventure = async () => {
        setIsLoading(true);
        // Übergeben Sie das ausgewählte Character an die Mutation
        const adventureId = await createAdventure({
            scenario: selectedScenario,
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
                {['fantasy', 'future', 'zork'].map(scenario => {
                    return (
                        <div
                            key={scenario}
                            className="flex flex-col items-center gap-2 text-2xl">

                            <img
                                onClick={() => setSelectedScenario(scenario)}
                                src={`/${scenario}.png`}
                                className={`cursor-pointer ${selectedScenario === scenario ? 'border border-white-500' : ''}`}
                            />
                            {scenario}
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
