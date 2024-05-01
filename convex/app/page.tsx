"use client";
//Importe
import { useState, useEffect, useRef } from 'react';
import { useMutation } from 'convex/react'; 
import { api } from '@/convex/_generated/api'; 
import { useRouter } from 'next/navigation'; 
import { CircularProgress, IconButton, Tooltip } from '@mui/material'; // Importe für Ladesymbol und Button
import InfoIcon from '@mui/icons-material/Info'; // Importiere das Info-Icon für Info Zeichen




export default function Main() {
    // Definiere den Status für den Ladezustand 
    const [isLoading, setIsLoading] = useState(false);
    // Mutationsfunktion aufrufen für neues Abenteuer
    const setupAdventureMutation = useMutation(api.prompt.setupAdventure);
    // Router
    const router = useRouter();
    // Filter
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

    // Tastatureingaben
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp':
                    // Pfeiltaste nach oben
                    if (selectedCharacterIndex >= 0) {
                        setSelectedCharacterIndex((prevIndex) => prevIndex - 1);
                    } else if (selectedScenarioIndex >= 0) {
                        setSelectedScenarioIndex((prevIndex) => prevIndex - 1);
                    } else if (playerNameRef.current) {
                        playerNameRef.current.focus();
                    }
                    break;
                case 'ArrowDown':
                    // Pfeiltaste nach unten
                    if (selectedScenarioIndex < scenarios.length - 1 && selectedCharacterIndex === -1) {
                        setSelectedScenarioIndex((prevIndex) => prevIndex + 1);
                    } else if (selectedCharacterIndex < characters.length - 1) {
                        setSelectedCharacterIndex((prevIndex) => prevIndex + 1);
                    } else if (playerNameRef.current) {
                        playerNameRef.current.focus();
                    }
                    break;
                    
                case 'Enter':
                    // Eingabetaste
                    if (selectedScenarioIndex !== -1 && selectedCharacterIndex === -1) {
                        setSelectedCharacterIndex(0);
                    } else if (selectedCharacterIndex !== -1 && !playerName) {
                        setTimeout(() => playerNameRef.current?.focus(), 0);
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

    // Starten eines Abenteuers
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

        // Führe die Mutation aus, um ein neues Abenteuer zu erstellen
        const adventureId = await setupAdventureMutation({
            scenario: scenarios[selectedScenarioIndex],
            character: characters[selectedCharacterIndex],
            playerName: playerName
        });
        // Navigation
        router.push(`/adventures/${adventureId}`);
    };

    // Button
    const handleScenarioClick = (index: number) => {
        setSelectedScenarioIndex(index);
    };

    const handleCharacterClick = (index: number) => {
        setSelectedCharacterIndex(index);
        if (index === 0) {
            setTimeout(() => {
                playerNameRef.current?.focus();
            }, 0);
        }
    };

    // Funktion zum Bearbeiten des Formular-Submit-Ereignisses
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleStartAdventure();
    };

    // Rendern der Komponente
    return (
        <div className='relative flex flex-col items-center justify-center w-full h-screen' style={{
            backgroundImage: `url('/karte.png')`,
            color: 'white',
            fontSize: '30px',
            fontFamily: 'Courier',
            fontWeight: 'bold',
            textShadow: '0 0 5px white',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            {/* Info-Kästchen zur Anzeige der Information zur Auswahl mit Maus oder Pfeiltasten */}
            <div className="absolute top-0 right-0 m-4 bg-gray-800 p-2 rounded-lg text-white text-xs flex items-center">
                <Tooltip title="Wähle mit Maus oder Pfeiltasten aus">
                    <IconButton size="small" style={{ color: 'white' }}>
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
                Die Auswahl kann mit Maus oder Pfeiltasten und Enter erfolgen
            </div>
            
            {/* Überschrift */}
            <h1 className="mb-8">Willkommen zum Textadventure AI-Quest! Bitte wähle ein Szenario:</h1>

            {/* Szenarioauswahl */}
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
                                style={{ width: '400px', height: '200px' }}
                                alt={scenario}
                            />
                            {scenario}
                        </div>
                    );
                })}
            </div>

            {/* Charakterauswahl */}
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

            {/* Eingabefeld für den Spielernamen */}
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

            {/* Button zum Starten des Abenteuers */}
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
