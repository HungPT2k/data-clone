const fs = require('fs').promises;
const path = require('path');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const mongoUri = 'mongodb://hung:123@localhost:27017/?authMechanism=DEFAULT';
const dbName = 'metaserv-clone';

const folderPath = './DB/backup';

const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

async function importCollectionsFromFolder(folderPath) {
  try {
    await client.connect();
    const db = client.db(dbName);

    const files = await fs.readdir(folderPath); 

    for (const file of files) {
   
      if (path.extname(file) === '.json') {
      
        const collectionName = file.split('.')[1];
   
        const data = await fs.readFile(path.join(folderPath, file));
   
      const jsonData = JSON.parse(data.toString());
      const deepConvertToMongoTypes = (obj) => {
        if (typeof obj === 'object' && obj !== null) {
          for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
              if (obj[key].$oid) {
                obj[key] = new ObjectId(obj[key].$oid);
              } else if (obj[key].$date) {
                obj[key] = new Date(obj[key].$date);
              } else {
                deepConvertToMongoTypes(obj[key]);
              }
            }
          }
        }
        return obj;
      };
      
      const documents = jsonData.map(doc => {
        return deepConvertToMongoTypes(doc);
      });
      
      
        const result = await db.collection(collectionName).insertMany(documents);
        console.log(`Inserted ${result.insertedCount} documents into collection ${collectionName}`);
      }
    }
  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    await client.close();
  }
}
importCollectionsFromFolder(folderPath).catch(console.error);
