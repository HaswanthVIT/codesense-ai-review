# CodeSense — AI Code Review Assistant

This project is an AI-powered tool that automatically reviews code files for quality, structure, and potential bugs, providing a detailed report in a modern, interactive dashboard.

---

## 🚀 Demo Video

**[Watch the full demo video here]( https://youtu.be/4v66VQquLPQ )**

---

## ✨ Key Features

-   **AI-Powered Analysis:** Uses the Gemini API to provide high-quality code reviews.
-   **Structured Reports:** Displays analysis in clear categories: Summary, Readability, Modularity, Bugs, and Suggestions.
-   **Interactive Dashboard:** A sleek, modern frontend built with React, Vite, and Tailwind CSS.
-   **PDF Export:** Allows users to download the complete review as a PDF report.

---

## 🛠️ Tech Stack

-   **Backend:** Python, FastAPI
-   **Frontend:** React, Vite, Tailwind CSS, Axios, Framer Motion
-   **LLM Integration:** Google Gemini API

---

## ⚙️ How to Run Locally

### Backend
1.  Navigate to the `backend` folder.
2.  Activate the virtual environment: `.venv\Scripts\activate`
3.  Run the server: `uvicorn main:app --reload --port 8000`

### Frontend
1.  Navigate to the `frontend` folder.
2.  Install dependencies: `npm install`
3.  Run the development server: `npm run dev`
