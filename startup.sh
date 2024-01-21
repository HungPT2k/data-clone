mongod --logpath /var/log/mongod.log &
echo "Waiting for MongoDB to start..."
while ! mongo --host 127.0.0.1 --port 27017 --eval "db.stats()" --quiet; do
    sleep 1
done


echo "Running Node.js script..."
node main.js
