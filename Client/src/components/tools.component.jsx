import Embed from "@editorjs/embed"
import List from "@editorjs/list"
import Image from "@editorjs/image"
import Header from "@editorjs/header"
import Quote from "@editorjs/quote"
import Marker from "@editorjs/marker"
import InlineCode from "@editorjs/inline-code"
import UploadImage from "../common/aws"

const uploadImageByURL = async (e) => {
    let link = new Promise((resolve, reject) => {
        try {
            resolve(e)
        }
        catch (err) {
            reject(err)
        }
    })
    const url = await link
    return {
        success: 1,
        file: { url }
    }
}

const uploadImageByFile = async (e) =>{
     return UploadImage(e)
     .then(url=>{
        if(url){
            return{
                success:1,
                file:{url}
            }
        }
     })
    
}

const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true
    },
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByUrl: uploadImageByURL,
                uploadByFile: uploadImageByFile
            }
        }
    },
    header: {
        class: Header,
        config: {
            placeholder: "Type Heading.....",
            levels: [2, 3],
            defaultLevel: 2
        }

    },
    quote: {
        class: Quote,
        inlineToolbar: true

    },
    marker: Marker,
    inlineCode: InlineCode
}

export default tools