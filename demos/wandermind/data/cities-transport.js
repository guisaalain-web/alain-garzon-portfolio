// WanderMind - Cities Transport Database with Official Links
// Real transport information for professional itineraries

const CITIES_TRANSPORT = {
    // ESPAÑA
    madrid: {
        name: 'Madrid',
        country: 'España',
        currency: 'EUR',
        language: 'Español',
        transport: {
            metro: {
                name: 'Metro de Madrid',
                url: 'https://www.metromadrid.es',
                ticketPrice: '1.50-2€',
                dayPass: '8.40€',
                hours: '06:00 - 01:30',
                lines: [
                    { id: 'L1', name: 'Línea 1', color: '#00a0e1', route: 'Pinar de Chamartín - Valdecarros', keyStops: ['Sol', 'Atocha', 'Tribunal'] },
                    { id: 'L2', name: 'Línea 2', color: '#ed1c24', route: 'Las Rosas - Cuatro Caminos', keyStops: ['Sol', 'Ópera', 'Noviciado'] },
                    { id: 'L3', name: 'Línea 3', color: '#ffcc00', route: 'Villaverde Alto - Moncloa', keyStops: ['Sol', 'Callao', 'Argüelles'] },
                    { id: 'L5', name: 'Línea 5', color: '#96bf0d', route: 'Alameda de Osuna - Casa de Campo', keyStops: ['Gran Vía', 'Callao', 'Ventas'] },
                    { id: 'L10', name: 'Línea 10', color: '#000078', route: 'Hospital Infanta Sofía - Puerta del Sur', keyStops: ['Tribunal', 'Plaza de España', 'Príncipe Pío'] }
                ]
            },
            bus: {
                name: 'EMT Madrid',
                url: 'https://www.emtmadrid.es',
                ticketPrice: '1.50€',
                dayPass: '8.40€ (combinado metro)',
                hours: '06:00 - 23:30',
                nightBus: 'Búhos (23:30 - 06:00)'
            },
            train: {
                name: 'Cercanías Renfe',
                url: 'https://www.renfe.com/es/es/cercanias',
                ticketPrice: '1.70-5€',
                keyRoutes: ['Aeropuerto T4', 'Alcalá', 'Aranjuez']
            }
        },
        tips: {
            food: ['Bocadillo de calamares en Plaza Mayor', 'Churros en San Ginés', 'Cocido madrileño'],
            freeAttractions: ['Retiro (gratis)', 'Templo de Debod', 'Palacio Real (exterior)'],
            localNeighborhoods: ['Malasaña', 'La Latina', 'Lavapiés', 'Chueca']
        }
    },

    barcelona: {
        name: 'Barcelona',
        country: 'España',
        currency: 'EUR',
        language: 'Catalán/Español',
        transport: {
            metro: {
                name: 'TMB Metro',
                url: 'https://www.tmb.cat',
                ticketPrice: '2.40€',
                dayPass: '10.50€ (T-Dia)',
                hours: '05:00 - 00:00 (24h viernes)',
                lines: [
                    { id: 'L1', name: 'Línia 1', color: '#E2001A', route: 'Hospital de Bellvitge - Fondo', keyStops: ['Pl. Catalunya', 'Arc de Triomf', 'Clot'] },
                    { id: 'L3', name: 'Línia 3', color: '#00A651', route: 'Zona Universitària - Trinitat Nova', keyStops: ['Pl. Catalunya', 'Diagonal', 'Liceu'] },
                    { id: 'L4', name: 'Línia 4', color: '#FAA61A', route: 'Trinitat Nova - La Pau', keyStops: ['Passeig de Gràcia', 'Barceloneta', 'Ciutadella'] },
                    { id: 'L5', name: 'Línia 5', color: '#0072BC', route: 'Cornellà Centre - Vall d\'Hebron', keyStops: ['Sagrada Família', 'Diagonal', 'Sants'] }
                ]
            },
            bus: {
                name: 'TMB Bus',
                url: 'https://www.tmb.cat/es/barcelona/autobuses',
                ticketPrice: '2.40€',
                touristBus: 'Bus Turístic - 30€/día'
            },
            train: {
                name: 'Rodalies/FGC',
                url: 'https://rofreccadfrtalies.gencat.cat',
                ticketPrice: '2.40-4€',
                keyRoutes: ['Aeropuerto', 'Montserrat (FGC)', 'Sitges']
            }
        },
        tips: {
            food: ['Pa amb tomàquet', 'Fideuà en la Barceloneta', 'Croquetas en El Xampanyet'],
            freeAttractions: ['Barrio Gótico', 'La Barceloneta', 'Bunkers del Carmel', 'Parque de la Ciutadella'],
            localNeighborhoods: ['El Born', 'Gràcia', 'Raval', 'Poble Sec']
        }
    },

    // FRANCIA
    paris: {
        name: 'París',
        country: 'Francia',
        currency: 'EUR',
        language: 'Francés',
        transport: {
            metro: {
                name: 'Métro RATP',
                url: 'https://www.ratp.fr',
                ticketPrice: '2.10€',
                dayPass: '16.10€ (Mobilis)',
                hours: '05:30 - 01:15',
                lines: [
                    { id: '1', name: 'Ligne 1', color: '#FFCD00', route: 'La Défense - Château de Vincennes', keyStops: ['Champs-Élysées', 'Louvre', 'Bastille'] },
                    { id: '4', name: 'Ligne 4', color: '#A0006E', route: 'Porte de Clignancourt - Mairie de Montrouge', keyStops: ['Montmartre', 'Châtelet', 'Saint-Germain'] },
                    { id: '6', name: 'Ligne 6', color: '#76C882', route: 'Charles de Gaulle-Étoile - Nation', keyStops: ['Trocadéro', 'Tour Eiffel (Bir-Hakeim)', 'Montparnasse'] },
                    { id: '14', name: 'Ligne 14', color: '#62259D', route: 'Saint-Lazare - Olympiades', keyStops: ['Gare de Lyon', 'Bercy', 'Bibliothèque'] }
                ]
            },
            bus: {
                name: 'Bus RATP',
                url: 'https://www.ratp.fr/plans-lignes/busratp',
                ticketPrice: '2.10€',
                touristBus: 'Open Tour - 39€/día'
            },
            train: {
                name: 'RER',
                url: 'https://www.ratp.fr/plans/rer',
                ticketPrice: '2.10-12€',
                keyRoutes: ['CDG Airport (RER B)', 'Versailles (RER C)', 'Disneyland (RER A)']
            }
        },
        tips: {
            food: ['Croissant en cualquier boulangerie', 'Crêpe en Montmartre', 'Falafel en Le Marais'],
            freeAttractions: ['Sacré-Cœur', 'Notre-Dame (exterior)', 'Jardines de Luxemburgo', 'Campos Elíseos'],
            localNeighborhoods: ['Le Marais', 'Montmartre', 'Saint-Germain', 'Belleville']
        }
    },

    // REINO UNIDO
    london: {
        name: 'Londres',
        country: 'Reino Unido',
        currency: 'GBP (£)',
        language: 'Inglés',
        transport: {
            metro: {
                name: 'London Underground (Tube)',
                url: 'https://tfl.gov.uk/modes/tube',
                ticketPrice: '£2.80-5.50 (Oyster)',
                dayPass: '£15.20 (Zones 1-2)',
                hours: '05:00 - 00:30 (24h viernes/sábado)',
                lines: [
                    { id: 'Central', name: 'Central Line', color: '#DC241F', route: 'Ealing Broadway - Epping', keyStops: ['Oxford Circus', 'Liverpool Street', 'Notting Hill'] },
                    { id: 'Northern', name: 'Northern Line', color: '#000000', route: 'High Barnet - Morden', keyStops: ['Camden Town', 'Leicester Square', 'London Bridge'] },
                    { id: 'Piccadilly', name: 'Piccadilly Line', color: '#0019A8', route: 'Heathrow - Cockfosters', keyStops: ['Piccadilly Circus', 'Covent Garden', 'South Kensington'] },
                    { id: 'Victoria', name: 'Victoria Line', color: '#009FE0', route: 'Walthamstow - Brixton', keyStops: ['Kings Cross', 'Oxford Circus', 'Victoria'] }
                ]
            },
            bus: {
                name: 'London Bus',
                url: 'https://tfl.gov.uk/modes/buses',
                ticketPrice: '£1.75',
                iconicRoutes: 'Route 11, 15 (double-decker por el centro)'
            },
            train: {
                name: 'National Rail / Overground',
                url: 'https://www.nationalrail.co.uk',
                ticketPrice: '£3-20',
                keyRoutes: ['Gatwick Express', 'Heathrow Express', 'Brighton']
            }
        },
        tips: {
            food: ['Fish & Chips en cualquier pub', 'Sunday Roast', 'Borough Market (comida artesanal)'],
            freeAttractions: ['British Museum', 'Tate Modern', 'Hyde Park', 'Cambio de guardia (Buckingham)'],
            localNeighborhoods: ['Shoreditch', 'Camden', 'Notting Hill', 'Brixton']
        }
    },

    // ITALIA
    rome: {
        name: 'Roma',
        country: 'Italia',
        currency: 'EUR',
        language: 'Italiano',
        transport: {
            metro: {
                name: 'Metro Roma',
                url: 'https://www.atac.roma.it',
                ticketPrice: '1.50€',
                dayPass: '7€ (24h)',
                hours: '05:30 - 23:30',
                lines: [
                    { id: 'A', name: 'Linea A', color: '#F7941D', route: 'Battistini - Anagnina', keyStops: ['Vaticano', 'Spagna', 'Termini'] },
                    { id: 'B', name: 'Linea B', color: '#0072BC', route: 'Rebibbia - Laurentina', keyStops: ['Colosseo', 'Termini', 'Circo Massimo'] },
                    { id: 'C', name: 'Linea C', color: '#00A651', route: 'Monte Compatri - San Giovanni', keyStops: ['San Giovanni', 'Pigneto'] }
                ]
            },
            bus: {
                name: 'ATAC Bus',
                url: 'https://www.atac.roma.it',
                ticketPrice: '1.50€',
                tips: '64 y 40 conectan Termini con Vaticano'
            },
            tram: {
                name: 'Tram',
                url: 'https://www.atac.roma.it',
                ticketPrice: '1.50€ (mismo billete)',
                iconicRoutes: 'Tram 3 - Colosseo a Trastevere'
            }
        },
        tips: {
            food: ['Carbonara en Trastevere', 'Supplì (croquetas de arroz)', 'Gelato en Giolitti'],
            freeAttractions: ['Panteón', 'Fontana di Trevi', 'Piazza Navona', 'Basílica San Pedro (exterior)'],
            localNeighborhoods: ['Trastevere', 'Testaccio', 'Monti', 'San Lorenzo']
        }
    },

    // ALEMANIA
    berlin: {
        name: 'Berlín',
        country: 'Alemania',
        currency: 'EUR',
        language: 'Alemán',
        transport: {
            metro: {
                name: 'U-Bahn BVG',
                url: 'https://www.bvg.de',
                ticketPrice: '3.20€',
                dayPass: '9.50€',
                hours: '04:00 - 01:00 (24h fines de semana)',
                lines: [
                    { id: 'U1', name: 'U1', color: '#55A822', route: 'Uhlandstraße - Warschauer Straße', keyStops: ['Kottbusser Tor', 'Schlesisches Tor'] },
                    { id: 'U2', name: 'U2', color: '#FF3300', route: 'Ruhleben - Pankow', keyStops: ['Alexanderplatz', 'Potsdamer Platz', 'Zoo'] },
                    { id: 'U5', name: 'U5', color: '#7E5330', route: 'Hauptbahnhof - Hönow', keyStops: ['Brandenburger Tor', 'Alexanderplatz', 'Frankfurter Tor'] },
                    { id: 'U8', name: 'U8', color: '#0067AD', route: 'Wittenau - Hermannstraße', keyStops: ['Alexanderplatz', 'Rosenthaler Platz', 'Hermannplatz'] }
                ]
            },
            sbahn: {
                name: 'S-Bahn',
                url: 'https://sbahn.berlin',
                ticketPrice: '3.20€ (mismo billete)',
                keyRoutes: 'Ring S41/S42 - circunvalación completa'
            },
            tram: {
                name: 'Tram',
                url: 'https://www.bvg.de/de/verbindungen/tram',
                ticketPrice: '3.20€ (mismo billete)',
                tips: 'M10 cruza todo Prenzlauer Berg'
            }
        },
        tips: {
            food: ['Currywurst en Konnopke', 'Döner en Kreuzberg', 'Bretzel recién hecho'],
            freeAttractions: ['Muro de Berlín (East Side Gallery)', 'Puerta de Brandenburgo', 'Reichstag (reservar online)'],
            localNeighborhoods: ['Kreuzberg', 'Prenzlauer Berg', 'Friedrichshain', 'Neukölln']
        }
    },

    // PAÍSES BAJOS
    amsterdam: {
        name: 'Ámsterdam',
        country: 'Países Bajos',
        currency: 'EUR',
        language: 'Holandés',
        transport: {
            metro: {
                name: 'GVB Metro',
                url: 'https://www.gvb.nl',
                ticketPrice: '3.40€',
                dayPass: '9€ (24h)',
                hours: '06:00 - 00:30',
                lines: [
                    { id: '52', name: 'Noord/Zuidlijn', color: '#004B9F', route: 'Noord - Zuid', keyStops: ['Centraal', 'Rokin', 'Vijzelgracht'] },
                    { id: '54', name: 'Lijn 54', color: '#FFDD00', route: 'Centraal - Gein', keyStops: ['Centraal', 'Amstel', 'Bijlmer'] }
                ]
            },
            tram: {
                name: 'GVB Tram',
                url: 'https://www.gvb.nl/reisinformatie/tram',
                ticketPrice: '3.40€',
                iconicRoutes: 'Tram 2 y 5 pasan por los museos'
            },
            bike: {
                name: 'Alquiler de Bicicletas',
                url: 'https://www.macbike.nl',
                price: '10-15€/día',
                tips: 'La forma más local de moverse'
            }
        },
        tips: {
            food: ['Stroopwafel recién hecho', 'Bitterballen en un brown café', 'Haring (arenque)'],
            freeAttractions: ['Vondelpark', 'Mercado de flores', 'Jordaan (pasear)', 'Begijnhof'],
            localNeighborhoods: ['Jordaan', 'De Pijp', 'Oud-West', 'NDSM Wharf']
        }
    },

    // ESTADOS UNIDOS
    newyork: {
        name: 'Nueva York',
        country: 'Estados Unidos',
        currency: 'USD ($)',
        language: 'Inglés',
        transport: {
            metro: {
                name: 'NYC Subway',
                url: 'https://new.mta.info',
                ticketPrice: '$2.90',
                dayPass: '$33 (7-day unlimited)',
                hours: '24/7',
                lines: [
                    { id: '1', name: '1 Train', color: '#EE352E', route: 'Van Cortlandt - South Ferry', keyStops: ['Times Square', 'Columbus Circle', 'WTC'] },
                    { id: 'A', name: 'A Train', color: '#0039A6', route: 'Inwood - Far Rockaway', keyStops: ['Penn Station', 'Columbus Circle', 'JFK'] },
                    { id: 'L', name: 'L Train', color: '#A7A9AC', route: '8th Ave - Canarsie', keyStops: ['Union Square', 'Bedford Ave (Brooklyn)', '14th St'] },
                    { id: '7', name: '7 Train', color: '#B933AD', route: 'Flushing - 34th St', keyStops: ['Times Square', 'Grand Central', 'Flushing'] }
                ]
            },
            bus: {
                name: 'MTA Bus',
                url: 'https://new.mta.info/modes/bus',
                ticketPrice: '$2.90',
                tips: 'M1, M2, M3 bajan por Fifth Ave'
            },
            ferry: {
                name: 'NYC Ferry / Staten Island Ferry',
                url: 'https://www.ferry.nyc',
                ticketPrice: '$4 / GRATIS (Staten Island)',
                tips: 'Staten Island Ferry = vistas de Estatua de la Libertad gratis'
            }
        },
        tips: {
            food: ['Pizza al slice en Joe\'s', 'Bagel con lox', 'Pastrami en Katz\'s'],
            freeAttractions: ['Central Park', 'High Line', 'Staten Island Ferry', 'Times Square'],
            localNeighborhoods: ['Williamsburg', 'East Village', 'SoHo', 'Harlem']
        }
    },

    // JAPÓN
    tokyo: {
        name: 'Tokio',
        country: 'Japón',
        currency: 'JPY (¥)',
        language: 'Japonés',
        transport: {
            metro: {
                name: 'Tokyo Metro',
                url: 'https://www.tokyometro.jp/en',
                ticketPrice: '¥180-320',
                dayPass: '¥800 (24h)',
                hours: '05:00 - 00:00',
                lines: [
                    { id: 'G', name: 'Ginza Line', color: '#F39700', route: 'Shibuya - Asakusa', keyStops: ['Shibuya', 'Ginza', 'Asakusa'] },
                    { id: 'M', name: 'Marunouchi Line', color: '#E60012', route: 'Ogikubo - Ikebukuro', keyStops: ['Tokyo Station', 'Shinjuku', 'Ikebukuro'] },
                    { id: 'H', name: 'Hibiya Line', color: '#9CAEB7', route: 'Naka-Meguro - Kita-Senju', keyStops: ['Roppongi', 'Ginza', 'Akihabara'] }
                ]
            },
            jrLines: {
                name: 'JR Yamanote Line',
                url: 'https://www.jreast.co.jp/e/routemaps',
                ticketPrice: '¥150-200',
                tips: 'El loop que conecta todas las zonas principales'
            },
            suicaPasmo: {
                name: 'Tarjeta Suica/Pasmo',
                url: 'https://www.jreast.co.jp/e/pass/suica.html',
                tips: 'Recargable, funciona en todo transporte y konbinis'
            }
        },
        tips: {
            food: ['Ramen en cualquier yokocho', 'Sushi en Tsukiji', 'Onigiri de konbini'],
            freeAttractions: ['Senso-ji Temple', 'Shibuya Crossing', 'Yoyogi Park', 'Imperial Palace (exterior)'],
            localNeighborhoods: ['Shimokitazawa', 'Yanaka', 'Koenji', 'Nakameguro']
        }
    }
};

// Export for use in app
window.CITIES_TRANSPORT = CITIES_TRANSPORT;
