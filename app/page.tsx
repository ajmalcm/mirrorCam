"use client";

import { useRef, useState } from "react";

import CameraFeed from "@/components/CameraFeed";
import ExpressionDetector from "@/components/ExpressionDetector";
import GifOverlay from "@/components/GifOverlay";
import NavBar from "@/components/NavBar";
import CanvasFilter from "@/components/CanvasFilter";
import EffectSettings from "@/components/EffectSettings";

type AsciiCharacterSet = "classic" | "dense" | "simple";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [gifUrl, setGifUrl] = useState<string | null>(null);

  const [selectedNavItem, setSelectedNavItem] = useState<string | null>(
    "ASCII CAM",
  );

  const [asciiSettings, setAsciiSettings] = useState<{
    columns: number;
    characterSet: AsciiCharacterSet;
  }>({
    columns: 160,
    characterSet: "dense",
  });

  type PixelShape = "square" | "circle";

  const [pixelSettings, setPixelSettings] = useState({
    pixelSize: 12,
    shape: "square" as PixelShape,
    gap: 0,
    brightness: 0,
    contrast: 0,
  });

  type ColorMode =
  | "original"
  | "bw"
  | "monochrome";

const [colorSettings, setColorSettings] = useState<{
  mode: ColorMode;
  color: string;
}>({
  mode: "original",
  color: "#ffffff",
});

const [glitchSettings, setGlitchSettings] = useState({
  rgbSplit: 12,
  intensity: 50,
  slices: 8,
  sliceSize: 30,
});

  return (
    <main className="h-screen bg-black text-white relative">
      {/* Camera Section */}
      <section >
        <div className="">
          {/* Camera Card */}
          <div>
            <div className="relative w-screen h-screen bg-black">
              {/* Actual Camera */}
              <CameraFeed ref={videoRef} />

              {/* GIF Reaction */}
              {selectedNavItem === "Reactions" && gifUrl && (
                <GifOverlay gifUrl={gifUrl} />
              )}

              {/* Canvas Effects */}
              {selectedNavItem !== "Reactions" && (
                <CanvasFilter
                  videoRef={videoRef}
                  enabled={true}
                  mode={selectedNavItem}
                  asciiSettings={asciiSettings}
                  pixelSettings={pixelSettings}
                  colorSettings={colorSettings}
                  glitchSettings={glitchSettings}
                />
              )}

              <EffectSettings
                mode={selectedNavItem}
                asciiSettings={asciiSettings}
                setAsciiSettings={setAsciiSettings}
                pixelSettings={pixelSettings}
                setPixelSettings={setPixelSettings}
                colorSettings={colorSettings}
                setColorSettings={setColorSettings}
                glitchSettings={glitchSettings}
                setGlitchSettings={setGlitchSettings}
              />
            </div>
          </div>

              
        </div>
      </section>

      {/* Expression Detection */}
      <ExpressionDetector
        videoRef={videoRef}
        setGifUrl={setGifUrl}
        enabled={selectedNavItem === "Reactions"}
      />

      {/* Navigation */}
      <NavBar
        setSelectedNavItem={setSelectedNavItem}
        selectedNavItem={selectedNavItem}
      />
    </main>
  );
}
