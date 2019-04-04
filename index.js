const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
// mongo
const mongo = require('mongodb').MongoClient;
// aws
const aws = require('aws-sdk');
aws.config.update({
    secretAccessKey: process.env.AWS_KEY,
    accessKeyId: process.env.AWS_ID
    //region: 'us-east-1' // region of your bucket
});
const s3 = new aws.S3();
// file-type
const readChunk = require('read-chunk');
const fileType = require('file-type');
// multer
const multer  = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const fileName = (+new Date()).toString(36) + Math.random().toString(36).substring(2);
        cb(null, fileName)
    }
});
const upload = multer({ storage: storage });
// express
const app = express();
app.use(express.static(path.join(__dirname, 'client/build')));
// CORS
const cors = require('cors');
app.use(cors());
// ROUTERS

mongo.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err, client) => {
    const db = client.db(process.env.DBNAME);
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname+'/client/build/index.html'));
    });

    app.post('/upload', upload.array('file', 20), (req, res) => {
        Promise.all(req.files.map((file) => checkValidationAndAppendExtension(file)))
            .then(resultObjArray => {
                return resultObjArray.map(obj => {
                    if (obj.status === 'success') return obj.promise
                })
            })
            .then(fileArrayReadyForSave => {
                Promise.all(fileArrayReadyForSave).then((links) => {
                    console.log(links);
                    res.send('success');
                });
            });
    });

    const port = process.env.PORT || 5000;
    app.listen(port);
});



function deleteFile(path, resolve, originalName) {
    fs.unlink(path, (err) => {
        if (err) {
            resolve({
               status: 'fail',
               originalName:  originalName
            })
        }
    })
}

function checkValidationAndAppendExtension(file) {
    return new Promise((resolve, reject) => {
        let filePath = file.path;
        let fileName = file.filename;
        // check size
        if (file.size > 5 * 1024 * 1024) {
            deleteFile(filePath, resolve, file.originalname);
            return
        }
        // add extension, remove file if wrong type
        const buffer = readChunk.sync(filePath, 0, fileType.minimumBytes);
        const ext = fileType(buffer).ext;
        if (ext === 'jpg' || ext === 'png') {
            filePath += '.' + ext;
            fileName += '.' + ext;
            fs.rename(file.path, filePath, (err) => {
                if (err) {
                    console.log(err);
                    resolve({
                        status: 'fail',
                        originalName: file.originalname
                    })
                } else {
                    resolve({
                        status: 'success',
                        promise: uploadToAWSAndUpdateDB(filePath, fileName, file.originalname)
                    });
                }})
        } else {
            deleteFile(filePath, resolve, file.originalname);
        }
    })
}
function uploadToAWSAndUpdateDB(filePath, fileName, originalName) {
    return new Promise((resolve, reject) => {
        // read file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(err);
                resolve({
                    status: 'fail',
                    originalName: originalName
                })
            } else {
                // upload to s3
                const params = {
                    Bucket: 'waterfall-gallery',
                    Key: fileName,
                    Body: data,
                    ACL: 'public-read'
                };
                s3.upload(params, function(s3Err, data) {
                    if (s3Err) {
                        console.log(s3Err);
                        resolve({
                            status: 'fail',
                            originalName: originalName
                        })
                    } else {
                        // update DB
                        const link = data.Location;
                        db.collection('waterfall-gallery').insertOne({
                            fileName: fileName,
                            link: link
                        }, (err, doc) => {
                            if (err) {
                                console.log(err);
                                resolve({
                                    status: 'fail',
                                    originalName: originalName
                                })
                            } else {
                                resolve({
                                    status: 'success',
                                    link: link
                                })
                            }
                        })
                    }
                });
            }
        });
    })
}
