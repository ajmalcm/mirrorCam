
"use client";

import { useEffect, useRef } from "react";

type CanvasFilterProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
};

const CanvasFilter = ({
  videoRef,
  enabled,
}: CanvasFilterProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

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
      These control the ASCII resolution.

      More columns = more detail.
      Fewer columns = bigger ASCII characters.

      Start with 100.
    */
    const columns = 160;

    /*
      ASCII characters from dark → bright.

      Using a longer character set gives
      us smoother visual transitions.
    */
    const characters =
      " .,:;irsXA253hMHGS#9B&@";

    const drawAsciiFrame = () => {
      if (!isActive) {
        return;
      }

      if (!video.videoWidth || !video.videoHeight) {
        animationFrameId =
          requestAnimationFrame(drawAsciiFrame);

        return;
      }

      /*
        The actual canvas should match
        the camera aspect ratio.

        We're NOT making the canvas
        100 pixels wide.

        100 is only our ASCII grid.
      */
      const canvasWidth = 1000;

      const canvasHeight = Math.floor(
        (video.videoHeight / video.videoWidth) *
          canvasWidth
      );

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      /*
        We create a temporary small canvas.

        This is where we reduce the camera
        to our ASCII resolution.
      */
      const sampleCanvas =
        document.createElement("canvas");

      const rows = Math.floor(
        columns *
          (video.videoHeight /
            video.videoWidth) *
          0.5
      );

      sampleCanvas.width = columns;
      sampleCanvas.height = rows;

      const sampleContext =
        sampleCanvas.getContext("2d");

      if (!sampleContext) {
        return;
      }

      /*
        Draw the camera into the small
        sampling canvas.

        Example:

        Camera:
        1280 × 720

        becomes:

        100 × ~28
      */
      sampleContext.drawImage(
        video,
        0,
        0,
        columns,
        rows
      );

      /*
        Get the reduced image pixels.
      */
      const imageData =
        sampleContext.getImageData(
          0,
          0,
          columns,
          rows
        );

      const pixels = imageData.data;

      /*
        Clear the main canvas.
      */
      context.fillStyle = "black";

      context.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
      );

      /*
        Calculate the size of each
        ASCII character.

        Every sampled pixel becomes
        one character.
      */
      const cellWidth =
        canvasWidth / columns;

      const cellHeight =
        canvasHeight / rows;

      /*
        Use a monospace font so every
        character occupies the same width.
      */
      const fontSize =
        cellHeight * 0.9;

      context.font = `${fontSize}px monospace`;

      context.textBaseline = "top";

      /*
        Loop through our ASCII grid.
      */
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const index =
            (y * columns + x) * 4;

          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];

          /*
            Convert RGB → brightness.

            0   = black
            255 = white
          */
          const brightness =
            0.299 * r +
            0.587 * g +
            0.114 * b;

          /*
            Convert brightness into
            an ASCII character.
          */
          const characterIndex =
            Math.floor(
              (brightness / 255) *
                (characters.length - 1)
            );

          const character =
            characters[characterIndex];

          /*
            Use the original camera
            color for the ASCII character.

            This makes the ASCII camera
            much more visually interesting.
          */
          context.fillStyle =
            `rgb(${r}, ${g}, ${b})`;

          /*
            Draw the character.
          */
          context.fillText(
            character,
            x * cellWidth,
            y * cellHeight
          );
        }
      }

      /*
        Request the next camera frame.
      */
      animationFrameId =
        requestAnimationFrame(drawAsciiFrame);
    };

    drawAsciiFrame();

    /*
      Cleanup when ASCII mode
      is disabled.
    */
    return () => {
      isActive = false;

      cancelAnimationFrame(
        animationFrameId
      );
    };
  }, [videoRef, enabled]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full -scale-x-100"
    />
  );
};

export default CanvasFilter;
