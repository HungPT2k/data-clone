/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const ObjectId = require('mongodb').ObjectId;
const dbName = 'telecom';
const client = new MongoClient('mongodb://root:wFvErzaaTcJD@localhost:27017', {
  minPoolSize: 10,
  maxPoolSize: 10,
});

(async () => {
  const connect = await client.connect();
  const files = fs.readdirSync('DB/backup1');
  await connect.db(dbName).dropDatabase({ dbName });

  for (const file of files) {
    if (file.includes('.json')) {
      fs.readFileSync(`DB/backup1/${file}`);
      const docs = JSON.parse(fs.readFileSync(`DB/backup1/${file}`).toString());
      const deepConvertToMongoTypes = (obj) => {
        // Hàm đệ quy để chuyển đổi tất cả các giá trị có định dạng $oid và $date
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
      
      const documents = docs.map(doc => {
        return deepConvertToMongoTypes(doc);
      });
      if (docs.length > 0) {
        await connect.db(dbName).collection(file.split('.')[1]).insertMany(documents);
      }
    }
  }
  console.log('Done Import');
  process.exit(0);
})();

