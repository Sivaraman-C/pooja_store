import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { unzipSync } from "fflate";
import "./FestivalCalendar.css";
import API_URL, { bypassHeaders } from "../../apiConfig";

import DiwaliBg from "../Assets/Diwali.jpeg";
import GanpatiBg from "../Assets/Ganpati.jpeg";
import NavratriBg from "../Assets/Navaratri.jpeg";
import ShivaratriBg from "../Assets/shivaratri.jpeg";
import SankrantiBg from "../Assets/sankranthi.jpeg";
import HoliBg from "../Assets/holi.jpg";
import DefaultBg from "../Assets/banner-bg.jpg";

import festivalEssentialsMap from "./festivalData/festivalEssentialsMap";
import festivalDetailsMap from "./festivalData/festivalDetailsMap";

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



const normalizeFestivalName = (name = "") =>
  name
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const regionalFestivalAliases = {
  navarathiri: "navratri",
  navaratri: "navratri",
  "vijaya dashami": "vijayadashami",
  dussehra: "vijayadashami",
  deepavali: "diwali",
  "saraswati poojai": "saraswati puja",
  "vinayagar chathurthi": "ganesh chaturthi",
  "vinayaka chaturthi": "ganesh chaturthi",
  gokulastami: "krishna janmashtami",
  "astami rohini": "krishna janmashtami",
  "ashtami rohini": "krishna janmashtami",
};

const areRegionalFestivalNamesEquivalent = (eventName, calendarName) => {
  const normalizedEvent = normalizeFestivalName(eventName);
  const normalizedCalendar = normalizeFestivalName(calendarName);
  const eventKey = regionalFestivalAliases[normalizedEvent] || normalizedEvent;
  const calendarKey = regionalFestivalAliases[normalizedCalendar] || normalizedCalendar;

  if (eventKey === calendarKey || eventKey.replace(/\s/g, "") === calendarKey.replace(/\s/g, "")) {
    return true;
  }

  return (
    eventKey.startsWith(`${calendarKey} `) ||
    eventKey.endsWith(` ${calendarKey}`) ||
    calendarKey.startsWith(`${eventKey} `) ||
    calendarKey.endsWith(` ${eventKey}`)
  );
};

const festivalAliases = {
  "ganesh chaturthi": "ganesha chaturthi",
  "ganesha chaturthi": "ganesha chaturthi",
  "vinayagar chathurthi": "ganesha chaturthi",

  "ganesh visarjan": "ganesha visarjan",
  "ganesha visarjan": "ganesha visarjan",

  "shivaratri": "maha shivaratri",
  "maha shivaratri": "maha shivaratri",

  "janmashtami": "krishna janmashtami",
  "krishna janmashtami": "krishna janmashtami",

  "dussehra": "vijayadashami / dussehra",
  "vijayadashami": "vijayadashami / dussehra",

  "vasant panchami": "saraswati puja / vasant panchami",
  "saraswati puja": "saraswati puja / vasant panchami",

  "deepavali": "diwali puja",
  "diwali": "diwali puja",

  "ratha yatra": "jagannath rath yatra",
  "jagannath rathyatra": "jagannath rath yatra",

  "makar sankranti": "makar sankranti",

  "karva chauth": "karwa chauth",
  "karwa chauth": "karwa chauth"
};

const getFestivalEssentialNames = (festivalName = "") => {
  const normalized = normalizeFestivalName(festivalName);

  const directKey = festivalEssentialsMap[normalized];

  if (directKey) {
    return directKey;
  }

  const aliasKey = festivalAliases[normalized];

  if (aliasKey && festivalEssentialsMap[aliasKey]) {
    return festivalEssentialsMap[aliasKey];
  }

  const matchedKey = Object.keys(festivalEssentialsMap).find((key) => {
    const normalizedKey = normalizeFestivalName(key);

    return (
      normalized === normalizedKey ||
      normalized.includes(normalizedKey) ||
      normalizedKey.includes(normalized)
    );
  });

  return matchedKey ? festivalEssentialsMap[matchedKey] : [];
};



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

