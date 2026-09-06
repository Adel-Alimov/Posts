import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "posts" }, (error, result) => {
            if (error) {
                console.error("Cloudinary error:", error);
                return reject(error);
            }
            resolve(result.secure_url);
        });
        if (file.data && file.data.length > 0) {
            stream.end(file.data);
        } else if (file.tempFilePath) {
            import("fs").then((fs) => {
                fs.createReadStream(file.tempFilePath).pipe(stream);
            });
        } else {
            reject(new Error("Файл не содержит данных для загрузки"));
        }
    });
};

// Create Post
export const createPost = async (req, res) => {
    try {
        const { title, text } = req.body;
        const user = await User.findById(req.userId);

        let imageUrl = "";

        if (req.files && req.files.image) {
            imageUrl = await uploadToCloudinary(req.files.image);
        }

        const newPost = new Post({
            username: user.username,
            title,
            text,
            imgUrl: imageUrl,
            author: req.userId,
        });

        await newPost.save();

        await User.findByIdAndUpdate(req.userId, {
            $push: { posts: newPost },
        });

        return res.json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};

//Get All Posts
export const getAll = async (req, res) => {
    try {
        const posts = await Post.find().sort("-createdAt");
        const popularPosts = await Post.find().limit(5).sort("-views");
        if (!posts) {
            return res.json({ message: "Постов нет" });
        }
        res.json({ posts, popularPosts });
    } catch (error) {
        res.json({ message: "Что то пошло не так" });
    }
};

//Get Post By Id
export const getById = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, {
            $inc: { views: 1 },
        });

        res.json(post);
    } catch (error) {
        res.json({ message: "Что то пошло не так" });
    }
};

//Get My Posts
export const getMyPosts = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const list = await Promise.all(
            user.posts.map((post) => {
                return Post.findById(post._id);
            }),
        );

        res.json(list);
    } catch (error) {
        res.json({ message: "Что то пошло не так" });
    }
};

//Remove Post
export const removePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.json({ message: "Такого поста не существует" });

        await User.findByIdAndUpdate(req.userId, {
            $pull: { posts: req.params.id },
        });

        res.json({ message: "Пост был удален" });
    } catch (error) {
        res.json({ message: "Что то пошло не так" });
    }
};

//Update Post
export const updatePost = async (req, res) => {
    try {
        const { title, text, id } = req.body;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Пост не найден" });
        }

        if (req.files && req.files.image) {
            post.imgUrl = await uploadToCloudinary(req.files.image);
        }

        post.title = title;
        post.text = text;
        await post.save();

        return res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};

//Get Post Comments
export const getPostComments = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const list = await Promise.all(
            post.comments.map((comment) => {
                return Comment.findById(comment);
            }),
        );
        res.json(list);
    } catch (error) {
        res.json({ message: "Что то пошло не так" });
    }
};
