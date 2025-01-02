const Photo = require('../models/photoModel');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

exports.uploadPhoto = [
    upload.single('photo'),
    async (req, res) => {
        try {
            const photo = await Photo.create({
                url: req.file.path,
                description: req.body.description,
                uploadedById: req.user.userId
            });
            res.status(201).send(photo);
        } catch (error) {
            res.status(400).send(error.message);
        }
    }
]; 