'use client';

import React, { useRef, useEffect, useState } from 'react';
import Peer from 'simple-peer';

export default function VideoCall() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const socket = useRef<WebSocket | null>(null);
  const peer = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        // Display local video feed
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          await localVideoRef.current.play();
        }

        // Connect to WebSocket signaling server
        socket.current = new WebSocket(`ws://${window.location.host}/api/signaling`);

        // Handle signaling messages
        socket.current.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === 'offer') {
            peer.current = new Peer({ initiator: false, trickle: false, stream });
            peer.current.signal(data.signal);

            peer.current.on('signal', (signal) => {
              socket.current?.send(JSON.stringify({ type: 'answer', signal }));
            });

            peer.current.on('stream', (remoteStream) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                remoteVideoRef.current.play();
              }
            });
          } else if (data.type === 'answer') {
            peer.current?.signal(data.signal);
          }
        };

        // Create a new peer connection
        peer.current = new Peer({ initiator: true, trickle: false, stream });

        peer.current.on('signal', (signal) => {
          socket.current?.send(JSON.stringify({ type: 'offer', signal }));
        });

        peer.current.on('stream', (remoteStream) => {
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

    return () => {
      socket.current?.close();
      peer.current?.destroy();
    };
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
