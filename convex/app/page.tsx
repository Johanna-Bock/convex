
"use client";

import Image from 'next/image'
import {useState} from "react";
import { useAction } from "convex/react";
import { api } from '@/convex/_generated/api';


export default function Home() {
  const handlePlayerAction = useAction(api.chat.handlePlayerAction);
  const [message, setMessage] = useState("")
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className ="flex flex-col">
        <div className=" bg-white rounded-xl h-[400px] w-[200px} nb-2"></div>
        
        <form onSubmit={(e) =>{
          e.preventDefault();
          handlePlayerAction({ message });
        }}> 
          <input name="message" value={message} onChange={(e) => setMessage(e.target.value)}
          />
          <button>Submit</button>
        </form>
        </div>
      
      </div>
    </main>
  )
}
