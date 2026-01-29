const AWS = require('aws-sdk');

const s3 = new AWS.S3({ region: 'ap-south-1' });

const uploadFile = async (fileBuffer, fileName, mimeType) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Zeroed/${fileName}`,
        Body: fileBuffer,
        ContentType: mimeType,
    };

    try {
        const result = await s3.upload(params).promise();
        return result.Location;
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("Error uploading file to S3.");
    }
};

const uploadVideo = async (fileBuffer, fileName, mimeType = 'video/mp4') => {
    return uploadFile(fileBuffer, `Videos/${fileName}`, mimeType);
};

module.exports = { uploadFile, uploadVideo };
