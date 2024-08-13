const { mongoose } = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.error(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! SHUTTING DOWN');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT || 8080;
const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB).then(() => {
  console.log('connected to database');
});

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.error(err.name, err.message);
  console.log('UNHANDLED REJECTION! SHUTTING DOWN');
  server.close(() => {
    process.exit(1);
  });
});
