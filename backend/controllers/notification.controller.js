import mongoose from "mongoose";
import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id
        const notifications = await Notification.find({ to: userId }).populate({ path: 'from', select: 'username profileImg' }).populate({ path: 'to', select: '-password' })
        await Notification.updateMany({ to: userId }, { read: true })
        res.status(200).json(notifications)
    } catch (error) {
        console.log('error in getNotifications controller');
        res.status(500).json({ message: error.message })
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id
        const notifications = await Notification.deleteMany({ to: userId })
        res.status(200).json('Notifications deleted successfully')
    } catch (error) {
        console.log('error in deleteNotifications controller');
        res.status(500).json({ message: error.message })
    }
}

