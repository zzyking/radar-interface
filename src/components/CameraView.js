import React, { useEffect, useRef, useState } from 'react';
import radar_background from './images/radar_background.gif';
import Alert from './ui/Alert';
import { Camera, CameraOff } from 'lucide-react';

const CameraView = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  const toggleCamera = async () => {
    if (isCameraActive) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
      setStream(null);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          setStream(newStream);
          setIsCameraActive(true);
          setError(null);
        }
      } catch (err) {
        setError('无法访问摄像头。请确保您已授予摄像头访问权限。');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="relative w-full h-screen">
      {/* Background layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${radar_background})`,
          zIndex: 1
        }}
      />

      {/* Video layer */}
      <div 
        className="absolute inset-0"
        style={{
          zIndex: 2,
          display: isCameraActive ? 'block' : 'none'
        }}
      >
        <video 
          ref={videoRef} 
          autoPlay 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Controls layer */}
      <div className="absolute inset-0" style={{ zIndex: 3 }}>
        {error && (
          <div className="absolute top-4 left-4">
            <Alert variant="destructive">{error}</Alert>
          </div>
        )}
        <button
          onClick={toggleCamera}
          className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          {isCameraActive ? 
            <Camera size={24} className="text-gray-800" /> : 
            <CameraOff size={24} className="text-gray-800" />
          }
        </button>
      </div>
    </div>
  );
};

export default CameraView;