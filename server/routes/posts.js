import { Router } from "express";
import { checkAuth } from "../utils/checkAuth.js";
import {
    createPost,
    getAll,
    getById,
    getMyPosts,
    getPostComments,
    removePost,
    updatePost,
} from "../controllers/posts.js";

const router = new Router();

//create post
router.post("/", checkAuth, createPost);

//get all posts
router.get("/", getAll);

//get post by id
router.get("/:id", getById);

//get my posts
router.get("/user/me", checkAuth, getMyPosts);

//remove post by id
router.delete("/:id", checkAuth, removePost);

//update post
router.put("/:id", checkAuth, updatePost);

//get post comments
router.get("/comments/:id", getPostComments);

export default router;
