import express from 'express';
import { createBook, getAllBooks, getUserBooks, deleteBook } from '../controller/bookController.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new book
router.post("/", protectRoute, createBook);

// Get all books with pagination
router.get("/", protectRoute, getAllBooks);

// Get user's books
router.get("/:id", protectRoute, getUserBooks);

// Delete a book
router.delete("/:id", protectRoute, deleteBook);

export default router;