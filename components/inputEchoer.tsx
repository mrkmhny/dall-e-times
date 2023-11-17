"use client"

import React, { useState } from 'react'

export default function InputEchoer() {
    const [input, setInput] = useState('');

    const handleInput = (event: any) => {
        setInput(event.target.value);
    }

    return (
        <div>
            <input type="text" placeholder="Type anything" value={input} onChange={handleInput} />
            <p>{input}</p>
        </div>
    )
}