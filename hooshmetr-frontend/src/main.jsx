import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { CompareProvider } from "@/context/CompareContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CompareProvider>
        {" "}
        {/* 🟪 همه صفحات به لیست مقایسه دسترسی دارن */}
        <App />
      </CompareProvider>
    </BrowserRouter>
  </React.StrictMode>
);
