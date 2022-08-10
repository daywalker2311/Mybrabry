const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

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
router.post('/', async (req, res) => {

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,

        description: req.body.description,
    });

    saveCover(book, req.body.cover);

    //console.log("book in post book : ", book);
    try {
        const newBook = await book.save();
        console.log("saving book");
        //res.redirect(`books/${newbook.id}`);
        res.redirect('books');
    } catch (error) {
        console.log("error in post book: ", error);
        // if (book.coverImageName != null) {
        //     removeBookCover(book.coverImageName)
        // }

        renderNewPage(res, book, true);
    }

})

// function removeBookCover(fileName) {
//     fs.unlink(path.join(uploadPath, fileName), err => {
//         if (err) console.log(err);
//     })
// }

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

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return

    const cover = JSON.parse(coverEncoded);
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}
module.exports = router;