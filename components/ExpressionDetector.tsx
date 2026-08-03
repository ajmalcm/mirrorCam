"use client";

import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { loadFaceApiModels } from "@/lib/faceApiLoader";

type ExpressionDetectorProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setGifUrl?: React.Dispatch<React.SetStateAction<string | null>>;
};

const ExpressionDetector = ({ videoRef, setGifUrl }: ExpressionDetectorProps) => {
  const candidateExpression = useRef<string | null>(null);
  const candidateStartTime = useRef<number>(0);
  const stableExpression = useRef<string | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let isDetecting = false;

    const initialize = async () => {
      try {
        // Load the AI models
        await loadFaceApiModels();
        console.log("Face API models loaded");

        const video = videoRef.current;

        if (!video) {
          console.error("Video element not found");
          return;
        }

        const detectLoop = async () => {
          // Prevent multiple detections running simultaneously
          if (!isDetecting) {
            isDetecting = true;

            try {
              const result = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();
              if (result) {
                const expressions = result.expressions;

                // Find the expression with the highest confidence
                const currentExpression = Object.entries(expressions).reduce(
                  (highest, current) => {
                    return current[1] > highest[1] ? current : highest;
                  },
                )[0];

                const now = Date.now();

                // First time seeing an expression
                if (candidateExpression.current === null) {
                  candidateExpression.current = currentExpression;
                  candidateStartTime.current = now;
                }

                // Expression changed
                else if (candidateExpression.current !== currentExpression) {
                  candidateExpression.current = currentExpression;
                  candidateStartTime.current = now;
                }

                // Same expression continues
                else {
                  const heldTime = now - candidateStartTime.current;

                  if (
                    heldTime >= 800 &&
                    stableExpression.current !== currentExpression
                  ) {
                    stableExpression.current = currentExpression;

                    console.clear();
                    console.log("🎉 Stable Expression:", currentExpression);
                    // Fetch GIF
                    await fetch(`/api/gif-search?expression=${currentExpression}`)
                      .then((response) => response.json())
                      .then((data) => {
                        if (data.gifUrl && setGifUrl) {
                          setGifUrl(data.gifUrl);
                        } else {
                          console.error("No GIF URL found in response");
                        }
                      })
                      .catch((error) => {
                        console.error("Error fetching GIF:", error);
                      });
                  }
                }
              } else {
                console.clear();
                console.log("🙈 No face detected");
              }
            } catch (error) {
              console.error(error);
            }

            isDetecting = false;
          }

          animationFrameId = requestAnimationFrame(detectLoop);
        };

        const handlePlaying = () => {
          console.log("🎥 Camera started");

          detectLoop();
        };

        video.addEventListener("playing", handlePlaying);

        return () => {
          video.removeEventListener("playing", handlePlaying);
          cancelAnimationFrame(animationFrameId);
        };
      } catch (error) {
        console.error("Initialization failed:", error);
      }
    };

    let cleanup: (() => void) | undefined;

    initialize().then((fn) => {
      cleanup = fn;
    });

    return () => {
      cleanup?.();
    };
  }, [videoRef]);

  return null;
};

export default ExpressionDetector;
