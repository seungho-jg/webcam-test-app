'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const WebcamTest = dynamic(() => import('../components/WebcamTest'), { ssr: false });

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center my-4">webcam</h1>
      {isClient && <WebcamTest />}
    </div>
  );
}