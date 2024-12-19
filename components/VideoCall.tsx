'use client';

import React, { useRef, useEffect, useState } from 'react';
import Peer from 'simple-peer';

export default function VideoCall() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        // Play local stream in local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          await localVideoRef.current.play();
        }

        // Peer-to-peer communication setup
        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on('signal', (data) => {
          console.log('SIGNAL:', data);
        });

        peer.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
          }
        });
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Unable to access camera or microphone. Please check your permissions.');
      }
    }

    setupMedia();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1>Video Call</h1>
      {error && <p className="text-red-500">{error}</p>}
      <video ref={localVideoRef} muted className="w-1/2" playsInline />
      <video ref={remoteVideoRef} className="w-1/2" playsInline />
    </div>
  );
}
