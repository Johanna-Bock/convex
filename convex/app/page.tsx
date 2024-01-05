"use client";

import { useMutation } from 'convex/react';
import { createAdventure } from '../convex/adventure';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';


export default function Main() {
    const createAdventure = useMutation(api.adventure.createAdventure);
    const router = useRouter();

    return (
    <div>
        <button
        onClick={async () => {
            await createAdventure();
            router.push("/adventures");
        }}
        >Start Adventure</button>
    </div>
    );
};