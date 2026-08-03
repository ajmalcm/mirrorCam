import { NextRequest, NextResponse } from "next/server";

const expressionMap: Record<string, string[]> = {
  happy: [
    "happy dance",
    "celebration",
    "victory",
    "excited",
    "lets go",
  ],
  sad: [
    "crying",
    "sad meme",
    "heartbreak",
  ],
  angry: [
    "rage",
    "table flip",
    "mad",
  ],
  surprised: [
    "mind blown",
    "shocked",
    "what?!",
  ],
  neutral: [
    "awkward",
    "confused",
    "blank stare",
  ],
  fearful: [
    "scared",
    "panic",
  ],
  disgusted: [
    "eww",
    "gross",
  ],
};

export async function GET(request: NextRequest) {
  try {
    const expression =
      request.nextUrl.searchParams.get("expression");

    if (!expression) {
      return NextResponse.json(
        { error: "Expression is required" },
        { status: 400 }
      );
    }

    const possibleSearches =
      expressionMap[expression] ?? [expression];

    const searchTerm =
      possibleSearches[
        Math.floor(Math.random() * possibleSearches.length)
      ];

    const apiKey = process.env.GIPHY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Giphy API key" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(
        searchTerm
      )}&limit=25&rating=g`
    );

    const data = await response.json();

    if (!data.data.length) {
      return NextResponse.json(
        { error: "No GIFs found" },
        { status: 404 }
      );
    }

    const randomGif =
      data.data[Math.floor(Math.random() * data.data.length)];

    return NextResponse.json({
      expression,
      searchTerm,
      gifUrl: randomGif.images.original.url,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}