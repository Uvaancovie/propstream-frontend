// Seed properties data for demonstration
const seedProperties = [
  {
    id: 1,
    name: "Luxury Beachfront Villa",
    address: "123 Ocean Drive",
    city: "Cape Town",
    description: "Beautiful oceanfront villa with stunning views and modern amenities. Perfect for a relaxing getaway.",
    pricePerNight: 2500,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ["WiFi", "Swimming Pool", "Ocean View", "Kitchen", "Parking"],
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
    user_id: 1,
    realtor_name: "John Smith",
    realtor_email: "realtor@test.com",
    realtor_phone: "+27 11 123 4567",
    property_type: "villa",
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Modern City Apartment",
    address: "456 Main Street",
    city: "Johannesburg",
    description: "Stylish apartment in the heart of the city with all modern conveniences.",
    pricePerNight: 1200,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["WiFi", "Gym", "Concierge", "Kitchen", "Air Conditioning"],
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
    user_id: 1,
    realtor_name: "John Smith",
    realtor_email: "realtor@test.com",
    realtor_phone: "+27 11 123 4567",
    property_type: "apartment",
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Cozy Mountain Cabin",
    address: "789 Mountain View",
    city: "Stellenbosch",
    description: "Peaceful cabin surrounded by mountains, perfect for nature lovers.",
    pricePerNight: 800,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["WiFi", "Fireplace", "Mountain View", "Kitchen", "Hiking Trails"],
    images: ["https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
    user_id: 2,
    realtor_name: "Sarah Johnson",
    realtor_email: "sarah@properties.com",
    realtor_phone: "+27 21 987 6543",
    property_type: "cabin",
    is_available: true,
    created_at: new Date().toISOString()
  }
];

// Seed bookings data for demonstration
const seedBookings = [
  {
    id: 1,
    propertyId: 1,
    propertyName: "Luxury Beachfront Villa",
    propertyLocation: "Cape Town",
    checkIn: "2025-09-15",
    checkOut: "2025-09-20",
    guests: 4,
    guestName: "Mike Client",
    guestEmail: "client@test.com",
    guestPhone: "+27 82 123 4567",
    totalAmount: 12500,
    status: "confirmed",
    createdAt: "2025-08-20T10:00:00Z",
    realtorEmail: "realtor@test.com",
    realtorName: "John Smith"
  },
  {
    id: 2,
    propertyId: 2,
    propertyName: "Modern City Apartment",
    propertyLocation: "Johannesburg",
    checkIn: "2025-09-10",
    checkOut: "2025-09-12",
    guests: 2,
    guestName: "Alice Walker",
    guestEmail: "alice@email.com",
    guestPhone: "+27 83 765 4321",
    totalAmount: 2400,
    status: "pending",
    createdAt: "2025-08-25T14:30:00Z",
    realtorEmail: "realtor@test.com",
    realtorName: "John Smith"
  }
];

// Function to seed data to localStorage
export const seedDemoData = () => {
  // Only seed if data doesn't exist
  const existingProperties = localStorage.getItem('propstream_properties');
  const existingBookings = localStorage.getItem('propstream_bookings');

  if (!existingProperties) {
    localStorage.setItem('propstream_properties', JSON.stringify(seedProperties));
    console.log('🌱 Seeded demo properties to localStorage');
  }

  if (!existingBookings) {
    localStorage.setItem('propstream_bookings', JSON.stringify(seedBookings));
    console.log('🌱 Seeded demo bookings to localStorage');
  }
};

// Function to get properties from localStorage
export const getPropertiesFromStorage = () => {
  const properties = localStorage.getItem('propstream_properties');
  return properties ? JSON.parse(properties) : [];
};

// Function to get bookings from localStorage
export const getBookingsFromStorage = () => {
  const bookings = localStorage.getItem('propstream_bookings');
  return bookings ? JSON.parse(bookings) : [];
};

// Function to add property to localStorage
export const addPropertyToStorage = (property) => {
  const properties = getPropertiesFromStorage();
  const newProperty = {
    ...property,
    id: Date.now(),
    created_at: new Date().toISOString()
  };
  properties.push(newProperty);
  localStorage.setItem('propstream_properties', JSON.stringify(properties));
  return newProperty;
};

// Function to add booking to localStorage
export const addBookingToStorage = (booking) => {
  const bookings = getBookingsFromStorage();
  const newBooking = {
    ...booking,
    id: Date.now(),
    createdAt: new Date().toISOString()
  };
  bookings.push(newBooking);
  localStorage.setItem('propstream_bookings', JSON.stringify(bookings));
  return newBooking;
};

export { seedProperties, seedBookings };
