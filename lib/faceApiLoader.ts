import * as faceapi from "face-api.js";

let modelLoadPromise: Promise<void> | null = null;

export async function loadFaceApiModels(): Promise<void> {
  // If we've already started loading (or already finished),
  // return the same Promise.
  if (modelLoadPromise) {
    return modelLoadPromise;
  }

  // First time: start loading and save the Promise.
  modelLoadPromise = Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  ]).then(() => {
    console.log("Face API models loaded");
  });

  return modelLoadPromise;
}