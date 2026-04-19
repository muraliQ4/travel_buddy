// Mock API Data for Development
// This file contains fake data to build the UI before integrating real APIs

export const mockPlaces = [
  {
    id: 'goa-1',
    name: 'Goa',
    formatted: 'Goa, India',
    lat: 15.2993,
    lon: 74.1240,
    type: 'state',
    country: 'India'
  },
  {
    id: 'manali-1',
    name: 'Manali',
    formatted: 'Manali, Himachal Pradesh, India',
    lat: 32.2396,
    lon: 77.1887,
    type: 'city',
    country: 'India'
  },
  {
    id: 'mumbai-1',
    name: 'Mumbai',
    formatted: 'Mumbai, Maharashtra, India',
    lat: 19.0760,
    lon: 72.8777,
    type: 'city',
    country: 'India'
  },
  {
    id: 'delhi-1',
    name: 'Delhi',
    formatted: 'Delhi, India',
    lat: 28.7041,
    lon: 77.1025,
    type: 'city',
    country: 'India'
  },
  {
    id: 'jaipur-1',
    name: 'Jaipur',
    formatted: 'Jaipur, Rajasthan, India',
    lat: 26.9124,
    lon: 75.7873,
    type: 'city',
    country: 'India'
  },
  {
    id: 'bangalore-1',
    name: 'Bangalore',
    formatted: 'Bangalore, Karnataka, India',
    lat: 12.9716,
    lon: 77.5946,
    type: 'city',
    country: 'India'
  },
  {
    id: 'kerala-1',
    name: 'Kerala',
    formatted: 'Kerala, India',
    lat: 10.8505,
    lon: 76.2711,
    type: 'state',
    country: 'India'
  },
  {
    id: 'udaipur-1',
    name: 'Udaipur',
    formatted: 'Udaipur, Rajasthan, India',
    lat: 24.5854,
    lon: 73.7125,
    type: 'city',
    country: 'India'
  }
];

export const mockWeather = {
  'goa-1': {
    temp: 28,
    feels_like: 31,
    description: 'Clear sky',
    humidity: 75,
    wind_speed: 12,
    icon: '01d'
  },
  'manali-1': {
    temp: 15,
    feels_like: 13,
    description: 'Light snow',
    humidity: 60,
    wind_speed: 8,
    icon: '13d'
  },
  'mumbai-1': {
    temp: 30,
    feels_like: 33,
    description: 'Partly cloudy',
    humidity: 70,
    wind_speed: 15,
    icon: '02d'
  },
  'delhi-1': {
    temp: 25,
    feels_like: 26,
    description: 'Haze',
    humidity: 55,
    wind_speed: 10,
    icon: '50d'
  },
  'jaipur-1': {
    temp: 27,
    feels_like: 28,
    description: 'Clear sky',
    humidity: 45,
    wind_speed: 14,
    icon: '01d'
  },
  'bangalore-1': {
    temp: 22,
    feels_like: 21,
    description: 'Light rain',
    humidity: 80,
    wind_speed: 7,
    icon: '10d'
  },
  'kerala-1': {
    temp: 26,
    feels_like: 29,
    description: 'Scattered clouds',
    humidity: 85,
    wind_speed: 9,
    icon: '03d'
  },
  'udaipur-1': {
    temp: 24,
    feels_like: 25,
    description: 'Clear sky',
    humidity: 50,
    wind_speed: 11,
    icon: '01d'
  }
};

