"use client";

import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [hasDocuments, setHasDocuments] = useState(false);

  const [connectionStatus, setConnectionStatus] =
    useState("Checking AI connection...");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error();
        setConnectionStatus("🟢 AI Connected");
      } catch {
        setConnectionStatus("🔴 AI Not Connected");
      }
    };

    checkConnection();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus("Uploading...");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setUploadStatus("Document uploaded successfully.");
      setHasDocuments(true);
      setFile(null);
    } catch {
      setUploadStatus("Upload failed. Please try again.");
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!input.trim()) {
      setError("Please enter a question before submitting.");
      return;
    }

    try {
      setLoading(true);
      setResponse("");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          hasDocuments,
        }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();
      setResponse(data.reply);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        min-h-screen flex items-center justify-center px-6
        bg-gradient-to-br from-white via-slate-100 to-gray-200
        relative overflow-hidden
      "
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/30 pointer-events-none" />

      <div
        className="
          backdrop-blur-xl
          bg-white/60
          border border-white/70
          shadow-[0_0_40px_rgba(255,255,255,0.6)]
          rounded-3xl
          p-10
          w-full
          max-w-2xl
          relative
        "
      >
        <h1
          className="
            text-3xl font-bold text-center mb-8
            bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700
            bg-clip-text text-transparent
          "
        >
          ✧ RAG Pipeline Assistant ✧
        </h1>

        <p className="text-center text-sm text-gray-500 mb-4">
          {connectionStatus}
        </p>

        {/* Upload Section */}
        <div
          className="
            mb-10 p-6 rounded-2xl
            bg-white/70
            border border-white/80
            shadow-inner
          "
        >
          <h2 className="text-gray-700 font-semibold mb-4 text-center">
            Upload Documentation
          </h2>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.json"
            hidden
            onChange={(e) => {
              if (e.target.files) {
                setFile(e.target.files[0]);
                setUploadStatus(`Selected file: ${e.target.files[0].name}`);
              }
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="
              w-full
              py-2
              rounded-xl
              bg-gradient-to-r from-slate-200 via-white to-slate-200
              text-gray-700
              font-medium
              border border-white
              shadow-md
              hover:scale-[1.02]
              transition
            "
          >
            {file ? "Change Document" : "Upload Document"}
          </button>

          {file && (
            <button
              onClick={handleUpload}
              className="
                mt-3
                w-full
                py-2
                rounded-xl
                bg-gray-700
                text-white
                font-medium
                hover:bg-gray-800
                transition
              "
            >
              Confirm Upload
            </button>
          )}

          {uploadStatus && (
            <p className="mt-3 text-sm text-center text-gray-600">
              {uploadStatus}
            </p>
          )}
        </div>

        {/* Chat Section */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your question..."
          rows={4}
          className="
            w-full
            p-4
            rounded-2xl
            bg-white/70
            border border-white/80
            shadow-inner
            focus:outline-none
            resize-none
            text-gray-700
          "
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="
            mt-5
            w-full
            py-3
            rounded-2xl
            bg-gradient-to-r from-gray-200 via-white to-gray-200
            text-gray-700
            font-semibold
            border border-white
            shadow-lg
            hover:scale-[1.02]
            transition
            disabled:opacity-50
          "
        >
          {loading ? "Illuminating..." : "Ask AI"}
        </button>

        {error && (
          <p className="text-red-400 mt-4 text-center">{error}</p>
        )}

        {response && (
          <div
            className="
              mt-8
              p-6
              rounded-2xl
              bg-white/70
              border border-white/80
              shadow-inner
            "
          >
            <h2 className="font-semibold mb-3 text-gray-700">
              ✦ Response ✦
            </h2>
            <p className="whitespace-pre-wrap text-gray-700">
              {response}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
