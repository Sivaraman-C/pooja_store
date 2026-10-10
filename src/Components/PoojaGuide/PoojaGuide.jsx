import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./PoojaGuide.css";
import { getFestivalGuideDetails, parseFestivalCsv } from "./festivalGuideData";

import Idols from "../Assets/idols.jpeg";
import DiwaliImage from "../Assets/Diwali.jpeg";
import Diwali from "../Assets/diwali.jpg";
import Navratri from "../Assets/Navaratri.jpeg";

const getFestivalImage = (name) => {
  const normalizedName = name.toLowerCase();
  if (normalizedName.includes("ganesh") || normalizedName.includes("vinayagar")) return Idols;
  if (normalizedName.includes("diwali") || normalizedName.includes("deepavali") || normalizedName.includes("lakshmi")) return DiwaliImage;
  if (normalizedName.includes("navratri") || normalizedName.includes("durga")) return Navratri;
  return Diwali;
};

const PoojaGuide = () => {
  const [festivalEvents, setFestivalEvents] = useState([]);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetch("/hindu_calendar_1900_2100.csv")
      .then((response) => {
        if (!response.ok) throw new Error(`Festival calendar request failed (${response.status})`);
        return response.text();
      })
      .then((csv) => {
        if (isMounted) setFestivalEvents(parseFestivalCsv(csv));
      })
      .catch((error) => {
        console.error("Pooja Guide calendar load error:", error);
        if (isMounted) setLoadError("Festival guides are temporarily unavailable.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const upcomingGuides = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const seenNames = new Set();

    return festivalEvents
      .filter((festival) => festival.date >= todayString)
      .sort((first, second) => first.date.localeCompare(second.date))
      .filter((festival) => {
        const normalizedName = festival.name.toLowerCase();
        if (seenNames.has(normalizedName)) return false;
        seenNames.add(normalizedName);
        return true;
      })
      .slice(0, 3);
  }, [festivalEvents]);

  useEffect(() => {
    if (!selectedFestival) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedFestival(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFestival]);

  const selectedDetails = selectedFestival
    ? getFestivalGuideDetails(selectedFestival.name)
    : null;

  return (
    <section className="pooja-guide-section">
      <div className="pooja-guide-container">
        <div className="pooja-guide-header">
          <div className="pooja-guide-titles">
            <h2>Pooja Guide</h2>
            <p>Learn the right way to perform your pooja</p>
          </div>
          <Link to="/pooja-guide" className="pooja-guide-view-all">
            View All →
          </Link>
        </div>

        <div className="pooja-guide-grid">
          {upcomingGuides.map((item) => (
            <button
              type="button"
              key={`${item.date}-${item.name}`}
              className="pooja-guide-card"
              onClick={() => setSelectedFestival(item)}
              aria-haspopup="dialog"
              aria-label={`View ${item.name} pooja guide`}
            >
              <div className="pooja-guide-image-wrap">
                <img src={getFestivalImage(item.name)} alt="" />
              </div>
              <div className="pooja-guide-card-content">
                <span className="pooja-guide-date">
                  {new Date(`${item.date}T00:00:00`).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <h4>{item.name}</h4>
                <div className="pooja-guide-sub-row">
                  <span>{item.category}</span>
                  <span className="pooja-guide-arrow" aria-hidden="true">→</span>
                </div>
              </div>
            </button>
          ))}
          {!upcomingGuides.length && !loadError && (
            <p className="pooja-guide-empty">Loading upcoming festivals...</p>
          )}
          {loadError && <p className="pooja-guide-empty" role="alert">{loadError}</p>}
        </div>
      </div>

      {selectedFestival && selectedDetails && (
        <div
          className="pooja-guide-modal-backdrop"
          onClick={() => setSelectedFestival(null)}
        >
          <section
            className="pooja-guide-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pooja-guide-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="pooja-guide-modal-close"
              onClick={() => setSelectedFestival(null)}
              aria-label="Close pooja guide"
            >
              ×
            </button>
            <div className="pooja-guide-modal-layout">
              <div className="pooja-guide-feature">
                <img src={getFestivalImage(selectedFestival.name)} alt="" />
                <div className="pooja-guide-feature-caption">
                  <h2 id="pooja-guide-modal-title">{selectedFestival.name} Vidhi &amp; Rituals</h2>
                  <p>Complete sacred guide for devotees</p>
                </div>
              </div>

              <div className="pooja-guide-steps-panel">
                <h3>Simple Steps</h3>
                <div className="pooja-guide-step-list">
                  {selectedDetails.steps.slice(0, 4).map((step, index) => (
                    <div className="pooja-guide-step-card" key={index}>
                      <div className="pooja-guide-step-image">
                        <img src={getFestivalImage(selectedFestival.name)} alt="" />
                        <span>{index + 1}</span>
                      </div>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedDetails.steps.length > 4 && (
                <div className="pooja-guide-extra-steps">
                  {selectedDetails.steps.slice(4).map((step, index) => {
                    const stepNumber = index + 5;
                    return (
                      <div className="pooja-guide-extra-step-card" key={stepNumber}>
                        <div className="pooja-guide-extra-step-image">
                          <img src={getFestivalImage(selectedFestival.name)} alt="" />
                          <span>{stepNumber}</span>
                        </div>
                        <p>{step}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedDetails.finalPrayer && (
                <p className="pooja-guide-modal-prayer">
                  <strong>🙏 Final prayer:</strong>
                  <br />
                  {selectedDetails.finalPrayer}
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

export default PoojaGuide;
