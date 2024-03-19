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
    const [selectedScenario, setSelectedScenario] = useState("fantasy");
    const [selectedCharacter, setSelectedCharacter] = useState(""); // Zustand für den ausgewählten Charakter

    const handleStartAdventure = async () => {
        setIsLoading(true);
        
        // Überprüfen Sie, ob ein Charakter ausgewählt wurde
        if (!selectedCharacter) {
            alert("Bitte wählen Sie zuerst einen Charakter aus."); // Hier könnten Sie auch eine benutzerfreundlichere Benachrichtigung verwenden
            setIsLoading(false);
            return;
        }

        // Übergeben Sie das ausgewählte Szenario und den ausgewählten Charakter an die Mutation
        const adventureId = await createAdventureMutation({
            scenario: selectedScenario,
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

            {/* Auswahl der Charaktere vor jedem Szenario */}
            {selectedScenario && (
                <div className="flex flex-col items-center gap-2 mt-4">
                    <h2>Wählen Sie Ihren Charakter:</h2>
                    <button
                        className={`bg-gray-500 hover:bg-gray-400 px-2 py-1 rounded-md ${selectedCharacter === "Wizard" ? 'border border-white-500' : ''}`}
                        onClick={() => setSelectedCharacter("Wizard")}
                    >
                        wizzard
                    </button>
                    <button
                        className={`bg-gray-500 hover:bg-gray-400 px-2 py-1 rounded-md ${selectedCharacter === "Warrior" ? 'border border-white-500' : ''}`}
                        onClick={() => setSelectedCharacter("Warrior")}
                    >
                        warrior
                    </button>
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
