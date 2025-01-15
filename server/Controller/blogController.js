import { nanoid } from "nanoid"
import Blog from '../Schema/Blog.js';
import User from "../Schema/User.js";

export const createBlog = async (req, res) => {
    let authorId = req.user
    let { title, des, banner, tags, content, draft } = req.body
    if (!title.length) {
        return res.status(403).json({ error: "You must provide a title  " })
    }
    if (!draft) {
        if (!des.length || des.length > 200) {
            return res.status(403).json({ error: "You must provide blog description under 200 characters" })
        }
        if (!banner.length) {
            return res.status(403).json({ error: "You must provide blog banner to publish it" })
        }
        if (!content.blocks.length) {
            return res.status(403).json({ error: "There must be some blog content to publish it" })
        }
        if (!tags.length || tags.length > 10) {
            return res.status(403).json({ error: "Provide tags in order to publish the blog, Maximum 10" })
        }
    }
    tags = tags.map(tag => tag.toLowerCase());

    let blog_id = title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, '-').trim() + nanoid();

    let blog = new Blog({
        title, des, banner, content, tags, author: authorId, blog_id, draft: Boolean(draft)
    })
    await blog.save().then(blog => {
        let incrementVal = draft ? 0 : 1;
        User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts": incrementVal }, $push: { "blogs": blog._id } })
            .then(user => {
                return res.status(200).json({ id: blog.blog_id })
            })
            .catch(err => {
                return res.status(500).json({ error: err.message })
            })
    })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
}


export const latestBlogs = async (req, res) => {
    let { page } = req.body
    let maxLimit = 4;
    await Blog.find({ draft: false }).populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id").sort({ "publishedAt": -1 }).select("blog_id title des banner activity tags publishedAt -_id").skip((page - 1) * maxLimit).limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs: blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
}

export const trendingBlogs = async (req, res) => {
    await Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id").sort({ "activity.total_read": -1, "activity.total_likes": -1, "publishedAt": -1 }).select("blog_id title publishedAt -_id").limit(5)
        .then(blogs => {
            return res.status(200).json({ blogs: blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
}

export const searchBlogs = async (req, res) => {
    let { tag, query,author, page } = req.body;
    
    let findQuery;
    if (tag) {
        findQuery = { tags: tag, draft: false }
    } else if(query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') }
    } else if (author){
        findQuery = { draft: false, author}
    }
    let maxLimit = 2;
    await Blog.find(findQuery)
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id").sort({ "activity.total_read": -1, "activity.total_likes": -1, "publishedAt": -1 }).select("blog_id title des banner activity tags publishedAt -_id").skip((page - 1) * maxLimit).limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs: blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
}

export const latestBlogsCount = async (req, res) => {

    await Blog.countDocuments({ draft: false })
        .then(count => {
            return res.status(200).json({ totalDocs: count })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
}

export const searchBlogsCount = async (req, res) => {
    let { tag, query,author } = req.body;

    let findQuery;
    if (tag) {
        findQuery = { tags: tag, draft: false }
    } else if(query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') }
    } else if (author){
        findQuery = { draft: false, author}
    }
    Blog.countDocuments(findQuery)
        .then(count => {
            return res.status(200).json({ totalDocs: count })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
}

export const searchUsers = async(req, res) => {
    let {query} = req.body

    await User.find({"personal_info.username":new RegExp(query,'i')})
    .limit(50)
    .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
    .then((users)=>{
        return res.status(200).json({users})
    })
    .catch(err=>{
        return res.status(500).json({error:err.message})
    })
}

export const getProfile =async(req,res)=>{
    let {username} = req.body;
    User.findOne({"personal_info.username": username}).select("-personal_info.password -google_auth -updateAt -blogs").then(user=>{
        return res.status(200).json({user:user})
    })
    .catch(err=>{
        return res.status(500).json({error:err.message})
    })

}