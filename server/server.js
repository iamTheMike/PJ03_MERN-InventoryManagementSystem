import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import admin from 'firebase-admin';

import 'dotenv/config';
import serviceAccountKey from './pj03-8c062-firebase-adminsdk-wycsv-0e8f15a00b.json'  assert { type: 'json' };
import authRoute from './Route/authRoute.js'
import blogRote from './Route/blogRoute.js'

const server = express();

let PORT = 3000;

server.use(express.json());



admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
})
mongoose.connect(process.env.DB_LOCATION,{
    autoIndex:true
})

server.use(cors())

server.use('/auth',authRoute)
server.use('/blog',blogRote)


server.listen(PORT,(req,res)=>{
    console.log(`Server running port ${PORT}` )
})