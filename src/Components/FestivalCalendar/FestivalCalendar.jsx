import React, { useEffect, useMemo, useState } from "react";
import "./FestivalCalendar.css";
import API_URL from "../../apiConfig";

const festivalDetails = [
  // =========================
  // JANUARY
  // =========================
  {
    date: "2026-01-14",
    name: "Pongal",
    category: "Harvest Festival",
    icon: "🌾",
    description:
      "A joyful harvest festival celebrating prosperity, gratitude and new beginnings.",
  },
  {
    date: "2026-01-14",
    name: "Makara Sankranti",
    category: "Hindu Festival",
    icon: "☀️",
    description:
      "A sacred solar festival marking the Sun's transition into Makara.",
  },
  {
    date: "2026-01-23",
    name: "Vasant Panchami",
    category: "Hindu Festival",
    icon: "🌼",
    description:
      "A festival dedicated to knowledge, learning and Goddess Saraswati.",
  },

  // =========================
  // FEBRUARY
  // =========================
  {
    date: "2026-02-15",
    name: "Maha Shivaratri",
    category: "Shaivite Festival",
    icon: "🔱",
    description:
      "A sacred night dedicated to Lord Shiva, observed with prayer and devotion.",
  },

  // =========================
  // MARCH
  // =========================
  {
    date: "2026-03-04",
    name: "Holi",
    category: "Festival of Colours",
    icon: "🎨",
    description:
      "The vibrant festival of colours celebrating joy, love and the arrival of spring.",
  },
  {
    date: "2026-03-19",
    name: "Ugadi",
    category: "New Year",
    icon: "🌿",
    description:
      "The traditional New Year celebration observed in several South Indian regions.",
  },
  {
    date: "2026-03-19",
    name: "Gudi Padwa",
    category: "New Year",
    icon: "🚩",
    description:
      "The traditional Marathi New Year celebrated with homes decorated for prosperity.",
  },
  {
    date: "2026-03-19",
    name: "Chaitra Navratri",
    category: "Devi Festival",
    icon: "🪷",
    description:
      "Nine sacred days dedicated to the divine feminine and Goddess Durga.",
  },
  {
    date: "2026-03-26",
    name: "Rama Navami",
    category: "Hindu Festival",
    icon: "🏹",
    description:
      "The auspicious celebration of the birth of Lord Rama.",
  },

  // =========================
  // APRIL
  // =========================
  {
    date: "2026-04-14",
    name: "Tamil New Year",
    category: "Tamil Festival",
    icon: "🌺",
    description:
      "Puthandu, the traditional Tamil New Year celebrated with prayers and festive traditions.",
  },
  {
    date: "2026-04-14",
    name: "Vishu",
    category: "Regional Festival",
    icon: "🪔",
    description:
      "The traditional Malayalam New Year associated with auspicious beginnings.",
  },
  {
    date: "2026-04-19",
    name: "Akshaya Tritiya",
    category: "Auspicious Day",
    icon: "✨",
    description:
      "A highly auspicious day traditionally associated with prosperity and new beginnings.",
  },

  // =========================
  // MAY
  // =========================
  {
    date: "2026-05-01",
    name: "Buddha Purnima",
    category: "Spiritual Festival",
    icon: "🪷",
    description:
      "A sacred day commemorating the birth, enlightenment and teachings of Buddha.",
  },

  // =========================
  // JUNE
  // =========================
  {
    date: "2026-06-25",
    name: "Nirjala Ekadashi",
    category: "Vrat",
    icon: "🪔",
    description:
      "An important Ekadashi observance traditionally associated with devotion and fasting.",
  },

  // =========================
  // JULY
  // =========================
  {
    date: "2026-07-16",
    name: "Jagannath Rath Yatra",
    category: "Hindu Festival",
    icon: "🛕",
    description:
      "The grand chariot festival dedicated to Lord Jagannath.",
  },
  {
    date: "2026-07-29",
    name: "Guru Purnima",
    category: "Spiritual Festival",
    icon: "🙏",
    description:
      "A sacred occasion to honour teachers, gurus and spiritual guides.",
  },

  // =========================
  // AUGUST
  // =========================
  {
    date: "2026-08-15",
    name: "Hariyali Teej",
    category: "Devi Festival",
    icon: "🌿",
    description:
      "A traditional festival celebrating devotion, nature and marital well-being.",
  },
  {
    date: "2026-08-17",
    name: "Nag Panchami",
    category: "Hindu Festival",
    icon: "🐍",
    description:
      "A traditional festival dedicated to the worship of serpent deities.",
  },
  {
    date: "2026-08-26",
    name: "Onam",
    category: "Harvest Festival",
    icon: "🌸",
    description:
      "Kerala's beloved harvest festival celebrating prosperity, culture and togetherness.",
  },
  {
    date: "2026-08-28",
    name: "Varalakshmi Vrat",
    category: "Devi Festival",
    icon: "🪔",
    description:
      "Varalakshmi Vratham is an auspicious Hindu festival dedicated to Goddess Lakshmi, the goddess of wealth, prosperity, happiness, and abundance. It is traditionally observed by married women, especially in South India, on the Friday before the full moon (Purnima) in the month of Shravana.",
  },
  {
    date: "2026-08-28",
    name: "Raksha Bandhan",
    category: "Hindu Festival",
    icon: "🧿",
    description:
      "Raksha Bandhan is a beautiful Hindu festival that celebrates the special bond of love, care, and protection between brothers and sisters. The festival is traditionally observed on the full moon day (Purnima) of the Hindu month of Shravana.",
  },

  // =========================
  // SEPTEMBER
  // =========================
  {
    date: "2026-09-04",
    name: "Janmashtami",
    category: "Krishna Festival",
    icon: "🦚",
    description:
      "Janmashtami, also known as Krishna Janmashtami, is a sacred Hindu festival celebrating the birth of Lord Krishna, one of the most beloved incarnations of Lord Vishnu. It is observed on the Ashtami Tithi (eighth lunar day) of the Krishna Paksha in the month of Shravana or Bhadrapada, depending on the regional calendar.",
  },
  {
    date: "2026-09-14",
    name: "Ganesh Chaturthi",
    category: "Hindu Festival",
    icon: "🐘",
    description:
      "Ganesh Chaturthi is a joyful Hindu festival celebrating the birth of Lord Ganesha, the beloved deity of wisdom, prosperity, and auspicious beginnings. The festival is observed on the Chaturthi Tithi (fourth lunar day) of the Shukla Paksha in the month of Bhadrapada.",
  },

  // =========================
  // OCTOBER
  // =========================
  {
    date: "2026-10-11",
    name: "Sharad Navratri",
    category: "Devi Festival",
    icon: "🪷",
    description:
      "Nine nights of devotion celebrating the many forms of Goddess Durga.",
  },
  {
    date: "2026-10-20",
    name: "Dussehra",
    category: "Hindu Festival",
    icon: "🏹",
    description:
      "The festival celebrating the victory of good over evil.",
  },

  // =========================
  // NOVEMBER
  // =========================
  {
    date: "2026-11-08",
    name: "Diwali",
    category: "Festival of Lights",
    icon: "🪔",
    description:
      "The festival of lights celebrating hope, prosperity, devotion and the triumph of light over darkness.",
  },
  {
    date: "2026-11-09",
    name: "Govardhan Puja",
    category: "Hindu Festival",
    icon: "🌿",
    description:
      "A sacred celebration associated with Lord Krishna and Govardhan Hill.",
  },
  {
    date: "2026-11-10",
    name: "Bhai Dooj",
    category: "Hindu Festival",
    icon: "❤️",
    description:
      "A traditional celebration honouring the bond between brothers and sisters.",
  },

  // =========================
  // DECEMBER
  // =========================
  {
    date: "2026-12-25",
    name: "Vaikuntha Ekadashi",
    category: "Vaishnavite Festival",
    icon: "🛕",
    description:
      "An important Vaishnavite observance associated with devotion to Lord Vishnu.",
  },
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getFestivalCategory = (title) => {
  const name = title.toLowerCase();

  if (name.includes("shivaratri")) return "Shaivite Festival";
  if (name.includes("navratri") || name.includes("durga") || name.includes("lakshmi")) return "Devi Festival";
  if (name.includes("ekadashi") || name.includes("vrat")) return "Vrat";
  if (name.includes("purnima") || name.includes("jayanti")) return "Spiritual Festival";
  if (name.includes("sankranti") || name.includes("new year") || name.includes("ugadi") || name.includes("gudi")) return "Regional Festival";
  if (name.includes("pongal") || name.includes("onam")) return "Harvest Festival";
  if (name.includes("diwali") || name.includes("dhanteras")) return "Festival of Lights";
  if (name.includes("holi")) return "Festival of Colours";

  return "Hindu Festival";
};

const getFestivalIcon = (title) => {
  const name = title.toLowerCase();

  if (name.includes("ganesh") || name.includes("vinayak")) return "🐘";
  if (name.includes("krishna") || name.includes("janmashtami") || name.includes("govardhan")) return "🦚";
  if (name.includes("rama") || name.includes("dussehra") || name.includes("vijayadashami")) return "🏹";
  if (name.includes("shiva") || name.includes("shivaratri") || name.includes("rudra")) return "🔱";
  if (name.includes("lakshmi") || name.includes("diwali") || name.includes("dhanteras")) return "🪔";
  if (name.includes("durga") || name.includes("navratri")) return "🪷";
  if (name.includes("saraswati")) return "🌼";
  if (name.includes("hanuman")) return "🙏";
  if (name.includes("surya") || name.includes("sankranti")) return "☀️";
  if (name.includes("holi")) return "🎨";
  if (name.includes("raksha") || name.includes("rakhi") || name.includes("bhai")) return "🧿";
  if (name.includes("guru") || name.includes("jayanti")) return "🙏";
  if (name.includes("ekadashi") || name.includes("purnima") || name.includes("amavas")) return "🌙";
  if (name.includes("teej") || name.includes("onam") || name.includes("pongal")) return "🌺";

  return "🪔";
};

const parseCalendarCsv = (csv) => {
  return csv
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const columns = line.split(",");
      const name = columns[5] || "Festival";
      const details = festivalDetails.find((festival) =>
        name.toLowerCase().startsWith(festival.name.toLowerCase())
      );

      return {
        date: columns[0],
        name,
        category: details?.category || getFestivalCategory(name),
        icon: details?.icon || getFestivalIcon(name),
        description: details?.description || `${name} is an auspicious day observed with prayer, offerings and devotion.`,
      };
    });
};

