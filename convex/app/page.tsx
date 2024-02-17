"use client";

import { useMutation } from 'convex/react';
import { createAdventure } from '../convex/adventure';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';


export default function Main() {
    const createAdventure = useMutation(api.adventure.createAdventure);
    const router = useRouter();

    return (
        <div className='flex flex-col items-center justify-center w-full h-screen' style={{ backgroundColor: 'black', color: 'white', fontSize: '30px', fontFamily: 'Courier', fontWeight: 'bold', textShadow: '0 0 5px white' }}>
            <h1 className="mb-8">Willkommen zum Textadventure Game! Bitte wähle ein Szenario:</h1>

            <div className="grid grid-cols-3 gap-8" style={{ width: '1000px' }}>
                <img src="/duck.png" alt="Duck"></img>
                <img src="/lizard.png" alt="Lizard"></img>
                <img src="/fox.png" alt="Fox"></img>
            </div>

        
        
            <button
                className="bg-gray-500 hover:bg-gray-400 px-2 py-1 rounded-md mt-8"
                onClick={async () => {
                    const adventureId = await createAdventure();
                    router.push(`/adventures/${adventureId}`);
                }}
             
        >Start Adventure</button>
    </div>
    );
};