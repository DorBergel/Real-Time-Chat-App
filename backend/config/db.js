require("dotenv").config();

const mongoose = require("mongoose");
const logger = require("../utils/logger");


exports.connectDB = async () => {

    try {
        const connection = mongoose.connect(process.env.MONGO_URL);

        logger.logInfoMsg("connected successfully to the database");
    }
    catch(err) {
        logger.logErrorMsg(`couldn't connect to the db ${err}`)

        process.exit(1);
    }
};
