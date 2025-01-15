import bcrypt from 'bcrypt'
import { getAuth } from "firebase-admin/auth"

import User from '../Schema/User.js';
import { formatDatatoSend, generateUsername } from '../Service/authService.js';
import { generateUploadURL } from '../Service/awsService.js';




export const signup = async (req, res) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password
    let { fullname, email, password } = req.body;
    if (fullname.length < 3) {
        return res.status(403).json({ "error": "Fullname must be at least 3 letters long" })
    }
    if (!email.length) {
        return res.status(403).json({ "error": "Enter Email" })
    }
    if (!emailRegex.test(email)) {
        return res.status(403).json({ "error": "Email is invalid " })
    }
    if (!passwordRegex.test(password)) {
        return res.status(403).json({ "error": "Password should be 6 to 20 cahracters long with a numeric, 1 lowercase and 1 uppercase letters" })
    }
    const emailExists = await User.exists({ "personal_info.email": email });
    if (emailExists) {
        return res.status(400).json({ "error": "Email already exists" });
    }
    bcrypt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateUsername(email);
        let user = new User({
            personal_info: {
                fullname, email, password: hashed_password, username
            }
        })
        user.save().then((user) => {
            return res.status(200).json(formatDatatoSend(user))
        }).catch(err => {
            if (err.code === 11000) {
                return res.status(500).json({ "error": "Email already exists" })
            }

        })
    })
}

export const signin = async (req, res) => {
    let { email, password } = req.body;
    await User.findOne({ "personal_info.email": email })
        .then((user) => {
            if (!user) {
                return res.status(403).json({ "error": "Email not found" })
            }
            if (!user.google_auth) {
                bcrypt.compare(password, user.personal_info.password, (err, result) => {
                    if (err) {
                        return res.status(403).json({ "error": "Error occured while login please try agian" })
                    }
                    if (!result) {
                        return res.status(403).json({ "error": "Incorrect Password" })
                    } else {
                        return res.status(200).json(formatDatatoSend(user))
                    }
                })
            } else {
                return res.status(403).json({ "error": "Account was created using goole. Try login with Google" })
            }

        }).catch((err) => {
            return res.status(500).json({ "error": err.message })
        })

}

export const googleAuth = async (req, res) => {
    let { access_token } = req.body;
    getAuth()
        .verifyIdToken(access_token)
        .then(async (decodeUser) => {
            let { email, name, picture } = decodeUser;
            picture = picture.replace("s96-c", "s384-c")
            let user = await User.findOne({ 'personal_info.email': email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth").then((data) => {
                return data || null
            })
                .catch(err => {
                    return res.status(500).json({ "error": err.message })
                })
            if (user) {
                if (!user.google_auth) {
                    return res.status(403).json({ "error": "This email was signed up without google. Please Login with password to access the account" })
                }
            } else {
                let username = await generateUsername(email)
                user = new User({
                    personal_info: { fullname: name, email, username },
                    google_auth: true
                })

                await user.save().then((u) => {
                    user = u;
                })
                    .catch(err => {
                        return res.status(500).json({ "error": err.message })
                    })
            }

            return res.status(200).json(formatDatatoSend(user))
        })
        .catch(err => {
            return res.status(500).json({ "error": "Failed to authenticate you with google. Try with some other google account" })
        })

}

export const uploadURL = async (req, res) => {
    generateUploadURL()
        .then(url => {
            res.status(200).json({ uploadURL: url })
        })
        .catch(err=>{
            return res.status(500).json({error:err.message})
        })
}
