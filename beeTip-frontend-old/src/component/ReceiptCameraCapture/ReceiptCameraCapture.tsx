import { useEffect, useRef, useState } from "react";
import "./ReceiptCameraCapture.css";

interface ReceiptCameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

export default function ReceiptCameraCapture({
  onCapture,
  onClose,
}: ReceiptCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      })
      .then((stream) => {
        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        if (isActive) {
          setError("Camera access was blocked or unavailable.");
        }
      });

    return () => {
      isActive = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera is not ready yet.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setError("Could not capture image.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL("image/jpeg", 0.86));
    onClose();
  };

  return (
    <div className="receipt-camera">
      <div className="receipt-camera-header">
        <p>Receipt Camera</p>
        <button type="button" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {error ? (
        <p className="page-error">{error}</p>
      ) : (
        <video
          ref={videoRef}
          className="receipt-camera-preview"
          autoPlay
          muted
          playsInline
        />
      )}

      <button
        type="button"
        className="primary-btn receipt-camera-capture-btn"
        onClick={handleCapture}
        disabled={Boolean(error)}
      >
        Capture
      </button>
    </div>
  );
}
