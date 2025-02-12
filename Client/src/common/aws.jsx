import axios from 'axios'

const UploadImage = async(img) => {
 let imgUrl = null;
 await axios.get(import.meta.env.VITE_SERVER_DOMAIN+"/auth/get-upload-url")
 .then(async({data:{uploadURL}})=>{
    console.log(uploadURL)
    await axios({
        method: 'PUT',
        url:uploadURL,
        headers:{'Content-Type':'multipart/form-data'},
        data: img
    })
    .then(()=>{
        console.log(uploadURL);
         imgUrl = uploadURL.split("?")[0]
         console.log(imgUrl);

    })
 })
 return imgUrl
}

export default UploadImage

