"use client";
import { createContext, useContext, useState } from "react";

const UIContext = createContext();

export function UIProvider({ children }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPostaJobModel, setShowPostaJobModel] = useState(false);

  return (
    <UIContext.Provider
      value={{
        showLoginModal,
        setShowLoginModal,
        showSignupModal,
        setShowSignupModal,
        searchTerm,
        setSearchTerm,
        showPostaJobModel,
        setShowPostaJobModel,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
