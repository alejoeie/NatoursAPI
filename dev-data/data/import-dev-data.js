const fs = require('fs');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const Tour = require('../../models/tourModel');



const DB = process.env.DATABASE;
mongoose.connect(DB, {
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  useUnifiedTopology:true
}).then(() => {console.log('DB connection successful');
});

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// Import data into database
const importData = async () => {
    try{
        await Tour.create(tours);
        console.log('Data successfully loaded');
    }catch (err){
        console.log(err);
    }
    process.exit();
};

// DELETE ALL DATA FROM COLLECTION 
const deleteData = async () => {
    try{
        await Tour.deleteMany();
        console.log('Data successfully deleted');
    }
    catch (err){
        console.log(err)
        process.exit();
    }
}
if(process.argv[2] === "--import"){
    importData();
} else if(process.argv[2] === "--delete"){
    deleteData();
}
