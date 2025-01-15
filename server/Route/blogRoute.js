import express from 'express'
import { createBlog, latestBlogs, latestBlogsCount, searchBlogs, searchBlogsCount, trendingBlogs } from '../Controller/blogController.js';
import { verifyJWT } from '../Service/securityService.js';

const route = express.Router();

route.post('/create-blog',verifyJWT,createBlog)
route.post('/latest-blogs',latestBlogs)
route.get('/trending-blogs',trendingBlogs)
route.post('/search-blogs',searchBlogs)
route.post("/all-latest-blogs-count",latestBlogsCount)
route.post("/search-blogs-count",searchBlogsCount)

export default route;