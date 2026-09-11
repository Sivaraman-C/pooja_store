import { useEffect, useMemo, useState } from "react";
import "./FestivalCalendar.css";

import DiwaliBg from "../Assets/Diwali.jpeg";
import GanpatiBg from "../Assets/Ganpati.jpeg";
import NavratriBg from "../Assets/Navaratri.jpeg";
import ShivaratriBg from "../Assets/shivaratri.jpeg";
import SankrantiBg from "../Assets/sankranthi.jpeg";
import HoliBg from "../Assets/holi.jpg";
import DefaultBg from "../Assets/banner-bg.jpg";

// =====================================================
// DYNAMIC IMAGE LOADING
// =====================================================
const festivalImages = {};
try {
  const context = require.context("../Assets/hindu_fest", false, /\.(png|jpe?g|svg)$/);
  context.keys().forEach((key) => {
    const cleanName = key.replace("./", "").replace(/\.(png|jpe?g|svg)$/, "").toLowerCase().replace(/_/g, " ").replace(/-/g, " ").trim();
    festivalImages[cleanName] = context(key);
  });
} catch (e) {}

const getFestivalImage = (festivalName) => {
  if (!festivalName) return DefaultBg;
  const name = festivalName.toLowerCase().replace(/_/g, " ").replace(/-/g, " ").trim();
  if (festivalImages[name]) return festivalImages[name];
  const match = Object.keys(festivalImages).find(imgName => name.includes(imgName) || imgName.includes(name));
  if (match) return festivalImages[match];
  if (name.includes("shivaratri")) return ShivaratriBg;
  if (name.includes("diwali") || name.includes("deepavali")) return DiwaliBg;
  if (name.includes("ganesh")) return GanpatiBg;
  if (name.includes("navratri")) return NavratriBg;
  if (name.includes("holi")) return HoliBg;
  if (name.includes("sankranti") || name.includes("pongal")) return SankrantiBg;
  return DefaultBg;
};

// =====================================================
// REGIONAL MAPPING
// =====================================================
const calendarRegionKeywords = {
  "Hindu Calendar": ["hindu", "festival", "puja", "vrat", "ekadashi", "amavasya", "purnima", "sankranti", "diwali", "holi", "navratri", "shivaratri", "janmashtami", "ganesh", "durga", "raksha bandhan"],
  "Indian Calendar": ["india", "national", "republic", "independence", "gandhi", "ambedkar", "indian"],
  "Tamil Calendar": ["tamil", "pongal", "vishu", "karthigai", "puthandu", "thai amavasai", "thai poosam", "panguni", "adi perukku", "avani avittam", "vinayagar", "chathurthi", "gokulastami", "rohini", "bharani", "arghya", "karthikai", "ekadasi", "pradhosham", "shivaratri", "janmashtami", "diwali"],
  "Telugu Calendar": ["telugu", "ugadi", "sankranti", "kartika purnima", "varalakshmi", "batukamma", "panchangam"],
  "Kannada Calendar": ["kannada", "ugadi", "sankranti", "gowri habba", "kar huni", "dasara", "navratri"],
  "Malayalam Calendar": ["malayalam", "onam", "vishu", "mandala pooja", "makaravilakku", "chingam"],
  "Gujarati Calendar": ["gujarati", "nutan varsh", "labh panchami", "dev diwali", "diwali", "sankranti"],
  "Marathi Calendar": ["marathi", "gudi padwa", "ganesh gauri", "narali purnima", "ganesh", "diwali"],
  "Bengali Calendar": ["bengali", "poila baisakh", "durga puja", "kali puja", "jamai sasthi", "navratri", "diwali"],
  "Punjabi Calendar": ["punjabi", "baisakhi", "lohri", "guru nanak", "hola mohalla"],
  "Odia Calendar": ["odia", "odisha", "rath yatra", "raja parba", "nuakhai", "odisha"],
  "Assamese Calendar": ["assamese", "bihu", "bohag", "rongali", "magh", "bihu"],
  "Jain Calendar": ["jain", "mahavir", "parshvanath", "panchami", "diksha", "jain"],
  "ISKCON Calendar": ["iskcon", "krishna", "janmashtami", "govardhan", "radha", "kirtan"],
  "Vrat & Upavas": ["vrat", "ekadashi", "ekadasi", "pradosh", "sankashti", "chaturthi", "chathurthi", "amavasya", "purnima", "satyanarayan", "karwa chauth", "ahoie", "masik"],
};

const majorFestivals = ["diwali", "deepavali", "holi", "shivaratri", "janmashtami", "ganesh chaturthi", "navratri", "dussehra", "raksha bandhan", "rama navami", "onam", "pongal", "makar sankranti", "durga puja", "chhath", "gudi padwa", "bihu", "rath yatra"];

const parseCsvLine = (line) => {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else current += char;
  }
  result.push(current.trim());
  return result;
};

const getFestivalCategory = (title) => {
  const name = title.toLowerCase();
  if (name.includes("shivaratri")) return "Shaivite Festival";
  if (name.includes("navratri") || name.includes("durga") || name.includes("lakshmi")) return "Devi Festival";
  if (name.includes("ekadashi") || name.includes("ekadasi") || name.includes("vrat") || name.includes("pradosh") || name.includes("chaturthi")) return "Vrat & Upavas";
  return "Festival";
};

