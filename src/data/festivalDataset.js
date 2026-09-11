const festivalBlueprints = [
  { name: "Makara Sankranti", category: "Festival", icon: "☀️", month: 1, day: 14, description: "A harvest festival celebrating the sun's northward journey and the beginning of a new agricultural cycle." },
  { name: "Pongal", category: "Festival", icon: "☀️", month: 1, day: 14, description: "Tamil harvest festival marking gratitude, abundance, and renewal for the coming season." },
  { name: "Republic Day", category: "Festival", icon: "🇮🇳", month: 1, day: 26, description: "India commemorates the adoption of its Constitution and the spirit of democratic unity." },
  { name: "Vasant Panchami", category: "Festival", icon: "🌼", month: 2, day: 2, description: "A vibrant celebration welcoming spring and worshipping wisdom, knowledge, and the goddess Saraswati." },
  { name: "Maha Shivaratri", category: "Shaivite Festival", icon: "🔱", month: 2, day: 26, description: "A sacred night of prayer, fasting, and devotion to Lord Shiva with deep spiritual significance." },
  { name: "Holi", category: "Festival", icon: "🎨", month: 3, day: 14, description: "The festival of colors, joy, fraternity, and the victory of good over evil." },
  { name: "Ram Navami", category: "Festival", icon: "🕉️", month: 4, day: 6, description: "Celebrates the birth of Lord Rama and the ideals of dharma, courage, and righteousness." },
  { name: "Hanuman Jayanti", category: "Festival", icon: "🦁", month: 4, day: 12, description: "Honors the devotion and strength of Lord Hanuman and his unwavering service to Lord Rama." },
  { name: "Akshaya Tritiya", category: "Festival", icon: "🌟", month: 5, day: 10, description: "A highly auspicious day associated with prosperity, new beginnings, and sacred rituals." },
  { name: "Gudi Padwa", category: "Festival", icon: "🏹", month: 3, day: 30, description: "Marathi New Year festival that symbolizes renewal, hope, and fresh beginnings." },
  { name: "Ugadi", category: "Festival", icon: "🌿", month: 3, day: 30, description: "Telugu and Kannada New Year festival heralding a joyful start to the lunar calendar year." },
  { name: "Buddha Purnima", category: "Festival", icon: "🧘", month: 5, day: 5, description: "Commemorates the birth, enlightenment, and Mahaparinirvana of Gautama Buddha." },
  { name: "Guru Purnima", category: "Festival", icon: "🪔", month: 7, day: 10, description: "A day of gratitude to spiritual teachers and guides who illuminate the path of wisdom." },
  { name: "Raksha Bandhan", category: "Festival", icon: "💫", month: 8, day: 9, description: "A sacred bond of protection and love between siblings, celebrated with rituals and blessings." },
  { name: "Janmashtami", category: "Festival", icon: "🦚", month: 8, day: 26, description: "Celebrates the birth of Lord Krishna, symbolizing joy, devotion, and divine playfulness." },
  { name: "Ganesh Chaturthi", category: "Festival", icon: "🐘", month: 9, day: 7, description: "The grand festival welcoming Lord Ganesha with devotion, music, and community celebrations." },
  { name: "Navratri", category: "Devi Festival", icon: "🪷", month: 9, day: 22, description: "Nine nights of worship to the divine feminine, invoking strength, compassion, and grace." },
  { name: "Dussehra", category: "Devi Festival", icon: "🔥", month: 10, day: 12, description: "Celebrates the victory of righteousness over evil, often with the burning of Ravana's effigy." },
  { name: "Diwali", category: "Festival", icon: "🪔", month: 10, day: 31, description: "The festival of lights, symbolizing the triumph of knowledge, hope, and inner awakening." },
  { name: "Bhai Dooj", category: "Festival", icon: "🎀", month: 11, day: 3, description: "A sibling festival honoring the bond of affection and protection between brothers and sisters." },
  { name: "Christmas", category: "Festival", icon: "🎄", month: 12, day: 25, description: "A global celebration of the birth of Jesus Christ with joy, generosity, and community service." },
  { name: "Makar Sankranti", category: "Festival", icon: "☀️", month: 1, day: 14, description: "Marks the sun's transition into Capricorn and is celebrated across India with gratitude and ritual." },
  { name: "Onam", category: "Festival", icon: "🌾", month: 9, day: 15, description: "The harvest festival of Kerala, celebrated with floral carpets, feasts, and community joy." },
  { name: "Durga Puja", category: "Devi Festival", icon: "🪷", month: 10, day: 5, description: "A grand worship of Goddess Durga, honoring her strength, compassion, and victory over evil." },
  { name: "Karthigai Deepam", category: "Festival", icon: "✨", month: 11, day: 12, description: "A festival of lights dedicated to Lord Murugan, celebrated with lamps and festive devotion." },
  { name: "Ekadashi", category: "Vrat & Upavas", icon: "🌙", month: 1, day: 21, description: "A spiritually significant fasting day observed for purification, discipline, and divine blessings." },
  { name: "Pradosh Vrat", category: "Vrat & Upavas", icon: "🌙", month: 2, day: 18, description: "An evening observance dedicated to Shiva, seeking protection, peace, and spiritual growth." }
];

const dateParts = (year, month, day) => {
  const dt = new Date(year, month - 1, day);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
};

export const generateFestivalDataset = (startYear = 2025, endYear = 2035) => {
  const dataset = [];

  for (let year = startYear; year <= endYear; year += 1) {
    festivalBlueprints.forEach((entry, index) => {
      const date = dateParts(year, entry.month, entry.day);
      dataset.push({
        date,
        name: entry.name,
        category: entry.category,
        icon: entry.icon,
        description: entry.description,
        bgImage: null,
        year,
        sortIndex: index,
      });
    });
  }

  return dataset;
};

export const festivalDataset = generateFestivalDataset();

export default festivalDataset;
