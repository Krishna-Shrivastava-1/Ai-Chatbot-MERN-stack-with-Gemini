import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'
import database from './libs/mongoDb.js'
import UserRoutes from './Routes/UserRoutes.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cookieParser())
app.use(bodyParser.json())
app.use(cors({
    origin: ['http://localhost:5173','https://askifyy.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allow Content-Type and Authorization headers
    credentials: true  // Optionally allow credentials (cookies, etc.)
}));
app.use(express.json())
// Database Connected
database()
app.use('/auth',UserRoutes)

app.listen(port, () => {
    console.log('Server is Listening on port ', port)

})