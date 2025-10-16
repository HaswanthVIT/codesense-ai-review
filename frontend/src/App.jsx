import React, { useState } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8000/analyze"; // Your FastAPI Backend Endpoint

function App() {
  const [file, setFile] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setReview(null); // Reset review on new file selection
    setError(null);
  };

  const handleUpload = async () => {
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setReview(response.data); // The backend returns a clean JSON object
    } catch (err) {
      console.error("API Error:", err);
      const detail = err.response?.data?.detail || "Could not connect to the backend API or an unknown error occurred.";
      setError(`Analysis Failed: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to render score based on color
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Component to render a section of the review
  const ReviewSection = ({ title, content, isList = false }) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-1 mb-2">{title}</h3>
      {isList ? (
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          {content.split('\n').filter(line => line.trim()).map((line, index) => (
            <li key={index}>{line.trim().replace(/^\*\s*|\d+\.\s*/, '')}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 whitespace-pre-line">{content}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-6 border-b pb-3">
          CodeSense: AI Code Review Assistant
        </h1>

        {/* --- File Upload Area --- */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-8 p-4 border rounded-md bg-blue-50">
          <label className="flex-shrink-0 text-gray-700 font-medium">Select Code File:</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            accept=".py,.js,.java,.ts,.cpp,.c"
          />
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className={`w-full md:w-auto px-6 py-2 rounded-lg text-white font-semibold transition-colors ${
              loading || !file
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-md'
            }`}
          >
            {loading ? 'Analyzing...' : 'Analyze Code'}
          </button>
        </div>

        {/* --- Error and Success Status --- */}
        {error && (
          <div className="p-4 mb-6 bg-red-100 text-red-700 border border-red-300 rounded-md font-medium">
            Error: {error}
          </div>
        )}
        {file && !loading && !review && !error && (
          <div className="p-4 mb-6 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-md">
            File selected: **{file.name}**. Click 'Analyze Code' to start the review.
          </div>
        )}

        {/* --- Review Report Display --- */}
        {review && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Report for {file.name}</h2>

            <div className="flex justify-between items-start mb-6 pb-4 border-b">
              <div className="flex-1 pr-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Overall Summary</h3>
                <p className="text-gray-600 italic">{review.summary}</p>
              </div>
              <div className={`p-4 rounded-full font-extrabold text-3xl flex-shrink-0 text-center ${getScoreColor(review.score)}`}>
                <span className="text-lg font-medium block">Score</span>
                {review.score}/10
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReviewSection title="Readability Analysis" content={review.readability} />
                <ReviewSection title="Modularity & Structure" content={review.modularity} />
            </div>

            <div className="mt-6 border-t pt-6">
                <ReviewSection title="Potential Bugs & Issues" content={review.bugs} isList={true} />
            </div>
            
            <div className="mt-6 border-t pt-6">
                <ReviewSection title="Actionable Improvement Suggestions" content={review.suggestions} isList={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;