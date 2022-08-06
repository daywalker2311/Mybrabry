const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Book = require('../models/book');
const uploadPath = path.join('public', Book.coverImageBasePath)
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
//const imageMimeTypes = ['jpeg', 'png', 'gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})
//All Books Route
router.get('/', async (req, res) => {
    let query = Book.find({});
    if (req.query.title && req.query.title) {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }

    if (req.query.publishedBefore) {
        query = query.lte('publishDate', req.query.publishedBefore);
    }

    if (req.query.publishedAfter) {
        query = query.gte('publishDate', req.query.publishedAfter);
    }

    try {
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch (error) {
        res.redirect('/');
    }


})

//New Book route
router.get('/new', async (req, res) => {

    renderNewPage(res, new Book());
})

//Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    console.log("filename : ", fileName);
    //console.log("filename : ", req);
    console.log("req.body : ", req.body);

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description,
    });

    console.log("book in post book : ", book);
    try {
        const newBook = await book.save();
        console.log("saving book");
        //res.redirect(`books/${newbook.id}`);
        res.redirect('books');
    } catch (error) {
        console.log("error in post book: ", error);
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName)
        }

        renderNewPage(res, book, true);
    }

})

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.log(err);
    })
}

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating book';

        res.render('books/new', params)
    } catch (error) {
        res.redirect('/books');
    }
}
module.exports = router;