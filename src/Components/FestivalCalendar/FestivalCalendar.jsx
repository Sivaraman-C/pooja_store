import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FestivalCalendar.css";
import API_URL, { bypassHeaders } from "../../apiConfig";

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

const festivalEssentialsMap = {
  "ganesha visarjan": [
    { id: "gv_1", name: "Ganesha idol", price: 450, image: DefaultBg },
    { id: "gv_2", name: "Fresh flowers & garland", price: 150, image: DefaultBg },
    { id: "gv_3", name: "Durva grass", price: 40, image: DefaultBg },
    { id: "gv_4", name: "Turmeric & kumkum", price: 60, image: DefaultBg },
    { id: "gv_5", name: "Sandalwood paste", price: 90, image: DefaultBg },
    { id: "gv_6", name: "Oil/ghee diya", price: 120, image: DefaultBg },
    { id: "gv_7", name: "Camphor", price: 75, image: DefaultBg },
    { id: "gv_8", name: "Incense sticks/dhoop", price: 80, image: DefaultBg },
    { id: "gv_9", name: "Fruits", price: 200, image: DefaultBg },
    { id: "gv_10", name: "Coconut", price: 30, image: DefaultBg },
    { id: "gv_11", name: "Modak / ladoo", price: 250, image: DefaultBg },
    { id: "gv_12", name: "Betel leaves & betel nuts", price: 50, image: DefaultBg },
    { id: "gv_13", name: "Akshata (rice mixed with turmeric)", price: 30, image: DefaultBg },
    { id: "gv_14", name: "Kalash & water", price: 180, image: DefaultBg },
    { id: "gv_15", name: "Sacred thread", price: 25, image: DefaultBg },
    { id: "gv_16", name: "Aarti plate", price: 350, image: DefaultBg },
    { id: "gv_17", name: "Ganesh mantra/aarti book", price: 100, image: DefaultBg },
    { id: "gv_18", name: "Clean cloth for carrying the idol", price: 150, image: DefaultBg }
  ],
  "hartalika teej": [
    { id: "ht_1", name: "Lord Shiva idol", price: 500, image: DefaultBg },
    { id: "ht_2", name: "Goddess Parvati idol", price: 500, image: DefaultBg },
    { id: "ht_3", name: "Lord Ganesha idol", price: 450, image: DefaultBg },
    { id: "ht_4", name: "Kalash", price: 180, image: DefaultBg },
    { id: "ht_5", name: "Coconut", price: 30, image: DefaultBg },
    { id: "ht_6", name: "Mango leaves", price: 40, image: DefaultBg },
    { id: "ht_7", name: "Gangajal", price: 75, image: DefaultBg },
    { id: "ht_8", name: "Akshata (raw rice)", price: 30, image: DefaultBg },
    { id: "ht_9", name: "Kumkum", price: 40, image: DefaultBg },
    { id: "ht_10", name: "Haldi", price: 40, image: DefaultBg },
    { id: "ht_11", name: "Chandan", price: 90, image: DefaultBg },
    { id: "ht_12", name: "Sindoor", price: 50, image: DefaultBg },
    { id: "ht_13", name: "Mauli / Kalawa", price: 25, image: DefaultBg },
    { id: "ht_14", name: "Janeu", price: 30, image: DefaultBg },
    { id: "ht_15", name: "Durva grass", price: 40, image: DefaultBg },
    { id: "ht_16", name: "Bel Patra", price: 50, image: DefaultBg },
    { id: "ht_17", name: "Shami leaves", price: 40, image: DefaultBg },
    { id: "ht_18", name: "Datura", price: 40, image: DefaultBg },
    { id: "ht_19", name: "Fresh flowers & garland", price: 150, image: DefaultBg },
    { id: "ht_20", name: "Betel leaves & supari", price: 50, image: DefaultBg },
    { id: "ht_21", name: "Diya & cotton wicks", price: 120, image: DefaultBg },
    { id: "ht_22", name: "Ghee", price: 250, image: DefaultBg },
    { id: "ht_23", name: "Camphor", price: 75, image: DefaultBg },
    { id: "ht_24", name: "Agarbatti & Dhoop", price: 80, image: DefaultBg },
    { id: "ht_25", name: "Pooja thali", price: 350, image: DefaultBg },
    { id: "ht_26", name: "Panchapatra", price: 220, image: DefaultBg },
    { id: "ht_27", name: "Bell", price: 150, image: DefaultBg }
  ],
  "rama navami": [
    { id: "rn_1", name: "Rama idol/image", price: 450, image: DefaultBg },
    { id: "rn_2", name: "Sita idol/image", price: 450, image: DefaultBg },
    { id: "rn_3", name: "Lakshmana idol/image", price: 400, image: DefaultBg },
    { id: "rn_4", name: "Hanuman idol/image", price: 350, image: DefaultBg },
    { id: "rn_5", name: "Tulsi leaves", price: 20, image: DefaultBg },
    { id: "rn_6", name: "Flowers", price: 100, image: DefaultBg },
    { id: "rn_7", name: "Garland", price: 150, image: DefaultBg },
    { id: "rn_8", name: "Turmeric", price: 40, image: DefaultBg },
    { id: "rn_9", name: "Kumkum", price: 40, image: DefaultBg },
    { id: "rn_10", name: "Sandalwood", price: 90, image: DefaultBg },
    { id: "rn_11", name: "Akshata", price: 30, image: DefaultBg },
    { id: "rn_12", name: "Coconut", price: 30, image: DefaultBg },
    { id: "rn_13", name: "Fruits", price: 200, image: DefaultBg },
    { id: "rn_14", name: "Panakam ingredients", price: 80, image: DefaultBg },
    { id: "rn_15", name: "Kosambari ingredients", price: 90, image: DefaultBg },
    { id: "rn_16", name: "Incense sticks", price: 80, image: DefaultBg },
    { id: "rn_17", name: "Camphor", price: 75, image: DefaultBg },
    { id: "rn_18", name: "Cotton wicks", price: 40, image: DefaultBg }
  ]
};

