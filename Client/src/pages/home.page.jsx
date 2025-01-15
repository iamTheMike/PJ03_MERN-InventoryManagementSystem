import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AnimationWrapper from '../common/page-animation'
import InPageNavigation, { activeTabLineRef, activeTabRef } from '../components/inpage-navigation.component'
import Loader from '../components/loader.component'
import BlogPostCard from '../components/blog-post.component'
import MinimalBlogPost from '../components/nobanner-blog-post.component'
import NoDataMessage from '../components/nodata.component'
import { filterPaginationData } from '../common/filter-pagination-data'
import LoadMoreDataBtn from '../components/load-more.component'



const HomePage = () => {

    let [blogs, setBlogs] = useState();
    let [trending, setTrending] = useState(null);
    let [pageState, setPageState] = useState("Home");


    let categories = ["Test", "Programming", "Sport", "Cooking", "Tech", "Finances"]

    const fetchLatestBlogs = async ({ page }) => {
        await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/latest-blogs", { page })
            .then(async ({ data }) => {

                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/blog/all-latest-blogs-count"
                })

                setBlogs(formatedData)
            })
            .catch(err => {

            })
    }
    const fetchTrendingBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/blog/trending-blogs")
            .then(({ data }) => {
                setTrending(data.blogs);
            })
            .catch(err => {

            })
    }
    const loadBlogByCategory = (e) => {
        let category = e.target.innerText;
        setBlogs(null);
        if (pageState === category) {
            setPageState("Home");
            return;
        }
        setPageState(category)
    }

    const fetchBlogsByCategory = async ({ page }) => {
        await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-blogs", { tag: pageState, page })
            .then(async ({ data }) => {

                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/blog/search-blogs-count",
                    data_to_send: { tag: pageState }
                })


                setBlogs(formatedData);
            })
            .catch(err => {
                console.log(err)
            })
    }

    

    useEffect(() => {
        activeTabRef.current.click();
        if (!blogs) {
            if (pageState === "Home") {
                fetchLatestBlogs({ page: 1 });
            } else {
                fetchBlogsByCategory({ page: 1 });
            }
        }
        if (!trending) {
            fetchTrendingBlogs();
        }
    }, [pageState])

    return (
        <AnimationWrapper>
            <section className='h-cover flex justify-center gap-10'>

                <div className='w-full'>
                    <InPageNavigation routes={[pageState, "Trending Blogs"]} defaultHidden={["Trending Blogs"]}
                    >
                        <>
                            {
                                !blogs ? <Loader /> :
                                    blogs.results.length ? (
                                        blogs.results.map((blog, i) => {

                                            return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * .1 }}>
                                                <BlogPostCard content={blog} author={blog.author.personal_info} />
                                            </AnimationWrapper>
                                        })
                                    )
                                        :
                                        <NoDataMessage message={`No ${pageState}'s Blogs published `} />
                            }
                            <LoadMoreDataBtn state={blogs} fetchDataFun={(pageState === "Home" ? fetchLatestBlogs : fetchBlogsByCategory)} />
                        </>

                        <>
                            {
                                !trending ? (<Loader />) :
                                    (trending.length ?
                                        trending.map((blog, i) => {

                                            return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * .1 }}>
                                                <MinimalBlogPost blog={blog} index={i} />
                                            </AnimationWrapper>
                                        })
                                        :
                                        <NoDataMessage message={"No Trending blog"} />
                                    )
                            }

                        </>

                    </InPageNavigation>

                </div>

                <div className='min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden '>
                    <div className='flex flex-col gap-10'>

                        <div>
                            <h1 className='font-medium text-xl mb-8'>Stories form all interests</h1>
                            <div className='flex gap-3 flex-wrap'>
                                {
                                    categories.map((category, i) => {
                                        return (
                                            <button key={i}
                                                onClick={loadBlogByCategory}
                                                className={"tag " + (pageState === category ? "bg-black text-white" : "")}
                                            >
                                                {category}
                                            </button>)

                                    })
                                }
                            </div>
                        </div>

                        <div>
                            <h1 className='font-medium text-xl mb-8'>
                                Trending
                                <i className='fi fi-rr-arrow-trend-up'></i>
                            </h1>
                            {
                                !trending ? <Loader /> :
                                    trending.map((blog, i) => {

                                        return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * .1 }}>
                                            <MinimalBlogPost blog={blog} index={i} />
                                        </AnimationWrapper>
                                    })
                            }
                        </div>

                    </div>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage