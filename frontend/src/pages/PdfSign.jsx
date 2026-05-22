import React, { useState } from "react";
import axios from "axios";

function PdfSign() {
  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState("");

  const handleSubmit = async () => {
    if (!file || !signature) {
      alert("Please upload PDF and enter signature");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signature);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/sign/signPdf",
        formData,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const a = document.createElement("a");
      a.href = url;
      a.download = "signed.pdf";
      a.click();
    } catch (err) {
      console.log("❌ FULL ERROR:", err);
      console.log("❌ RESPONSE:", err.response);
      console.log("❌ DATA:", err.response?.data);
      alert(JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        PDF Sign Tool
      </h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4 block w-full"
      />

      <input
        type="text"
        placeholder="Enter signature text"
        value={signature}
        onChange={(e) => setSignature(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        Sign PDF
      </button>
    </div>
  );
}

export default PdfSign;