// CompareContext.jsx
// 🔄 اشتراک‌گذاری لیست مقایسه ابزارها بین صفحات مختلف

import { createContext, useState, useContext } from "react";

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  const toggleCompare = (toolId) => {
    setCompareList((prev) => {
      if (prev.includes(toolId)) {
        return prev.filter((id) => id !== toolId);
      }
      if (prev.length >= 3) {
        alert("حداکثر ۳ ابزار قابل مقایسه است.");
        return prev;
      }
      return [...prev, toolId];
    });
  };

  return (
    <CompareContext.Provider value={{ compareList, toggleCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
