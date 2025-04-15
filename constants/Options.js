export const SelectTravelersList = [
  {
    id: 1,
    title: "Just Me",
    desc: "A sole travel exploration",
    icon: "🚶",
    people: "1",
  },
  {
    id: 2,
    title: "A Couple",
    desc: "Two travels in tandem",
    icon: "👩🏻‍❤️‍👨🏻",
    people: "2",
  },
  {
    id: 3,
    title: "Family",
    desc: "A group of fun loving people",
    icon: "👨‍👩‍👧‍👦",
    people: "3 to 5",
  },
  {
    id: 5,
    title: "Friends",
    desc: "A bunck of thrill-seekers",
    icon: "🫂",
    people: "4 to 7",
  },
];

export const SelectBudgetOptions = [
  {
    id: 1,
    title: "Cheap",
    desc: "Stay concious of costs",
    icon: "🪙",
  },
  {
    id: 2,
    title: "Moderate",
    desc: "Keep costs at average side",
    icon: "💵",
  },
  {
    id: 3,
    title: "Luxury",
    desc: "Don't worry about costs",
    icon: "💸",
  },
];

export const AI_PROMPT =
  "Generate Travel Plan for Location: {location}, for {totalDays} Days and {totalNight} Night for {traveler} with a {budget} budget with a Flight details, Flight Price with Booking url, eco-friendly Hotels options list with HotelName, Hotel address, Price, hotel image url, geo coordinates, rating, sustainability features, descriptions and Places to visit nearby with placeName, Place Details, environmental impact, conservation status, Place Image Url, Geo Coordinates, ticket Pricing, Time to travel each of the location for {totalDays} days and {totalNight} night with each day plan including local volunteering opportunities, community-based tourism activities, sustainable dining options, and carbon offset opportunities with best time to visit to reduce overtourism in JSON format";
