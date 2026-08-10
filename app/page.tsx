"use client";

import { useRef, useState } from "react";

import CameraFeed from "@/components/CameraFeed";
import ExpressionDetector from "@/components/ExpressionDetector";
import GifOverlay from "@/components/GifOverlay";
import NavBar from "@/components/NavBar";
import CanvasFilter from "@/components/CanvasFilter";

type AsciiCharacterSet = "classic" | "dense" | "simple";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [gifUrl, setGifUrl] = useState<string | null>(null);

  const [selectedNavItem, setSelectedNavItem] =
    useState<string | null>("Reactions");

  const [asciiSettings, setAsciiSettings] = useState<{
    columns: number;
    characterSet: AsciiCharacterSet;
  }>({
    columns: 160,
    characterSet: "dense",
  });

  const [pixelSettings, setPixelSettings] = useState({
  pixelSize: 12,
  shape: "square" as "square" | "circle",
  gap: 0,
});

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Camera Section */}
      <section className="px-4 pt-6">

        <div className="mx-auto max-w-5xl">

          {/* Camera Card */}
          <div className="relative overflow-hidden rounded-2xl">

            <div className="relative aspect-video bg-black">

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
                />
              )}

            </div>

          </div>


          {/* ASCII SETTINGS */}
          {selectedNavItem === "ASCII CAM" && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">

              <h2 className="mb-5 text-lg font-semibold">
                ASCII Settings
              </h2>


              {/* Density */}
              <div className="mb-6">

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-sm text-zinc-300">
                    Density
                  </label>

                  <span className="text-sm text-zinc-500">
                    {asciiSettings.columns}
                  </span>

                </div>

                <input
                  type="range"
                  min="50"
                  max="220"
                  value={asciiSettings.columns}
                  onChange={(e) =>
                    setAsciiSettings((prev) => ({
                      ...prev,
                      columns: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                />

              </div>


              {/* Character Set */}
              <div>

                <label className="mb-2 block text-sm text-zinc-300">
                  Character Set
                </label>

                <select
                  value={asciiSettings.characterSet}
                  onChange={(e) =>
                    setAsciiSettings((prev) => ({
                      ...prev,
                      characterSet:
                        e.target.value as AsciiCharacterSet,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
                >

                  <option value="dense">
                    Dense
                  </option>

                  <option value="classic">
                    Classic
                  </option>

                  <option value="simple">
                    Simple
                  </option>

                </select>

              </div>

            </div>
          )}

         {selectedNavItem === "Pixel Cam" && (
  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">

    <h2 className="mb-5 text-lg font-semibold">
      Pixel Settings
    </h2>

    {/* Pixel Size */}
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm text-zinc-300">
          Pixel Size
        </label>

        <span className="text-sm text-zinc-500">
          {pixelSettings.pixelSize}px
        </span>
      </div>

      <input
        type="range"
        min="4"
        max="30"
        value={pixelSettings.pixelSize}
        onChange={(e) =>
          setPixelSettings((prev) => ({
            ...prev,
            pixelSize: Number(e.target.value),
          }))
        }
        className="w-full"
      />
    </div>

    {/* Pixel Shape */}
    <div className="mt-6">
      <label className="mb-2 block text-sm text-zinc-300">
        Pixel Shape
      </label>

      <select
        value={pixelSettings.shape}
        onChange={(e) =>
          setPixelSettings((prev) => ({
            ...prev,
            shape: e.target.value as "square" | "circle",
          }))
        }
        className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white"
      >
        <option value="square">Square</option>
        <option value="circle">Circle</option>
      </select>
    </div>

    {/* Pixel Gap */}
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm text-zinc-300">
          Pixel Gap
        </label>

        <span className="text-sm text-zinc-500">
          {pixelSettings.gap}px
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="8"
        value={pixelSettings.gap}
        onChange={(e) =>
          setPixelSettings((prev) => ({
            ...prev,
            gap: Number(e.target.value),
          }))
        }
        className="w-full"
      />
    </div>

  </div>
)}

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