const { mongoose } = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tourModel');

dotenv.config({ path: '../../config.env' });

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB).then(() => {
  console.log('connected to database');
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('imported');   
    }
    catch (error) {
        console.log(error);
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('deleted');   
    }
    catch (error) {
        console.log(error);
    }
    process.exit();
};

if (process.argv[2] === '--import'){
    importData()
}
else if (process.argv[2] === '--delete'){
    deleteData()
}