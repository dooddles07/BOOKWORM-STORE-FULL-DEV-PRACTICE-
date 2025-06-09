import User from '../model/user.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '1d'})
}

export const register = async(req, res ) => {
    try{
        const {username, email, password} = req.body;

        if(!username || !email || !password) {
            return res.status(400).json({message: "All fields are required"})
        }

        if(password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters long"})
        }

        if(username.length < 3) {
            return res.status(400).json({message: "Username must be at least 3 characters long"})
        }

        const existingEmail = await User.findOne({email});
        if (existingEmail) {
            return res.status(400).json({message: "Email already exists"})
        }

        const existingUsername = await User.findOne({username});
        if (existingUsername) {
            return res.status(400).json({message: "Username already exists"})
        }

        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;


        
        const user = new User({
            email,
            username,
            password,
            profileImage,
        })

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
        }, 
    });
    
    
    } catch(error){
        console.log(error);
        res.status(500).json({message: "Internal Server Error"})
    }
};

export const login = async(req, res ) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({message: "All fields are required"})
        }

        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({message: "User not found"})
        }

        const isPasswordCorrect = await user.comparePassword(password);
        if(!isPasswordCorrect) {
            return res.status(400).json({message: "Invalid password"})
        }

        const token = generateToken(user._id);
        res.status(200).json({
            token,
            user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
        }, 
    });
    } catch (error) {
        console.log("Error in login route", error);
        res.status(500).json({message: "Internal Server Error"})
    }
};