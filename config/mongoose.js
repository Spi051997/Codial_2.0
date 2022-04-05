
const mongoose=require('mongoose');
const mongoAtlasUri =
  "mongodb+srv://admin:admin@cluster0.efyft.mongodb.net/Codialdemo?retryWrites=true&w=majority";

  console.log(mongoAtlasUri);

try {
  // Connect to the MongoDB cluster
  mongoose.connect(
    mongoAtlasUri,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log(" Mongoose is connected"),
  );
} catch (e) {
  console.log("could not connect");
}

const dbConnection = mongoose.connection;
dbConnection.on("error", (err) => console.log(`Connection error ${err}`));
dbConnection.once("open", () => console.log("Connected to DB!"));