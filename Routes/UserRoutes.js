import express from 'express'
import User from '../Models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

const app = express
const router = app.Router()
const secretkey = process.env.SECRETKEY || 'sjdgcschakcwkvuckwavecvwkuaecvuk'

// Verify token check

export const verifytoken = (req, res, next) => {

    const token = req.headers['authorization']?.split(' ')[1] || req.cookies.token
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing' })
    }
    try {
        const decode = jwt.verify(token, secretkey)
        req.userId = decode.id
        next()
    } catch (error) {
        console.log(error)
    }
}

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: '834513002@smtp-brevo.com',
        pass: 'GaJd5XcMxCkpn3WR',
    }
})

// Account creation route || Registration route
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide complete Credentials', succes: false })
        }
        const userdata = await User.findOne({ email })
        if (userdata) {
            return res.status(409).json({ message: 'User already exists', succes: false })
        }
        const hashpassword = await bcrypt.hash(password, 10)
        const createuser = new User({ name, email, password: hashpassword })
        await createuser.save()




        // Welcome email options
        const mailOptions = {
            from: 'per550017@gmail.com', // Verified Elastic Email sender address
            to: email, // Recipient's email address
            subject: 'Welcome to AsKify',
            text: `Hi ${name},\n\nWelcome to AsKify, your AI-powered chatbot! We're excited to have you with us.\n\nExplore the potential of AI to assist with your queries and learning. With AsKify, you can:\n\n- Chat with AI for instant answers and help.\n- Ask questions on any topic and get tailored responses.\n- Enjoy an engaging and personalized AI conversation!\n\nStart chatting with AI today: [Visit Our Homepage](https://askifyy.netlify.app/)\n\nBest regards,\nThe AsKify Team`,

            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <img src="https://res.cloudinary.com/dzlgy00ia/image/upload/v1736512328/ChannelBanner/ujgdeyipunvz7x7aiotc.png" 
        alt="AsKify Logo" style="max-width: 100%; margin-bottom: 20px; border-radius: 10px;" />
    <h1 style="color: #4034eb;">Welcome to AsKify - Your AI Chatbot Companion!</h1>
    <h2>Hi ${name},</h2>
    <p>We're thrilled to welcome you to AsKify!</p>
    <p>With AsKify, you can:</p>
    <ul>
        <li>Send messages to our intelligent AI and get accurate, instant responses.</li>
        <li>Explore new ideas, simplify your queries, and enjoy seamless interactions.</li>
        <li>Make every conversation smarter and more productive!</li>
    </ul>
    <p>
        <a href="https://askifyy.netlify.app/" 
           style="background-color: #4034eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
           Start Chatting Now
        </a>
    </p>
    <p>We can't wait to see how AsKify enhances your experience.</p>
    <p>Best regards,</p>
    <p><b>The AsKify Team</b></p>
</div>

            `,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error in Sending email ', error)
                return res.status(500).json({
                    message: 'Account created, but failed to send welcome email.',
                    success: true,
                });
            }
            console.log('Email sent:', info.response);
            return res.status(201).json({
                message: 'Account created successfully and welcome email sent.',
                success: true,
            });
        })


        return res.status(201).json({
            message: 'Account created Successfully',
            succes: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Server error'
        })
    }
})




// Account Login route || Sigin route
router.post('/signin', async (req, res) => {
    const { email, password } = req.body
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide complete Credentials', succes: false })
        }
        const userdata = await User.findOne({ email })
        if (!userdata) {
            return res.status(409).json({ message: 'User not exists', succes: false })
        }
        const ispasswordcorrect = await bcrypt.compare(password, userdata.password)
        if (!ispasswordcorrect) {
            return res.status(401).json({
                message: 'Invalid password'
            })
        }
        const token = jwt.sign({ id: userdata._id }, secretkey, { expiresIn: '1d' })
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        })
        return res.status(200).json({
            message: `Account loggedin Successfully , ${userdata.name}`,
            succes: true,
            token: token
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Server error'
        })
    }
})

// Logout Route

router.post('/logout', async (req, res) => {
    try {
        return res.cookie('token', '', {
            expiresIn: new Date(0),
            httpOnly: true
        }).json({
            message: 'Logout Successfully',
            succes: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Server error'
        })
    }
})


// Getting user by Id
router.get('/getbyId/:id', async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findById(id).select('-password')
        if (!user) {
            return res.status(404).json({ message: 'User not found', succes: false })
        }
        return res.status(200).json(user)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Server error'
        })
    }
})



// Saving users chats
router.post('/userchat/:id', async (req, res) => {
    const { id } = req.params
    const { chats } = req.body
    try {
        const userid = await User.findById(id)
        if (!userid) {
            return res.status(401).json({ message: 'User not found' })
        }
        const savechats = await User.findByIdAndUpdate(userid, { $push: { chatsbyuser: chats } }, { new: true })
        await savechats.save()
        return res.status(201).json({
            message: 'Chats are saved',
            succes: true,
            savechats: savechats
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Server error'
        })
    }
})



// Saving AI's chats
router.post('/aichat/:id', async (req, res) => {
    const { id } = req.params
    const { aichats } = req.body
    try {
        const userid = await User.findById(id)
        if (!userid) {
            return res.status(401).json({ message: 'User not found' })
        }
        const savechats = await User.findByIdAndUpdate(userid, { $push: { chatsbyai: aichats } }, { new: true })
        await savechats.save()
        return res.status(201).json({
            message: 'Chats are saved',
            succes: true,
            savechats: savechats
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Server error'
        })
    }
})
export default router;