const festivalDetailsMap = {
  "ganesh chaturthi": {
    description: "Ganesha Chaturthi celebrates the birth of Lord Ganesha, the remover of obstacles and deity of wisdom and prosperity. Devotees install Ganesha idols, perform special poojas, offer modaks and flowers, and seek His blessings for success and happiness.",
    steps: [
      "Clean and decorate the home altar and place a clean platform (chowki) for Lord Ganesha.",
      "Pran Pratishtha – Install the Ganesha idol with devotion, invoking His divine presence with sacred mantras.",
      "Offer Shodashopachara – Offer water, sacred thread, kumkum, sandalwood paste, flowers, and Durva grass.",
      "Naivedyam & Modak – Offer modaks, ladoos, fruits, and coconut as naivedyam.",
      "Perform Aarti & Bhajans – Sing the Ganesh Aarti daily and chant 'Om Gan Ganapataye Namah'."
    ],
    finalPrayer: "“Vakraund Mahakaya Suryakoti Samaprabha, Nirvighnam Kuru Me Deva Sarva-Kaaryeshu Sarvada.”"
  },
  "ganesha visarjan": {
    description: "Ganesha Visarjan marks the joyful conclusion of Ganesh Chaturthi celebrations. Devotees perform a final pooja and aarti, offer flowers, fruits, modaks, and prayers to Lord Ganesha, and seek His blessings for happiness, wisdom, and prosperity. The idol is then respectfully taken for immersion while chanting “Ganpati Bappa Morya!” Visarjan symbolizes the return of Lord Ganesha to His divine abode and reminds devotees of the cycle of creation and dissolution. It is celebrated with devotion, gratitude, and the hope of welcoming Lord Ganesha again next year.",
    steps: [
      "Clean the pooja area – Clean the place and arrange the Ganesha idol, pooja plate, flowers, and other items.",
      "Light the diya and incense – Light an oil/ghee lamp and incense sticks to begin the pooja.",
      "Offer flowers and Durva – Offer fresh flowers, garland, and Durva grass to Lord Ganesha.",
      "Apply Kumkum and Sandalwood – Apply sandalwood paste, turmeric, and kumkum to the idol as traditionally appropriate.",
      "Offer Naivedyam – Offer modak/ladoo, fruits, coconut, betel leaves, betel nuts, and other prepared offerings.",
      "Perform Ganesh Pooja – Pray to Lord Ganesha and chant simple prayers such as “Om Gan Ganapataye Namah.”",
      "Perform the final Aarti – Light camphor and perform the Ganesha Aarti while the family participates in prayer.",
      "Offer your final prayers – Thank Lord Ganesha for His blessings and pray for peace, prosperity, wisdom, and removal of obstacles.",
      "Take the idol for Visarjan – Carry the idol respectfully while chanting “Ganpati Bappa Morya!”",
      "Perform the immersion – Immerse the idol respectfully in a suitable designated place, following local rules. For home Visarjan, an appropriate container can be used for an eco-friendly clay idol."
    ],
    finalPrayer: "“Ganpati Bappa Morya! May Lord Ganesha bless our family with happiness, prosperity, wisdom, and peace. Please return again next year.”"
  },
  "hartalika teej": {
    description: "Hartalika Teej is a vibrant festival observed by women, dedicated to Goddess Parvati and Lord Shiva. Devotees observe a strict fast, perform elaborate poojas with clay idols, and pray for marital bliss and family well-being.",
    steps: [
      "Clean the pooja area and create a clean platform decorated with flowers and mango leaves.",
      "Prepare handmade clay idols of Lord Shiva, Goddess Parvati, and Lord Ganesha.",
      "Install the idols and offer Kalash Sthapana with coconut and mango leaves.",
      "Offer Bilva leaves, Shami leaves, Datura, flowers, kumkum, haldi, chandan, and sindoor.",
      "Perform the Hartalika Teej Katha and offer fruits, sweets, and naivedyam.",
      "Light the ghee lamp and incense, performing aarti with devotion.",
      "Offer final prayers seeking blessings for marital harmony, happiness, and well-being."
    ],
    finalPrayer: "“Om Namah Shivaya! May Goddess Parvati and Lord Shiva bless your marriage with eternal love, harmony, and happiness.”"
  },
  "maha shivaratri": {
    description: "Maha Shivaratri is a sacred festival dedicated to Lord Shiva. Devotees observe fasting, perform Shiva Abhishekam, offer Bilva leaves, milk and water, and stay engaged in prayer and chanting throughout the night.",
    steps: [
      "Clean the altar and place the Shiva Lingam on a clean pedestal.",
      "Perform Abhishek – Bathe the Shiva Lingam with water, milk, honey, curd, and ghee while chanting 'Om Namah Shivaya'.",
      "Offer Bilva leaves – Offer sacred Bilva leaves, flowers, and white sandalwood paste.",
      "Light the diya and incense – Light a ghee lamp and incense.",
      "Night Vigil (Jaagaran) – Keep vigil through the night, chanting 'Om Namah Shivaya' and listening to Shiva stories."
    ],
    finalPrayer: "“Om Namah Shivaya! May Lord Shiva bestow inner peace, spiritual strength, and divine grace upon you and your family.”"
  },
  "rama navami": {
    description: "Rama Navami celebrates the birth of Lord Rama, an incarnation of Lord Vishnu. Devotees perform Rama Pooja, recite the Ramayana, offer fruits and sweets, and pray for righteousness, peace and prosperity.",
    steps: [
      "Clean the temple area and place the image or idol of Lord Rama, Sita, Lakshmana, and Hanuman.",
      "Light a lamp and incense, offering flowers, tulsi leaves, and kumkum.",
      "Perform Rama Puja – Recite Vishnu Sahasranama or chapters from the Ramayana.",
      "Offer Naivedyam – Offer panakam (jaggery water), fruits, and traditional sweets.",
      "Perform Aarti – Offer final aarti and seek Lord Rama's blessings for righteousness."
    ],
    finalPrayer: "“Shri Ramachandra Charanau Manasa Smarami! May Lord Rama guide your path with truth and righteousness.”"
  },
  "krishna janmashtami": {
    description: "Krishna Janmashtami celebrates the birth of Lord Krishna. Devotees observe fasting, decorate Krishna idols, sing devotional songs, perform midnight pooja and offer butter, milk, fruits and sweets.",
    steps: [
      "Clean the home altar and create a cradle (jhula) for Bal Gopal.",
      "Bathe the Krishna idol with panchamrit (milk, curd, honey, sugar, ghee) at midnight.",
      "Dress the deity in new clothes and ornaments.",
      "Offer Makhan (butter), mishri, fruits, and sweets as naivedyam.",
      "Perform midnight aarti and rock the cradle while singing bhajans."
    ],
    finalPrayer: "“Hare Krishna Hare Rama! May Lord Krishna fill your home with divine love, joy, and playfulness.”"
  },
  "hanuman jayanti": {
    description: "Hanuman Jayanti commemorates the birth of Lord Hanuman, known for devotion, courage and strength. Devotees offer flowers, fruits and sindoor, recite Hanuman Chalisa and seek protection and strength.",
    steps: [
      "Clean the altar and place an image or idol of Lord Hanuman.",
      "Offer red flowers, sindoor (vermilion), and jasmine oil.",
      "Light a ghee lamp and incense.",
      "Recite Hanuman Chalisa and Sundarakanda with utmost devotion.",
      "Offer sweets like laddoo as naivedyam and perform aarti."
    ],
    finalPrayer: "“Jai Hanuman Gyan Gun Sagar! May Lord Hanuman grant you courage, strength, and unwavering devotion.”"
  },
  "narasimha jayanti": {
    description: "Narasimha Jayanti celebrates the appearance of Lord Narasimha, the fierce incarnation of Lord Vishnu. Devotees perform Vishnu and Narasimha Pooja, recite prayers and seek protection from negativity and difficulties.",
    steps: [
      "Clean the puja space and place the picture or idol of Lord Narasimha.",
      "Offer flowers, tulsi leaves, sandalwood paste, and kumkum.",
      "Light a lamp and incense, chanting Vishnu mantras or Narasimha Kavacha.",
      "Offer fruits and sweet naivedyam.",
      "Perform aarti and pray for protection against all obstacles and fears."
    ],
    finalPrayer: "“Ugram Veeram Maha-Vishnu Jwalantham Sarvatomukham! May Lord Narasimha protect you from all negativity.”"
  },
  "vamana jayanti": {
    description: "Vamana Jayanti celebrates the appearance of Lord Vamana, an incarnation of Lord Vishnu. Devotees offer prayers, flowers and naivedyam and remember the story of Lord Vamana and King Mahabali.",
    steps: [
      "Clean the altar and place the idol or picture of Lord Vamana.",
      "Light a lamp and incense, offering yellow flowers and tulsi leaves.",
      "Offer fruits, milk sweets, and water.",
      "Recite Vishnu prayers and reflect on the virtues of humility and devotion.",
      "Perform aarti and seek divine grace."
    ],
    finalPrayer: "“Om Namo Narayanaya! May Lord Vamana bless you with wisdom, humility, and prosperity.”"
  },
  "parashurama jayanti": {
    description: "Parashurama Jayanti commemorates the birth of Lord Parashurama, one of the Dashavatara of Lord Vishnu. Devotees perform prayers and seek courage, discipline and spiritual strength.",
    steps: [
      "Clean the puja area and place the picture of Lord Parashurama.",
      "Light a lamp and incense, offering fresh flowers and tulsi leaves.",
      "Offer fruits and naivedyam.",
      "Recite prayers seeking courage, righteousness, and spiritual discipline.",
      "Perform aarti."
    ],
    finalPrayer: "“Om Parashuramaya Namah! May Lord Parashurama grant you strength, valor, and righteousness.”"
  },
  "buddha purnima": {
    description: "Buddha Purnima commemorates the birth, enlightenment and Mahaparinirvana of Gautama Buddha. Devotees spend the day in prayer, meditation, charity and reflection on compassion, peace and wisdom.",
    steps: [
      "Clean the home and place an image of Lord Buddha with candles and flowers.",
      "Engage in meditation and mindfulness throughout the day.",
      "Practice charity by feeding the needy or helping others.",
      "Reflect upon the teachings of compassion, non-violence, and inner peace.",
      "Light incense and offer quiet prayers for universal harmony."
    ],
    finalPrayer: "“Buddham Sharanam Gacchami! May the teachings of Lord Buddha bring peace, clarity, and compassion to your life.”"
  },
  "durga puja": {
    description: "Durga Puja is a major celebration dedicated to Goddess Durga. Devotees worship the Goddess through elaborate rituals, offerings, chanting and aarti, celebrating the triumph of good over evil.",
    steps: [
      "Establish the Ghat (Kalash sthapana) and clean the worship space.",
      "Invoke Goddess Durga with mantras and offer red flowers, kumkum, and alta.",
      "Light a ghee lamp and incense.",
      "Offer bhog (naivedyam), fruits, and sweets.",
      "Perform the evening Sandhi Aarti with devotion and joy."
    ],
    finalPrayer: "“Ya Devi Sarvabhuteshu Shakti-Rupena Samsthita! May Goddess Durga protect and bless your family.”"
  },
  "navratri": {
    description: "Navratri is a nine-night festival dedicated to the various forms of Goddess Durga. Devotees observe fasting, perform daily Devi Pooja, chant mantras and participate in devotional celebrations.",
    steps: [
      "Set up the Ghat (Kalash) on Day 1 and light an Akhand Jyoti (uninterrupted lamp) if observed.",
      "Perform daily puja offering fresh flowers, fruits, and sweets specific to each day's form of Durga.",
      "Recite Durga Saptashati or Devi stotras.",
      "Observe fasting with pure foods and restraint.",
      "Conclude with Kanya Pujan on Ashtami or Navami."
    ],
    finalPrayer: "“Sarva Mangala Mangalye Shive Sarvartha Sadhike! May the Divine Mother grant health, wealth, and strength.”"
  },
  "vijayadashami": {
    description: "Vijayadashami marks the victory of righteousness over evil. Devotees worship Goddess Durga or Lord Rama according to regional traditions and seek blessings for success, courage and prosperity.",
    steps: [
      "Clean the puja space and place the image of Goddess Durga or Lord Rama.",
      "Perform Ayudha Puja by cleaning and blessing tools, books, and instruments.",
      "Offer flowers, fruits, and sweets.",
      "Seek blessings for new beginnings, education, and career success.",
      "Perform aarti and distribute sweets."
    ],
    finalPrayer: "“Om Vijaya Namah! May you achieve success and victory in all your righteous endeavors.”"
  },
  "dussehra": {
    description: "Vijayadashami marks the victory of righteousness over evil. Devotees worship Goddess Durga or Lord Rama according to regional traditions and seek blessings for success, courage and prosperity.",
    steps: [
      "Clean the puja space and place the image of Goddess Durga or Lord Rama.",
      "Perform Ayudha Puja by cleaning and blessing tools, books, and instruments.",
      "Offer flowers, fruits, and sweets.",
      "Seek blessings for new beginnings, education, and career success.",
      "Perform aarti and distribute sweets."
    ],
    finalPrayer: "“Om Vijaya Namah! May you achieve success and victory in all your righteous endeavors.”"
  },
  "diwali puja": {
    description: "Diwali Puja is performed during the festival of lights to seek divine blessings for prosperity, happiness and abundance. Families traditionally clean and decorate their homes and worship Goddess Lakshmi and Lord Ganesha.",
    steps: [
      "Clean and decorate the home with rangoli, flowers, and rows of earthen diyas.",
      "Establish the altar with idols of Goddess Lakshmi and Lord Ganesha.",
      "Offer kumkum, turmeric, haldi, flowers, and sweets.",
      "Light a ghee lamp and incense, performing the Lakshmi-Ganesha Aarti.",
      "Distribute prasad and celebrate with family."
    ],
    finalPrayer: "“Om Shreem Mahalakshmyei Namah! May Goddess Lakshmi fill your home with wealth, light, and unending joy.”"
  },
  "lakshmi puja": {
    description: "Lakshmi Puja is dedicated to Goddess Lakshmi, the Goddess of wealth and prosperity. Devotees clean and decorate their homes, light lamps, offer flowers and sweets, and pray for financial well-being and abundance.",
    steps: [
      "Clean the house thoroughly and place a red cloth on the puja chowki.",
      "Install idols or images of Goddess Lakshmi and Lord Ganesha.",
      "Offer lotus or marigold flowers, kumkum, turmeric, and coins.",
      "Light a lamp and incense, offering naivedyam of sweets and fruits.",
      "Perform aarti and chant Lakshmi mantras."
    ],
    finalPrayer: "“Padmasane Padmakare Preeta-Sur-Pujite! May Goddess Lakshmi shower abundant wealth and prosperity upon you.”"
  },
  "dhanteras": {
    description: "Dhanteras marks the beginning of the Diwali festival period. Devotees worship Goddess Lakshmi and Lord Dhanvantari and traditionally pray for health, prosperity and abundance.",
    steps: [
      "Clean the home and light a special Yama diya outside the front door at dusk.",
      "Worship Lord Dhanvantari (God of Ayurveda and health) and Goddess Lakshmi.",
      "Offer flowers, sweets, and kumkum.",
      "Purchase auspicious items such as utensils or gold/silver symbolically.",
      "Perform aarti and pray for health and wealth."
    ],
    finalPrayer: "“Om Dhanvantaraye Namah! May Lord Dhanvantari grant you perfect health and well-being.”"
  },
  "govardhan puja": {
    description: "Govardhan Puja commemorates Lord Krishna lifting Govardhan Hill to protect the people of Vrindavan. Devotees create symbolic Govardhan representations, offer food and perform Krishna Pooja with devotion.",
    steps: [
      "Create a symbolic hill representation using cow dung or sweet mixtures (Annakut).",
      "Decorate it with flowers, incense, and lamps.",
      "Offer a grand assortment of vegetarian dishes (Annakut) and sweets to Lord Krishna.",
      "Perform parikrama (circumambulation) around the Govardhan representation.",
      "Perform aarti and share prasadam."
    ],
    finalPrayer: "“Govardhanadhara Namah! May Lord Krishna protect your family and shelter you from all hardships.”"
  },
  "bhai dooj": {
    description: "Bhai Dooj celebrates the loving relationship between brothers and sisters. Sisters traditionally perform aarti and pray for their brothers' well-being, while brothers express their love and affection.",
    steps: [
      "Prepare a sacred seating area for the brother.",
      "Sister applies a vermilion (tilak) and rice grain mark on the brother's forehead.",
      "Perform aarti and pray for the brother's long life, health, and success.",
      "Exchange sweets, gifts, and affectionate blessings.",
      "Share a festive meal together."
    ],
    finalPrayer: "“May the sacred bond of love and protection between brother and sister grow stronger every year.”"
  },
  "saraswati puja": {
    description: "Saraswati Puja is dedicated to Goddess Saraswati, the deity of knowledge, wisdom, music and learning. Students and devotees offer flowers, books and musical instruments and seek blessings for education and creativity.",
    steps: [
      "Clean the study or puja space and place books, notebooks, and musical instruments near the Goddess's image.",
      "Offer white flowers, white sandalwood, and kumkum.",
      "Light a lamp and incense.",
      "Chant Saraswati Vandana ('Ya Kundendu Tudharahar...', 'Saraswati Namasthubhyam').",
      "Perform aarti and pray for wisdom, clarity, and academic or artistic success."
    ],
    finalPrayer: "“Saraswati Namasthubhyam Varade Kaamaroopini! May Goddess Saraswati bestow supreme wisdom and knowledge upon you.”"
  },
  "vasant panchami": {
    description: "Saraswati Puja is dedicated to Goddess Saraswati, the deity of knowledge, wisdom, music and learning. Students and devotees offer flowers, books and musical instruments and seek blessings for education and creativity.",
    steps: [
      "Clean the study or puja space and place books, notebooks, and musical instruments near the Goddess's image.",
      "Offer white flowers, white sandalwood, and kumkum.",
      "Light a lamp and incense.",
      "Chant Saraswati Vandana ('Ya Kundendu Tudharahar...', 'Saraswati Namasthubhyam').",
      "Perform aarti and pray for wisdom, clarity, and academic or artistic success."
    ],
    finalPrayer: "“Saraswati Namasthubhyam Varade Kaamaroopini! May Goddess Saraswati bestow supreme wisdom and knowledge upon you.”"
  },
  "jagannath rathyatra": {
    description: "Jagannath Rathyatra is a grand chariot festival dedicated to Lord Jagannath, along with Lord Balabhadra and Goddess Subhadra. Devotees participate in the procession and offer prayers seeking divine blessings.",
    steps: [
      "Clean the altar and place images of Lord Jagannath, Balabhadra, and Subhadra.",
      "Offer flowers, tulsi leaves, and sweet offerings like Khaja.",
      "Light a lamp and incense, reciting devotional prayers.",
      "Participate in singing bhajans and chanting 'Hare Krishna'.",
      "Perform aarti and seek Lord Jagannath's boundless grace."
    ],
    finalPrayer: "“Jagannatha Swami Nayaga-Gami Bhava! May Lord Jagannath bless your life's journey with grace and devotion.”"
  },
  "guru purnima": {
    description: "Guru Purnima is dedicated to honouring spiritual teachers, mentors and gurus. Devotees express gratitude through prayers, offerings and remembrance of the wisdom received from their teachers.",
    steps: [
      "Clean the altar and place a picture of your Guru or spiritual master.",
      "Offer flowers, fruits, and a symbolic gift or dakshina.",
      "Light a lamp and incense.",
      "Express heartfelt gratitude and seek blessings for spiritual guidance.",
      "Perform aarti and meditate on the Guru's teachings."
    ],
    finalPrayer: "“Gurur Brahma Gurur Vishnu Gurur Devo Maheshwaraha! Salutations to the divine Guru.”"
  },
  "raksha bandhan": {
    description: "Raksha Bandhan celebrates the bond between brothers and sisters. Sisters traditionally tie a sacred Rakhi around their brothers' wrists and pray for their well-being, while brothers offer blessings and gifts.",
    steps: [
      "Arrange the puja thali with roli, akshata, a diya, sweets, and the sacred Rakhi thread.",
      "Sister applies tilak on the brother's forehead and ties the Rakhi on his right wrist.",
      "Perform a short prayer wishing the brother long life, health, and prosperity.",
      "Feed sweets to each other and exchange gifts.",
      "Brother vows to protect and support his sister always."
    ],
    finalPrayer: "“May this sacred thread protect you from all harm and strengthen the bond of love forever.”"
  },
  "akshaya tritiya": {
    description: "Akshaya Tritiya is considered an auspicious day for new beginnings, charity, worship and important activities. Devotees perform Lakshmi and Vishnu Pooja and pray for prosperity and continued abundance.",
    steps: [
      "Clean the home and establish an altar for Lord Vishnu and Goddess Lakshmi.",
      "Offer yellow flowers, tulsi leaves, kumkum, and sweets.",
      "Light a ghee lamp and incense.",
      "Engage in charity (daan) by feeding the needy or donating essentials.",
      "Perform aarti and pray for unending prosperity ('Akshaya')."
    ],
    finalPrayer: "“Om Namo Narayanaya! May your wealth, happiness, and good karma grow multifold and never diminish.”"
  },
  "ganga dussehra": {
    description: "Ganga Dussehra celebrates the descent of the sacred River Ganga to Earth. Devotees worship Goddess Ganga, take holy baths where customary, offer prayers and perform charity.",
    steps: [
      "Take a holy bath or sprinkle Gangajal at home with prayer.",
      "Set up an altar with a Kalash representing River Ganga.",
      "Offer flowers, milk, fruits, and sweets.",
      "Light a lamp and incense, reciting Ganga Stotram.",
      "Perform charity and aarti."
    ],
    finalPrayer: "“Om Namah Gangayai! May Mother Ganga cleanse your mind, body, and soul of all impurities.”"
  },
  "chhath puja": {
    description: "Chhath Puja is a devotional festival dedicated primarily to the Sun God, Surya, and Chhathi Maiya. Devotees observe fasting and offer traditional prayers and offerings to the setting and rising Sun.",
    steps: [
      "Prepare traditional prasad (thekua, fruits) with utmost cleanliness.",
      "Gather at a riverbank or clean water body at sunset.",
      "Offer Arghya (water and milk offering) to the setting Sun while standing in water.",
      "Return at sunrise to offer Arghya to the rising Sun.",
      "Conclude the rigorous fast with prayers and distribution of prasad."
    ],
    finalPrayer: "“Om Suryaya Namah! May Sun God Surya grant vitality, health, and brilliance to your life.”"
  },
  "vishwakarma puja": {
    description: "Vishwakarma Puja honors Lord Vishwakarma, regarded in Hindu tradition as the divine architect and craftsman. Workers, artisans and businesses worship tools, machinery and workplaces and pray for safety and success.",
    steps: [
      "Clean and arrange tools, machinery, vehicles, and workspaces.",
      "Place a picture or idol of Lord Vishwakarma on a clean altar.",
      "Offer flowers, turmeric, kumkum, and sweets.",
      "Light a lamp and incense, performing puja for safety, productivity, and success.",
      "Perform aarti and distribute prasad to workers and colleagues."
    ],
    finalPrayer: "“Om Vishwakarmaya Namah! May Lord Vishwakarma bless your work, tools, and craftsmanship with success.”"
  },
  "karwa chauth": {
    description: "Karwa Chauth is a traditional fasting observance associated with prayers for the well-being and longevity of one's husband. Devotees perform the prescribed rituals and offer prayers to Shiva, Parvati, Ganesha and Chandra according to tradition.",
    steps: [
      "Start the day before sunrise with the pre-dawn meal (Sargi).",
      "Observe a strict nirjala fast (without water) through the day.",
      "Listen to the Karwa Chauth Vrat Katha in the evening.",
      "Offer water and prayers to the Moon through a sieve at moonrise, followed by breaking the fast.",
      "Seek blessings from elders."
    ],
    finalPrayer: "“May your marital bond be filled with love, mutual respect, good health, and longevity.”"
  },
  "vat savitri vrat": {
    description: "Vat Savitri Vrat is traditionally observed by married women who pray for the well-being and longevity of their husbands. Devotees worship Savitri and perform rituals associated with the sacred Banyan tree.",
    steps: [
      "Clean the puja area near a sacred Banyan (Vat) tree.",
      "Offer water, turmeric, kumkum, red thread, flowers, and fruits to the tree.",
      "Tie a sacred thread (moli) around the trunk of the Banyan tree while circumambulating it.",
      "Listen to the legend of Savitri and Satyavan.",
      "Pray for the husband's longevity and family happiness."
    ],
    finalPrayer: "“May Savitri's devotion inspire strength, dedication, and everlasting harmony in your marriage.”"
  },
  "shani jayanti": {
    description: "Shani Jayanti commemorates the birth of Lord Shani. Devotees perform Shani Pooja, offer sesame oil and black sesame where customary, and pray for justice, discipline, protection and spiritual strength.",
    steps: [
      "Clean the puja area and place the image or idol of Lord Shani.",
      "Offer black sesame seeds, mustard oil, black cloth, and blue flowers.",
      "Light a mustard oil lamp and incense.",
      "Recite Shani Stotram or 'Om Sham Shanicharaya Namah'.",
      "Perform aarti and charity (daan)."
    ],
    finalPrayer: "“Om Sham Shanicharaya Namah! May Lord Shani grant you patience, discipline, and protection from adversity.”"
  },
  "gudi padwa": {
    description: "Gudi Padwa marks the traditional New Year in Maharashtra and some other regions. Homes are decorated with a Gudi, and families perform prayers and celebrate with traditional food and festivities.",
    steps: [
      "Clean the house and draw a colorful rangoli at the entrance.",
      "Hoist the Gudi (a bamboo staff adorned with a silk cloth, garland, neem leaves, and an upturned silver/copper vessel) outside a window or door.",
      "Perform puja offering flowers, incense, and sweets.",
      "Partake of traditional prasad made of neem leaves and jaggery.",
      "Celebrate with family and friends."
    ],
    finalPrayer: "“Wishing you a joyous and prosperous New Year filled with new beginnings and happiness.”"
  },
  "ugadi": {
    description: "Ugadi marks the traditional New Year in Andhra Pradesh, Telangana and Karnataka. Families clean and decorate their homes, prepare Ugadi Pachadi and perform prayers for a prosperous and peaceful year.",
    steps: [
      "Clean the home and decorate the entrance with fresh mango leaf toran (hangings).",
      "Prepare the special Ugadi Pachadi (combining six tastes: sweet, sour, salty, bitter, tangy, and spicy representing life's experiences).",
      "Offer prayers to deities for a peaceful and prosperous year ahead.",
      "Listen to the Panchanga Sravanam (yearly almanac reading).",
      "Share festive meals with family."
    ],
    finalPrayer: "“Happy Ugadi! May the coming year bring sweetness, health, and success to your family.”"
  },
  "makar sankranti": {
    description: "Makar Sankranti marks the Sun's transition into Makara (Capricorn) and is celebrated as an important harvest and seasonal festival. Devotees offer prayers to Surya, participate in charity and celebrate with traditional foods.",
    steps: [
      "Take a holy dip in a river or bathe at home with prayer.",
      "Offer water and prayers to the Sun God (Surya Dev) at sunrise.",
      "Prepare sesame and jaggery sweets (Tilgul / Ladoo).",
      "Engage in charity by donating food grains, blankets, or sweets.",
      "Fly kites and celebrate harvest abundance."
    ],
    finalPrayer: "“Om Suryaya Namah! May the Sun God bring warmth, light, and prosperity into your home.”"
  },
  "pongal": {
    description: "Pongal is a major Tamil harvest festival dedicated to gratitude for the Sun, nature, cattle and agricultural abundance. Families prepare sweet Pongal, decorate their homes and celebrate with prayers and traditional customs.",
    steps: [
      "Clean the home and draw traditional Kolam designs at the entrance.",
      "Boil fresh milk and rice in a clay pot outdoors until it overflows while joyfully shouting 'Pongalo Pongal!'.",
      "Offer sweet Pongal and sugarcane to Surya Dev as thanksgiving.",
      "Worship cattle during Maatu Pongal.",
      "Celebrate with family and elders."
    ],
    finalPrayer: "“Iniya Pongal Nalvazhthukkal! May nature shower bountiful harvest, health, and happiness.”"
  },
  "puthandu": {
    description: "Puthandu is the Tamil New Year. Families prepare festive meals, decorate homes, view auspicious items and offer prayers while seeking happiness, health and prosperity for the coming year.",
    steps: [
      "Arrange the 'Kanni' (auspicious tray with gold, silver, fruits, flowers, and betel leaves) to view first thing in the morning.",
      "Clean the house and draw a vibrant Kolam at the doorway.",
      "Take a ceremonial bath and wear new clothes.",
      "Visit the local temple and offer prayers for the new year.",
      "Partake in a grand vegetarian feast with family."
    ],
    finalPrayer: "“Puthandu Nalvazhthukkal! May the Tamil New Year bring peace, joy, and prosperity to your household.”"
  },
  "karthigai deepam": {
    description: "Karthigai Deepam is a traditional Tamil festival celebrated by lighting rows of oil lamps. Devotees worship Lord Shiva and Lord Murugan according to tradition and illuminate their homes with lamps.",
    steps: [
      "Clean the house and courtyard thoroughly.",
      "Light rows of earthen oil lamps (deepam) across doorways, balconies, and temples at dusk.",
      "Worship Lord Shiva and Lord Murugan with flowers and incense.",
      "Prepare special neivedyam like Pori Urundai (puffed rice balls).",
      "Offer prayers for divine light to dispel inner darkness."
    ],
    finalPrayer: "“May the divine light of Karthigai Deepam illuminate your life with wisdom, peace, and grace.”"
  },
  "panguni uthiram": {
    description: "Panguni Uthiram is an important Tamil festival associated with divine marriages and Lord Murugan. Devotees visit temples, perform special poojas and seek blessings for family harmony and spiritual well-being.",
    steps: [
      "Visit a local temple dedicated to Lord Murugan, Shiva, or Vishnu.",
      "Offer flowers, turmeric, kumkum, and special abhishekams.",
      "Participate in or witness divine wedding festival celebrations (Kalyana Utsavam).",
      "Offer prayers for marital harmony and family well-being.",
      "Perform aarti and partake in prasad."
    ],
    finalPrayer: "“May divine grace strengthen your family bonds and bring harmony, peace, and love.”"
  },
  "onam": {
    description: "Onam is a major Kerala festival celebrating the legendary return of King Mahabali. Families create Pookalam decorations, prepare a traditional feast and participate in cultural and devotional celebrations.",
    steps: [
      "Create intricate floral carpets (Pookalam) at the entrance of the home.",
      "Wear traditional white and gold attire (Kasavu Mundu).",
      "Prepare the grand Onasadya (traditional vegetarian feast with 20+ dishes).",
      "Participate in traditional Vallam Kali (boat races) or cultural songs and dances.",
      "Offer prayers for prosperity and equality."
    ],
    finalPrayer: "“Happy Onam! May Maveli's blessings bring boundless prosperity, health, and happiness.”"
  },
  "vishu": {
    description: "Vishu is the traditional Malayalam New Year observance. Families prepare Vishukkani, light lamps and offer prayers, beginning the day with an auspicious viewing believed to bring blessings for the year ahead.",
    steps: [
      "Prepare the Vishukkani (auspicious arrangement of rice, yellow flowers (kanikonna), gold, mirror, fruits, and holy texts) before dawn.",
      "Wake family members with eyes closed so the Vishukkani is the first thing they see in the morning.",
      "Light a brass lamp (nilavilakku) before the arrangement.",
      "Distribute Vishukaineettam (token money given by elders to younger ones).",
      "Enjoy a traditional Vishu feast (Vishu Sadya)."
    ],
    finalPrayer: "“Vishu Ashamsakal! May your year begin with auspiciousness, peace, and prosperity.”"
  },
  "ashtami rohini": {
    description: "Ashtami Rohini is an important Kerala observance celebrating the birth of Lord Krishna. Devotees perform Krishna Pooja, offer traditional foods and participate in devotional activities in temples and homes.",
    steps: [
      "Clean the home altar and draw tiny baby footsteps leading into the prayer room.",
      "Offer butter, milk sweets, and fresh tulsi leaves to Lord Krishna.",
      "Light a brass nilavilakku lamp and incense.",
      "Recite Bhagavad Gita verses or Krishna bhajans.",
      "Perform aarti and share prasadam with family."
    ],
    finalPrayer: "“Hare Krishna! May Lord Krishna bless your home with devotion, happiness, and peace.”"
  }
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
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?.user_id;

  useEffect(() => {
    setLoading(true);
    fetch("/hindu_calendar_1900_2100.csv")
      .then(res => res.text())
      .then(csv => {
        setCalendarFestivals(parseCalendarCsv(csv));
        setLoading(false);
      })
      .catch(err => console.error("CSV Load Error:", err));

    fetch(`${API_URL}/api/products`, { headers: { ...bypassHeaders } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllProducts(data);
      })
      .catch(err => console.error("Products Load Error:", err));
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
    if (!selectedFestival || allProducts.length === 0) return [];
    const festName = selectedFestival.name.toLowerCase();

    let allowedKeywords = [];
    let excludedKeywords = [];

    if (festName.includes("shiva") || festName.includes("shivaratri") || festName.includes("pradosh")) {
      allowedKeywords = ["shiva", "lingam", "bilva", "bel", "rudraksha", "diya", "ghee", "bell", "abhishek"];
      excludedKeywords = ["krishna", "murugan", "ganesh", "rama"];
    } else if (festName.includes("ganesh") || festName.includes("vinayagar") || festName.includes("visarjan") || festName.includes("teej")) {
      allowedKeywords = ["ganesh", "idol", "durva", "modak", "kumkum", "sandalwood", "diya", "bell", "camphor", "flower", "coconut", "kalash", "thali"];
      excludedKeywords = ["krishna", "murugan", "shiva", "rama", "hanuman", "saraswati", "lakshmi"];
    } else if (festName.includes("rama") || festName.includes("navami")) {
      allowedKeywords = ["rama", "sita", "lakshmana", "hanuman", "tulsi", "diya", "incense", "flower", "thali", "bell", "kumkum"];
      excludedKeywords = ["krishna", "murugan", "shiva", "ganesh"];
    } else if (festName.includes("lakshmi") || festName.includes("diwali") || festName.includes("dhanteras") || festName.includes("deepavali")) {
      allowedKeywords = ["lakshmi", "ganesha", "diya", "lamp", "lotus", "kumkum", "turmeric", "haldi", "coin", "gold", "silver", "sweets"];
      excludedKeywords = ["krishna", "murugan", "shiva", "rama"];
    } else {
      allowedKeywords = ["diya", "lamp", "incense", "agarbatti", "kumkum", "flower", "bell", "thali", "idol"];
      excludedKeywords = [];
    }

    let matched = allProducts.filter(p => {
      const pName = (p.name || "").toLowerCase();
      const pCat = (p.category || "").toLowerCase();
      const pDesc = (p.description || "").toLowerCase();

      const isExcluded = excludedKeywords.some(ex => pName.includes(ex) || pCat.includes(ex));
      if (isExcluded) return false;

      return allowedKeywords.some(kw => pName.includes(kw) || pCat.includes(kw) || pDesc.includes(kw));
    });

    if (matched.length === 0) {
      matched = allProducts.filter(p => {
        const pName = (p.name || "").toLowerCase();
        const pCat = (p.category || "").toLowerCase();
        return !excludedKeywords.some(ex => pName.includes(ex) || pCat.includes(ex));
      });
    }

    if (matched.length === 0) {
      matched = allProducts;
    }

    const unique = Array.from(new Set(matched.map(p => p.id)))
      .map(id => matched.find(p => p.id === id));

    return unique.slice(0, 50).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image.startsWith("http") ? p.image : `${API_URL}${p.image}`
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
      } else if (selectedCalendar !== "Hindu Calendar") {
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
                <h3 className="pooja-steps-title">Simple pooja steps</h3>
                <ol className="pooja-steps-list">
                  {getFestivalDetails().steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>

                {getFestivalDetails().finalPrayer && (
                  <div className="pooja-final-prayer">
                    <p style={{ margin: 0 }}><strong>🙏 Final prayer:</strong><br />{getFestivalDetails().finalPrayer}</p>
                  </div>
                )}

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
