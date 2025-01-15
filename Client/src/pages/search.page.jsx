import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import InPageNavigation from '../components/inpage-navigation.component'
import Loader from '../components/loader.component';
import AnimationWrapper from '../common/page-animation';
import BlogPostCard from '../components/blog-post.component';
import NoDataMessage from '../components/nodata.component';

import axios from 'axios';
import { filterPaginationData } from '../common/filter-pagination-data';
import LoadMoreDataBtn from '../components/load-more.component';
import UserCard from '../components/usercard.component';

const SearchPage = () => {
    let { query } = useParams()
    let [blogs, setBlogs] = useState(null);
    let [users, setUsers] = useState(null);
    const searchBlogs = async ({ page, create_new_arr = false }) => {
        await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-blogs", { query, page })

            .then(async ({ data }) => {

                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/blog/search-blogs-count",
                    data_to_send: { query },
                    create_new_arr
                })


                setBlogs(formatedData);
            })
            .catch(err => {
                console.log(err)
            })
    }



    const fetchSearchUsers = async () => {
        await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-users", { query })
            .then(({ data }) => {
                setUsers(data.users);


            })
    }

    useEffect(() => {
        resetState();
        searchBlogs({ page: 1, create_new_arr: true })
        fetchSearchUsers();
    }, [query])

    const resetState = () => {
        setBlogs(null);
        setUsers(null);
    }
    const UserCardWrapper = () => {
        return (
            <>
                {
                    !users ? <Loader />
                        : users.length ?
                            users.map((user, i) => {

                                return (
                                    <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                                        <UserCard user={user} />
                                    </AnimationWrapper>
                                )
                            })
                            : <NoDataMessage message={"No User Found"} />

                }
            </>
        )
    }
    return (
        <section className='h-cover flex justify-center gap-10'>
            <div className='w-full'>
                <InPageNavigation routes={[`Blog Search Results : "${query}"`, "Accounts Found in Search"]} defaultHidden={"Accounts Found in Search"}>

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
                                    <NoDataMessage message={`No Blogs Found `} />
                        }
                        <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />
                    </>

                    <UserCardWrapper />



                </InPageNavigation>
            </div>

            <div className='min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden'>

                <h1 className='font-medium text-xl mb-8'>Accounts Found in Search
                    <i className='fi fi-rr-user text-xl ml-3'/>
                </h1>
                <UserCardWrapper />
            </div>


        </section>
    )
}

export default SearchPage