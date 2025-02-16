import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MONGO_URI = 'mongodb+srv://taoruih:1rlK0gNG4aQUluil@cluster0.mdwu0.mongodb.net/cluster0?retryWrites=true&w=majority&appName=Cluster0';

async function exportData() {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get list of all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Fetch data from each collection
    const data = {};
    
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Fetching data from collection: ${collectionName}`);
      
      try {
        // Create a dynamic model for each collection
        const Model = mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
        
        // Fetch documents from the collection with a limit of 200
        const documents = await Model.find({}).limit(3).lean();
        data[collectionName] = documents;
        
        console.log(`Found ${documents.length} documents in ${collectionName}`);
        
        // Clean up the model to prevent OverwriteModelError
        delete mongoose.models[collectionName];
      } catch (error) {
        console.error(`Error fetching data from ${collectionName}:`, error.message);
      }
    }

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../../../exports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write to JSON file
    const outputPath = path.join(outputDir, 'mongodb_export.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`Data exported successfully to ${outputPath}`);
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

exportData();