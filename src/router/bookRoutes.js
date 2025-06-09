import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import Book from '../model/books.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const {title, caption, image, rating} = req.body;

        if(!title || !caption || !image || !rating) {
            return res.status(400).json({message: "Please provide all fields"});
        }

        //upload the image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image)
        const imageURL = uploadResponse.secure_url;
        
        //save to the database
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageURL,
            user: req.user._id
        })

        await newBook.save();
        
        res.status(201).json(newBook);

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error"})
    }
} )

//get all books, pagination, infinite loading
router.get("/", protectRoute, async (req, res) => {
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find()
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage");
        
        const totalBooks = await Book.countDocuments();

        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });
    } catch (error) {
        console.log("Error in get all books route", error)
        res.status(500).json({message: "Internal Server Error"})
    }
})

router.get("/:id", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({user: req.user._id})
        .sort({createdAt: -1});
        res.json(books);
    } catch (error) {
        console.log("Error in get user books route", error)
        res.status(500).json({message: "Internal Server Error"})
    }
})

//delete book
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if(!book) {
            return res.status(404).json({message: "Book not found"})
        }

        //check if user is the creator of the book
        if(book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({message: "Unauthorized"})
        }

        //delete the image from cloudinary
        if(book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.log("Error in delete book route", error)
                return res.status(500).json({message: "Internal Server Error"})
            }
        }

        //delete the book
        await book.deleteOne();
        res.status(200).json({message: "Book deleted successfully"})
    } catch (error) {
        console.log("Error in delete book route", error)
        res.status(500).json({message: "Internal Server Error"})
    }
})



export default router;