/***
 * @author Komal Suthar
 * @description Database Configuration [Refer: https://mongoosejs.com/docs/deprecations.html]
 */
require('dotenv').config()

const mongoose = require('mongoose');
const config = require('config');
// const db = process.env.NODE_ENV === 'production' ? config.get('dbConfig.production_mongoURI') : config.get('dbConfig.staging_mongoURI')
const db = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(db)
        console.log("DB connected successfully")
    } catch (exception) {
        console.error('Error in DB Connection ', exception.message);
        process.exit(1);
    }
}

module.exports = connectDB;