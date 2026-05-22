import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

function PdfMerge() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf"
    );
    setFiles((prev) => [...prev, ...pdfFiles]);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert("Please select at least 2 PDF files");
      return;
    }

    setLoading(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);

        const pages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();

      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error while merging PDFs");
    }

    setLoading(false);
  };

  const removeFile = (index) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Merge PDFs</h2>

      <input
        type="file"
        multiple
        accept="application/pdf"
        onChange={handleFileChange}
      />

      <div style={{ marginTop: "20px" }}>
        {files.map((file, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "5px 0",
              padding: "5px",
              border: "1px solid #ccc",
            }}
          >
            <span>{file.name}</span>
            <button onClick={() => removeFile(index)}>Remove</button>
          </div>
        ))}
      </div>

      <button
        onClick={handleMerge}
        disabled={loading}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        {loading ? "Merging..." : "Merge PDFs"}
      </button>
    </div>
  );
}

export default PdfMerge;