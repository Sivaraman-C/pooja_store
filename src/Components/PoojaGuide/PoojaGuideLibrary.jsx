import React, { useEffect, useMemo, useState } from "react";
import { getFestivalCategory, getFestivalGuideDetails, normalizeFestivalName, parseFestivalCsv } from "./festivalGuideData";
import "./PoojaGuideLibrary.css";
import "./PoojaGuide.css";

import DefaultImage from "../Assets/diwali.jpg";
import DiwaliImage from "../Assets/Diwali.jpeg";
import GanpatiImage from "../Assets/idols.jpeg";
import NavratriImage from "../Assets/Navaratri.jpeg";
import ShivaratriImage from "../Assets/shivaratri.jpeg";
import SankrantiImage from "../Assets/sankranthi.jpeg";

const categories = [
  "All",
  "Festival",
  "Devi Festival",
  "Shaivite Festival",
  "Vrat & Upavas",
  "Regional Festival",
  "Spiritual Festival",
];

const getFestivalImage = (name) => {
  const normalizedName = name.toLowerCase();
  if (normalizedName.includes("ganesh") || normalizedName.includes("vinayagar")) return GanpatiImage;
  if (normalizedName.includes("diwali") || normalizedName.includes("deepavali") || normalizedName.includes("lakshmi")) return DiwaliImage;
  if (normalizedName.includes("navratri") || normalizedName.includes("durga")) return NavratriImage;
  if (normalizedName.includes("shiva")) return ShivaratriImage;
  if (normalizedName.includes("sankranti") || normalizedName.includes("pongal")) return SankrantiImage;
  return DefaultImage;
};

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const PoojaGuideLibrary = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch("/hindu_calendar_1900_2100.csv")
      .then((response) => {
        if (!response.ok) throw new Error(`Festival calendar request failed (${response.status})`);
        return response.text();
      })
      .then((csv) => {
        if (!isMounted) return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const uniqueFestivals = new Map();

        parseFestivalCsv(csv).forEach((event) => {
          const key = normalizeFestivalName(event.name);
          if (!key) return;
          const current = uniqueFestivals.get(key);
          if (!current || (event.date >= todayString && (current.nextDate < todayString || event.date < current.nextDate))) {
            uniqueFestivals.set(key, {
              name: event.name,
              category: getFestivalCategory(event.name),
              nextDate: event.date >= todayString ? event.date : current?.nextDate || "",
            });
          }
        });

        setEvents(
          [...uniqueFestivals.values()].sort((first, second) => {
            if (first.nextDate && second.nextDate) return first.nextDate.localeCompare(second.nextDate) || first.name.localeCompare(second.name);
            if (first.nextDate) return -1;
            if (second.nextDate) return 1;
            return first.name.localeCompare(second.name);
          })
        );
      })
      .catch((loadError) => {
        console.error("Pooja guide library load error:", loadError);
        if (isMounted) setError("Unable to load the festival and pooja guides.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedFestival) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedFestival(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedFestival]);

  const filteredFestivals = useMemo(() => {
    const query = normalizeFestivalName(search);
    return events.filter((festival) => {
      const matchesSearch = !query || normalizeFestivalName(festival.name).includes(query);
      const matchesCategory = selectedCategory === "All" || festival.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, search, selectedCategory]);

  const selectedDetails = selectedFestival
    ? getFestivalGuideDetails(selectedFestival.name)
    : null;

  return (
    <main className="pooja-guide-library">
      <header className="pooja-guide-library-header">
        <span>DEVOTIONAL GUIDES</span>
        <h1>Festivals &amp; Pooja Guides</h1>
        <p>Explore sacred occasions and follow simple steps for your pooja.</p>
      </header>

      <section className="pooja-guide-library-content" aria-label="Festival and pooja guides">
        <div className="pooja-guide-library-tools">
          <label className="pooja-guide-library-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search festivals and poojas"
              aria-label="Search festivals and poojas"
            />
          </label>
          <label className="pooja-guide-library-category">
            <span>Festival Type</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="pooja-guide-library-message" role="alert">{error}</p>}
        {loading ? (
          <p className="pooja-guide-library-message">Loading festival and pooja guides...</p>
        ) : (
          <>
            <p className="pooja-guide-library-count">
              {filteredFestivals.length} {filteredFestivals.length === 1 ? "guide" : "guides"}
            </p>
            {filteredFestivals.length ? (
              <div className="pooja-guide-library-grid">
                {filteredFestivals.map((festival) => (
                  <article className="pooja-guide-library-card" key={normalizeFestivalName(festival.name)}>
                    <img src={getFestivalImage(festival.name)} alt="" />
                    <div className="pooja-guide-library-card-content">
                      <span className="pooja-guide-library-type">{festival.category}</span>
                      {festival.nextDate && (
                        <span className="pooja-guide-library-date">Upcoming · {formatDate(festival.nextDate)}</span>
                      )}
                      <h2>{festival.name}</h2>
                      <button type="button" onClick={() => setSelectedFestival(festival)}>
                        Know More <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="pooja-guide-library-message">No guides match your search and filter.</p>
            )}
          </>
        )}
      </section>

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
              <p className="pooja-guide-library-description">{selectedDetails.description}</p>
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
    </main>
  );
};

export default PoojaGuideLibrary;
