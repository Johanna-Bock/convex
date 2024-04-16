//Dokument für die Funktionalitäten
"use client";
import { useRef, useEffect, useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CircularProgress } from '@mui/material';
import Link from 'next/link';

export default function Adventure(props: { params: { adventureId: Id<"adventures"> } }) {
  const handlePlayerAction = useAction(api.chat.handlePlayerAction);
  const adventureId = props.params.adventureId;
  const entries = useQuery(api.chat.getAllEntries, { adventureId });
  const [message, setMessage] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  let isFirstEntry = true;


  //Scrollbar
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Event-Handler für Tastatureingaben registrieren, wenn das Textfeld nicht fokussiert ist
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName !== 'INPUT') {
        handleNumberKeyPress(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [entries]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    handlePlayerAction({
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

  const handleNumberKeyPress = (e: KeyboardEvent) => {
    const keyPressed = e.key;
    if (keyPressed >= '1' && keyPressed <= '7') {
      const index = parseInt(keyPressed) - 1;
      const buttons = ['umsehen', 'Inventar', 'laufe nach Norden', 'laufe nach Süden', 'laufe nach Westen', 'laufe nach Osten', 'aufheben'];
      setMessage(buttons[index]);

      e.preventDefault();
    } else if (keyPressed === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleAbortAdventure = () => {
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
        </div>
      </div>
      <button onClick={handleAbortAdventure} style={{ backgroundColor: 'red', color: 'white', padding: '10px', borderRadius: '5px', marginTop: '20px', cursor: 'pointer' }}>Abenteuer beenden</button>
    </main>
  );
}
