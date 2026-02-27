// Minimal sample data to demonstrate structure.
// Replace/extend with your 500+ product dataset or connect to a backend API.

const CATEGORIES = [
    { id: "brakes", name: "Brakes", image: "spareparts-breakes.jpg" },
    { id: "filters", name: "Filters", image: "Car Air Filters.jpg" },
    { id: "suspension", name: "Suspension", image: "car suspension parts.jpg" },
    { id: "electrical", name: "Electrical", image: "electrical parts.jpg" },
    { id: "engine", name: "Engine", image: "car engine.jpg" },
    { id: "transmission", name: "Transmission", image: "car transmission.jpg" },
    { id: "cooling", name: "Cooling", image: "car cooling sys.jpg" },
    { id: "body", name: "Body & Trim", image: "assets/categories/body.webp" },
];

const BRANDS = ["Toyota", "Honda", "Nissan", "Mercedes", "Hyundai", "Ford", "Kia", "Volkswagen"];

const YEARS = Array.from({ length: 25 }, (_, i) => 2001 + i); // 2001–2025

const PRODUCTS = [
    {
        id: "P-0001",
        name: "Brake Pads Front",
        brand: "Toyota",
        model: "Corolla",
        year: 2015,
        category: "brakes",
        price: 220.0,
        stock: 12,
        rating: 4.6,
        sku: "TOY-BRK-1123",
        fitment: "Corolla 2014–2018 (E170)",
        images: ["brake pad front, toyota corolla.jpg "],
        badge: "Genuine",
        specs: { material: "Ceramic", warranty: "12 months" },
        description: "High-performance front brake pads suitable for Toyota Corolla models (E170)."
    },
    {
        id: "P-0002",
        name: "Air Filter",
        brand: "Honda",
        model: "Civic",
        year: 2017,
        category: "filters",
        price: 95.0,
        stock: 20,
        rating: 4.3,
        sku: "HON-FLT-3011",
        fitment: "Civic 2016–2019 (FC/FK)",
        images: ["Air filter, honda civic.jpg"],
        badge: "Aftermarket",
        specs: { efficiency: "99%", warranty: "6 months" },
        description: "OEM-equivalent air filter ensuring optimal airflow and engine protection."
    },
    {
        id: "P-0003",
        name: "Shock Absorber Rear",
        brand: "Nissan",
        model: "Altima",
        year: 2018,
        category: "suspension",
        price: 380.0,
        stock: 8,
        rating: 4.5,
        sku: "NIS-SUS-5521",
        fitment: "Altima 2015–2019",
        images: ["rear shock absorber.jpg"],
        badge: "Genuine",
        specs: { type: "Gas-charged", warranty: "12 months" },
        description: "Durable rear shock absorber for Nissan Altima."
    },
    {
        id: "P-0004",
        name: "Spark Plug Set (4)",
        brand: "Mercedes",
        model: "C-Class",
        year: 2016,
        category: "electrical",
        price: 260.0,
        stock: 16,
        rating: 4.7,
        sku: "MER-ELC-7742",
        fitment: "C-Class W205",
        images: ["spark plug set.jpg"],
        badge: "Genuine",
        specs: { gap: "0.8 mm", warranty: "12 months" },
        description: "Premium spark plugs optimized for Mercedes C-Class W205."
    },
];

// Pagination size
const PAGE_SIZE = 12;
