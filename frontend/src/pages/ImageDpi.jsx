import { useState, useRef } from "react";

const PRESET_DPIS = [72, 96, 150, 300, 600];

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/bmp",
  "image/x-tiff",
];

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "tiff",
  "tif",
  "bmp",
];

const ImageIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      ry="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle
      cx="8.5"
      cy="8.5"
      r="1.5"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

export default function ImageDpi() {

  const [file, setFile] = useState(null);

  const [dpi, setDpi] = useState(300);

  const [resample, setResample] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState("");

  const [statusType, setStatusType] =
    useState("info");

  const [isDragging, setIsDragging] =
    useState(false);

  const [dpiResult, setDpiResult] =
    useState(null);

  const inputRef = useRef(null);

  const dropAreaRef = useRef(null);

  const showMessage = (
    message,
    type = "info",
    timeout = 5000
  ) => {

    setStatusMessage(message);

    setStatusType(type);

    if (timeout > 0) {
      setTimeout(() => {
        setStatusMessage("");
      }, timeout);
    }
  };

  const validateFile = (f) => {

    const ext = f.name
      .split(".")
      .pop()
      ?.toLowerCase();

    return (
      ACCEPTED_TYPES.includes(f.type) ||
      ALLOWED_EXTENSIONS.includes(ext)
    );
  };

  const addFiles = (incoming) => {

    const selected =
      Array.from(incoming)[0];

    if (!selected) return;

    if (!validateFile(selected)) {

      showMessage(
        "Error: Unsupported file format. Use JPG, JPEG, PNG, TIFF, TIF, or BMP.",
        "error",
        4000
      );

      return;
    }

    setFile(selected);

    setDpiResult(null);

    setStatusMessage("");
  };

  const removeFile = () => {

    setFile(null);

    setDpiResult(null);

    setStatusMessage("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDragEnter = (e) => {

    e.preventDefault();

    e.stopPropagation();

    setIsDragging(true);
  };

  const handleDragOver = (e) => {

    e.preventDefault();

    e.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (e) => {

    e.preventDefault();

    e.stopPropagation();

    if (
      dropAreaRef.current &&
      !dropAreaRef.current.contains(
        e.relatedTarget
      )
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {

    e.preventDefault();

    e.stopPropagation();

    setIsDragging(false);

    addFiles(e.dataTransfer.files);
  };

  const handleAreaClick = () => {
    inputRef.current?.click();
  };

  const handleConvert = async () => {

    if (!file) return;

    setLoading(true);

    setStatusMessage("");

    setDpiResult(null);

    const form = new FormData();

    form.append("images", file);

    form.append("dpi", dpi);

    form.append(
      "resample",
      String(resample)
    );

    try {

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/convert-dpi`,
        {
          method: "POST",
          body: form,
        }
      );

      if (!res.ok) {

        let errorMessage =
          "Conversion failed";

        try {

          const err =
            await res.json();

          errorMessage =
            err.error ||
            err.message ||
            errorMessage;

        } catch {}

        throw new Error(errorMessage);
      }

      const blob =
        await res.blob();

      const url =
        URL.createObjectURL(blob);

      const a =
        document.createElement("a");

      const ext =
        file.name.match(
          /\.[^.]+$/
        )?.[0] || "";

      const baseName =
        file.name.replace(
          /\.[^.]+$/,
          ""
        );

      a.href = url;

      a.download =
        `${baseName}_${dpi}dpi${ext}`;

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      showMessage(
        `Success! Image converted to ${dpi} DPI.`,
        "success"
      );

    } catch (err) {

      showMessage(
        `Error: ${
          err.message ||
          "Conversion failed"
        }`,
        "error"
      );

    } finally {

      setLoading(false);
    }
  };

  const handleCheckDpi = async () => {

    if (!file) return;

    setLoading(true);

    setStatusMessage("");

    setDpiResult(null);

    const form = new FormData();

    form.append("images", file);

    try {

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/check-dpi`,
        {
          method: "POST",
          body: form,
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to check DPI"
        );
      }

      const data =
        await res.json();

      setDpiResult(data[0]);

    } catch (err) {

      showMessage(
        `Error: ${
          err.message ||
          "Failed to check DPI"
        }`,
        "error"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">

      {/* Title */}
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        Image DPI Converter
      </h1>

      <div className="w-full flex flex-col items-center">

        {/* Upload Area */}
        <div
          ref={dropAreaRef}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleAreaClick}
          className={`w-full border-2 border-dashed rounded-2xl p-8 mb-6 cursor-pointer transition-all duration-300 flex flex-col items-center select-none ${
            isDragging
              ? "border-[#3b82f6] bg-[#ebf5ff] scale-[1.02]"
              : "border-[#c7d2fe] bg-[rgba(239,246,255,0.6)] hover:border-[#4361ee] hover:-translate-y-1 hover:shadow-[0_8px_15px_rgba(67,97,238,0.1)]"
          }`}
        >

          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.tiff,.tif,.bmp"
            className="hidden"
            onChange={(e) =>
              addFiles(
                e.target.files
              )
            }
          />

          {!file ? (

            <label className="flex flex-col items-center text-xl text-[#4b5563] cursor-pointer font-medium">

              <div className="text-[2.5rem] text-[#4361ee] mb-4">
                <ImageIcon />
              </div>

              Choose image or drag & drop

              <div className="text-[0.95rem] text-[#6b7280] mt-3">
                Supports JPG, JPEG, PNG, TIFF, TIF, BMP
              </div>

            </label>

          ) : (

            <div
              className="w-full"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="flex items-center justify-between bg-[#f0f9ff] px-4 py-3 rounded-lg border-l-[3px] border-[#0ea5e9]">

                <span
                  className="text-[#0369a1] font-semibold text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[85%]"
                  title={file.name}
                >
                  {file.name}
                </span>

                <button
                  onClick={removeFile}
                  className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-700 transition-all"
                  aria-label="Remove file"
                >
                  ×
                </button>

              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="w-full bg-[rgba(239,246,255,0.8)] border border-[#c7d2fe] rounded-2xl p-6 mb-6 text-left">

          <p className="text-sm font-semibold text-[#1a1a2e] mb-3">
            Target DPI
          </p>

          <div className="flex gap-2 flex-wrap mb-4">

            {PRESET_DPIS.map((p) => (

              <button
                key={p}
                onClick={() => setDpi(p)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  dpi === p
                    ? "bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white border-transparent"
                    : "bg-white text-[#4361ee] border-[#c7d2fe]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-5">

            <input
              type="number"
              min={1}
              max={2400}
              value={dpi}
              onChange={(e) =>
                setDpi(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-24 px-3 py-2 rounded-lg border border-[#c7d2fe]"
            />

            <span className="text-sm text-[#6b7280]">
              Custom value (1 – 2400)
            </span>

          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">

            <input
              type="checkbox"
              checked={resample}
              onChange={(e) =>
                setResample(
                  e.target.checked
                )
              }
              className="mt-0.5 w-4 h-4 accent-[#4361ee]"
            />

            <div>

              <span className="text-sm font-semibold text-[#1a1a2e]">
                Resize pixel dimensions
              </span>

              <p className="text-xs text-[#6b7280] mt-0.5">
                Scales image pixel size according to DPI.
              </p>

            </div>

          </label>
        </div>

        {/* Note */}
        <div className="w-full bg-[#fffbeb] border-l-4 border-[#f59e0b] px-4 py-3 rounded-r-xl mb-6 text-left">

          <p className="text-xs text-[#92400e]">

            <span className="font-semibold">
              Note:
            </span>{" "}

            Changing DPI without resampling only updates metadata. Pixel dimensions remain unchanged.

          </p>

        </div>

        {/* Buttons */}
        <div className="w-full flex gap-3">

          <button
            onClick={handleCheckDpi}
            disabled={!file || loading}
            className="flex-1 py-3.5 px-6 border-2 border-[#4361ee] text-[#4361ee] bg-white rounded-lg text-base font-semibold transition-all duration-300 hover:enabled:bg-[#eef2ff] disabled:opacity-50"
          >
            {loading
              ? "Checking…"
              : "Check DPI"}
          </button>

          <button
            onClick={handleConvert}
            disabled={!file || loading}
            className="flex-1 bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-6 rounded-lg text-base font-semibold transition-all duration-300 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] disabled:opacity-50"
          >
            {loading
              ? "Converting…"
              : `Convert to ${dpi} DPI`}
          </button>

        </div>

        {/* Status */}
        {statusMessage && (

          <p
            className={`mt-6 text-[0.95rem] ${
              statusType === "success"
                ? "text-green-600"
                : statusType === "error"
                ? "text-red-500"
                : "text-[#4b5563]"
            }`}
          >
            {statusMessage}
          </p>
        )}

        {/* DPI Result */}
        {dpiResult && (

          <div className="w-full mt-6">

            <div
              className={`px-4 py-3 rounded-lg text-sm text-left border-l-4 ${
                dpiResult.error
                  ? "bg-red-50 border-red-400 text-red-700"
                  : "bg-[#f0f9ff] border-[#0ea5e9] text-[#0369a1]"
              }`}
            >

              {dpiResult.error ? (

                <span>

                  <span className="font-semibold">
                    {dpiResult.filename}
                  </span>

                  : {dpiResult.error}

                </span>

              ) : (

                <span>

                  <span className="font-semibold">
                    {dpiResult.filename}
                  </span>

                  {" — "}

                  <span className="font-semibold">
                    {dpiResult.dpi[0]} DPI
                  </span>

                  {" · "}

                  {dpiResult.width_px} × {dpiResult.height_px} px

                  {" · "}

                  {dpiResult.format}

                </span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}