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
      If disabled, don't run
      the canvas animation.
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
      IMPORTANT:

      Create the sampling canvas
      only ONCE.

      Previously we were creating
      this on every frame.
    */

    const sampleCanvas =
      document.createElement("canvas");

    const sampleContext =
      sampleCanvas.getContext("2d");


    if (!sampleContext) {
      return;
    }


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
        Wait until camera dimensions
        are available.
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
        Get current settings.

        These values come from React
        state.
      */

      const columns =
        asciiSettings.columns;

      const characters =
        ASCII_CHARACTER_SETS[
          asciiSettings.characterSet
        ];


      /*
        Main canvas resolution.
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

        The 0.5 compensates for the
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
        Draw camera into tiny canvas.

        Example:

        Camera
        1280 × 720

        ↓

        ASCII grid
        160 × ~45
      */

      sampleContext.drawImage(
        video,
        0,
        0,
        columns,
        rows
      );


      /*
        Get pixel information.
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
        Clear main canvas.
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
        Calculate size of each
        ASCII cell.
      */

      const cellWidth =
        canvasWidth /
        columns;

      const cellHeight =
        canvasHeight /
        rows;


      /*
        Font size follows the
        cell height.
      */

      const fontSize =
        cellHeight * 0.9;


      context.font =
        `${fontSize}px monospace`;

      context.textBaseline =
        "top";


      /*
        Convert every sampled pixel
        into one character.
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
            Convert RGB → brightness.

            0   = black
            255 = white
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
            Keep original camera
            color.
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


      const pixelSize = pixelSettings.pixelSize;


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
        Get pixel information.
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
        Turn image into blocks.
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

          const index =
            (y * canvasWidth + x) * 4;


          const r =
            pixels[index];

          const g =
            pixels[index + 1];

          const b =
            pixels[index + 2];


          context.fillStyle =
            `rgb(${r}, ${g}, ${b})`;


          const drawSize = pixelSize - pixelSettings.gap;
          if (pixelSettings.shape === "square") {
  context.fillRect(
    x + pixelSettings.gap / 2,
    y + pixelSettings.gap / 2,
    drawSize,
    drawSize
  );
}

if (pixelSettings.shape === "circle") {
  context.beginPath();

  context.arc(
    x + pixelSize / 2,
    y + pixelSize / 2,
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

      /*
        Clear canvas when effect
        is stopped.
      */

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
    pixelSettings
  ]);


  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full -scale-x-100"
    />
  );
};


export default CanvasFilter;