"use client";

import { forwardRef, useEffect, useState } from "react";

const CameraFeed = forwardRef<HTMLVideoElement>((props, ref) => {
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let stream: MediaStream;  //inbuilt browser Interface to access the camera and microphone

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (ref && typeof ref !== "function" && ref.current) {//check if ref is a valid video element reference and not a function
          ref.current.srcObject = stream;//assign the media stream to the video element's srcObject property
          await ref.current.play();//play the video element to start displaying the camera feed
        }
      } catch (err) {
        console.error(err);
        setPermissionDenied(true);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [ref]);

  if (permissionDenied) {
    return <p>Camera permission denied.</p>;
  }

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted
      className="h-full w-full object-cover -scale-x-100"
    />
  );
});

CameraFeed.displayName = "CameraFeed"; 

export default CameraFeed;