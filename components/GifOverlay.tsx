"use client";

type GifOverlayProps = {
  gifUrl: string | null;
};

const GifOverlay = ({ gifUrl }: GifOverlayProps) => {
  if (!gifUrl) return null;

  return (
    <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
      <div className="rounded-2xl bg-black/40 backdrop-blur-md p-2 shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
        <img
          src={gifUrl}
          alt="Reaction GIF"
          className="w-28 sm:w-36 md:w-44 lg:w-64 rounded-xl"
        />
      </div>
    </div>
  );
};

export default GifOverlay;