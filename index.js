const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketSetup = require("./sockets/chatSocket");
const config = require('config');
const serverless = require('serverless-http');
const indexRouter = require('./routes');
var cookieParser = require('cookie-parser');
const errorHandler = require('errorhandler');
require('dotenv').config();

const app = express();

const server = require('http').Server(app);
socketSetup(server);

const isProduction = process.env.NODE_ENV === 'production';

connectDB();

app.set('view engine', 'ejs');

app.use(cors());
app.use(cookieParser());
app.use(require('morgan')('dev'));

app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

app.use(express.static('public'));

if (!isProduction) {
  app.use(errorHandler());
}

app.use('/', indexRouter);

const PORT = isProduction ? process.env.PRODUCTION_PORT : process.env.STAGING_PORT

module.exports = {
  handler: serverless(app),
  app
};

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});