import festivalDetailsMap from "../FestivalCalendar/festivalData/festivalDetailsMap";

const parseCsvLine = (line) => {
  const columns = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === "," && !inQuotes) {
      columns.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }

  columns.push(value.trim());
  return columns;
};

export const normalizeFestivalName = (name = "") =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const getFestivalCategory = (title = "") => {
  const name = title.toLowerCase();
  if (name.includes("shivaratri") || name.includes("shiva") || name.includes("pradosh")) return "Shaivite Festival";
  if (name.includes("navratri") || name.includes("durga") || name.includes("lakshmi") || name.includes("saraswati") || name.includes("amman") || name.includes("parvathi") || name.includes("kali") || name.includes("chhath") || name.includes("gowri") || name.includes("varalakshmi")) return "Devi Festival";
  if (name.includes("ekadashi") || name.includes("ekadasi") || name.includes("vrat") || name.includes("upavas") || name.includes("amavasya") || name.includes("purnima") || name.includes("chaturthi") || name.includes("sankashti") || name.includes("pradosham") || name.includes("masik")) return "Vrat & Upavas";
  if (name.includes("pongal") || name.includes("onam") || name.includes("bihu") || name.includes("gudi padwa") || name.includes("ugadi") || name.includes("vishu") || name.includes("baisakhi") || name.includes("lohri") || name.includes("rath yatra") || name.includes("raja") || name.includes("nuakhai") || name.includes("batukamma") || name.includes("poila baisakh")) return "Regional Festival";
  if (name.includes("jayanti") || name.includes("mahotsav") || name.includes("aradhana") || name.includes("guru") || name.includes("jayanthi") || name.includes("satsang") || name.includes("kirtan")) return "Spiritual Festival";
  return "Festival";
};

export const parseFestivalCsv = (csv) =>
  csv
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const columns = parseCsvLine(line);
      const date = columns[0];
      const title = columns[5];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || !title) return null;

      const name = title.includes("/") ? title.split("/").pop().trim() : title;
      return { date, name, category: getFestivalCategory(name) };
    })
    .filter(Boolean);

export const getFestivalGuideDetails = (festivalName) => {
  const normalizedName = normalizeFestivalName(festivalName);
  const matchingKey = Object.keys(festivalDetailsMap)
    .sort((first, second) => second.length - first.length)
    .find((key) => {
      const normalizedKey = normalizeFestivalName(key);
      return normalizedName === normalizedKey || normalizedName.includes(normalizedKey);
    });

  if (matchingKey) return festivalDetailsMap[matchingKey];

  return {
    description: `${festivalName} is an auspicious occasion observed with prayer, devotion, and traditional offerings.`,
    steps: [
      `Clean the prayer area and arrange the traditional offerings for ${festivalName}.`,
      "Light a diya and incense, then begin with a prayer and your family sankalpam.",
      "Offer flowers, kumkum, water, and naivedyam while reciting prayers according to your tradition.",
      "Complete the aarti, share prasadam, and offer a closing prayer.",
    ],
    finalPrayer: `May ${festivalName} bring peace, happiness, and divine blessings to your family.`,
  };
};
