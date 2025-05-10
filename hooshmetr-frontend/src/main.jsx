import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { CompareProvider } from "@/context/CompareContext";
import TagManager from "react-gtm-module";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tagManagerArgs = {
  gtmId: "GTM-TNNLQBHJ", // شناسه GTM واقعی خودت رو اینجا بذار
};

TagManager.initialize(tagManagerArgs);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CompareProvider>
          <App />
          <ToastContainer position="top-right" rtl autoClose={4000} />
        </CompareProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
