"use client";

import { useEffect, useRef } from "react";

type AsciiCharacterSet = "classic" | "dense" | "simple";

type ColorMode = "original" | "bw" | "monochrome";

type CanvasFilterProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  mode: string | null;

  asciiSettings: {
    columns: number;
    characterSet: AsciiCharacterSet;
  };

  pixelSettings: {
    pixelSize: number;
    shape: "square" | "circle";
    gap: number;
    brightness: number;
    contrast: number;
  };

  colorSettings: {
    mode: ColorMode;
    color: string;
  };

  glitchSettings: {
    rgbSplit: number;
    slices: number;
    sliceSize: number;
    intensity: number;
    // sliceIntensity: number;
    // frequency: number;
    // scanlines: boolean;
    // noise: number;
  };
};

/*
  Different ASCII character sets.

  Dark → bright
*/
const ASCII_CHARACTER_SETS: Record<AsciiCharacterSet, string> = {
  classic: " .:-=+*#%@",

  dense: " .,:;irsXA253hMHGS#9B&@",

  simple: " .:-=+*#@",
};

const CanvasFilter = ({
  videoRef,
  enabled,
  mode,
  asciiSettings,
  pixelSettings,
  colorSettings,
  glitchSettings,
}: CanvasFilterProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    /*
      Don't run the canvas renderer
      when the effect is disabled.
    */
    if (!enabled) {
      return;
    }

    const video = videoRef.current;

    const canvas = canvasRef.current;

    const getColor = (r: number, g: number, b: number) => {
      if (colorSettings.mode === "original") {
        return `rgb(${r}, ${g}, ${b})`;
      }

      if (colorSettings.mode === "bw") {
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        return `rgb(${brightness}, ${brightness}, ${brightness})`;
      }

      if (colorSettings.mode === "monochrome") {
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        const hex = colorSettings.color;

        const red = parseInt(hex.slice(1, 3), 16);

        const green = parseInt(hex.slice(3, 5), 16);

        const blue = parseInt(hex.slice(5, 7), 16);

        const factor = brightness / 255;

        return `rgb(
      ${Math.round(red * factor)},
      ${Math.round(green * factor)},
      ${Math.round(blue * factor)}
    )`;
      }

      return `rgb(${r}, ${g}, ${b})`;
    };

    if (!video || !canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let animationFrameId: number;

    let isActive = true;

    /*
      Sampling canvas.

      We reuse this instead of creating
      a new canvas on every frame.
    */
    const sampleCanvas = document.createElement("canvas");

    const sampleContext = sampleCanvas.getContext("2d");

    if (!sampleContext) {
      return;
    }

    /*
      ==================================
      BRIGHTNESS + CONTRAST
      ==================================
    */

    const clamp = (value: number) => Math.max(0, Math.min(255, value));

    const adjustColor = (r: number, g: number, b: number) => {
      /*
        ------------------------------
        Brightness
        ------------------------------

        -100 = darker
         0   = original
        +100 = brighter
      */

      let adjustedR = r + pixelSettings.brightness;

      let adjustedG = g + pixelSettings.brightness;

      let adjustedB = b + pixelSettings.brightness;

      /*
        Clamp brightness.
      */

      adjustedR = clamp(adjustedR);

      adjustedG = clamp(adjustedG);

      adjustedB = clamp(adjustedB);

      /*
        ------------------------------
        Contrast
        ------------------------------

        -100 = low contrast
         0   = original
        +100 = high contrast
      */

      const factor =
        (259 * (pixelSettings.contrast + 255)) /
        (255 * (259 - pixelSettings.contrast));

      adjustedR = factor * (adjustedR - 128) + 128;

      adjustedG = factor * (adjustedG - 128) + 128;

      adjustedB = factor * (adjustedB - 128) + 128;

      /*
        Clamp contrast result.
      */

      adjustedR = clamp(adjustedR);

      adjustedG = clamp(adjustedG);

      adjustedB = clamp(adjustedB);

      return {
        r: adjustedR,
        g: adjustedG,
        b: adjustedB,
      };
    };

    /*
      ============================
      ASCII
      ============================
    */

    const drawAsciiFrame = () => {
      if (!isActive) {
        return;
      }

      /*
        Wait for camera dimensions.
      */

      if (!video.videoWidth || !video.videoHeight) {
        animationFrameId = requestAnimationFrame(drawAsciiFrame);

        return;
      }

      /*
        Get ASCII settings.
      */

      const columns = asciiSettings.columns;

      const characters = ASCII_CHARACTER_SETS[asciiSettings.characterSet];

      /*
        Main canvas.
      */

      const canvasWidth = 1000;

      const canvasHeight = Math.floor(
        (video.videoHeight / video.videoWidth) * canvasWidth,
      );

      canvas.width = canvasWidth;

      canvas.height = canvasHeight;

      /*
        Calculate ASCII rows.

        0.5 compensates for the
        rectangular shape of characters.
      */

      const rows = Math.floor(
        columns * (video.videoHeight / video.videoWidth) * 0.5,
      );

      /*
        Resize sampling canvas.
      */

      sampleCanvas.width = columns;

      sampleCanvas.height = rows;

      /*
        Draw camera into small
        sampling canvas.
      */

      sampleContext.drawImage(video, 0, 0, columns, rows);

      /*
        Read pixels.
      */

      const imageData = sampleContext.getImageData(0, 0, columns, rows);

      const pixels = imageData.data;

      /*
        Clear canvas.
      */

      context.fillStyle = "black";

      context.fillRect(0, 0, canvasWidth, canvasHeight);

      /*
        ASCII cell dimensions.
      */

      const cellWidth = canvasWidth / columns;

      const cellHeight = canvasHeight / rows;

      const fontSize = cellHeight * 0.9;

      context.font = `${fontSize}px monospace`;

      context.textBaseline = "top";

      /*
        Convert pixels → ASCII.
      */

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const index = (y * columns + x) * 4;

          const r = pixels[index];

          const g = pixels[index + 1];

          const b = pixels[index + 2];

          /*
            RGB → brightness.
          */

          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

          /*
            Brightness → character.
          */

          const characterIndex = Math.floor(
            (brightness / 255) * (characters.length - 1),
          );

          const character = characters[characterIndex];

          /*
            Keep original color.
          */

          context.fillStyle = getColor(r, g, b);

          /*
            Draw character.
          */

          context.fillText(character, x * cellWidth, y * cellHeight);
        }
      }

      /*
        Next frame.
      */

      animationFrameId = requestAnimationFrame(drawAsciiFrame);
    };

    /*
      ============================
      PIXEL
      ============================
    */

    const drawPixelFrame = () => {
      if (!isActive) {
        return;
      }

      /*
        Wait for camera dimensions.
      */

      if (!video.videoWidth || !video.videoHeight) {
        animationFrameId = requestAnimationFrame(drawPixelFrame);

        return;
      }

      /*
        Main canvas.
      */

      const canvasWidth = 1000;

      const canvasHeight = Math.floor(
        (video.videoHeight / video.videoWidth) * canvasWidth,
      );

      canvas.width = canvasWidth;

      canvas.height = canvasHeight;

      /*
        Pixel size.
      */

      const pixelSize = pixelSettings.pixelSize;

      /*
        Draw normal camera frame.
      */

      context.drawImage(video, 0, 0, canvasWidth, canvasHeight);

      /*
        Read camera pixels.
      */

      const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);

      const pixels = imageData.data;

      /*
        Draw pixel blocks.
      */

      for (let y = 0; y < canvasHeight; y += pixelSize) {
        for (let x = 0; x < canvasWidth; x += pixelSize) {
          /*
            Find the pixel at
            the top-left of the block.
          */

          const index = (y * canvasWidth + x) * 4;

          const r = pixels[index];

          const g = pixels[index + 1];

          const b = pixels[index + 2];

          /*
            Apply brightness
            and contrast.
          */

          const adjusted = adjustColor(r, g, b);

          /*
            Use adjusted color.
          */

          context.fillStyle = getColor(adjusted.r, adjusted.g, adjusted.b);

          /*
            Gap between pixels.
          */

          const drawSize = Math.max(1, pixelSize - pixelSettings.gap);

          /*
            =========================
            SQUARE
            =========================
          */

          if (pixelSettings.shape === "square") {
            context.fillRect(
              x + pixelSettings.gap / 2,

              y + pixelSettings.gap / 2,

              drawSize,
              drawSize,
            );
          }

          /*
            =========================
            CIRCLE
            =========================
          */

          if (pixelSettings.shape === "circle") {
            context.beginPath();

            context.arc(
              x + pixelSize / 2,

              y + pixelSize / 2,

              drawSize / 2,

              0,
              Math.PI * 2,
            );

            context.fill();
          }
        }
      }

      /*
        Next frame.
      */

      animationFrameId = requestAnimationFrame(drawPixelFrame);
    };

    //glitch effect 
     const drawGlitchFrame = () => {
  if (!isActive) {
    return;
  }

  if (
    !video.videoWidth ||
    !video.videoHeight
  ) {
    animationFrameId =
      requestAnimationFrame(drawGlitchFrame);

    return;
  }

  const canvasWidth = 1000;

  const canvasHeight = Math.floor(
    (video.videoHeight /
      video.videoWidth) *
      canvasWidth
  );

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  /*
    Draw the original camera frame.
  */

  context.drawImage(
    video,
    0,
    0,
    canvasWidth,
    canvasHeight
  );

  /*
    ============================
    RGB SPLIT
    ============================
  */

  const imageData = context.getImageData(
    0,
    0,
    canvasWidth,
    canvasHeight
  );

  const source = imageData.data;

  const output = context.createImageData(
    canvasWidth,
    canvasHeight
  );

  const destination = output.data;

  const split =
    glitchSettings.rgbSplit;

  for (
    let y = 0;
    y < canvasHeight;
    y++
  ) {
    for (
      let x = 0;
      x < canvasWidth;
      x++
    ) {
      const index =
        (y * canvasWidth + x) * 4;

      /*
        RED shifted right.
      */

      const redX = Math.min(
        canvasWidth - 1,
        x + split
      );

      const redIndex =
        (y * canvasWidth + redX) * 4;

      /*
        BLUE shifted left.
      */

      const blueX = Math.max(
        0,
        x - split
      );

      const blueIndex =
        (y * canvasWidth + blueX) * 4;

      /*
        GREEN stays normal.
      */

      destination[index] =
        source[redIndex];

      destination[index + 1] =
        source[index + 1];

      destination[index + 2] =
        source[blueIndex + 2];

      destination[index + 3] = 255;
    }
  }

  context.putImageData(
    output,
    0,
    0
  );

  /*
    ============================
    HORIZONTAL GLITCH SLICES
    ============================
  */

  const sliceCount =
    glitchSettings.slices;

  const intensity =
    glitchSettings.intensity;

  const maxSliceSize =
    glitchSettings.sliceSize;

  for (
    let i = 0;
    i < sliceCount;
    i++
  ) {
    /*
      Randomly decide whether
      this slice glitches.
    */

    if (
      Math.random() * 100 >
      intensity
    ) {
      continue;
    }

    /*
      Random Y position.
    */

    const y =
      Math.floor(
        Math.random() *
          canvasHeight
      );

    /*
      Random slice height.
    */

    const height =
      Math.max(
        2,
        Math.floor(
          Math.random() *
            maxSliceSize
        )
      );

    /*
      Random horizontal movement.

      Can move left or right.
    */

    const offset =
      Math.floor(
        (Math.random() * 2 - 1) *
          100
      );

    /*
      Make sure the slice
      stays inside the canvas.
    */

    const sourceY = Math.max(
      0,
      Math.min(
        y,
        canvasHeight - height
      )
    );

    /*
      Copy the slice.
    */

    const slice = context.getImageData(
      0,
      sourceY,
      canvasWidth,
      height
    );

    /*
      Clear the original slice.
    */

    context.clearRect(
      0,
      sourceY,
      canvasWidth,
      height
    );

    /*
      Draw the slice shifted.
    */

    context.putImageData(
      slice,
      offset,
      sourceY
    );
  }

  /*
    Next frame.
  */

  animationFrameId =
    requestAnimationFrame(
      drawGlitchFrame
    );
};

    /*
      ============================
      START EFFECT
      ============================
    */

    if (mode === "ASCII CAM") {
      drawAsciiFrame();
    }

    if (mode === "Pixel Cam") {
      drawPixelFrame();
    }

    if (mode === "Glitch") {
      drawGlitchFrame();
    }

    /*
      ============================
      CLEANUP
      ============================
    */

    return () => {
      isActive = false;

      cancelAnimationFrame(animationFrameId);

      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [videoRef, enabled, mode, asciiSettings, pixelSettings, colorSettings, glitchSettings]);

  /*
    Canvas element.

    CameraFeed remains underneath it.
  */

  return (
    <canvas
      ref={canvasRef}
      className="
        absolute
        inset-0
        h-full
        w-full
        object-cover
        -scale-x-100
      "
    />
  );
};

export default CanvasFilter;
