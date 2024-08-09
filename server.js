const { mongoose } = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');



const port = process.env.PORT || 8080;
const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB).then(() => {
  console.log('connected to database');
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
