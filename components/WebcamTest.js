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
  };

  const handleBack = () => {
    setPreviewUrl(null);
    setRecordedChunks([]);
    setTimer(0);
  };

  return (
    <div className="relative w-full h-full bg-black rounded-md">
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        className="w-full h-full object-cover rounded-md"
      />

      {/* Formatted Time - Top Left */}
      <div className="absolute top-4 left-4 p-2 rounded-lg" style={{
        backgroundColor: isRecording ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        transition: 'background-color 0.3s ease'
      }}>
        {formatTime(timer)}
      </div>

      {/* Recording Button - Bottom Center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`w-16 h-16 rounded-full focus:outline-none transition-all duration-300 ${
            isRecording 
              ? 'bg-transparent border-4 border-white' 
              : 'bg-red-600 border-4 border-white'
          }`}
        >
          {isRecording && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-4 h-4 bg-red-600 rounded-sm"></span>
            </span>
          )}
        </button>
      </div>

      {previewUrl && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white shadow-lg p-4 rounded-lg max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-2">Preview:</h3>
            <video src={previewUrl} controls className="w-full rounded" />
            <button 
              onClick={() => {
                const a = document.createElement('a');
                a.href = previewUrl;
                a.download = 'recorded-video.webm';
                a.click();
              }}
              className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Download Recording
            </button>
            <button
              onClick={handleBack}
              className="w-full mt-2 bg-stone-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


export default WebcamTest;