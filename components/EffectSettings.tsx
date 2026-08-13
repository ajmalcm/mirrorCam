"use client";

import { useState } from "react";

type AsciiCharacterSet =
  | "classic"
  | "dense"
  | "simple";


  type ColorMode = "original" | "bw" | "monochrome";

type EffectSettingsProps = {
  mode: string | null;

  asciiSettings: {
    columns: number;
    characterSet: "classic" | "dense" | "simple";
  };

  setAsciiSettings: React.Dispatch<
    React.SetStateAction<{
      columns: number;
      characterSet: "classic" | "dense" | "simple";
    }>
  >;

  pixelSettings: {
    pixelSize: number;
    shape: "square" | "circle";
    gap: number;
  };

  setPixelSettings: React.Dispatch<
    React.SetStateAction<{
      pixelSize: number;
      shape: "square" | "circle";
      gap: number;
      brightness: number;
      contrast: number;
    }>
  >;

  colorSettings: {
    mode: ColorMode;
    color: string;
  };

  setColorSettings: React.Dispatch<
    React.SetStateAction<{
      mode: ColorMode;
      color: string;
    }>
  >;

  glitchSettings: {
    rgbSplit: number;
    intensity: number;
    slices: number;
    sliceSize: number;
    // sliceIntensity: number;
    // frequency: number;
    // scanlines: boolean;
    // noise: number;
  };

  setGlitchSettings: React.Dispatch<
    React.SetStateAction<{
      rgbSplit: number;
      slices: number;
      sliceSize: number;
      intensity: number;
    }>
  >;
};


