const aws = require('aws-sdk');
const sharp = require('sharp');

/**
 * configs for reuse
 */
const config = {
    extensions: ['.png', '.jpg', '.jpeg', '.webp'],
    dimensionsRegex: /\/?\d{2,6}x\d{2,6}\//gm, // checks /200x200/ & 200x200/
    extensionsToCheck: ['.png', '.jpg', '.jpeg', '.webp'],
};

/**
 * Check if file exists in s3
 * @param {s3} s3
 * @param {string} Bucket
 * @param {string} Key
 * @returns {boolean}
 */
async function fileExists(s3, Bucket, Key) {
    try {
        await s3.headObject({ Bucket, Key }).promise();
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Check if Provided file path has dimensions
 * @param {string} filePath ex. 200x200/image.png, image.png
 * @returns {boolean}
 */
function pathHasDimensions(filePath) {
    let dimensions = filePath.match(config.dimensionsRegex);
    return dimensions && dimensions.length > 0;
}

/**
 * Extracts dimensions from filePath
 * @param {string} filePath ex. 200x200/image.png, image.png
 * @returns {string|null}
 */
function getPathDimentions(filePath) {
    let dimensions = filePath.match(config.dimensionsRegex);
    if (dimensions && dimensions.length > 0) return dimensions[0];
    return null;
}

/**
 * Get Array of filePaths where image can be found
 * @param {string} filePath
 * @returns {Array<string>}
 */
function getFilePathsToCheck(filePath) {
    let Key = filePath;
    let filePathsToCheck = [];
    if (pathHasDimensions(Key)) {
        config.extensionsToCheck.forEach((extension) => {
            filePathsToCheck.push(`${Key.split('.')[0]}${extension}`);
        });
    }
    // check in parent folder
    let dimensions = getPathDimentions(Key); // ex. /100x100/
    Key = Key.replace(dimensions, '/'); // replaces /100x100/ => /
    if (Key.startsWith('/')) Key = Key.substring(1);
    config.extensionsToCheck.forEach((extension) => {
        filePathsToCheck.push(`${Key.split('.')[0]}${extension}`);
    });
    return filePathsToCheck;
}

/**
 * Find possible source file from bucket
 * @param {Array<string>} filePaths Array of file paths to search
 * @returns string
 */
async function checkFilePathsInBucket(s3, Bucket, filePaths) {
    const params = {
        Bucket,
        Prefix: '',
    };
    let response = await s3.listObjectsV2(params).promise();
    let foundContent = response.Contents.find((content) =>
        filePaths.includes(content.Key)
    );
    if (foundContent) {
        return foundContent.Key;
    } else {
        return null;
    }
}

/**
 * Based on resource fileName returns source fileName
 * @param {s3} s3 s3 instance created using new AWS.s3()
 * @param {string} Bucket Bucket Name
 * @param {string} Key File Name
 * @returns {string|null}
 */
async function getSourceImagePath(s3, Bucket, Key) {
    let filePathsToCheck = getFilePathsToCheck(Key);
    let sourceFilePath = checkFilePathsInBucket(s3, Bucket, filePathsToCheck);
    return sourceFilePath;
}

/**
 * Resize Buffered image based on destinationPath
 * @param {Buffer} content Image in Buffer format
 * @param {string} destinationPath Destination Path of image
 * @returns {Buffer}
 */
async function resizeImage(content, destinationPath) {
    let format = destinationPath.split('.')[1];
    let dimensions = destinationPath.match(config.dimensionsRegex);

    if (dimensions && dimensions.length > 0) {
        dimensions = dimensions[0].replace(/\//gm, '');

        let [width, height] = dimensions.split('x');
        return await sharp(content)
            .resize(+width, +height)
            .toFormat(format)
            .toBuffer();
    } else {
        return await sharp(content).toFormat(format).toBuffer();
    }
}

/**
 * Handler function that gets executed by lambda
 * @param {any} event Event containing Payload sent
 * @returns {string|null}
 */
exports.resizer = async (url) => {
    const bucket = process.env.BUCKET_NAME;
    const key = url.startsWith('/') ? url.substring(1) : url;
    const accessKeyId = process.env.ACCESS_KEY_ID;
    const secretAccessKey = process.env.SECRET_ACCESS_KEY;
    const region = process.env.REGION;
    try {
        // configure S3
        const s3 = new aws.S3({
            apiVersion: '2006-03-01',
            accessKeyId,
            secretAccessKey,
            region,
        });
        let fileExistsRes = await fileExists(s3, bucket, key);
        if (fileExistsRes) {
            return key; // File Exists
        }

        let fileSourcePath = await getSourceImagePath(s3, bucket, key);
        console.log(fileSourcePath);
        if (!fileSourcePath) {
            return ''; // No usable source found
        }

        const { Body } = await s3
            .getObject({
                Bucket: bucket,
                Key: fileSourcePath,
            })
            .promise();
        let resizedImage = await resizeImage(Body, key);
        await s3
            .putObject({
                Bucket: bucket,
                Key: key,
                Body: resizedImage,
            })
            .promise();
        return key;
    } catch (err) {
        console.log(err);
        const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};
