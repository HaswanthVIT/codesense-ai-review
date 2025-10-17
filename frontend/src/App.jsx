import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreCircle } from './components/ScoreCircle';
import { ReportCard } from './components/ReportCard';
import { FileCode, UploadCloud, Download, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';

// Loader component for when analysis is in progress
const Loader = () => (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <motion.div
            className="w-16 h-16 bg-cyan-400 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8], boxShadow: ["0 0 20px #06b6d4", "0 0 40px #06b6d4", "0 0 20px #06b6d4"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <p className="mt-6 text-lg text-cyan-300 font-medium">AI is analyzing your code...</p>
    </div>
);

const API_URL = "http://localhost:8000/analyze";

export default function App() {
  const [file, setFile] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setReview(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a code file first.");
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReview(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail || "Could not connect to the backend API. Please ensure it's running.";
      setError(`Analysis Failed: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileName("");
    setReview(null);
    setError(null);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFont("Inter", "normal");
    doc.setFontSize(22);
    doc.text("CodeSense AI Review Report", 10, 20);
    doc.setFontSize(16);
    doc.text(`File: ${fileName}`, 10, 30);
    doc.text(`Score: ${review.score}/10`, 10, 40);
    let y = 60;
    const sections = ['summary', 'readability', 'modularity', 'bugs', 'suggestions'];
    sections.forEach(key => {
        doc.setFontSize(14);
        doc.setFont("Inter", "bold");
        doc.text(key.charAt(0).toUpperCase() + key.slice(1), 10, y);
        y += 7;
        doc.setFontSize(10);
        doc.setFont("Inter", "normal");
        const text = doc.splitTextToSize(review[key], 180);
        doc.text(text, 10, y);
        y += text.length * 5 + 10;
    });
    doc.save(`CodeSense_Report_${fileName}.pdf`);
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-8 font-sans flex flex-col items-center">
      <div className="w-full max-w-5xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/40 rounded-2xl p-6 sm:p-8">
        <header className="flex items-center mb-8 pb-4 border-b border-slate-700">
          <FileCode className="h-8 w-8 mr-3 text-cyan-400" />
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
           CodeSense AI
          </h1>
        </header>
        
        <section className="mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4 p-4 border-2 border-dashed border-slate-600 rounded-lg bg-slate-900/30">
            <label htmlFor="file-upload" className="flex-grow w-full flex items-center justify-center px-4 py-3 bg-slate-700/50 text-slate-300 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
              <UploadCloud className="h-5 w-5 mr-2" />
              <span>{fileName || "Select a code file..."}</span>
            </label>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".py,.js,.java,.ts,.cpp,.c" />
            <button
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="w-full md:w-auto px-8 py-3 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transform hover:scale-105"
            >
              Analyze Code
            </button>
          </div>
        </section>

        <main>
          <AnimatePresence mode="wait">
            {loading && <motion.div key="loader"><Loader /></motion.div>}
            {error && <motion.p key="error" className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</motion.p>}
            {review && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-200">Review Report for <span className="text-cyan-400">{fileName}</span></h2>
                  <div className="flex gap-2">
                    <button onClick={handleDownloadPdf} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg" title="Download PDF"><Download /></button>
                    <button onClick={handleReset} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg" title="Analyze New File"><RefreshCw /></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 flex justify-center">
                    <ScoreCircle score={review.score} />
                  </div>
                  <div className="lg:col-span-2">
                    <ReportCard title="Overall Summary" content={review.summary} />
                    <ReportCard title="Readability Analysis" content={review.readability} />
                  </div>
                </div>
                <div className="mt-6 border-t border-gray-700 pt-6">
                   <ReportCard title="Modularity & Structure" content={review.modularity} />
                </div>
                 <div className="mt-6 border-t border-gray-700 pt-6">
                  <ReportCard title="Potential Bugs & Issues" content={review.bugs} isList={true} />
                </div>
                <div className="mt-6 border-t border-gray-700 pt-6">
                  <ReportCard title="Actionable Improvement Suggestions" content={review.suggestions} isList={true} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}