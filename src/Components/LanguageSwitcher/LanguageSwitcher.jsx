import React, { useState, useEffect } from "react";
import "./LanguageSwitcher.css";

const LanguageSwitcher = () => {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );

  const changeLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    localStorage.setItem("language", selectedLanguage);

    const googleSelect = document.querySelector(".goog-te-combo");
    if (googleSelect) {
      googleSelect.value = selectedLanguage;
      googleSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  // Synchronize with any changes from Navbar or other places
  useEffect(() => {
    const handleStorageChange = () => {
      setLanguage(localStorage.getItem("language") || "en");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="global-language-switcher">
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="lang-select-dropdown"
      >
        <option value="en">English</option>
        <option value="ta">தமிழ்</option>
        <option value="hi">हिन्दी</option>
        <option value="te">తెలుగు</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
