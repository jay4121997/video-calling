'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the code using the API
    const response = await fetch('/api/validate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (!data.valid) {
      setError('Invalid code. Please try again.');
      return;
    }

    // Determine user type and redirect to the call page
    const userType = data.userType;
    console.log("user",userType)
    const instanceId = uuidv4();
    router.push(`/call?user=${userType}&code=${code}&instanceId=${instanceId}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Enter Secret Code</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
        <input
          type="password"
          placeholder="Enter secret code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Join Call
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </main>
  );
}
