// In-memory server fallback data when Java Spring Boot is offline or booting up

export interface FallbackUser {
    id: string | number;
    username: string;
    password?: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    role: string;
}

export interface FallbackRoom {
    id: string | number;
    roomNumber: string;
    name: string;
    type: string;
    pricePerNight: number;
    capacity: number;
    status: string;
    description: string;
    amenities: string;
    imageUrl: string;
}

export interface FallbackBooking {
    id: string | number;
    bookingReference: string;
    userId: string | number;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    roomId: string | number;
    roomNumber: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    guestsCount: number;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    specialRequests?: string;
    createdAt?: string;
    kyc?: {
      verified: boolean;
      documentType?: string;
      documentNumber?: string;
      verifiedAt?: string;
      notes?: string;
    };
}

export interface FallbackStaff {
    id: string | number;
    name: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    shift: string;
    salary: number;
    status: string;
}

export interface FallbackService {
    id: string | number;
    userId?: string | number;
    guestName: string;
    roomNumber: string;
    serviceType: string;
    description: string;
    priority: string;
    status: string;
    assignedStaff?: string;
}

export interface FallbackCheckIn {
    id: string | number;
    bookingId?: string | number;
    roomId?: string | number;
    guestName?: string;
    checkInTime?: string;
    checkOutTime?: string;
    [key: string]: unknown;
}

export const fallbackData = {
    users: [
        { id: '1', username: 'admin', password: '123', name: 'Administrator', email: 'admin@luxestay.com', phone: '+1 555-0100', role: 'admin' },
        { id: '2', username: 'staff', password: '123', name: 'Front Desk Staff', email: 'staff@luxestay.com', phone: '+1 555-0101', role: 'receptionist' },
        { id: '3', username: 'guest', password: '123', name: 'Alex Morgan', email: 'guest@luxestay.com', phone: '+1 555-0199', role: 'guest' }
    ] as FallbackUser[],
    rooms: [
        {
            id: '1',
            roomNumber: '101',
            name: 'Deluxe Ocean Suite',
            type: 'Deluxe Suite',
            pricePerNight: 250.00,
            capacity: 2,
            status: 'available',
            description: 'Stunning ocean view with king-size bed and marble bath.',
            amenities: 'WiFi, Ocean View, King Bed, Mini Bar, Smart TV, AC',
            imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800'
        },
        {
            id: '2',
            roomNumber: '102',
            name: 'Executive King Room',
            type: 'Executive',
            pricePerNight: 180.00,
            capacity: 2,
            status: 'available',
            description: 'Spacious executive room ideal for business travelers with dedicated workspace.',
            amenities: 'WiFi, Workspace, King Bed, City View, Coffee Maker',
            imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800'
        },
        {
            id: '3',
            roomNumber: '103',
            name: 'Presidential Penthouse',
            type: 'Penthouse',
            pricePerNight: 500.00,
            capacity: 4,
            status: 'available',
            description: 'Top-floor luxury penthouse with panoramic city views and private jacuzzi.',
            amenities: 'WiFi, Jacuzzi, Private Terrace, 2 King Beds, Butler Service',
            imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800'
        },
        {
            id: '4',
            roomNumber: '201',
            name: 'Standard Double Room',
            type: 'Standard',
            pricePerNight: 120.00,
            capacity: 2,
            status: 'available',
            description: 'Comfortable and cozy double room with all modern essentials.',
            amenities: 'WiFi, Queen Bed, AC, En-suite Bathroom',
            imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800'
        },
        {
            id: '5',
            roomNumber: '202',
            name: 'Family Garden Suite',
            type: 'Family Suite',
            pricePerNight: 290.00,
            capacity: 4,
            status: 'available',
            description: 'Spacious suite overlooking lush gardens, perfect for families.',
            amenities: 'WiFi, Garden View, 2 Queen Beds, Kitchenette, Bathtub',
            imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=800'
        }
    ] as FallbackRoom[],
    bookings: [
        {
            id: '1',
            bookingReference: 'BK-1001',
            userId: '3',
            guestName: 'Alex Morgan',
            guestEmail: 'alex@example.com',
            guestPhone: '+1 555-0199',
            roomId: '1',
            roomNumber: '101',
            roomType: 'Deluxe Suite',
            checkInDate: new Date().toISOString().split('T')[0],
            checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            nights: 3,
            guestsCount: 2,
            totalAmount: 750.00,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            specialRequests: 'Late check-in around 8 PM, extra towels requested.'
        }
    ] as FallbackBooking[],
    staff: [
        { id: '1', name: 'Elena Rostova', email: 'elena@luxestay.com', phone: '+1 555-0201', role: 'Front Desk Lead', department: 'Reception', shift: 'Morning', salary: 4200.00, status: 'Active' },
        { id: '2', name: 'Marcus Vance', email: 'marcus@luxestay.com', phone: '+1 555-0202', role: 'Executive Chef', department: 'Kitchen', shift: 'Evening', salary: 5500.00, status: 'Active' },
        { id: '3', name: 'Sarah Jenkins', email: 'sarah@luxestay.com', phone: '+1 555-0203', role: 'Head Housekeeper', department: 'Housekeeping', shift: 'Morning', salary: 3800.00, status: 'Active' },
        { id: '4', name: 'David Chen', email: 'david@luxestay.com', phone: '+1 555-0204', role: 'Maintenance Tech', department: 'Maintenance', shift: 'Night', salary: 3900.00, status: 'Active' }
    ] as FallbackStaff[],
    services: [
        { id: '1', userId: '3', guestName: 'Alex Morgan', roomNumber: '101', serviceType: 'Housekeeping', description: 'Fresh towels and extra pillows requested.', priority: 'MEDIUM', status: 'PENDING', assignedStaff: 'Sarah Jenkins' }
    ] as FallbackService[],
    checkins: [] as FallbackCheckIn[]
};
