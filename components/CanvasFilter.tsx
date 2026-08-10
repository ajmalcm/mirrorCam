"use client";

import { useEffect, useRef } from "react";

type AsciiCharacterSet =
  | "classic"
  | "dense"
  | "simple";

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
};

/*
  Different ASCII character sets.

  Dark → bright
*/
const ASCII_CHARACTER_SETS: Record<
  AsciiCharacterSet,
  string
> = {
  classic: " .:-=+*#%@",

  dense:
    " .,:;irsXA253hMHGS#9B&@",

  simple:
    " .:-=+*#@",
};

const CanvasFilter = ({
  videoRef,
  enabled,
  mode,
  asciiSettings,
  pixelSettings,
}: CanvasFilterProps) => {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    /*
      Don't run the canvas renderer
      when the effect is disabled.
    */
    if (!enabled) {
      return;
    }

    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    const context =
      canvas.getContext("2d");

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
    const sampleCanvas =
      document.createElement("canvas");

    const sampleContext =
      sampleCanvas.getContext("2d");

    if (!sampleContext) {
      return;
    }

    /*
      ==================================
      BRIGHTNESS + CONTRAST
      ==================================
    */

    const clamp = (value: number) =>
      Math.max(
        0,
        Math.min(255, value)
      );

    const adjustColor = (
      r: number,
      g: number,
      b: number
    ) => {
      /*
        ------------------------------
        Brightness
        ------------------------------

        -100 = darker
         0   = original
        +100 = brighter
      */

      let adjustedR =
        r + pixelSettings.brightness;

      let adjustedG =
        g + pixelSettings.brightness;

      let adjustedB =
        b + pixelSettings.brightness;

      /*
        Clamp brightness.
      */

      adjustedR =
        clamp(adjustedR);

      adjustedG =
        clamp(adjustedG);

      adjustedB =
        clamp(adjustedB);

      /*
        ------------------------------
        Contrast
        ------------------------------

        -100 = low contrast
         0   = original
        +100 = high contrast
      */

      const factor =
        (259 *
          (pixelSettings.contrast + 255)) /
        (255 *
          (259 - pixelSettings.contrast));

      adjustedR =
        factor *
          (adjustedR - 128) +
        128;

      adjustedG =
        factor *
          (adjustedG - 128) +
        128;

      adjustedB =
        factor *
          (adjustedB - 128) +
        128;

      /*
        Clamp contrast result.
      */

      adjustedR =
        clamp(adjustedR);

      adjustedG =
        clamp(adjustedG);

      adjustedB =
        clamp(adjustedB);

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

      if (
        !video.videoWidth ||
        !video.videoHeight
      ) {
        animationFrameId =
          requestAnimationFrame(
            drawAsciiFrame
          );

        return;
      }

      /*
        Get ASCII settings.
      */

      const columns =
        asciiSettings.columns;

      const characters =
        ASCII_CHARACTER_SETS[
          asciiSettings.characterSet
        ];

      /*
        Main canvas.
      */

      const canvasWidth = 1000;

      const canvasHeight =
        Math.floor(
          (video.videoHeight /
            video.videoWidth) *
            canvasWidth
        );

      canvas.width =
        canvasWidth;

      canvas.height =
        canvasHeight;

      /*
        Calculate ASCII rows.

        0.5 compensates for the
        rectangular shape of characters.
      */

      const rows =
        Math.floor(
          columns *
            (video.videoHeight /
              video.videoWidth) *
            0.5
        );

      /*
        Resize sampling canvas.
      */

      sampleCanvas.width =
        columns;

      sampleCanvas.height =
        rows;

      /*
        Draw camera into small
        sampling canvas.
      */

      sampleContext.drawImage(
        video,
        0,
        0,
        columns,
        rows
      );

      /*
        Read pixels.
      */

      const imageData =
        sampleContext.getImageData(
          0,
          0,
          columns,
          rows
        );

      const pixels =
        imageData.data;

      /*
        Clear canvas.
      */

      context.fillStyle =
        "black";

      context.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
      );

      /*
        ASCII cell dimensions.
      */

      const cellWidth =
        canvasWidth /
        columns;

      const cellHeight =
        canvasHeight /
        rows;

      const fontSize =
        cellHeight * 0.9;

      context.font =
        `${fontSize}px monospace`;

      context.textBaseline =
        "top";

      /*
        Convert pixels → ASCII.
      */

      for (
        let y = 0;
        y < rows;
        y++
      ) {
        for (
          let x = 0;
          x < columns;
          x++
        ) {
          const index =
            (y * columns + x) * 4;

          const r =
            pixels[index];

          const g =
            pixels[index + 1];

          const b =
            pixels[index + 2];

          /*
            RGB → brightness.
          */

          const brightness =
            0.299 * r +
            0.587 * g +
            0.114 * b;

          /*
            Brightness → character.
          */

          const characterIndex =
            Math.floor(
              (brightness / 255) *
                (characters.length - 1)
            );

          const character =
            characters[
              characterIndex
            ];

          /*
            Keep original color.
          */

          context.fillStyle =
            `rgb(${r}, ${g}, ${b})`;

          /*
            Draw character.
          */

          context.fillText(
            character,
            x * cellWidth,
            y * cellHeight
          );
        }
      }

      /*
        Next frame.
      */

      animationFrameId =
        requestAnimationFrame(
          drawAsciiFrame
        );
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

      if (
        !video.videoWidth ||
        !video.videoHeight
      ) {
        animationFrameId =
          requestAnimationFrame(
            drawPixelFrame
          );

        return;
      }

      /*
        Main canvas.
      */

      const canvasWidth = 1000;

      const canvasHeight =
        Math.floor(
          (video.videoHeight /
            video.videoWidth) *
            canvasWidth
        );

      canvas.width =
        canvasWidth;

      canvas.height =
        canvasHeight;

      /*
        Pixel size.
      */

      const pixelSize =
        pixelSettings.pixelSize;

      /*
        Draw normal camera frame.
      */

      context.drawImage(
        video,
        0,
        0,
        canvasWidth,
        canvasHeight
      );

      /*
        Read camera pixels.
      */

      const imageData =
        context.getImageData(
          0,
          0,
          canvasWidth,
          canvasHeight
        );

      const pixels =
        imageData.data;

      /*
        Draw pixel blocks.
      */

      for (
        let y = 0;
        y < canvasHeight;
        y += pixelSize
      ) {
        for (
          let x = 0;
          x < canvasWidth;
          x += pixelSize
        ) {
          /*
            Find the pixel at
            the top-left of the block.
          */

          const index =
            (y * canvasWidth + x) * 4;

          const r =
            pixels[index];

          const g =
            pixels[index + 1];

          const b =
            pixels[index + 2];

          /*
            Apply brightness
            and contrast.
          */

          const adjusted =
            adjustColor(
              r,
              g,
              b
            );

          /*
            Use adjusted color.
          */

          context.fillStyle =
            `rgb(
              ${adjusted.r},
              ${adjusted.g},
              ${adjusted.b}
            )`;

          /*
            Gap between pixels.
          */

          const drawSize =
            Math.max(
              1,
              pixelSize -
                pixelSettings.gap
            );

          /*
            =========================
            SQUARE
            =========================
          */

          if (
            pixelSettings.shape ===
            "square"
          ) {
            context.fillRect(
              x +
                pixelSettings.gap /
                  2,

              y +
                pixelSettings.gap /
                  2,

              drawSize,
              drawSize
            );
          }

          /*
            =========================
            CIRCLE
            =========================
          */

          if (
            pixelSettings.shape ===
            "circle"
          ) {
            context.beginPath();

            context.arc(
              x +
                pixelSize / 2,

              y +
                pixelSize / 2,

              drawSize / 2,

              0,
              Math.PI * 2
            );

            context.fill();
          }
        }
      }

      /*
        Next frame.
      */

      animationFrameId =
        requestAnimationFrame(
          drawPixelFrame
        );
    };

    /*
      ============================
      START EFFECT
      ============================
    */

    if (
      mode === "ASCII CAM"
    ) {
      drawAsciiFrame();
    }

    if (
      mode === "Pixel Cam"
    ) {
      drawPixelFrame();
    }

    /*
      ============================
      CLEANUP
      ============================
    */

    return () => {
      isActive = false;

      cancelAnimationFrame(
        animationFrameId
      );

      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    };

  }, [
    videoRef,
    enabled,
    mode,
    asciiSettings,
    pixelSettings,
  ]);

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