import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()
export const database = async () => {
    try {
        await mongoose.connect(process.env.MONGODBURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Databse Connected')
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
    export default database;