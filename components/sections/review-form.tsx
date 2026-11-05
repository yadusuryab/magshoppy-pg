"use client";

import { useEffect, useRef, useState } from "react";

const MAX_IMAGES = 4;

export default function ReviewForm({
  onClose,
  shoeId,
}: {
  onClose: () => void;
  shoeId?: string;
}) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

 const addFiles = (list: FileList | null) => {
  if (!list) return;
  const picked = Array.from(list); // copy first
  if (inputRef.current) inputRef.current.value = "";
  setFiles((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
};

  const submit = async () => {
    setError(null);
    if (!name.trim()) return setError("Enter your name.");
    if (!rating) return setError("Choose a rating.");

    const body = new FormData();
    body.append("customerName", name.trim());
    body.append("rating", String(rating));
    body.append("reviewText", text.trim());
    if (shoeId) body.append("shoeId", shoeId);
    files.forEach((f) => body.append("images", f));

    try {
      setStatus("sending");
      const res = await fetch("/api/reviews", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit review.");
      setStatus("done");
    } catch (e: any) {
      setError(e.message);
      setStatus("idle");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Write a review"
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          ✕
        </button>

        {status === "done" ? (
          <div className="py-10 text-center">
            <p className="text-xl font-semibold">Review submitted</p>
            <p className="text-sm text-gray-500 mt-2">It will appear once approved.</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-5">Write a review</h3>

            <label className="block text-sm font-medium mb-1" htmlFor="rv-name">
              Name
            </label>
            <input
              id="rv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />

            <p className="text-sm font-medium mb-1">Rating</p>
            <div className="flex gap-1 mb-4" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => setRating(n)}
                  className={`text-3xl leading-none ${
                    n <= (hover || rating) ? "text-amber-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium mb-1" htmlFor="rv-text">
              Your review
            </label>
            <textarea
              id="rv-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />

            <p className="text-sm font-medium mb-1">
              Photos ({files.length}/{MAX_IMAGES})
            </p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {previews.map((src, i) => (
               <div key={src} className="relative aspect-[9/16] rounded-lg overflow-hidden">
  <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {files.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="aspect-[9/16] rounded-lg border-2 border-dashed text-gray-400 text-2xl hover:border-gray-900 hover:text-gray-900"
                  aria-label="Add photo"
                >
                  +
                </button>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => addFiles(e.target.files)}
            />

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <button
              onClick={submit}
              disabled={status === "sending"}
              className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {status === "sending" ? "Submitting…" : "Submit review"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}