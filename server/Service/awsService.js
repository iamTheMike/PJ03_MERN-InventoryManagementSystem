import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';

const s3 = new S3({
    region: 'ap-southeast-2',

    credentials: {
        accessKeyId:process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
})

export const generateUploadURL = async() =>{
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`
    return await getSignedUrl(s3, new PutObjectCommand({
        Bucket: 'pj03',
        Key: imageName,
        ContentType: "image/jpeg",
    }), {
        expiresIn: 1000,
    });
}