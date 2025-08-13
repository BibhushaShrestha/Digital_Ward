import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service.js';

dotenv.config();

const services = [
  {
    serviceId: 'BIRTH-CERT',
    title: 'Birth Certificate',
    nepaliTitle: 'जन्म प्रमाणपत्र',
    description: 'Official birth registration and certificate issuance',
    category: 'certificates',
    fee: { amount: 25, currency: 'NPR', displayText: 'Rs.' },
    processingTime: { minDays: 3, maxDays: 5, displayText: '3-5 days' },
    requiredDocuments: [
      { name: "Parents' citizenship", isRequired: true, fileTypes: ['pdf','jpg','png'] },
      { name: 'Hospital record', isRequired: true, fileTypes: ['pdf','jpg','png'] },
      { name: 'Application form', isRequired: true, fileTypes: ['pdf'] }
    ],
    icon: 'Baby',
    color: 'bg-blue-500',
    priority: 10,
  },
  {
    serviceId: 'DEATH-CERT',
    title: 'Death Certificate',
    nepaliTitle: 'मृत्यु प्रमाणपत्र',
    description: 'Official death registration and certificate',
    category: 'certificates',
    fee: { amount: 25, currency: 'NPR', displayText: 'Rs.' },
    processingTime: { minDays: 2, maxDays: 3, displayText: '2-3 days' },
    requiredDocuments: [
      { name: 'Medical certificate', isRequired: true, fileTypes: ['pdf'] },
      { name: 'Family citizenship', isRequired: true, fileTypes: ['pdf','jpg','png'] },
      { name: 'Application form', isRequired: true, fileTypes: ['pdf'] }
    ],
    icon: 'Heart',
    color: 'bg-red-500',
    priority: 9,
  },
  {
    serviceId: 'MARRIAGE-CERT',
    title: 'Marriage Certificate',
    nepaliTitle: 'विवाह दर्ता प्रमाणपत्र',
    description: 'Marriage registration and certificate',
    category: 'certificates',
    fee: { amount: 50, currency: 'NPR', displayText: 'Rs.' },
    processingTime: { minDays: 5, maxDays: 7, displayText: '5-7 days' },
    requiredDocuments: [
      { name: "Both parties' citizenship", isRequired: true },
      { name: 'Witness signatures', isRequired: true },
      { name: 'Application form', isRequired: true }
    ],
    icon: 'Heart',
    color: 'bg-pink-500',
    priority: 8,
  },
];

async function seed() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ward-connect-nepal');
    console.log('Connected to MongoDB');

    // Upsert services
    for (const svc of services) {
      const updated = await Service.findOneAndUpdate(
        { serviceId: svc.serviceId },
        { $set: svc },
        { upsert: true, new: true }
      );
      console.log(`Upserted service: ${updated.title}`);
    }

    await conn.disconnect();
    console.log('Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
