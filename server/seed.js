const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Property = require('./models/Property');

const connectDB = require('./config/db');

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Property.deleteMany({});

        // Create demo user
        const user = await User.create({
            firstName: 'Demo',
            lastName: 'User',
            username: 'demo',
            email: 'demo@estateiq.com',
            phone: '+91 98765 43210',
            password: 'demo123',
            role: 'user'
        });

        console.log('Demo user created: username=demo, password=demo123');

        // Create admin user
        await User.create({
            firstName: 'Admin',
            lastName: 'EstateIQ',
            username: 'admin',
            email: 'admin@estateiq.com',
            phone: '+91 99999 00000',
            password: 'Admin@123',
            role: 'admin'
        });

        console.log('Admin user created: username=admin, password=Admin@123');

        // Create demo properties (India)
        const properties = await Property.insertMany([
            {
                title: 'Luxury Sea-Facing Apartment',
                description: 'Stunning 3 BHK sea-facing apartment in Bandra West with panoramic Arabian Sea views, modular kitchen, Italian marble flooring, and private balcony. Located in a premium gated society with pool, gym, and 24/7 security.',
                type: 'buy',
                price: 45000000,
                location: { address: 'Bandstand Road, Bandra West', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050' },
                propertyType: 'apartment',
                bedrooms: 3,
                bathrooms: 3,
                area: 1800,
                amenities: ['Swimming Pool', 'Gym', 'Club House', 'Parking', 'Sea View', 'Balcony', '24/7 Security'],
                owner: user._id,
                status: 'active',
                featured: true
            },
            {
                title: 'Modern Studio in Cyber City',
                description: 'Fully furnished studio apartment in DLF Cyber City, ideal for young professionals. Features modular kitchen, high-speed internet, power backup, and access to shared co-working lounge.',
                type: 'rent',
                price: 35000,
                location: { address: 'DLF Phase 3, Sector 24', city: 'Gurugram', state: 'Haryana', zipCode: '122002' },
                propertyType: 'apartment',
                bedrooms: 1,
                bathrooms: 1,
                area: 650,
                amenities: ['Furnished', 'Power Backup', 'Wi-Fi', 'Co-working Lounge', 'Metro Nearby'],
                owner: user._id,
                status: 'active',
                featured: true
            },
            {
                title: 'Spacious Family Villa in Whitefield',
                description: 'Beautiful 4 BHK independent villa in a gated community near ITPL. Features landscaped garden, car porch for 2 cars, servant quarters, and Italian marble interiors. Close to top schools and hospitals.',
                type: 'buy',
                price: 32000000,
                location: { address: 'Palm Meadows, Whitefield', city: 'Bengaluru', state: 'Karnataka', zipCode: '560066' },
                propertyType: 'villa',
                bedrooms: 4,
                bathrooms: 4,
                area: 3500,
                amenities: ['Garden', 'Car Porch', 'Servant Quarters', 'Club House', 'Children Play Area', 'CCTV'],
                owner: user._id,
                status: 'active',
                featured: false
            },
            {
                title: 'Heritage Haveli in Old City',
                description: 'Restored heritage haveli in the old city with traditional Rajasthani architecture, courtyard, rooftop terrace with fort views, and 3 spacious bedrooms. Perfect for homestay or boutique hotel conversion.',
                type: 'buy',
                price: 18000000,
                location: { address: 'Chandpole, Old City', city: 'Jaipur', state: 'Rajasthan', zipCode: '302001' },
                propertyType: 'house',
                bedrooms: 3,
                bathrooms: 2,
                area: 2400,
                amenities: ['Courtyard', 'Rooftop Terrace', 'Fort View', 'Traditional Architecture', 'Parking'],
                owner: user._id,
                status: 'active',
                featured: true
            },
            {
                title: 'Cozy 1 BHK near IIT Campus',
                description: 'Well-maintained 1 BHK apartment near IIT Madras, ideal for students or working professionals. Includes semi-furnished rooms, balcony, and covered parking. Close to Adyar and Velachery.',
                type: 'rent',
                price: 18000,
                location: { address: 'Sardar Patel Road, Adyar', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600020' },
                propertyType: 'apartment',
                bedrooms: 1,
                bathrooms: 1,
                area: 550,
                amenities: ['Semi-Furnished', 'Balcony', 'Parking', 'Near Campus', 'Power Backup'],
                owner: user._id,
                status: 'active',
                featured: false
            },
            {
                title: 'Premium Office Space in Baner',
                description: 'Plug-and-play office space in a Grade A commercial building with reception, 6 cabins, conference room, pantry, and server room. Ideal for IT companies, startups, or consultancies.',
                type: 'rent',
                price: 120000,
                location: { address: 'Baner Road, IT Park', city: 'Pune', state: 'Maharashtra', zipCode: '411045' },
                propertyType: 'office',
                bedrooms: 0,
                bathrooms: 3,
                area: 3200,
                amenities: ['Reception', 'Conference Room', 'Parking', 'Lift', 'Security', 'Power Backup', 'Cafeteria'],
                owner: user._id,
                status: 'active',
                featured: false
            },
            {
                title: 'Duplex Penthouse in Salt Lake',
                description: 'Ultra-luxury duplex penthouse in Salt Lake Sector V with private terrace garden, imported fittings, home automation system, jacuzzi, and panoramic city views. Premium address for elite living.',
                type: 'buy',
                price: 28000000,
                location: { address: 'Sector V, Salt Lake City', city: 'Kolkata', state: 'West Bengal', zipCode: '700091' },
                propertyType: 'apartment',
                bedrooms: 4,
                bathrooms: 5,
                area: 4000,
                amenities: ['Terrace Garden', 'Jacuzzi', 'Home Automation', 'Lift', 'Gym', 'City View'],
                owner: user._id,
                status: 'active',
                featured: true
            },
            {
                title: 'Hill View Cottage in Manali',
                description: 'Charming 2-bedroom wooden cottage with valley views, fireplace, sit-out area, and apple orchard access. Perfect weekend getaway or Airbnb investment in the heart of Himachal.',
                type: 'buy',
                price: 8500000,
                location: { address: 'Old Manali Road', city: 'Manali', state: 'Himachal Pradesh', zipCode: '175131' },
                propertyType: 'house',
                bedrooms: 2,
                bathrooms: 1,
                area: 1200,
                amenities: ['Fireplace', 'Valley View', 'Orchard', 'Sit-out', 'Parking'],
                owner: user._id,
                status: 'active',
                featured: false
            },
            {
                title: 'Luxury 3 BHK in Gomti Nagar',
                description: 'Elegant 3 BHK flat in a high-rise tower with Gomti river views, vitrified flooring, modular kitchen, covered parking, and world-class amenities including infinity pool and sky lounge.',
                type: 'rent',
                price: 45000,
                location: { address: 'Gomti Nagar Extension', city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226010' },
                propertyType: 'apartment',
                bedrooms: 3,
                bathrooms: 2,
                area: 1650,
                amenities: ['Infinity Pool', 'Sky Lounge', 'Gym', 'River View', 'Covered Parking', 'Power Backup'],
                owner: user._id,
                status: 'active',
                featured: true
            },
            {
                title: 'Residential Plot in Gandhinagar',
                description: 'Prime 2400 sq ft residential plot in GIFT City vicinity with all utilities, paved roads, and NA permission. Approved for G+2 construction. Excellent investment opportunity near upcoming metro corridor.',
                type: 'buy',
                price: 4800000,
                location: { address: 'Sector 20, Near GIFT City', city: 'Gandhinagar', state: 'Gujarat', zipCode: '382020' },
                propertyType: 'land',
                bedrooms: 0,
                bathrooms: 0,
                area: 2400,
                amenities: ['NA Permission', 'Paved Road', 'Utilities Available', 'Near Metro'],
                owner: user._id,
                status: 'active',
                featured: false
            }
        ]);

        console.log(`${properties.length} demo properties created`);
        console.log('\nSeed complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedData();
