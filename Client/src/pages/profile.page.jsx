import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AnimationWrapper from '../common/page-animation';
import Loader from '../components/loader.component';
import { useContext } from 'react';
import { UserContext } from '../App';
import AboutUser from '../components/about.component';
import { filterPaginationData } from '../common/filter-pagination-data';
import InPageNavigation from '../components/inpage-navigation.component';
import BlogPostCard from '../components/blog-post.component';
import NoDataMessage from '../components/nodata.component';
import LoadMoreDataBtn from '../components/load-more.component';
import MinimalBlogPost from '../components/nobanner-blog-post.component';
import PageNotFound from './404.page';

export const profileDataStructure = {
    personal_info: {
        fullname: "",
        username: "",
        profile_img: "",
        bio: "",
    },
    account_info: {
        total_posts: 0,
        total_reads: 0
    },
    social_links: {},
    joineAt: ""
}

const ProfilePage = () => {
    let { id: profileId } = useParams();
    let [profile, setProfile] = useState(profileDataStructure);
    let fullname = profile?.personal_info?.fullname;
    let profile_username = profile?.personal_info?.username
    let profile_img = profile?.personal_info?.profile_img
    let bio = profile?.personal_info?.bio
    let total_posts = profile?.account_info?.total_posts
    let total_reads = profile?.account_info?.total_reads
    let social_links = profile?.social_links
    let joinedAt = profile?.joinedAt
    let [loading, setLoading] = useState(true)
    let [blogs, setBlogs] = useState(null);
    let [profileLoaded, setProfileLoaded] = useState();
    let { userAuth } = useContext(UserContext)
    let username = userAuth?.username
    const fetchUserProfile = async () => {
        await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/get-profile", { username: profileId })
            .then(({ data: { user } }) => {
                if(user){
                    setProfile(user);
                }
                setProfileLoaded(profileId)
                getBlogs({ user_id: user._id, page: 1 })
                setLoading(false);

            })
            .catch((err) => {
                setLoading(false);
            })
    }
    const getBlogs = async ({ page, user_id }) => {
        user_id = user_id === undefined ? blogs.user_id : user_id;
        await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-blogs", {
            author: user_id,
            page
        }).then(async ({ data }) => {

            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: '/blog/search-blogs-count',
                data_to_send: { author: user_id }
            })
            formatedData.user_id = user_id;
            setBlogs(formatedData);
            console.log(formatedData)
        })
            .catch(err => {
                console.log(err)
            })

    }

    useEffect(() => {
        if(profileId!==profileLoaded){
            setBlogs(null);
        }
        if(!blogs){
            resetState();
            fetchUserProfile();
        }
        
    }, [profileId,blogs])

    const resetState = () => {
        setProfile(profileDataStructure);
        setLoading(true);
        setProfileLoaded("");
    }
    return (
        <AnimationWrapper>
            {
                loading ? <Loader /> :
                    profile_username.length ? 
                    <section className='h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12'>
                        <div className='flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10'>
                            <img className="h-48 w-48 bg-grey rounded-full md:w-32 md:h-32" src={profile_img} />
                            <h1 className='text-2xl font-medium'>@{profile_username}</h1>
                            <p className='text-xl capitalize h-6'>{fullname}</p>
                            <p>{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} - Reads</p>
                            <div className='flex gap-4 mt-2'>
                                {
                                    profileId === username ?
                                        <Link to="/settings/edit-profile" className="btn-light rounded-md">
                                            Edit Profile
                                        </Link> : ""
                                }
                            </div>
                            <AboutUser className="max-md:hidden " bio={bio} social_links={social_links} joinedAt={joinedAt} />
                        </div>
                        <div className='max-md:mt-12 w-full'>
                            <InPageNavigation routes={["Blogs Published", "About"]} defaultHidden={["About"]}
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
                                    <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />
                                </>

                                <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />

                            </InPageNavigation>
                        </div>
                    </section>
                    :
                    <PageNotFound/>
            }
        </AnimationWrapper>

    )
}

export default ProfilePage