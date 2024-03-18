"use client";

import { useRef, useEffect, useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export default function Adventure(props: { params: { adventureId: Id<"adventures"> } }) {
  const handlePlayerAction = useAction(api.chat.handlePlayerAction);
  const adventureId = props.params.adventureId;
  const entries = useQuery(api.chat.getAllEntries, { adventureId });
  const [message, setMessage] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null); // Referenz für das Ende des Nachrichtencontainers
  let isFirstEntry = true;

  useEffect(() => {
    // Automatisches Scrollen zum Ende des Containers, wenn neue Einträge hinzugefügt werden
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries]); // Überwacht Änderungen an den Einträgen

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
                      <span style={{ marginRight: '30px' }}>You:</span>
                      <hr />
                      {entry.input}
                    </div>
                  )}
                  <div className="flex flex-col gap-4" style={{ fontSize: '22px', fontFamily: 'Courier' }}> {/* Erhöhter Abstand */}
                    Dungeon Master:
                    <hr />
                    {entry.response}
                    <div></div>
                    <div className="gap-30"></div>
                  </div>
                </div>
              );
            })}
            {/* Platzhalter-Ref für das automatische Scrollen */}
            <div ref={messageEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePlayerAction({
                message,
                adventureId,
              });
              setMessage('');
            }}
          >
            <input
              className="p-1 rounded text-black"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button>Submit</button>
          </form>
        </div>
      </div>
    </main>
  );
}
