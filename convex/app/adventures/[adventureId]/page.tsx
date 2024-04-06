"use client";

import { useRef, useEffect, useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CircularProgress } from '@mui/material'; // Import des CircularProgress-Komponenten aus Material-UI
import Link from 'next/link'; // Import der Link-Komponente von Next.js

export default function Adventure(props: { params: { adventureId: Id<"adventures"> } }) {
  const handlePlayerAction = useAction(api.chat.handlePlayerAction);
  const adventureId = props.params.adventureId;
  const entries = useQuery(api.chat.getAllEntries, { adventureId });
  const [message, setMessage] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null); // Referenz für das Ende des Nachrichtencontainers
  const [isLoading, setIsLoading] = useState(false); // Zustand für das Laden des Chat-GPT
  let isFirstEntry = true;

  useEffect(() => {
    // Automatisches Scrollen zum Ende des Containers, wenn neue Einträge hinzugefügt werden
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries]); // Überwacht Änderungen an den Einträgen

  // Funktion zum Senden der Benutzeraktion
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Setzt den Ladezustand auf true, wenn die Benutzeraktion gesendet wird
    handlePlayerAction({
      message,
      adventureId,
    }).then(() => {
      setMessage('');
      setIsLoading(false); // Setzt den Ladezustand auf false, wenn die Benutzeraktion abgeschlossen ist
    });
  };

  // Funktion zum Abbrechen des Abenteuers und Rückkehr zur Startseite
  const handleAbortAdventure = () => {
    // Hier kannst du weitere Aktionen ausführen, bevor das Abenteuer abgebrochen wird, z.B. API-Aufrufe oder Zustandsänderungen.
    // Nachdem alle erforderlichen Aktionen ausgeführt wurden, kehre zur Startseite zurück.
    window.location.href = '/';  
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
                    <div className="flex flex-col gap-4" style={{ fontSize: '22px', fontFamily: 'Courier' }}> {/* Erhöhter Abstand */}
                      <span style={{ marginRight: '10px' }}>You:</span>
                      <hr/>
                      {entry.input}
                    </div>
                  )}
                  <div className="flex flex-col gap-4" style={{ fontSize: '22px', fontFamily: 'Courier' }}> {/* Erhöhter Abstand */}
                    Dungeon Master:
                    <hr />
                    {entry.response}
                    <div className="gap-30"></div>
                    <div className="gap-30"></div>
                  </div>
                </div>
              );
            })}
            {/* Platzhalter-Ref für das automatische Scrollen */}
            <div ref={messageEndRef} />
          </div>

          {/* Formular zum Senden der Benutzeraktion */}
          <form onSubmit={handleSubmit}>
          <input
              className="p-1 rounded text-black"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {/* Anzeigen des Ladebalkens, wenn isLoading true ist */}
            <div style={{ marginRight: '50px', marginTop: '5px'  }}> {/* Hier wird die margin-left Eigenschaft hinzugefügt */}
              {isLoading ? (
                <CircularProgress size={24} style={{ color: '#FFFFFF' }} /> 
              ) : (
                <button type="submit" style={{ marginRight: '50px' }}>Submit</button>
              )}
            </div>
          </form>
        </div>
      </div>
      {/* Button zum Abbrechen des Abenteuers und zur Rückkehr zur Startseite */}
      <button onClick={handleAbortAdventure} style={{ backgroundColor: 'red', color: 'white', padding: '10px', borderRadius: '5px', marginTop: '20px', cursor: 'pointer' }}>Abenteuer abbrechen</button>
    </main>
  );
}
