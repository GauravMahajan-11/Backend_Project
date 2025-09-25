//database is always in another continent (i.e far away from us) so it takes time to connect to database
//so we use async await to connect to database and wrap it in try catch block to handle error if any

import dotenv from "dotenv"
import connectDB from "./db/index.js"; 

dotenv.config({
    path : `./env`
})

connectDB()

















/*  second way of connecting DB

import express from "express";
const app = express();

( async () => {

    try{

        await mongoose.connect(`${process.env.DATABSE_URI}/${DB_NAME}`)  
        app.on("error", (err) => {
            console.error(" ERROR :",err)
            throw err
        })

         app.listen(process.env.PORT, () => {
         console.log(`Server is running on port ${process.env.PORT}`);
      })

  }catch(error){
    console.error(" ERROR :",error)
    throw err
    }
})()  
*/
