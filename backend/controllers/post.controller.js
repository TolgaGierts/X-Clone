import Notification from "../models/notification.model.js"
import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import { v2 as cloudinary } from "cloudinary"

export const createPost = async (req, res) => {
    try {
        const { text } = req.body
        let { img } = req.body
        const userId = req.user._id.toString()
        const user = await User.findById(userId)
        console.log(user)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        if (!text && !img) {
            return res.status(400).json({ message: 'Text or image is required' })
        }

        if (img) {
            const uploadedRes = await cloudinary.uploader.upload(img)
            img = uploadedRes.secure_url
        }
        const newPost = new Post({
            user: userId,
            text,
            img
        })
        await newPost.save()
        res.status(201).json(newPost)
        console.log(newPost)
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log('error in createPost controller')
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        console.log(post)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: 'Post deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log('error in deletePost controller')
    }
}
export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body
        const post = await Post.findById(req.params.id)
        if (!text) {
            return res.status(400).json({ message: 'Text is required' })
        }
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }
        const newComment = {
            text,
            user: req.user._id,
        }
        post.comments.push(newComment)
        await post.save()
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log('error in commentOnPost controller')
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }
        if (post.likes.includes(req.user._id)) {
            // post.likes = post.likes.filter((like) => like.toString() !== req.user._id.toString())
            await Post.updateOne({ _id: req.params.id }, { $pull: { likes: req.user._id } })
            await User.updateOne({ _id: req.user._id }, { $pull: { likedPosts: req.params.id } })
        } else {
            post.likes.push(req.user._id)
            await User.updateOne({ _id: req.user._id }, { $push: { likedPosts: req.params.id } })
        }
        await post.save()

        const notification = new Notification({
            from: req.user._id,
            to: post.user,
            type: 'like',
        })
        await notification.save()
        res.status(200).json({ message: 'Post liked/unliked successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log('error in likeUnlikePost controller')
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({ path: 'user', select: '-password' }).populate({ path: 'comments.user', select: '-password' })
        if (posts.length === 0) {
            return res.status(200).json([])
        }
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log('error in getPosts controller')
    }
}

export const getLikedPosts = async (req, res) => {
    const userId = req.user._id
    try {
        const user = await User.findById(userId)
        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }).populate({ path: 'user', select: '-password' }).populate({ path: 'comments.user', select: '-password' })

        res.status(200).json(likedPosts)
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log('error in getLikedPosts controller')
    }
}

export const getFollowingPosts = async (req, res) => {
    const userId = req.user._id
    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        const following = user.following
        const followingPosts = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 }).populate({ path: 'user', select: '-password' }).populate({ path: 'comments.user', select: '-password' })
        res.status(200).json(followingPosts)
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log('error in getFollowingPosts controller')
    }
}

export const getUserPosts = async (req, res) => {
    const { username } = req.params.username
    try {
        const user = await User.findOne(username)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).populate({ path: 'user', select: '-password' }).populate({ path: 'comments.user', select: '-password' })
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log('error in getUserPosts controller')
    }
}