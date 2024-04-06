"use client";
import { useState, useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';

export default function Main() {
    const [isLoading, setIsLoading] = useState(false);
    const createAdventureMutation = useMutation(api.adventure.createAdventure);
    const router = useRouter();
    const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(-1);
    const [selectedCharacterIndex, setSelectedCharacterIndex] = useState(-1);
    const [playerName, setPlayerName] = useState("");
    const scenarios = ['Fantasy', 'Kriminalgeschichte', 'Zork'];
    const characters = ['Zauberer', 'Krieger'];
    const scenariosRef = useRef<HTMLDivElement[]>([]);
    const charactersRef = useRef<HTMLButtonElement[]>([]);
    const playerNameRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        scenariosRef.current = scenariosRef.current.slice(0, scenarios.length);
        charactersRef.current = charactersRef.current.slice(0, characters.length);
    }, [scenarios, characters]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp':
                    if (selectedCharacterIndex >= 0) {
                        setSelectedCharacterIndex((prevIndex) => prevIndex - 1);
                    } else if (selectedScenarioIndex >= 0) {
                        setSelectedScenarioIndex((prevIndex) => prevIndex - 1);
                    } else if (playerNameRef.current) {
                        playerNameRef.current.focus();
                    }
                    break;
                case 'ArrowDown':
                    if (selectedScenarioIndex < scenarios.length - 1 && selectedCharacterIndex === -1) {
                        setSelectedScenarioIndex((prevIndex) => prevIndex + 1);
                    } else if (selectedCharacterIndex < characters.length - 1) {
                        setSelectedCharacterIndex((prevIndex) => prevIndex + 1);
                    } else if (playerNameRef.current) {
                        playerNameRef.current.focus();
                    }
                    break;
                case 'Enter':
                    if (selectedScenarioIndex !== -1 && selectedCharacterIndex === -1) {
                        setSelectedCharacterIndex(0);
                    } else if (selectedCharacterIndex !== -1 && !playerName) {
                        setTimeout(() => playerNameRef.current?.focus(), 0); // Springe automatisch zum Namenseingabefeld
                    } else if (playerName && !isLoading) {
                        handleStartAdventure();
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [selectedScenarioIndex, selectedCharacterIndex, playerName, isLoading]);

    const handleStartAdventure = async () => {
        setIsLoading(true);

        if (selectedScenarioIndex === -1) {
            alert("Bitte wähle zuerst ein Szenario aus.");
            setIsLoading(false);
            return;
        }

        if (selectedCharacterIndex === -1) {
            alert("Bitte wähle zuerst einen Charakter aus.");
            setIsLoading(false);
            return;
        }

        if (!playerName) {
            alert("Bitte gebe einen Namen ein.");
            setIsLoading(false);
            return;
        }

        const adventureId = await createAdventureMutation({
            scenario: scenarios[selectedScenarioIndex],
            character: characters[selectedCharacterIndex],
            playerName: playerName
        });
        router.push(`/adventures/${adventureId}`);
    };

    const handleScenarioClick = (index: number) => {
        setSelectedScenarioIndex(index);
    };

    const handleCharacterClick = (index: number) => {
        setSelectedCharacterIndex(index);
        if (index === 0) { // Wenn der Zauberer ausgewählt wurde
            setTimeout(() => {
                playerNameRef.current?.focus(); // Automatisch zum Namenseingabefeld springen
            }, 0);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleStartAdventure();
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
            <h1 className="mb-8">Willkommen zum Textadventure Spiel! Bitte wähle ein Szenario:</h1>

            <div className="grid grid-cols-3 gap-8" style={{ width: '1000px' }}>
                {scenarios.map((scenario, index) => {
                    return (
                        <div
                            key={scenario}
                            className="flex flex-col items-center gap-2 text-2xl"
                            ref={(ref) => (scenariosRef.current[index] = ref as HTMLDivElement)}
                            onClick={() => handleScenarioClick(index)}
                            style={{ border: selectedScenarioIndex === index ? '2px solid white' : 'none', cursor: 'pointer' }}
                        >
                            <img
                                src={`/${scenario}.png`}
                                style={{ width: '400px', height: '200px' }} // Setze die Größe der Bilder hier
                                alt={scenario}
                            />
                            {scenario}
                        </div>
                    );
                })}
            </div>

            {selectedScenarioIndex !== -1 && (
                <div className="flex flex-col items-center gap-2 mt-4">
                    <h2>Wählen Sie Ihren Charakter:</h2>
                    {characters.map((character, index) => (
                        <button
                            key={character}
                            className={`bg-gray-500 hover:bg-gray-400 px-2 py-1 rounded-md ${selectedCharacterIndex === index ? 'border border-white-500' : ''}`}
                            onClick={() => handleCharacterClick(index)}
                            ref={(ref) => (charactersRef.current[index] = ref as HTMLButtonElement)}
                            style={{ cursor: 'pointer' }}
                        >
                            {character}
                        </button>
                    ))}
                </div>
            )}

            {selectedCharacterIndex !== -1 && (
                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 mt-4">
                    <h2>Gebe einen Spielernamen ein:</h2>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Ihr Name"
                        className="bg-gray-300 px-2 py-1 rounded-md"
                        ref={(ref) => (playerNameRef.current = ref)}
                    />
                </form>
            )}

            <button
                className="bg-gray-500 hover:bg-gray-400 px-2 py-1 rounded-md mt-8"
                onClick={handleStartAdventure}
                disabled={isLoading}
            >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Starte das Abenteuer"}
            </button>
        </div>
    );
};