const categories = [
  "All",
  "Hindu Festival",
  "Devi Festival",
  "Spiritual Festival",
  "Harvest Festival",
  "New Year",
  "Regional Festival",
  "Festival of Lights",
  "Festival of Colours",
  "Vrat",
];

const festivalProductKeywords = {
  Pongal: ["pongal", "rice", "sugarcane", "turmeric"],
  "Makara Sankranti": ["sankranti", "sesame", "til", "kite"],
  "Vasant Panchami": ["saraswati", "yellow", "book", "incense"],
  "Maha Shivaratri": ["shiva", "shiv", "bilva", "rudraksha"],
  Holi: ["holi", "colour", "gulal", "color"],
  Ugadi: ["ugadi", "neem", "mango", "kalash"],
  "Gudi Padwa": ["gudi", "kalash", "mango", "neem"],
  "Chaitra Navratri": ["navratri", "durga", "kumkum", "diya"],
  "Rama Navami": ["rama", "ram", "tulsi", "incense"],
  "Tamil New Year": ["tamil", "mango", "neem", "kalash"],
  Vishu: ["vishu", "kanikonna", "mango", "kalash"],
  "Akshaya Tritiya": ["akshaya", "gold", "lakshmi", "diya"],
  "Buddha Purnima": ["buddha", "incense", "diya", "lotus"],
  "Nirjala Ekadashi": ["ekadashi", "vishnu", "tulsi", "incense"],
  "Jagannath Rath Yatra": ["jagannath", "krishna", "chandan", "incense"],
  "Guru Purnima": ["guru", "incense", "diya", "chandan"],
  "Hariyali Teej": ["teej", "mehndi", "green", "bangles"],
  "Nag Panchami": ["nag", "naga", "milk", "incense"],
  Onam: ["onam", "flower", "pookalam", "lamp"],
  "Varalakshmi Vrat": ["varalakshmi", "lakshmi", "kumkum", "kalash"],
  "Raksha Bandhan": ["rakhi", "raksha", "bandhan"],
  Janmashtami: ["janmashtami", "krishna", "flute", "makhan"],
  "Ganesh Chaturthi": ["ganesh", "ganesha", "modak", "durva"],
  "Sharad Navratri": ["navratri", "durga", "kumkum", "diya"],
  Dussehra: ["dussehra", "rama", "ram", "incense"],
  Diwali: ["diwali", "deepavali", "diya", "lakshmi"],
  "Govardhan Puja": ["govardhan", "krishna", "tulsi", "incense"],
  "Bhai Dooj": ["bhai", "dooj", "kumkum", "tilak"],
  "Vaikuntha Ekadashi": ["vaikuntha", "ekadashi", "vishnu", "tulsi"],
};

