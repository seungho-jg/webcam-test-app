import React, { useState, useRef, useEffect } from 'react';

const WebcamTest = () => {
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [timer, setTimer] = useState(0);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const startStream = async () => {
      try {
        const userMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(userMedia);
        if (videoRef.current) {
          videoRef.current.srcObject = userMedia;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    startStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartRecording = () => {
    setRecordedChunks([]);
    setIsRecording(true);
    setTimer(0);

    const media = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorderRef.current = media;

    media.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };

    media.start();

    timerIntervalRef.current = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    clearInterval(timerIntervalRef.current);
  };

  useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    }
  }, [recordedChunks, isRecording]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  const handleDownload = () => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'recorded-video.webm';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <video ref={videoRef} autoPlay muted className="w-full max-w-2xl mx-auto border rounded" />
      </div>
      <div className="flex justify-center space-x-4">
        {!isRecording ? (
          <button onClick={handleStartRecording} className="bg-blue-500 text-white px-4 py-2 rounded">
            Start Recording
          </button>
        ) : (
          <button onClick={handleStopRecording} className="bg-red-500 text-white px-4 py-2 rounded">
            Stop Recording
          </button>
        )}
        {previewUrl && (
          <button onClick={handleDownload} className="bg-green-500 text-white px-4 py-2 rounded">
            Download Recording
          </button>
        )}
      </div>
      {previewUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Preview:</h3>
          <video src={previewUrl} controls className="w-full max-w-2xl mx-auto border rounded" />
        </div>
      )}
    </div>
  );
};

export default WebcamTest;