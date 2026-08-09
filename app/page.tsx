"use client";

import { useRef, useState } from "react";

import CameraFeed from "@/components/CameraFeed";
import ExpressionDetector from "@/components/ExpressionDetector";
import GifOverlay from "@/components/GifOverlay";
import NavBar from "@/components/NavBar";
import CanvasFilter from "@/components/CanvasFilter";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [selectedNavItem, setSelectedNavItem] = useState<string | null>("Reactions");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* Header */}
      {/* <header className="pt-10 pb-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          🎭 FunCam
        </h1>

        <p className="mt-3 text-slate-400">
          AI-powered expression reactions
        </p>
      </header> */}

      <section className="px-4">

        <div>

          {/* Camera Card */}
          <div className="relative overflow-hidden ">

            <div className="aspect-video bg-black">

              <CameraFeed ref={videoRef} />

              {
                selectedNavItem === "Reactions" && gifUrl &&
                <GifOverlay gifUrl={gifUrl} />
                }

                {selectedNavItem == "ASCII CAM" && (
    <CanvasFilter
      videoRef={videoRef}
      enabled={selectedNavItem === "ASCII CAM"}
    />
  )}

            </div>

          </div>

          {/* Future Status Panel */}
          {/* <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-lg p-6">

            <h2 className="text-lg font-semibold mb-5">
              Detection Status
            </h2>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">

              <div>
                <p className="text-sm text-slate-400">
                  Current Expression
                </p>

                <p className="mt-1 font-medium">
                  Waiting...
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Confidence
                </p>

                <p className="mt-1 font-medium">
                  --
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Detection
                </p>

                <p className="mt-1 text-green-400 font-medium">
                  Running
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Filter
                </p>

                <p className="mt-1 font-medium">
                  None
                </p>
              </div>

            </div>

          </div> */}

        </div>

      </section>

      
        <ExpressionDetector
  videoRef={videoRef}
  setGifUrl={setGifUrl}
  enabled={selectedNavItem === "Reactions"}
/>
      

      <NavBar setSelectedNavItem={setSelectedNavItem} selectedNavItem={selectedNavItem} />

    </main>
  );
}