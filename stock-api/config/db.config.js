const mongoose = require('mongoose');
const logger = require('../logger/api.logger');

const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME,
  } = process.env;


const MONGO_CONNECTION_STRING = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`
const connect = () => {

    const url = MONGO_CONNECTION_STRING;
    logger.info("MONGO_CONNECTION_STRING :::" + MONGO_CONNECTION_STRING);

    mongoose.connect(url, {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })

    mongoose.connection.once("open", async () => {
        logger.info("Connected to database");
    });
      
    mongoose.connection.on("error", (err) => {
        logger.error("Error connecting to database  ", err);
    });
}

const disconnect = () => {
    
    if (!mongoose.connection) {
      return;
    }
    
    mongoose.disconnect();

    mongoose.once("close", async () => {
        console.log("Diconnected  to database");
    });

};

module.exports = {
    connect,
    disconnect
}