const getFestivalIcon = (title) => {
  const name = title.toLowerCase();
  if (name.includes("ganesh") || name.includes("vinayagar")) return "🐘";
  if (name.includes("krishna") || name.includes("janmashtami")) return "🦚";
  if (name.includes("shiva") || name.includes("shivaratri")) return "🔱";
  if (name.includes("diwali") || name.includes("lakshmi")) return "🪔";
  if (name.includes("durga") || name.includes("navratri")) return "🪷";
  if (name.includes("saraswati")) return "🌼";
  if (name.includes("surya") || name.includes("sankranti")) return "☀️";
  if (name.includes("holi")) return "🎨";
  if (name.includes("ekadashi") || name.includes("amavas") || name.includes("purnima")) return "🌙";
  return "🪔";
};

const categories = ["All", "Festival", "Devi Festival", "Shaivite Festival", "Vrat & Upavas", "Regional Festival", "Spiritual Festival"];
const calendarTypes = ["Hindu Calendar", "Indian Calendar", "Tamil Calendar", "Telugu Calendar", "Kannada Calendar", "Malayalam Calendar", "Gujarati Calendar", "Marathi Calendar", "Bengali Calendar", "Odia Calendar", "Assamese Calendar", "Jain Calendar", "ISKCON Calendar", "Vrat & Upavas"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const FestivalCalendar = () => {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCalendar, setSelectedCalendar] = useState("Hindu Calendar");
  const [search, setSearch] = useState("");
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [calendarFestivals, setCalendarFestivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/hindu_calendar_1900_2100.csv")
      .then(res => res.text())
      .then(csv => {
        setCalendarFestivals(parseCalendarCsv(csv));
        setLoading(false);
      })
      .catch(err => console.error("CSV Load Error:", err));
  }, []);

  const parseCalendarCsv = (csv) => {
    return csv.split(/\r?\n/).slice(1).filter(Boolean).map((line) => {
      const columns = parseCsvLine(line);
      const date = columns[0];
      if (!date || !columns[5]) return null;
      const name = columns[5].includes("/") ? columns[5].split("/")[1].trim() : columns[5];
      return {
        date, name,
        category: getFestivalCategory(name),
        icon: getFestivalIcon(name),
        bgImage: getFestivalImage(name),
        description: `${name} is an auspicious day observed with devotion.`
      };
    }).filter(Boolean);
  };

  const openFestival = (festival) => setSelectedFestival(festival);
  const closeFestival = () => setSelectedFestival(null);

  const filteredForGrid = useMemo(() => {
    return calendarFestivals.filter(f => {
      const matchesMonthYear = f.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`);
      let matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase().trim());

      let matchesCalendar = true;
      if (selectedCalendar !== "Hindu Calendar") {
        const keywords = calendarRegionKeywords[selectedCalendar] || [];
        const nameLower = f.name.toLowerCase();
        const regionalMatch = keywords.some(key => nameLower.includes(key));
        const isMajor = majorFestivals.some(fest => nameLower.includes(fest));
        matchesCalendar = regionalMatch || isMajor;
      }

      return matchesMonthYear && matchesCategory && matchesSearch && matchesCalendar;
    });
  }, [calendarFestivals, currentMonth, currentYear, selectedCategory, selectedCalendar, search]);

  const upcomingList = useMemo(() => {
    const todayStr = today.toISOString().split('T')[0];
    const normalizedSearch = search.trim().toLowerCase();

    return calendarFestivals.filter(f => {
      if (f.category === "Vrat & Upavas") return false;

      const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
      const matchesSearch = !normalizedSearch || f.name.toLowerCase().includes(normalizedSearch);

      let matchesCalendar = true;
      if (selectedCalendar !== "Hindu Calendar") {
        const keywords = calendarRegionKeywords[selectedCalendar] || [];
        matchesCalendar = keywords.some(key => f.name.toLowerCase().includes(key)) || majorFestivals.some(fest => f.name.toLowerCase().includes(fest));
      }

      return f.date >= todayStr && matchesCategory && matchesSearch && matchesCalendar;
    }).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10);
  }, [calendarFestivals, search, selectedCalendar, selectedCategory, today]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevDays = new Date(currentYear, currentMonth, 0).getDate();
    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) days.push({ day: prevDays - i, currentMonth: false });
    for (let d = 1; d <= daysInMonth; d++) days.push({ day: d, currentMonth: true });
    while (days.length < 42) days.push({ day: days.length - daysInMonth - firstDay + 1, currentMonth: false });
    return days;
  }, [currentMonth, currentYear]);

  const getFestivalsForDay = (day) => {
    if (!day.currentMonth) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day.day).padStart(2, "0")}`;
    return filteredForGrid.filter(f => f.date === dateStr);
  };

  const formatDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const changeMonth = (direction) => {
    let m = currentMonth + direction;
    let y = currentYear;
    if (m < 0) { m = 11; y--; }
    else if (m > 11) { m = 0; y++; }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  return (
    <main className="festival-page">
      <section className="festival-hero">
        <div className="festival-hero-pattern"></div>
        <div className="festival-icon icon-diya">🪔</div><div className="festival-icon icon-lotus">🪷</div><div className="festival-icon icon-kalash">🏺</div><div className="festival-icon icon-bell">🔔</div><div className="festival-icon icon-peacock">🦚</div><div className="festival-icon icon-ganesh">🐘</div>
        <div className="festival-hero-content">
          <div className="festival-eyebrow">✦ SACRED MOMENTS · {currentYear} ✦</div>
          <h1>Festival<span> Calendar</span></h1>
          <p>Complete database of festivals and auspicious days.</p>
        </div>
      </section>

      <section className="festival-container">
        <div className="festival-tools">
          <div className="festival-search">
             <span>⌕</span>
             <input type="text" placeholder="Search festivals..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="festival-filter">
            <label>Calendars</label>
            <select value={selectedCalendar} onChange={e => setSelectedCalendar(e.target.value)}>
              {calendarTypes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="festival-filter">
            <label>Festival Type</label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="festival-filter">
            <label>Year</label>
            <select value={currentYear} onChange={e => setCurrentYear(parseInt(e.target.value))}>
              {Array.from({ length: 201 }, (_, i) => 1900 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {loading ? <div className="loading-container"><p>Loading sacred data...</p></div> : (
          <>
            <div className="calendar-card">
              <div className="calendar-header">
                <div>
                  <span className="calendar-label">SACRED DAYS</span>
                  <h2>
                    {months[currentMonth]} <span>{currentYear}</span>
                  </h2>
                </div>
                <div className="calendar-actions">
                  <button className="today-button" onClick={goToToday}>Today</button>
                  <button className="calendar-nav" onClick={() => changeMonth(-1)}>←</button>
                  <button className="calendar-nav" onClick={() => changeMonth(1)}>→</button>
                </div>
              </div>
              <div className="calendar-weekdays">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}</div>
              <div className="calendar-grid">
                {calendarDays.map((d, i) => {
                  const fests = getFestivalsForDay(d);
                  const isToday = d.currentMonth && d.day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                  return (
                    <div key={i} className={`calendar-day ${!d.currentMonth ? "muted-day" : ""} ${isToday ? "today" : ""} ${fests.length ? "festival-day" : ""}`}>
                      <span className="day-number">{d.day}</span>
                      <div className="day-festivals-container">
                        {fests.map(f => (
                          <button key={f.name} className="festival-event" onClick={() => openFestival(f)}>
                            <span className="fest-icon">{f.icon}</span>
                            <strong className="fest-name">{f.name}</strong>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <section className="upcoming-section">
              <div className="upcoming-grid">
                {upcomingList.slice(0, 4).map(f => (
                  <button className="upcoming-card" key={f.name} onClick={() => openFestival(f)}>
                    <div className="card-bg-container"><img src={f.bgImage} alt="" className="card-bg-img" /><div className="card-overlay" /></div>
                    <div className="upcoming-info"><span className="upcoming-date">{formatDate(f.date)}</span><h3>{f.name}</h3></div>
                    <span className="upcoming-arrow">→</span>
                  </button>
                ))}
                <div className="upcoming-title-card">
                  <div className="festival-hero-pattern"></div>
                  <div className="festival-icon icon-lotus">🪷</div>
                  <div className="festival-icon icon-kalash">🏺</div>
                  <div className="festival-icon icon-bell">🔔</div>
                  <div className="title-card-content">
                    <span className="title-eyebrow">MARK YOUR CALENDAR</span>
                    <h2>Upcoming Festivals</h2>
                    <div className="title-decoration">✦</div>
                  </div>
                </div>
                {upcomingList.slice(4, 10).map(f => (
                  <button className="upcoming-card" key={f.name} onClick={() => openFestival(f)}>
                    <div className="card-bg-container"><img src={f.bgImage} alt="" className="card-bg-img" /><div className="card-overlay" /></div>
                    <div className="upcoming-info"><span className="upcoming-date">{formatDate(f.date)}</span><h3>{f.name}</h3></div>
                    <span className="upcoming-arrow">→</span>
                  </button>
                ))}
              </div>
            </section>

            <div className="festival-footer">
              <span>✦</span>
              <p>{calendarFestivals.filter(f => f.date.startsWith(currentYear)).length} sacred celebrations in {currentYear}</p>
              <span>✦</span>
            </div>
          </>
        )}
      </section>

      {selectedFestival && (
        <div className="festival-modal-backdrop" onClick={closeFestival}>
          <div className="festival-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeFestival}>×</button>
            <div className="modal-icon">{selectedFestival.icon}</div>
            <span className="modal-category">{selectedFestival.category}</span>
            <h2>{selectedFestival.name}</h2>
            <div className="modal-date">📅 {formatDate(selectedFestival.date)}</div>
            <p className="modal-description">{selectedFestival.description}</p>
            <div className="modal-divider">✦</div>
            <button className="modal-done" onClick={closeFestival}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default FestivalCalendar;
