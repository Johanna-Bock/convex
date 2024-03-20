"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';

export default function Main() {
    const [isLoading, setIsLoading] = useState(false);
    const createAdventureMutation = useMutation(api.adventure.createAdventure);
    const router = useRouter();
    const [selectedScenario, setSelectedScenario] = useState("");
    const [selectedCharacter, setSelectedCharacter] = useState("");
    const [playerName, setPlayerName] = useState("");

    const handleStartAdventure = async () => {
        setIsLoading(true);
        
        if (!selectedCharacter) {
            alert("Bitte wählen Sie zuerst einen Charakter aus.");
            setIsLoading(false);
            return;
        }

        if (!playerName) {
            alert("Bitte geben Sie Ihren Namen ein.");
            setIsLoading(false);
            return;
        }

        const adventureId = await createAdventureMutation({
            scenario: selectedScenario,
            character: selectedCharacter,
            playerName: playerName
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
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            }}>
            <h1 className="mb-8">Willkommen zum Textadventure Game! Bitte wähle ein Szenario:</h1>

            <div className="grid grid-cols-3 gap-8" style={{ width: '1000px' }}>
                {['fantasy', 'mystery', 'zork'].map(scenario => {
                    return (
                        <div
                            key={scenario}
                            className="flex flex-col items-center gap-2 text-2xl">

                            <img
                                onClick={() => setSelectedScenario(scenario)}
                                src={`/${scenario}.png`}
                                className={`cursor-pointer ${selectedScenario === scenario ? 'border border-white-500' : ''}`}
                                style={{ width: '400px', height: '200px' }} // Setze die Größe der Bilder hier
                            />
                            {scenario}
                        </div>
                    );
                })}
            </div>

            {selectedScenario && (
                <div className="flex flex-col items-center gap-2 mt-4">
                    <h2>Wählen Sie Ihren Charakter:</h2>
                    <button
                        className={`bg-gray-500 hover:bg-gray-400 px-2 py-1 rounded-md ${selectedCharacter === "Zauberer" ? 'border border-white-500' : ''}`}
                        onClick={() => setSelectedCharacter("Zauberer")}
                    >
                        wizzard
                    </button>
                    <button
                        className={`bg-gray-500 hover:bg-gray-400 px-2 py-1 rounded-md ${selectedCharacter === "Krieger" ? 'border border-white-500' : ''}`}
                        onClick={() => setSelectedCharacter("Krieger")}
                    >
                        warrior
                    </button>
                </div>
            )}

            {selectedCharacter && (
                <div className="flex flex-col items-center gap-2 mt-4">
                    <h2>Geben Sie Ihren Namen ein:</h2>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Ihr Name"
                        className="bg-gray-300 px-2 py-1 rounded-md"
                    />
                </div>
            )}

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
