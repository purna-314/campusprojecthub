import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initialBatches, initialFaculty, initialProjects } from '../seedData.js';
import { BatchModel } from '../models/Batch.js';
import { FacultyModel } from '../models/Faculty.js';
import { ProjectModel } from '../models/Project.js';

dotenv.config();

export let isMongoConnected = false;

export async function connectMongoDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.log('\x1b[33m%s\x1b[0m', 'ℹ [MongoDB] MONGODB_URI not set in server/.env. Using local persistent storage mode.');
    return false;
  }

  try {
    console.log('🔄 Connecting to MongoDB Cloud (Atlas)...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isMongoConnected = true;
    console.log('\x1b[32m%s\x1b[0m', '✔ Connected to MongoDB Cloud (Atlas) successfully!');

    // Check if initial collections need seeding
    await seedCloudIfEmpty();
    return true;
  } catch (err) {
    isMongoConnected = false;
    console.error('\x1b[31m%s\x1b[0m', '✖ [MongoDB] Failed to connect to MongoDB Cloud: ' + err.message);
    console.log('\x1b[33m%s\x1b[0m', 'ℹ Operating in local storage mode until valid MongoDB credentials are provided.');
    return false;
  }
}

export async function seedCloudIfEmpty() {
  try {
    const batchCount = await BatchModel.countDocuments();
    if (batchCount === 0) {
      console.log('🌱 Seeding Batches to MongoDB Cloud...');
      await BatchModel.insertMany(initialBatches);
    }

    const facultyCount = await FacultyModel.countDocuments();
    if (facultyCount === 0) {
      console.log('🌱 Seeding Faculty mentors to MongoDB Cloud...');
      await FacultyModel.insertMany(initialFaculty);
    }

    const projectCount = await ProjectModel.countDocuments();
    if (projectCount === 0) {
      console.log('🌱 Seeding Projects to MongoDB Cloud...');
      await ProjectModel.insertMany(initialProjects);
    }

    console.log('\x1b[32m%s\x1b[0m', '✔ MongoDB Cloud collections verified and ready.');
  } catch (err) {
    console.error('Error during cloud seeding:', err);
  }
}

export async function resetCloudDb() {
  if (!isMongoConnected) return false;
  await BatchModel.deleteMany({});
  await FacultyModel.deleteMany({});
  await ProjectModel.deleteMany({});
  await BatchModel.insertMany(initialBatches);
  await FacultyModel.insertMany(initialFaculty);
  await ProjectModel.insertMany(initialProjects);
  return true;
}
