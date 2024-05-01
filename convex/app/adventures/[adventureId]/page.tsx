"use client";
import { useRef, useEffect, useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CircularProgress } from '@mui/material';
import Link from 'next/link';

export default function Adventure(props: { params: { adventureId: Id<"adventures"> } }) {
  const usePlayerInput = useAction(api.backend.usePlayerInput);
  const adventureId = props.params.adventureId;
  const entries = useQuery(api.backend.getAllEntries, { adventureId });
  const [message, setMessage] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Referenz zum Eingabefeld
  const abortButtonRef = useRef<HTMLButtonElement>(null); // Referenz zum "Abenteuer beenden" Button
  const [isLoading, setIsLoading] = useState(false);
  let isFirstEntry = true;

  
  useEffect(() => {
    // Fokussiere das Eingabefeld, wenn die Komponente geladen wird
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Event-Handler für das Keydown-Event registrieren
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleAbortAdventure(); // Wenn Escape gedrückt wird, rufe die Funktion zum Beenden des Abenteuers auf
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Leeres Array als Abhängigkeitsliste, um sicherzustellen, dass der Effekt nur einmal ausgeführt wird

  //Scrollbar
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    usePlayerInput({
      message,
      adventureId,
    }).then(() => {
      setMessage('');
      setIsLoading(false);
    });
  };

  const handleAlternativeInput = (input: string) => {
    setMessage(input);
  };

  const handleAbortAdventure = () => {
    window.location.href = '/'; // Hier könnte auch die entsprechende Logik stehen, um das Abenteuer zu beenden
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24" style={{ backgroundColor: 'black', color: 'white' }}>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="grid grid-cols-2"></div>
        <div className="flex flex-col">
          <div className="p-4 text-white bg-black rounded-xl h-[600px] mb-2 p-2 overflow-y-auto">
            {entries?.map((entry) => {
              const isCurrentEntryFirst = isFirstEntry;
              isFirstEntry = false;

              return (
                <div key={entry._id} className="flex flex-col gap-10 text-white">
                  {isCurrentEntryFirst ? null : (
                    <div className="flex flex-col gap-4" style={{ fontSize: '22px', fontFamily: 'Courier' }}>
                      <span style={{ marginRight: '10px' }}>Spieler:</span>
                      <hr/>
                      {entry.input}
                    </div>
                  )}
                  <div className="flex flex-col gap-4" style={{ fontSize: '22px', fontFamily: 'Courier' }}>
                    Dungeon Master:
                    <hr />
                    {entry.response}
                    <div className="gap-30"></div>
                    <div className="gap-30"></div>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef} // Füge die Referenz zum Eingabefeld hinzu
              className="p-1 rounded text-black"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div style={{ marginRight: '50px', marginTop: '5px' }}>
              {isLoading ? (
                <CircularProgress size={24} style={{ color: '#FFFFFF' }} /> 
              ) : (
                <button type="submit" style={{ marginRight: '50px' }}>Bestätigen</button>
              )}
            </div>
          </form>
          {/* Auskommentierter Abschnitt */}
          {/*
          <div className="absolute bottom-0 right-0 m-4">
            <div className="bg-gray-800 p-2 rounded-lg text-white text-xs flex flex-col">
              <button onClick={() => handleAlternativeInput('umsehen')} style={{ backgroundColor: 'gray', color: 'white', padding: '10px', borderRadius: '5px', cursor: 'pointer', marginBottom: '5px' }}>Umsehen</button>
              <button onClick={() => handleAlternativeInput('Inventar')} style={{ backgroundColor: 'gray', color: 'white', padding: '10px', borderRadius: '5px', cursor: 'pointer', marginBottom: '5px' }}>Inventar</button>
              <button onClick={() => handleAlternativeInput('laufe nach Norden')} style={{ backgroundColor: 'gray', color: 'white', padding: '10px', borderRadius: '5px', cursor: 'pointer', marginBottom: '5px' }}>laufe nach Norden</button>
              <button onClick={() => handleAlternativeInput('laufe nach Süden')} style={{ backgroundColor: 'gray', color: 'white', padding: '10px', borderRadius: '5px', cursor: 'pointer', marginBottom: '5px' }}>laufe nach Süden</button>
              <button onClick={() => handleAlternativeInput('laufe nach Westen')} style={{ backgroundColor: 'gray', color: 'white', padding: '10px', borderRadius: '5px', cursor: 'pointer', marginBottom: '5px' }}>laufe nach Westen</button>
              <button onClick={() => handleAlternativeInput('laufe nach Osten')} style={{ backgroundColor: 'gray', color: 'white', padding: '10px', borderRadius: '5px', cursor: 'pointer', marginBottom: '5px' }}>laufe nach Osten</button>
              <button onClick={() => handleAlternativeInput('aufheben')} style={{ backgroundColor: 'gray', color: 'white', padding: '10px', borderRadius: '5px', cursor: 'pointer', marginBottom: '5px' }}>aufheben</button>
            </div>
          </div>
          */}
        </div>
      </div>
      <button ref={abortButtonRef} onClick={handleAbortAdventure} style={{ backgroundColor: 'red', color: 'white', padding: '10px', borderRadius: '5px', marginTop: '20px', cursor: 'pointer' }}>Abenteuer beenden</button>
    </main>
  );
}
