"use client";

import { useRef } from "react";
import CameraFeed from "@/components/CameraFeed";
import ExpressionDetector from "@/components/ExpressionDetector";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement >(null);

  return (
    <div>
      <CameraFeed ref={videoRef} />
      <ExpressionDetector videoRef={videoRef} />
    </div>
  );
}