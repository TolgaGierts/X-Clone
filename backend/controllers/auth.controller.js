import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const Signup = async (req, res) => {
    try {
        console.log(req.body)
        const { username, fullName, email, password } = req.body
        const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" })
        }
        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return res.status(400).json({ message: "Username is already taken" })
        }
        const existingEmail = await User.findOne({ email })
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already taken" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword
        })
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save()
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            })
        }
        else {
            res.status(400).json({ message: "Invalid user data" })
        }
    } catch (error) {
        console.log(error, 'error in signup controller')
        res.status(500).json({ message: error.message })
    }
}

export const Login = async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (user && passwordMatch) {
            generateTokenAndSetCookie(user._id, res)
            res.status(200).json({
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImg: user.profileImg,
                coverImg: user.coverImg
            })
        }
        else {
            res.status(400).json({ message: "Invalid username or password" })
        }
    } catch (error) {
        console.log(error, 'error in signup controller')
        res.status(500).json({ message: error.message })
    }

}

export const Logout = async (req, res) => {
    try {
        res.cookie("token", "", { maxAge: 0 })
        res.status(200).json({ message: "Logout successful" })
    } catch (error) {
        console.log(error, 'error in logout controller')
        res.status(500).json({ message: error.message })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};