export const mockTransport = {
  'goa-1': {
    trains: [
      { 
        id: 'T1', 
        name: 'Konkan Kanya Express', 
        from: 'Mumbai CST', 
        to: 'Madgaon', 
        departure: '22:15', 
        arrival: '08:30', 
        duration: '10h 15m',
        price: '₹650',
        class: '3AC'
      },
      { 
        id: 'T2', 
        name: 'Jan Shatabdi', 
        from: 'Delhi', 
        to: 'Vasco da Gama', 
        departure: '06:00', 
        arrival: '05:30', 
        duration: '23h 30m',
        price: '₹1,200',
        class: '2AC'
      }
    ],
    flights: [
      { 
        id: 'F1', 
        airline: 'IndiGo', 
        from: 'Mumbai', 
        to: 'Goa', 
        departure: '14:30', 
        arrival: '16:00', 
        duration: '1h 30m',
        price: '₹3,500',
        bookingUrl: 'https://www.skyscanner.co.in/transport/flights/bom/goi/'
      },
      { 
        id: 'F2', 
        airline: 'Air India', 
        from: 'Delhi', 
        to: 'Goa', 
        departure: '09:15', 
        arrival: '11:45', 
        duration: '2h 30m',
        price: '₹5,200',
        bookingUrl: 'https://www.skyscanner.co.in/transport/flights/del/goi/'
      }
    ],
    buses: [
      { 
        id: 'B1', 
        operator: 'VRL Travels', 
        from: 'Bangalore', 
        to: 'Goa', 
        departure: '20:00', 
        arrival: '08:00', 
        duration: '12h',
        price: '₹950',
        type: 'Sleeper AC',
        bookingUrl: 'https://www.redbus.in/bus-tickets/bangalore-to-goa'
      },
      { 
        id: 'B2', 
        operator: 'Paulo Travels', 
        from: 'Mumbai', 
        to: 'Goa', 
        departure: '17:30', 
        arrival: '05:30', 
        duration: '12h',
        price: '₹800',
        type: 'Semi-Sleeper',
        bookingUrl: 'https://www.redbus.in/bus-tickets/mumbai-to-goa'
      }
    ]
  },
  'manali-1': {
    trains: [
      { 
        id: 'T3', 
        name: 'Himalayan Queen', 
        from: 'Kalka', 
        to: 'Shimla', 
        departure: '05:30', 
        arrival: '11:00', 
        duration: '5h 30m',
        price: '₹320',
        class: 'Chair Car',
        note: 'Then bus to Manali (8h)'
      }
    ],
    flights: [
      { 
        id: 'F3', 
        airline: 'Alliance Air', 
        from: 'Delhi', 
        to: 'Bhuntar (Kullu)', 
        departure: '07:00', 
        arrival: '08:15', 
        duration: '1h 15m',
        price: '₹4,500',
        note: 'Then taxi to Manali (50km)',
        bookingUrl: 'https://www.skyscanner.co.in/transport/flights/del/kuu/'
      }
    ],
    buses: [
      { 
        id: 'B3', 
        operator: 'HRTC Volvo', 
        from: 'Delhi', 
        to: 'Manali', 
        departure: '18:00', 
        arrival: '08:00', 
        duration: '14h',
        price: '₹1,200',
        type: 'AC Volvo',
        bookingUrl: 'https://www.redbus.in/bus-tickets/delhi-to-manali'
      },
      { 
        id: 'B4', 
        operator: 'Raj Travels', 
        from: 'Chandigarh', 
        to: 'Manali', 
        departure: '21:00', 
        arrival: '06:00', 
        duration: '9h',
        price: '₹800',
        type: 'Semi-Sleeper',
        bookingUrl: 'https://www.redbus.in/bus-tickets/chandigarh-to-manali'
      }
    ]
  },
  'mumbai-1': {
    trains: [
      { 
        id: 'T4', 
        name: 'Rajdhani Express', 
        from: 'Delhi', 
        to: 'Mumbai Central', 
        departure: '16:55', 
        arrival: '08:35', 
        duration: '15h 40m',
        price: '₹2,500',
        class: '3AC'
      }
    ],
    flights: [
      { 
        id: 'F4', 
        airline: 'Vistara', 
        from: 'Bangalore', 
        to: 'Mumbai', 
        departure: '12:00', 
        arrival: '13:45', 
        duration: '1h 45m',
        price: '₹4,200',
        bookingUrl: 'https://www.skyscanner.co.in/transport/flights/blr/bom/'
      }
    ],
    buses: [
      { 
        id: 'B5', 
        operator: 'Neeta Travels', 
        from: 'Pune', 
        to: 'Mumbai', 
        departure: '22:30', 
        arrival: '04:30', 
        duration: '6h',
        price: '₹450',
        type: 'AC Sleeper',
        bookingUrl: 'https://www.redbus.in/bus-tickets/pune-to-mumbai'
      }
    ]
  }
};

export const mockRentals = {
  'goa-1': [
    {
      id: 'R1',
      type: 'Bike',
      name: 'Royal Enfield Classic 350',
      pricePerDay: '₹800',
      available: true,
      bookingUrl: 'https://www.google.com/search?q=bike+rental+goa',
      features: ['Helmet included', 'Unlimited km', '24/7 support']
    },
    {
      id: 'R2',
      type: 'Scooter',
      name: 'Honda Activa',
      pricePerDay: '₹400',
      available: true,
      bookingUrl: 'https://www.google.com/search?q=scooter+rental+goa',
      features: ['Helmet included', 'Fuel efficient']
    },
    {
      id: 'R3',
      type: 'Car',
      name: 'Maruti Swift',
      pricePerDay: '₹1,500',
      available: true,
      bookingUrl: 'https://www.zoomcar.com/goa',
      features: ['Self-drive', 'Insurance included', 'AC']
    }
  ],
  'manali-1': [
    {
      id: 'R4',
      type: 'Bike',
      name: 'Royal Enfield Himalayan',
      pricePerDay: '₹1,200',
      available: true,
      bookingUrl: 'https://www.google.com/search?q=bike+rental+manali',
      features: ['Off-road capable', 'Helmet & gloves', 'Mountain ready']
    },
    {
      id: 'R5',
      type: 'Car',
      name: 'Mahindra Thar',
      pricePerDay: '₹3,500',
      available: true,
      bookingUrl: 'https://www.zoomcar.com/manali',
      features: ['4WD', 'Perfect for snow', 'Driver available']
    }
  ],
  'mumbai-1': [
    {
      id: 'R6',
      type: 'Car',
      name: 'Honda City',
      pricePerDay: '₹2,000',
      available: true,
      bookingUrl: 'https://www.zoomcar.com/mumbai',
      features: ['Self-drive', 'GPS', 'Fuel efficient']
    },
    {
      id: 'R7',
      type: 'Bike',
      name: 'Bajaj Pulsar',
      pricePerDay: '₹500',
      available: true,
      bookingUrl: 'https://www.google.com/search?q=bike+rental+mumbai',
      features: ['City commute', 'Helmet included']
    }
  ]
};

// Helper function to get data for a place by ID
export const getPlaceById = (placeId) => {
  return mockPlaces.find(p => p.id === placeId);
};

export const getWeatherForPlace = (placeId) => {
  return mockWeather[placeId] || {
    temp: 25,
    feels_like: 26,
    description: 'Pleasant weather',
    humidity: 60,
    wind_speed: 10,
    icon: '01d'
  };
};

export const getTransportForPlace = (placeId) => {
  return mockTransport[placeId] || {
    trains: [],
    flights: [],
    buses: []
  };
};

export const getRentalsForPlace = (placeId) => {
  return mockRentals[placeId] || [];
};