const defaultPoojaSteps = [
  "Clean the prayer space and place the deity or festival symbol on a fresh cloth.",
  "Light a lamp and incense, then begin with a quiet prayer and your family sankalpam.",
  "Offer flowers, kumkum, water and the festival naivedyam while chanting the relevant mantra.",
  "Complete the aarti, share the prasadam and keep the space peaceful for the rest of the day.",
];

const getPoojaSteps = (festival) => [
  `Prepare offerings traditionally associated with ${festival.name} and arrange them before the prayer begins.`,
  ...defaultPoojaSteps.slice(1),
];

const getRelatedProducts = (festival, products) => {
  const keywords = festivalProductKeywords[festival.name] || [
    ...festival.name.toLowerCase().split(/\s+/),
    festival.category.toLowerCase(),
  ];

  const festivalProducts = products.filter((product) => {
    const searchableText = `${product.name || ""} ${product.category || ""}`.toLowerCase();
    return keywords.some((keyword) => searchableText.includes(keyword.trim().toLowerCase()));
  });

  if (festivalProducts.length) {
    return festivalProducts;
  }

  return products.filter((product) => {
    const searchableText = `${product.name || ""} ${product.category || ""}`.toLowerCase();
    return ["pooja", "puja", "samagri", "devotional", "ritual"].some((keyword) =>
      searchableText.includes(keyword)
    );
  });
};

