"use client";

import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { loadFaceApiModels } from "@/lib/faceApiLoader";

type ExpressionDetectorProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setGifUrl?: React.Dispatch<React.SetStateAction<string | null>>;
  enabled: boolean;
};

const ExpressionDetector = ({
  videoRef,
  setGifUrl,
  enabled,
}: ExpressionDetectorProps) => {
  const candidateExpression = useRef<string | null>(null);
  const candidateStartTime = useRef(0);
  const stableExpression = useRef<string | null>(null);

  useEffect(() => {
    // If Reaction mode is disabled,
    // reset the previous detection session.
    if (!enabled) {
      candidateExpression.current = null;
      candidateStartTime.current = 0;
      stableExpression.current = null;

      return;
    }

    let animationFrameId: number | null = null;
    let isDetecting = false;
    let isActive = true;

    const initialize = async () => {
      try {
        // Load Face API models
        await loadFaceApiModels();

        // User may have switched modes
        // while models were loading.
        if (!isActive) {
          return;
        }

        console.log("Face API models loaded");

        const video = videoRef.current;

        if (!video) {
          console.error("Video element not found");
          return;
        }

        const detectLoop = async () => {
          // Stop the loop if Reaction mode is no longer active.
          if (!isActive) {
            return;
          }

          // Prevent multiple face detections
          // from running simultaneously.
          if (!isDetecting) {
            isDetecting = true;

            try {
              const result = await faceapi
                .detectSingleFace(
                  video,
                  new faceapi.TinyFaceDetectorOptions()
                )
                .withFaceExpressions();

              // The user may have switched modes
              // while face detection was running.
              if (!isActive) {
                isDetecting = false;
                return;
              }

              if (result) {
                const expressions = result.expressions;

                // Find the expression with the highest confidence.
                const currentExpression = Object.entries(
                  expressions
                ).reduce((highest, current) => {
                  return current[1] > highest[1]
                    ? current
                    : highest;
                })[0];

                const now = Date.now();

                // First time seeing an expression.
                if (candidateExpression.current === null) {
                  candidateExpression.current =
                    currentExpression;

                  candidateStartTime.current = now;
                }

                // Expression changed.
                else if (
                  candidateExpression.current !==
                  currentExpression
                ) {
                  candidateExpression.current =
                    currentExpression;

                  candidateStartTime.current = now;
                }

                // Same expression continues.
                else {
                  const heldTime =
                    now - candidateStartTime.current;

                  // Expression has been held for 800ms
                  // and hasn't already been processed.
                  if (
                    heldTime >= 800 &&
                    stableExpression.current !==
                      currentExpression
                  ) {
                    stableExpression.current =
                      currentExpression;

                    console.log(
                      "🎉 Stable Expression:",
                      currentExpression
                    );

                    // Make sure Reaction mode
                    // is still active.
                    if (!isActive) {
                      isDetecting = false;
                      return;
                    }

                    try {
                      const response = await fetch(
                        `/api/gif-search?expression=${currentExpression}`
                      );

                      const data = await response.json();

                      // Don't update the UI if the user
                      // switched modes while the request
                      // was running.
                      if (!isActive) {
                        isDetecting = false;
                        return;
                      }

                      if (data.gifUrl && setGifUrl) {
                        setGifUrl(data.gifUrl);
                      } else {
                        console.error(
                          "No GIF URL found in response"
                        );
                      }
                    } catch (error) {
                      if (isActive) {
                        console.error(
                          "Error fetching GIF:",
                          error
                        );
                      }
                    }
                  }
                }
              } else {
                console.log("🙈 No face detected");
              }
            } catch (error) {
              if (isActive) {
                console.error(error);
              }
            }

            isDetecting = false;
          }

          // Continue the detection loop only
          // while Reaction mode is active.
          if (isActive) {
            animationFrameId =
              requestAnimationFrame(detectLoop);
          }
        };

        const handlePlaying = () => {
          if (!isActive) {
            return;
          }

          console.log("🎥 Camera started");

          detectLoop();
        };

        video.addEventListener(
          "playing",
          handlePlaying
        );

        // If the camera is already playing
        // when the detector starts.
        if (!video.paused) {
          handlePlaying();
        }

        // Cleanup for the video event listener.
        return () => {
          video.removeEventListener(
            "playing",
            handlePlaying
          );
        };
      } catch (error) {
        if (isActive) {
          console.error(
            "Initialization failed:",
            error
          );
        }
      }
    };

    let cleanup: (() => void) | undefined;

    initialize().then((fn) => {
      cleanup = fn;
    });

    // React cleanup.
    return () => {
      console.log(
        "🛑 Expression detection stopped"
      );

      // Kill switch for async operations
      // and the detection loop.
      isActive = false;

      // Stop requestAnimationFrame.
      if (animationFrameId !== null) {
        cancelAnimationFrame(
          animationFrameId
        );
      }

      // Remove the video event listener.
      cleanup?.();

      // Reset detection state so that
      // the next Reaction session starts fresh.
      candidateExpression.current = null;
      candidateStartTime.current = 0;
      stableExpression.current = null;
    };
  }, [videoRef, enabled, setGifUrl]);

  // This component only performs detection.
  return null;
};

export default ExpressionDetector;