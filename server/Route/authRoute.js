import express from 'express'
import { googleAuth, signin, signup, uploadURL } from '../Controller/authController.js';

const route = express.Router();


route.post('/signup',signup)
route.post("/signin",signin)
route.post("/google-auth", googleAuth)
route.get('/get-upload-url',uploadURL)



export default route;