const parseOdsRegionalCalendars = (arrayBuffer) => {
  const files = unzipSync(new Uint8Array(arrayBuffer));
  const contentXml = files["content.xml"];
  if (!contentXml) throw new Error("Festival spreadsheet is missing content.xml");

  const xml = new DOMParser().parseFromString(
    new TextDecoder().decode(contentXml),
    "application/xml"
  );
  if (xml.getElementsByTagName("parsererror").length) {
    throw new Error("Festival spreadsheet contains invalid XML");
  }

  const tableNamespace = "urn:oasis:names:tc:opendocument:xmlns:table:1.0";
  const textNamespace = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";
  const tables = Array.from(xml.getElementsByTagNameNS(tableNamespace, "table"));
  const getRows = (table) =>
    Array.from(table.getElementsByTagNameNS(tableNamespace, "table-row")).map((row) => {
      const cells = [];
      let columnIndex = 0;

      Array.from(row.children).forEach((cell) => {
        if (
          cell.namespaceURI !== tableNamespace ||
          !["table-cell", "covered-table-cell"].includes(cell.localName)
        ) {
          return;
        }

        const repeatCount = Math.max(
          1,
          Number(cell.getAttributeNS(tableNamespace, "number-columns-repeated")) || 1
        );
        const value = Array.from(cell.children)
          .filter(
            (paragraph) =>
              paragraph.namespaceURI === textNamespace &&
              paragraph.localName === "p"
          )
          .map((paragraph) => paragraph.textContent.trim())
          .filter(Boolean)
          .join(" ");

        for (let count = 0; count < repeatCount && columnIndex < 12; count += 1) {
          cells[columnIndex] = value;
          columnIndex += 1;
        }
      });

      return cells;
    });

  const calendars = {
    "Tamil Calendar": [],
    "Malayalam Calendar": [],
    "Telugu Calendar": [],
  };
  tables.forEach((table) => {
    const sheetName = table.getAttributeNS(tableNamespace, "name");
    const rows = getRows(table).slice(2);

    if (sheetName === "Calendars") {
      rows.forEach((row) => {
        calendars["Tamil Calendar"].push(row[2]);
        calendars["Malayalam Calendar"].push(row[3]);
        calendars["Telugu Calendar"].push(row[4]);
      });
    }
  });

  Object.keys(calendars).forEach((calendar) => {
    calendars[calendar] = [
      ...new Set(
        calendars[calendar]
          .filter((name) => typeof name === "string" && name.trim())
          .map((name) => name.trim())
      ),
    ];
  });
  if (Object.values(calendars).every((names) => names.length === 0)) {
    throw new Error("Festival spreadsheet does not contain regional calendar names");
  }

  return calendars;
};

