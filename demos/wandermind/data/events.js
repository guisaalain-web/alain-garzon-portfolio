// Global Events database organized by city
const EVENTS = {
    madrid: [
        { id: 1, title: "Jazz en la Azotea", category: "music", date: "2024-12-06", time: "21:00", location: "Terraza Hotel Óscar", description: "Concierto íntimo de jazz bajo las estrellas.", hidden: true, coords: { lat: 40.4205, lng: -3.7008 } },
        { id: 2, title: "Mercado Nocturno Vintage", category: "market", date: "2024-12-07", time: "19:00", location: "Conde Duque", description: "Ropa vintage, vinilos y diseño independiente.", hidden: true, coords: { lat: 40.4282, lng: -3.7124 } },
        { id: 3, title: "Cata Clandestina de Vinos", category: "food", date: "2024-12-08", time: "20:30", location: "Bodega Secreta Lavapiés", description: "Degustación de vinos naturales.", hidden: true, coords: { lat: 40.4070, lng: -3.7010 } },
        { id: 4, title: "Exposición Underground", category: "art", date: "2024-12-05", time: "18:00", location: "Nave Terneras", description: "Arte urbano y nuevos medios.", hidden: false, coords: { lat: 40.3920, lng: -3.6975 } }
    ],
    paris: [
        { id: 1, title: "Jazz Manouche Secret", category: "music", date: "2024-12-06", time: "22:00", location: "Cave du 38 Riv'", description: "Jazz gitano en cueva histórica del Marais.", hidden: true, coords: { lat: 48.8566, lng: 2.3522 } },
        { id: 2, title: "Marché des Enfants Rouges", category: "market", date: "2024-12-07", time: "09:00", location: "3e Arrondissement", description: "El mercado cubierto más antiguo de París.", hidden: false, coords: { lat: 48.8630, lng: 2.3623 } },
        { id: 3, title: "Wine & Cheese Underground", category: "food", date: "2024-12-08", time: "19:00", location: "Cave à Fromage Secrete", description: "Maridaje en bodega del siglo XVII.", hidden: true, coords: { lat: 48.8520, lng: 2.3499 } },
        { id: 4, title: "Street Art Belleville", category: "art", date: "2024-12-09", time: "14:00", location: "Belleville", description: "Tour de murales con artistas locales.", hidden: true, coords: { lat: 48.8714, lng: 2.3850 } }
    ],
    london: [
        { id: 1, title: "Secret Jazz Club", category: "music", date: "2024-12-06", time: "21:00", location: "Undisclosed Soho", description: "Club de jazz speakeasy sin cartel.", hidden: true, coords: { lat: 51.5134, lng: -0.1364 } },
        { id: 2, title: "Columbia Road Market", category: "market", date: "2024-12-08", time: "08:00", location: "Bethnal Green", description: "Mercado de flores dominical legendario.", hidden: false, coords: { lat: 51.5294, lng: -0.0717 } },
        { id: 3, title: "Supper Club Underground", category: "food", date: "2024-12-07", time: "20:00", location: "Hackney Wick", description: "Cena secreta en almacén reconvertido.", hidden: true, coords: { lat: 51.5435, lng: -0.0254 } },
        { id: 4, title: "Immersive Theatre", category: "art", date: "2024-12-09", time: "19:30", location: "Punchdrunk Warehouse", description: "Teatro inmersivo experimental.", hidden: true, coords: { lat: 51.5010, lng: -0.0510 } }
    ],
    rome: [
        { id: 1, title: "Opera en Ruinas", category: "music", date: "2024-12-06", time: "21:00", location: "Termas de Caracalla", description: "Ópera al aire libre en ruinas romanas.", hidden: false, coords: { lat: 41.8793, lng: 12.4924 } },
        { id: 2, title: "Mercato Testaccio", category: "market", date: "2024-12-07", time: "07:00", location: "Testaccio", description: "Mercado local con los mejores supplì.", hidden: true, coords: { lat: 41.8760, lng: 12.4756 } },
        { id: 3, title: "Cena en Viñedo", category: "food", date: "2024-12-08", time: "20:00", location: "Frascati Hills", description: "Cena con vista a Roma y vino local.", hidden: true, coords: { lat: 41.8089, lng: 12.6810 } },
        { id: 4, title: "Aperitivo Secreto", category: "food", date: "2024-12-09", time: "18:00", location: "Terrazza Monti", description: "Aperitivo en terraza escondida.", hidden: true, coords: { lat: 41.8946, lng: 12.4922 } }
    ],
    tokyo: [
        { id: 1, title: "Underground Techno", category: "music", date: "2024-12-06", time: "23:00", location: "Womb Shibuya", description: "Club techno legendario de Tokio.", hidden: false, coords: { lat: 35.6595, lng: 139.6983 } },
        { id: 2, title: "Tsukiji Outer Market", category: "market", date: "2024-12-07", time: "05:00", location: "Tsukiji", description: "Mercado exterior con sushi matutino.", hidden: true, coords: { lat: 35.6654, lng: 139.7707 } },
        { id: 3, title: "Ramen Workshop", category: "food", date: "2024-12-08", time: "11:00", location: "Shinjuku", description: "Aprende a hacer ramen auténtico.", hidden: true, coords: { lat: 35.6938, lng: 139.7034 } },
        { id: 4, title: "Digital Art Night", category: "art", date: "2024-12-09", time: "19:00", location: "teamLab Planets", description: "Experiencia nocturna especial.", hidden: true, coords: { lat: 35.6264, lng: 139.7838 } }
    ],
    newyork: [
        { id: 1, title: "Speakeasy Jazz Night", category: "music", date: "2024-12-06", time: "22:00", location: "Hidden Bar Greenwich", description: "Jazz íntimo en bar prohibición.", hidden: true, coords: { lat: 40.7336, lng: -74.0027 } },
        { id: 2, title: "Smorgasburg", category: "market", date: "2024-12-07", time: "11:00", location: "Williamsburg", description: "El mayor mercado de comida de NYC.", hidden: false, coords: { lat: 40.7216, lng: -73.9625 } },
        { id: 3, title: "Secret Rooftop Cinema", category: "art", date: "2024-12-08", time: "20:00", location: "Bushwick Rooftop", description: "Cine bajo las estrellas de Brooklyn.", hidden: true, coords: { lat: 40.6944, lng: -73.9213 } },
        { id: 4, title: "Tasting Menu Pop-up", category: "food", date: "2024-12-09", time: "19:00", location: "Lower East Side", description: "Pop-up de chef Michelin.", hidden: true, coords: { lat: 40.7150, lng: -73.9843 } }
    ],
    barcelona: [
        { id: 1, title: "Flamenco Underground", category: "music", date: "2024-12-06", time: "22:00", location: "El Raval", description: "Tablao íntimo en sótano.", hidden: true, coords: { lat: 41.3797, lng: 2.1689 } },
        { id: 2, title: "Mercat de Sant Antoni", category: "market", date: "2024-12-08", time: "08:00", location: "Eixample", description: "Mercado dominical de libros y antigüedades.", hidden: false, coords: { lat: 41.3772, lng: 2.1614 } },
        { id: 3, title: "Vermouth Hour", category: "food", date: "2024-12-07", time: "12:00", location: "Gràcia", description: "Ruta de vermut con tapas locales.", hidden: true, coords: { lat: 41.4034, lng: 2.1563 } },
        { id: 4, title: "Street Art Tour", category: "art", date: "2024-12-09", time: "16:00", location: "Poblenou", description: "Tour grafiti con artistas del barrio.", hidden: true, coords: { lat: 41.4033, lng: 2.2043 } }
    ],
    amsterdam: [
        { id: 1, title: "Canal Concert", category: "music", date: "2024-12-06", time: "20:00", location: "Prinsengracht", description: "Concierto clásico en barco.", hidden: true, coords: { lat: 52.3667, lng: 4.8833 } },
        { id: 2, title: "Noordermarkt", category: "market", date: "2024-12-07", time: "09:00", location: "Jordaan", description: "Mercado orgánico de sábado.", hidden: false, coords: { lat: 52.3798, lng: 4.8849 } },
        { id: 3, title: "Cheese Tasting", category: "food", date: "2024-12-08", time: "15:00", location: "De Pijp", description: "Cata de quesos holandeses secretos.", hidden: true, coords: { lat: 52.3530, lng: 4.8938 } },
        { id: 4, title: "Light Festival Walk", category: "art", date: "2024-12-09", time: "18:00", location: "City Center", description: "Tour de instalaciones de luz.", hidden: false, coords: { lat: 52.3676, lng: 4.9041 } }
    ],
    berlin: [
        { id: 1, title: "Techno Temple", category: "music", date: "2024-12-06", time: "00:00", location: "Berghain Area", description: "Club mítico con DJ set especial.", hidden: true, coords: { lat: 52.5112, lng: 13.4420 } },
        { id: 2, title: "Mauerpark Karaoke", category: "music", date: "2024-12-08", time: "15:00", location: "Prenzlauer Berg", description: "Karaoke masivo al aire libre.", hidden: false, coords: { lat: 52.5430, lng: 13.4028 } },
        { id: 3, title: "Food Tour Kreuzberg", category: "food", date: "2024-12-07", time: "12:00", location: "Kreuzberg", description: "Tour gastro multicultural.", hidden: true, coords: { lat: 52.4952, lng: 13.4030 } },
        { id: 4, title: "Abandoned Places Tour", category: "art", date: "2024-12-09", time: "14:00", location: "Various", description: "Tour de lugares abandonados legales.", hidden: true, coords: { lat: 52.5069, lng: 13.4277 } }
    ],
    bangkok: [
        { id: 1, title: "Rooftop Jazz Night", category: "music", date: "2024-12-06", time: "20:00", location: "Silom", description: "Jazz con vista al skyline.", hidden: true, coords: { lat: 13.7278, lng: 100.5230 } },
        { id: 2, title: "Rot Fai Market", category: "market", date: "2024-12-07", time: "17:00", location: "Ratchada", description: "Mercado nocturno vintage.", hidden: false, coords: { lat: 13.7672, lng: 100.5739 } },
        { id: 3, title: "Thai Cooking Class", category: "food", date: "2024-12-08", time: "10:00", location: "Old Town", description: "Clase de cocina en casa local.", hidden: true, coords: { lat: 13.7500, lng: 100.4913 } },
        { id: 4, title: "Temple at Dawn", category: "culture", date: "2024-12-09", time: "05:30", location: "Wat Arun", description: "Meditación al amanecer.", hidden: true, coords: { lat: 13.7437, lng: 100.4889 } }
    ],
    dubai: [
        { id: 1, title: "Desert Sound Session", category: "music", date: "2024-12-06", time: "17:00", location: "Al Marmoom", description: "DJ set en el desierto.", hidden: true, coords: { lat: 24.9500, lng: 55.4500 } },
        { id: 2, title: "Spice Souk Tour", category: "market", date: "2024-12-07", time: "10:00", location: "Deira", description: "Tour de especias con comerciantes.", hidden: true, coords: { lat: 25.2690, lng: 55.3020 } },
        { id: 3, title: "Emirati Dinner", category: "food", date: "2024-12-08", time: "19:00", location: "Al Fahidi", description: "Cena tradicional emiratí.", hidden: true, coords: { lat: 25.2637, lng: 55.2962 } },
        { id: 4, title: "Sunset Dhow Cruise", category: "culture", date: "2024-12-09", time: "16:30", location: "Dubai Creek", description: "Crucero en barco tradicional.", hidden: false, coords: { lat: 25.2580, lng: 55.3050 } }
    ],
    sydney: [
        { id: 1, title: "Harbour Jazz", category: "music", date: "2024-12-06", time: "19:00", location: "Circular Quay", description: "Jazz junto a la Ópera.", hidden: false, coords: { lat: 33.8568, lng: 151.2153 } },
        { id: 2, title: "Paddington Markets", category: "market", date: "2024-12-07", time: "10:00", location: "Paddington", description: "Mercado de diseño australiano.", hidden: false, coords: { lat: -33.8847, lng: 151.2266 } },
        { id: 3, title: "Beach BBQ Class", category: "food", date: "2024-12-08", time: "11:00", location: "Bondi", description: "Clase de barbacoa aussie.", hidden: true, coords: { lat: -33.8915, lng: 151.2767 } },
        { id: 4, title: "Aboriginal Art Walk", category: "art", date: "2024-12-09", time: "14:00", location: "The Rocks", description: "Tour de arte aborigen.", hidden: true, coords: { lat: -33.8599, lng: 151.2090 } }
    ]
};

window.EVENTS = EVENTS;
