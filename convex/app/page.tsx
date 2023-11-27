
"use client";

import Image from 'next/image'
import {useState} from "react";

export default function Home() {
  const [message, setMessage] = useState("")
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className ="flex flex-col">
        <div className=" bg-white rounded-xl h-[400px] w-[200px}"></div>
        {message}
        <form>
          <input name="message" value={message} onChange={(e) => setMessage(e.target.value)}/>
        </form>
        </div>
      
      </div>
    </main>
  )
}
