// Global Transport database organized by city
const TRANSPORT = {
    madrid: {
        metro: [
            { id: "L1", name: "Línea 1", color: "#00a0e1", route: "Pinar de Chamartín - Valdecarros", frequency: 4 },
            { id: "L2", name: "Línea 2", color: "#ed1c24", route: "Las Rosas - Cuatro Caminos", frequency: 5 },
            { id: "L3", name: "Línea 3", color: "#ffcc00", route: "Villaverde Alto - Moncloa", frequency: 4 }
        ],
        bus: [
            { id: "001", name: "Circular", color: "#22c55e", route: "Circular Centro", frequency: 8 },
            { id: "027", name: "Línea 27", color: "#22c55e", route: "Embajadores - Plaza Castilla", frequency: 10 }
        ]
    },
    paris: {
        metro: [
            { id: "1", name: "Ligne 1", color: "#FFCD00", route: "La Défense - Château de Vincennes", frequency: 3 },
            { id: "4", name: "Ligne 4", color: "#A0006E", route: "Porte de Clignancourt - Mairie de Montrouge", frequency: 3 },
            { id: "14", name: "Ligne 14", color: "#62259D", route: "Saint-Lazare - Olympiades", frequency: 2 }
        ],
        bus: [
            { id: "69", name: "Bus 69", color: "#22c55e", route: "Champ de Mars - Gambetta", frequency: 8 }
        ]
    },
    london: {
        metro: [
            { id: "Central", name: "Central Line", color: "#DC241F", route: "Ealing Broadway - Epping", frequency: 3 },
            { id: "Northern", name: "Northern Line", color: "#000000", route: "High Barnet - Morden", frequency: 3 },
            { id: "Piccadilly", name: "Piccadilly Line", color: "#0019A8", route: "Heathrow - Cockfosters", frequency: 4 }
        ],
        bus: [
            { id: "11", name: "Bus 11", color: "#DC241F", route: "Fulham - Liverpool Street", frequency: 8 }
        ]
    },
    rome: {
        metro: [
            { id: "A", name: "Linea A", color: "#F7941D", route: "Battistini - Anagnina", frequency: 5 },
            { id: "B", name: "Linea B", color: "#0072BC", route: "Rebibbia - Laurentina", frequency: 5 }
        ],
        bus: [
            { id: "40", name: "Bus 40", color: "#22c55e", route: "Termini - Vaticano Express", frequency: 10 }
        ]
    },
    tokyo: {
        metro: [
            { id: "G", name: "Ginza Line", color: "#F39700", route: "Shibuya - Asakusa", frequency: 2 },
            { id: "M", name: "Marunouchi Line", color: "#E60012", route: "Ogikubo - Ikebukuro", frequency: 2 },
            { id: "Y", name: "Yamanote Line", color: "#9ACD32", route: "Loop Line", frequency: 2 }
        ],
        bus: [
            { id: "都01", name: "Toei 01", color: "#22c55e", route: "Shibuya - Shinjuku", frequency: 10 }
        ]
    },
    newyork: {
        metro: [
            { id: "1", name: "1 Line", color: "#EE352E", route: "Van Cortlandt - South Ferry", frequency: 4 },
            { id: "A", name: "A Line", color: "#0039A6", route: "Inwood - Far Rockaway", frequency: 5 },
            { id: "L", name: "L Line", color: "#A7A9AC", route: "8th Ave - Canarsie", frequency: 4 }
        ],
        bus: [
            { id: "M1", name: "M1 Bus", color: "#22c55e", route: "Harlem - Financial District", frequency: 8 }
        ]
    },
    barcelona: {
        metro: [
            { id: "L1", name: "Línia 1", color: "#E2001A", route: "Hospital de Bellvitge - Fondo", frequency: 4 },
            { id: "L3", name: "Línia 3", color: "#00A651", route: "Zona Universitària - Trinitat Nova", frequency: 4 },
            { id: "L4", name: "Línia 4", color: "#FAA61A", route: "Trinitat Nova - La Pau", frequency: 5 }
        ],
        bus: [
            { id: "V15", name: "V15", color: "#22c55e", route: "Pg. Marítim - Horta", frequency: 8 }
        ]
    },
    amsterdam: {
        metro: [
            { id: "52", name: "Noord/Zuidlijn", color: "#004B9F", route: "Noord - Zuid", frequency: 5 },
            { id: "54", name: "Lijn 54", color: "#FFDD00", route: "Centraal - Gein", frequency: 6 }
        ],
        tram: [
            { id: "2", name: "Tram 2", color: "#3b82f6", route: "Centraal Station - Nieuw Sloten", frequency: 6 },
            { id: "5", name: "Tram 5", color: "#3b82f6", route: "Centraal Station - Amstelveen", frequency: 6 }
        ]
    },
    berlin: {
        metro: [
            { id: "U1", name: "U1", color: "#55A822", route: "Uhlandstraße - Warschauer Straße", frequency: 4 },
            { id: "U2", name: "U2", color: "#FF3300", route: "Ruhleben - Pankow", frequency: 4 },
            { id: "U8", name: "U8", color: "#0067AD", route: "Wittenau - Hermannstraße", frequency: 4 }
        ],
        tram: [
            { id: "M10", name: "M10 Tram", color: "#BE1414", route: "Hauptbahnhof - Warschauer Str", frequency: 5 }
        ]
    },
    bangkok: {
        metro: [
            { id: "BTS-S", name: "BTS Sukhumvit", color: "#8CC63F", route: "Mo Chit - Bearing", frequency: 4 },
            { id: "BTS-Si", name: "BTS Silom", color: "#8CC63F", route: "National Stadium - Bang Wa", frequency: 4 },
            { id: "MRT-B", name: "MRT Blue", color: "#2E4A9A", route: "Hua Lamphong - Tao Poon", frequency: 5 }
        ],
        bus: [
            { id: "8", name: "Bus 8", color: "#22c55e", route: "Grand Palace - Chatuchak", frequency: 10 }
        ]
    },
    dubai: {
        metro: [
            { id: "Red", name: "Red Line", color: "#EE3040", route: "Rashidiya - UAE Exchange", frequency: 4 },
            { id: "Green", name: "Green Line", color: "#00A651", route: "Etisalat - Creek", frequency: 5 }
        ],
        bus: [
            { id: "8", name: "Bus 8", color: "#22c55e", route: "Gold Souq - Deira City Centre", frequency: 10 }
        ]
    },
    sydney: {
        metro: [
            { id: "T1", name: "T1 North Shore", color: "#F99D1C", route: "Central - Berowra", frequency: 6 },
            { id: "T4", name: "T4 Eastern", color: "#0072BC", route: "Central - Bondi Junction", frequency: 8 }
        ],
        bus: [
            { id: "333", name: "Bus 333", color: "#22c55e", route: "Circular Quay - Bondi", frequency: 10 }
        ]
    }
};

function generateSchedule(frequency) {
    const now = new Date();
    const schedules = [];
    for (let i = 0; i < 5; i++) {
        const nextTime = new Date(now.getTime() + (i * frequency + Math.floor(Math.random() * 2)) * 60000);
        const hours = nextTime.getHours().toString().padStart(2, '0');
        const mins = nextTime.getMinutes().toString().padStart(2, '0');
        schedules.push({ time: `${hours}:${mins}`, eta: i === 0 ? `${frequency} min` : `${(i * frequency)} min`, destination: i % 2 === 0 ? "Fin de línea" : "Centro" });
    }
    return schedules;
}

window.TRANSPORT = TRANSPORT;
window.generateSchedule = generateSchedule;