const EffectSettings = ({
  mode,
  asciiSettings,
  setAsciiSettings,
  pixelSettings,
  setPixelSettings,
  colorSettings,
  setColorSettings,
  glitchSettings,
  setGlitchSettings,
}: EffectSettingsProps) => {

  /*
    Controls whether the
    settings panel is visible.
  */

  const [isOpen, setIsOpen] = useState(false);

  /*
    Don't show settings for
    Reactions or unknown modes.
  */

  if (
    mode !== "ASCII CAM" &&
    mode !== "Pixel Cam" &&
    mode !== "Glitch"
  ) {
    return null;
  }

  return (
    <div className="absolute right-4 top-4 z-20">

      {/* Settings Button */}

      <button
        onClick={() =>
          setIsOpen((previous) => !previous)
        }
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          border
          border-white/10
          bg-black/40
          text-lg
          text-white
          shadow-lg
          backdrop-blur-xl
          transition
          hover:bg-white/10
        "
        aria-label="Open settings"
      >
        ⚙
      </button>


      {/* Settings Panel */}

      {isOpen && (
        <div
          className="
            absolute
            right-0
            top-12
            w-72
            rounded-2xl
            border
            border-white/10
            bg-black/50
            p-5
            text-white
            shadow-2xl
            backdrop-blur-2xl
          "
        >

          {/* Header */}

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="font-semibold">
                {mode === "ASCII CAM"
                  ? "ASCII Settings"
                  : "Pixel Settings"}
              </h2>

              <p className="mt-1 text-xs text-zinc-400">
                Customize your effect
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="
                text-zinc-400
                transition
                hover:text-white
              "
            >
              ✕
            </button>

          </div>


          {/* ASCII SETTINGS */}

          {mode === "ASCII CAM" && (
            <div className="space-y-6">

              {/* Density */}

              <div>

                <div className="mb-2 flex justify-between">

                  <label className="text-sm text-zinc-300">
                    Density
                  </label>

                  <span className="text-xs text-zinc-500">
                    {asciiSettings.columns}
                  </span>

                </div>

                <input
                  type="range"
                  min="50"
                  max="220"
                  value={asciiSettings.columns}
                  onChange={(e) =>
                    setAsciiSettings((previous) => ({
                      ...previous,
                      columns: Number(
                        e.target.value
                      ),
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
                    setAsciiSettings((previous) => ({
                      ...previous,
                      characterSet:
                        e.target.value as AsciiCharacterSet,
                    }))
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-white/10
                    bg-zinc-900/80
                    px-3
                    py-2
                    text-sm
                    text-white
                    outline-none
                  "
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


          {/* PIXEL SETTINGS */}

          {mode === "Pixel Cam" && (
            <div className="space-y-6">

              {/* Pixel Size */}

              <div>

                <div className="mb-2 flex justify-between">

                  <label className="text-sm text-zinc-300">
                    Pixel Size
                  </label>

                  <span className="text-xs text-zinc-500">
                    {pixelSettings.pixelSize}px
                  </span>

                </div>

                <input
                  type="range"
                  min="4"
                  max="30"
                  value={pixelSettings.pixelSize}
                  onChange={(e) =>
                    setPixelSettings((previous) => ({
                      ...previous,
                      pixelSize: Number(
                        e.target.value
                      ),
                    }))
                  }
                  className="w-full"
                />

              </div>


              {/* Pixel Gap */}

              <div>

                <div className="mb-2 flex justify-between">

                  <label className="text-sm text-zinc-300">
                    Pixel Gap
                  </label>

                  <span className="text-xs text-zinc-500">
                    {pixelSettings.gap}px
                  </span>

                </div>

                <input
                  type="range"
                  min="0"
                  max="8"
                  value={pixelSettings.gap}
                  onChange={(e) =>
                    setPixelSettings((previous) => ({
                      ...previous,
                      gap: Number(
                        e.target.value
                      ),
                    }))
                  }
                  className="w-full"
                />

              </div>


              {/* Shape */}

              <div>

                <label className="mb-2 block text-sm text-zinc-300">
                  Pixel Shape
                </label>

                <select
                  value={pixelSettings.shape}
                  onChange={(e) =>
                    setPixelSettings((previous) => ({
                      ...previous,
                      shape:
                        e.target.value as
                          | "square"
                          | "circle",
                    }))
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-white/10
                    bg-zinc-900/80
                    px-3
                    py-2
                    text-sm
                    text-white
                    outline-none
                  "
                >

                  <option value="square">
                    Square
                  </option>

                  <option value="circle">
                    Circle
                  </option>

                </select>

              </div>

            </div>
          )}

          {/* GLITCH SETTINGS */}
          {mode === "Glitch" && (
  <div className="space-y-6">

    <h2 className="text-lg font-semibold text-white">
      ⚡ Glitch Settings
    </h2>

    {/* RGB Split */}
    <div>
      <div className="mb-2 flex justify-between">
        <label className="text-sm text-zinc-300">
          RGB Split
        </label>

        <span className="text-sm text-zinc-500">
          {glitchSettings.rgbSplit}px
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="40"
        value={glitchSettings.rgbSplit}
        onChange={(e) =>
          setGlitchSettings((prev) => ({
            ...prev,
            rgbSplit: Number(e.target.value),
          }))
        }
        className="w-full"
      />
    </div>

    {/* Intensity */}
    <div>
      <div className="mb-2 flex justify-between">
        <label className="text-sm text-zinc-300">
          Intensity
        </label>

        <span className="text-sm text-zinc-500">
          {glitchSettings.intensity}%
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={glitchSettings.intensity}
        onChange={(e) =>
          setGlitchSettings((prev) => ({
            ...prev,
            intensity: Number(e.target.value),
          }))
        }
        className="w-full"
      />
    </div>

    {/* Number of slices */}
    <div>
      <div className="mb-2 flex justify-between">
        <label className="text-sm text-zinc-300">
          Slices
        </label>

        <span className="text-sm text-zinc-500">
          {glitchSettings.slices}
        </span>
      </div>

      <input
        type="range"
        min="1"
        max="30"
        value={glitchSettings.slices}
        onChange={(e) =>
          setGlitchSettings((prev) => ({
            ...prev,
            slices: Number(e.target.value),
          }))
        }
        className="w-full"
      />
    </div>

    {/* Slice Size */}
    <div>
      <div className="mb-2 flex justify-between">
        <label className="text-sm text-zinc-300">
          Slice Size
        </label>

        <span className="text-sm text-zinc-500">
          {glitchSettings.sliceSize}px
        </span>
      </div>

      <input
        type="range"
        min="2"
        max="100"
        value={glitchSettings.sliceSize}
        onChange={(e) =>
          setGlitchSettings((prev) => ({
            ...prev,
            sliceSize: Number(e.target.value),
          }))
        }
        className="w-full"
      />
    </div>

  </div>
)}

          {/* COLOR SETTINGS */}

<div className="mt-6 border-t border-white/10 pt-6">

  <h3 className="mb-4 text-sm font-semibold text-white">
    Color
  </h3>

  {/* Color Mode */}

  <div>
    <label className="mb-2 block text-sm text-zinc-300">
      Color Mode
    </label>

    <select
      value={colorSettings.mode}
      onChange={(e) =>
        setColorSettings((prev) => ({
          ...prev,
          mode: e.target.value as ColorMode,
        }))
      }
      className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
    >
      <option value="original">
        Original
      </option>

      <option value="bw">
        Black & White
      </option>

      <option value="monochrome">
        Monochrome
      </option>
    </select>
  </div>


  {/* Color Picker */}

  {colorSettings.mode === "monochrome" && (
    <div className="mt-4">

      <label className="mb-2 block text-sm text-zinc-300">
        Color
      </label>

      <div className="flex items-center gap-3">

        <input
          type="color"
          value={colorSettings.color}
          onChange={(e) =>
            setColorSettings((prev) => ({
              ...prev,
              color: e.target.value,
            }))
          }
          className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
        />

        <span className="text-sm text-zinc-400">
          {colorSettings.color}
        </span>

      </div>

    </div>
  )}

</div>

        </div>
      )}

    </div>
  );
};

export default EffectSettings;