const getFestivalCategory = (title) => {
  const name = title.toLowerCase();
  if (name.includes("shivaratri") || name.includes("shiva") || name.includes("pradosh")) return "Shaivite Festival";
  if (name.includes("navratri") || name.includes("durga") || name.includes("lakshmi") || name.includes("saraswati") || name.includes("amman") || name.includes("parvathi") || name.includes("kali") || name.includes("chhath") || name.includes("gowri") || name.includes("varalakshmi")) return "Devi Festival";
  if (name.includes("ekadashi") || name.includes("ekadasi") || name.includes("vrat") || name.includes("upavas") || name.includes("amavasya") || name.includes("purnima") || name.includes("chaturthi") || name.includes("sankashti") || name.includes("pradosham") || name.includes("masik")) return "Vrat & Upavas";
  if (name.includes("pongal") || name.includes("onam") || name.includes("bihu") || name.includes("gudi padwa") || name.includes("ugadi") || name.includes("vishu") || name.includes("baisakhi") || name.includes("lohri") || name.includes("rath yatra") || name.includes("raja") || name.includes("nuakhai") || name.includes("batukamma") || name.includes("poila baisakh")) return "Regional Festival";
  if (name.includes("jayanti") || name.includes("mahotsav") || name.includes("aradhana") || name.includes("guru") || name.includes("jayanthi") || name.includes("satsang") || name.includes("kirtan")) return "Spiritual Festival";
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
  const [showPoojaDetails, setShowPoojaDetails] = useState(false);
  const [calendarFestivals, setCalendarFestivals] = useState([]);
  const [regionalCalendars, setRegionalCalendars] = useState({});
  const [calendarLoadError, setCalendarLoadError] = useState("");
  const [regionalCalendarsError, setRegionalCalendarsError] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?.user_id;

  useEffect(() => {
    setLoading(true);
    let isMounted = true;

    const loadCalendarDates = fetch("/hindu_calendar_1900_2100.csv")
      .then((res) => {
        if (!res.ok) throw new Error(`Calendar CSV request failed (${res.status})`);
        return res.text();
      })
      .then((csv) => {
        if (isMounted) setCalendarFestivals(parseCalendarCsv(csv));
      })
      .catch((err) => {
        console.error("Calendar CSV Load Error:", err);
        if (isMounted) setCalendarLoadError("Unable to load calendar dates.");
      });

    const loadFestivalOptions = fetch("/Festival_Calendars.ods")
      .then((res) => {
        if (!res.ok) throw new Error(`Festival ODS request failed (${res.status})`);
        return res.arrayBuffer();
      })
      .then((data) => {
        const calendars = parseOdsRegionalCalendars(data);
        if (isMounted) setRegionalCalendars(calendars);
      })
      .catch((err) => {
        console.error("Festival spreadsheet Load Error:", err);
        if (isMounted) {
          setRegionalCalendarsError("Unable to load regional calendars.");
        }
      });

    Promise.all([loadCalendarDates, loadFestivalOptions]).finally(() => {
      if (isMounted) setLoading(false);
    });

    fetch(`${API_URL}/api/products`, { headers: { ...bypassHeaders } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllProducts(data);
      })
      .catch(err => console.error("Products Load Error:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const parseCalendarCsv = (csv) => {
    return csv.split(/\r?\n/).slice(1).filter(Boolean).map((line) => {
      const columns = parseCsvLine(line);
      const date = columns[0];
      if (!date || !columns[5]) return null;
      const name = columns[5].includes("/") ? columns[5].split("/")[1].trim() : columns[5];
      const details = festivalDetailsMap[name.toLowerCase()];
      return {
        date, name,
        category: getFestivalCategory(name),
        icon: getFestivalIcon(name),
        bgImage: getFestivalImage(name),
        description: details ? details.description : `${name} is a joyful Hindu festival celebrating the divine presence, auspicious beginnings, and spiritual devotion.`
      };
    }).filter(Boolean);
  };

  const openFestival = (festival) => {
    setSelectedFestival(festival);
    setShowPoojaDetails(false);
  };
  const closeFestival = () => {
    setSelectedFestival(null);
    setShowPoojaDetails(false);
  };

  const getFestivalDetails = () => {
    if (!selectedFestival) return null;
    const nameLower = selectedFestival.name.toLowerCase();
    const matchedKey = Object.keys(festivalDetailsMap).find(key => nameLower.includes(key));
    if (matchedKey) return festivalDetailsMap[matchedKey];
    return {
      description: selectedFestival.description,
      steps: [
        `Prepare offerings traditionally associated with ${selectedFestival.name} and arrange them before the prayer begins.`,
        "Light a lamp and incense, then begin with a quiet prayer and your family sankalpam.",
        "Offer flowers, kumkum, water and the festival naivedyam while chanting the relevant mantra.",
        "Complete the aarti, share the prasadam and keep the space peaceful for the rest of the day."
      ],
      finalPrayer: `May ${selectedFestival.name} bring divine blessings, peace, and prosperity to your family.`
    };
  };

  const getFestivalEssentials = () => {
  if (!selectedFestival || !Array.isArray(allProducts)) {
    return [];
  }

  const essentialNames = getFestivalEssentialNames(
    selectedFestival.name
  );

  if (essentialNames.length === 0) {
    return [];
  }

  const normalizeProductText = (value = "") =>
    value
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const products = allProducts
    .map((product) => {
      const productName = normalizeProductText(product.name);
      const productCategory = normalizeProductText(product.category);
      const productDescription = normalizeProductText(product.description);

      return {
        ...product,
        _searchText: `${productName} ${productCategory} ${productDescription}`
      };
    });

  const matchedProducts = [];

  essentialNames.forEach((essentialName) => {
    const essential = normalizeProductText(essentialName);

    if (!essential) return;

    const words = essential
      .split(" ")
      .filter((word) => word.length > 2);

    const matches = products.filter((product) => {
      const text = product._searchText;

      if (text.includes(essential)) {
        return true;
      }

      if (words.length >= 2) {
        const matchedWords = words.filter((word) =>
          text.includes(word)
        );

        return matchedWords.length >= Math.ceil(words.length * 0.6);
      }

      return words.some((word) => text.includes(word));
    });

    matches.forEach((product) => {
      if (!matchedProducts.some((item) => item.id === product.id)) {
        matchedProducts.push(product);
      }
    });
  });

  return matchedProducts.slice(0, 50).map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image:
      product.image && product.image.startsWith("http")
        ? product.image
        : product.image
          ? `${API_URL}${product.image}`
          : DefaultBg
  }));
};

  const handleAddAllEssentials = async () => {
    if (!userId) { navigate("/login"); return; }
    const essentials = getFestivalEssentials();
    try {
      for (const item of essentials) {
        await fetch(`${API_URL}/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...bypassHeaders },
          body: JSON.stringify({ user_id: userId, product_id: item.id, quantity: 1 }),
        });
      }
      window.dispatchEvent(new Event("cartUpdated"));
      alert("Festival essentials added to cart successfully!");
    } catch (err) {
      console.error("Add essentials error:", err);
    }
  };

  const filteredForGrid = useMemo(() => {
    return calendarFestivals.filter(f => {
      const matchesMonthYear = f.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`);
      let matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase().trim());

      let matchesCalendar = true;
      if (selectedCalendar === "Vrat & Upavas") {
        matchesCalendar = f.category === "Vrat & Upavas";
      } else if (regionalCalendars[selectedCalendar]) {
        matchesCalendar = regionalCalendars[selectedCalendar].some((festivalName) => {
          return areRegionalFestivalNamesEquivalent(f.name, festivalName);
        });
      } else if (selectedCalendar !== "Hindu Calendar") {
        const keywords = calendarRegionKeywords[selectedCalendar] || [];
        const nameLower = f.name.toLowerCase();
        const regionalMatch = keywords.some(key => nameLower.includes(key));
        const isMajor = majorFestivals.some(fest => nameLower.includes(fest));
        matchesCalendar = regionalMatch || isMajor;
      }

      return matchesMonthYear && matchesCategory && matchesSearch && matchesCalendar;
    });
  }, [calendarFestivals, currentMonth, currentYear, selectedCategory, selectedCalendar, regionalCalendars, search]);

  const upcomingList = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    return calendarFestivals.filter(f => {
      if (f.category === "Vrat & Upavas") return false;
      return f.date >= todayStr;
    }).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10);
  }, [calendarFestivals]);

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

        {calendarLoadError && <p className="festival-data-error" role="alert">{calendarLoadError}</p>}
        {regionalCalendarsError && <p className="festival-data-error" role="alert">{regionalCalendarsError}</p>}

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
            <span className="modal-category">HINDU FESTIVAL</span>
            <h2>{selectedFestival.name}</h2>
            <div className="modal-date">📅 {formatDate(selectedFestival.date)}</div>
            <p className="modal-description">{getFestivalDetails().description}</p>

            <button className="pooja-toggle-btn" onClick={() => setShowPoojaDetails(!showPoojaDetails)}>
              {showPoojaDetails ? "Hide Pooja Details" : "How to do Pooja"}
            </button>

            {showPoojaDetails && (
              <div className="pooja-details-container">
                <div className="pooja-steps-header">
                  <span className="pooja-header-mark">🌿</span>
                  <h3 className="pooja-steps-title">Follow These Easy Steps for a Blessed Pooja and Festival essentials</h3>
                  <span className="pooja-header-mark">🌿</span>
                </div>

                <div className="pooja-split-layout">
                  <div className="pooja-steps-panel">
                    <div className="pooja-layout-top">
                      <div className="pooja-main-feature-img">
                        <img src={getFestivalImage(selectedFestival.name)} alt={selectedFestival.name} />
                        <div className="feature-img-caption">
                          <h4>{selectedFestival.name} Vidhi & Rituals</h4>
                          <p>Complete sacred guide for devotees</p>
                        </div>
                      </div>

                      <div className="pooja-sidebar-steps">
                        <h4 className="sidebar-steps-heading">Simple Steps</h4>
                        <div className="sidebar-steps-list">
                          {getFestivalDetails().steps.slice(0, 4).map((step, idx) => {
                            const stepImages = [ShivaratriBg, NavratriBg, DiwaliBg, GanpatiBg, SankrantiBg];
                            const stepImg = stepImages[idx % stepImages.length];
                            const preview = step.includes(" – ")
                              ? step.split(" – ")[1] || step
                              : step.includes(" - ")
                                ? step.split(" - ")[1] || step
                                : step;

                            return (
                              <div className="pooja-step-row-card" key={idx}>
                                <div className="pooja-step-visual-small">
                                  <img src={stepImg} alt={`Step ${idx + 1}`} className="pooja-step-photo" />
                                  <span className="pooja-step-number-small">{idx + 1}</span>
                                </div>
                                <p>{preview}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {getFestivalDetails().steps.length > 4 && (
                      <div className="pooja-continues-section">
                        <div className="pooja-steps-grid-bottom">
                          {getFestivalDetails().steps.slice(4).map((step, idx) => {
                            const realIdx = idx + 4;
                            const stepImages = [HoliBg, DefaultBg, ShivaratriBg, NavratriBg, DiwaliBg];
                            const stepImg = stepImages[idx % stepImages.length];
                            const preview = step.includes(" – ")
                              ? step.split(" – ")[1] || step
                              : step.includes(" - ")
                                ? step.split(" - ")[1] || step
                                : step;

                            return (
                              <div className="pooja-step-card" key={realIdx}>
                                <div className="pooja-step-visual">
                                  <img src={stepImg} alt={`Step ${realIdx + 1}`} className="pooja-step-photo" />
                                  <span className="pooja-step-number">{realIdx + 1}</span>
                                </div>
                                <p>{preview}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {getFestivalDetails().finalPrayer && (
                      <div className="pooja-final-prayer">
                        <p style={{ margin: 0 }}><strong>🙏 Final prayer:</strong><br />{getFestivalDetails().finalPrayer}</p>
                      </div>
                    )}
                  </div>

                  <div className="pooja-essentials-panel">
                    <div className="festival-essentials-header">
                      <h4>Festival essentials</h4>
                      <span className="essentials-count">{getFestivalEssentials().length} items</span>
                    </div>

                    <div className="essentials-list-scroll">
                      {getFestivalEssentials().map(item => (
                        <div key={item.id} className="essential-product-card">
                          <img src={item.image.startsWith("http") ? item.image : `${API_URL}${item.image}`} alt={item.name} className="essential-product-img" />
                          <div className="essential-product-info">
                            <p className="essential-product-name">{item.name}</p>
                            <div className="essential-product-price">₹{Number(item.price).toLocaleString("en-IN")}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button className="add-all-essentials-btn" onClick={handleAddAllEssentials}>
                      Add All Festival Essentials to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-divider">✦</div>
            <button className="modal-done" onClick={closeFestival}>Continue Exploring</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default FestivalCalendar;