const FestivalCalendar = () => {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(7);
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [search, setSearch] = useState("");
  const [selectedFestival, setSelectedFestival] =
    useState(null);
  const [calendarFestivals, setCalendarFestivals] = useState([]);
  const [showPoojaDetails, setShowPoojaDetails] =
    useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [addingProducts, setAddingProducts] = useState(false);
  const [visibleProductCount, setVisibleProductCount] = useState(5);

  useEffect(() => {
    fetch("/hindu_calendar_1900_2100.csv")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load festival calendar");
        }

        return response.text();
      })
      .then((csv) => setCalendarFestivals(parseCalendarCsv(csv)))
      .catch((error) => console.error("Festival calendar error:", error));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load products");
        }

        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Festival products error:", error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const openFestival = (festival) => {
    setSelectedFestival(festival);
    setShowPoojaDetails(false);
    setVisibleProductCount(5);
  };

  const closeFestival = () => {
    setSelectedFestival(null);
    setShowPoojaDetails(false);
    setVisibleProductCount(5);
  };

  const addFestivalProductsToCart = async () => {
    const user = localStorage.getItem("user");
    let currentUser;

    try {
      currentUser = user ? JSON.parse(user) : null;
    } catch (error) {
      currentUser = null;
    }

    const userId = currentUser?.id || currentUser?.user_id;
    const relatedProducts = getRelatedProducts(selectedFestival, products);

    if (!userId) {
      alert("Please log in to add products to your cart.");
      return;
    }

    if (!relatedProducts.length) {
      alert("No products are currently linked to this festival.");
      return;
    }

    setAddingProducts(true);

    try {
      await Promise.all(
        relatedProducts.map((product) =>
          fetch(`${API_URL}/api/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              product_id: product.id,
              quantity: 1,
            }),
          }).then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || "Unable to add products");
            }
          })
        )
      );

      window.dispatchEvent(new Event("cartUpdated"));
      alert(`${relatedProducts.length} festival product${relatedProducts.length === 1 ? "" : "s"} added to cart.`);
    } catch (error) {
      console.error("Festival products cart error:", error);
      alert(error.message || "Unable to add festival products to cart.");
    } finally {
      setAddingProducts(false);
    }
  };

  // =========================
  // CHANGE MONTH
  // =========================

  const changeMonth = (direction) => {
    let month = currentMonth + direction;
    let year = currentYear;

    if (month < 0) {
      month = 11;
      year--;
    }

    if (month > 11) {
      month = 0;
      year++;
    }

    setCurrentMonth(month);
    setCurrentYear(year);
  };

  // =========================
  // GO TO CURRENT MONTH
  // =========================

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // =========================
  // FILTER FESTIVALS
  // =========================

  const filteredFestivals = useMemo(() => {
    return calendarFestivals.filter((festival) => {
      const yearMatch = festival.date.startsWith(`${currentYear}-`);
      const categoryMatch =
        selectedCategory === "All" ||
        festival.category === selectedCategory;

      const searchMatch =
        festival.name
          .toLowerCase()
          .includes(search.toLowerCase().trim()) ||
        festival.category
          .toLowerCase()
          .includes(search.toLowerCase().trim());

      return yearMatch && categoryMatch && searchMatch;
    });
  }, [calendarFestivals, currentYear, selectedCategory, search]);

  // =========================
  // CALENDAR DAYS
  // =========================

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      currentYear,
      currentMonth,
      1
    ).getDay();

    const daysInMonth = new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();

    const previousMonthDays = new Date(
      currentYear,
      currentMonth,
      0
    ).getDate();

    const days = [];

    // Previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: previousMonthDays - i,
        currentMonth: false,
      });
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        currentMonth: true,
      });
    }

    // Next month
    let nextDay = 1;

    while (days.length < 42) {
      days.push({
        day: nextDay,
        currentMonth: false,
      });

      nextDay++;
    }

    return days;
  }, [currentMonth, currentYear]);

  // =========================
  // GET FESTIVALS FOR DAY
  // =========================

  const getFestivalsForDay = (day) => {
    if (!day.currentMonth) {
      return [];
    }

    const dateString =
      `${currentYear}-${String(
        currentMonth + 1
      ).padStart(2, "0")}-${String(
        day.day
      ).padStart(2, "0")}`;

    return filteredFestivals.filter(
      (festival) =>
        festival.date === dateString
    );
  };

  // =========================
  // UPCOMING FESTIVALS
  // =========================

  const upcomingFestivals = filteredFestivals
    .filter(
      (festival) =>
        new Date(festival.date) >= today
    )
    .sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    )
    .slice(0, 5);

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // CHECK TODAY
  // =========================

  const isToday = (day) => {
    return (
      day.currentMonth &&
      day.day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const relatedProducts = selectedFestival
    ? getRelatedProducts(selectedFestival, products)
    : [];

  return (
    <main className="festival-page">

      {/* =========================
            HERO
        ========================= */}

        <section className="festival-hero">

        <div className="festival-hero-pattern"></div>

        {/* Decorative Festival Icons */}
        <div className="festival-icon icon-diya">🪔</div>
        <div className="festival-icon icon-lotus">🪷</div>
        <div className="festival-icon icon-kalash">🏺</div>
        <div className="festival-icon icon-bell">🔔</div>
        <div className="festival-icon icon-peacock">🦚</div>
        <div className="festival-icon icon-ganesh">🐘</div>

        <div className="festival-hero-content">

            <div className="festival-eyebrow">
            ✦ SACRED MOMENTS · 2026 ✦
            </div>

            <h1>
            Festival
            <span> Calendar</span>
            </h1>

            <p>
            Discover India's sacred festivals,
            auspicious days and beautiful traditions
            throughout the year.
            </p>

            <div className="hero-divider">
            <span>✦</span>
            </div>

        </div>

        </section>


      {/* =========================
          MAIN CONTENT
      ========================== */}

      <section className="festival-container">

        {/* SEARCH + FILTER */}

        <div className="festival-tools">

          <div className="festival-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search festivals..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </div>


          <div className="festival-filter">

            <label>
              Festival Type
            </label>

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
            >
              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>

          </div>

        </div>


        {/* =========================
            CALENDAR HEADER
        ========================== */}

        <div className="calendar-card">

          <div className="calendar-header">

            <div>

              <span className="calendar-label">
                SACRED DAYS
              </span>

              <h2>
                {months[currentMonth]}
                <span>
                  {" "}
                  {currentYear}
                </span>
              </h2>

            </div>


            <div className="calendar-actions">

              <button
                className="today-button"
                onClick={goToToday}
              >
                Today
              </button>

              <button
                className="calendar-nav"
                onClick={() =>
                  changeMonth(-1)
                }
                aria-label="Previous month"
              >
                ←
              </button>

              <button
                className="calendar-nav"
                onClick={() =>
                  changeMonth(1)
                }
                aria-label="Next month"
              >
                →
              </button>

            </div>

          </div>


          {/* WEEK DAYS */}

          <div className="calendar-weekdays">

            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((day) => (
              <div key={day}>
                {day}
              </div>
            ))}

          </div>


          {/* CALENDAR */}

          <div className="calendar-grid">

            {calendarDays.map(
              (day, index) => {

                const dayFestivals =
                  getFestivalsForDay(day);

                return (
                  <div
                    key={index}
                    className={`
                      calendar-day
                      ${
                        !day.currentMonth
                          ? "muted-day"
                          : ""
                      }
                      ${
                        isToday(day)
                          ? "today"
                          : ""
                      }
                      ${
                        dayFestivals.length
                          ? "festival-day"
                          : ""
                      }
                    `}
                  >

                    <span className="day-number">
                      {day.day}
                    </span>


                    {dayFestivals.map(
                      (festival) => (

                        <button
                          key={
                            festival.name
                          }
                          className="festival-event"
                          onClick={() => openFestival(festival)}
                        >

                          <span>
                            {festival.icon}
                          </span>

                          <strong>
                            {festival.name}
                          </strong>

                        </button>

                      )
                    )}

                  </div>
                );
              }
            )}

          </div>

        </div>


        {/* =========================
            UPCOMING FESTIVALS
        ========================== */}

        <section className="upcoming-section">

          <div className="section-heading">

            <div>

              <span>
                MARK YOUR CALENDAR
              </span>

              <h2>
                Upcoming Festivals
              </h2>

            </div>

            <div className="heading-decoration">
              ✦
            </div>

          </div>


          <div className="upcoming-grid">

            {upcomingFestivals.length > 0 ? (

              upcomingFestivals.map(
                (festival) => (

                  <button
                    className="upcoming-card"
                    key={festival.name}
                    onClick={() => openFestival(festival)}
                  >

                    <div className="upcoming-icon">
                      {festival.icon}
                    </div>

                    <div className="upcoming-info">

                      <span className="upcoming-date">
                        {formatDate(
                          festival.date
                        )}
                      </span>

                      <h3>
                        {festival.name}
                      </h3>

                      <p>
                        {festival.category}
                      </p>

                    </div>

                    <span className="upcoming-arrow">
                      →
                    </span>

                  </button>

                )
              )

            ) : (

              <div className="empty-festivals">

                <div>🪔</div>

                <h3>
                  No festivals found
                </h3>

                <p>
                  Try another search or
                  festival category.
                </p>

              </div>

            )}

          </div>

        </section>


        {/* =========================
            FESTIVAL COUNT
        ========================== */}

        <div className="festival-footer">

          <span>
            ✦
          </span>

          <p>
            {filteredFestivals.length} sacred
            celebrations in {currentYear}
          </p>

          <span>
            ✦
          </span>

        </div>

      </section>


      {/* =========================
          FESTIVAL MODAL
      ========================== */}

      {selectedFestival && (

        <div
          className="festival-modal-backdrop"
          onClick={closeFestival}
        >

          <div
            className="festival-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={closeFestival}
            >
              ×
            </button>


            <div className="modal-icon">
              {selectedFestival.icon}
            </div>


            <span className="modal-category">
              {selectedFestival.category}
            </span>


            <h2>
              {selectedFestival.name}
            </h2>


            <div className="modal-date">
              <span>📅</span>

              {formatDate(
                selectedFestival.date
              )}
            </div>


            <p className="modal-description">
              {selectedFestival.description}
            </p>

            <button
              className="modal-pooja-button"
              onClick={() => setShowPoojaDetails((visible) => !visible)}
            >
              {showPoojaDetails ? "Hide Pooja Details" : "How to do Pooja"}
            </button>

            {showPoojaDetails && (
              <div className="pooja-details">
                <h3>Simple pooja steps</h3>
                <ol>
                  {getPoojaSteps(selectedFestival).map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>

                <div className="festival-products-heading">
                  <h3>Festival essentials</h3>
                  <span>
                    {productsLoading ? "Loading..." : `${relatedProducts.length} items`}
                  </span>
                </div>

                {relatedProducts.length > 0 && (
                  <div className="festival-products-list">
                    {relatedProducts.slice(0, visibleProductCount).map((product) => (
                      <div className="festival-product" key={product.id}>
                        <div className="festival-product-image">
                          {product.image ? (
                            <img src={`${API_URL}${product.image}`} alt="" />
                          ) : (
                            <span>🪔</span>
                          )}
                        </div>
                        <div>
                          <strong>{product.name}</strong>
                          <span>₹{Number(product.price).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {relatedProducts.length > visibleProductCount && (
                  <button
                    className="festival-load-more"
                    onClick={() => setVisibleProductCount((count) => count + 5)}
                  >
                    Load More
                  </button>
                )}

                <button
                  className="modal-done festival-cart-button"
                  onClick={addFestivalProductsToCart}
                  disabled={addingProducts || productsLoading || !relatedProducts.length}
                >
                  {addingProducts ? "Adding to Cart..." : "Add All Festival Essentials to Cart"}
                </button>
              </div>
            )}


            <div className="modal-divider">
              ✦
            </div>


            <button
              className="modal-done"
              onClick={closeFestival}
            >
              Continue Exploring
            </button>

          </div>

        </div>

      )}

    </main>
  );
};

export default FestivalCalendar;