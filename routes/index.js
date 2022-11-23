var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

//Handler function to wrap each route
function asyncHandler(cb) {
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

// Home route
router.get('/', (req, res) => {
  res.redirect("/books");
});

//Shows full list of books
router.get('/books', asyncHandler(async(req, res) => {
  const books = await Book.findAll();
  res.render('index', { books });
}));

//Shows the create new book form
router.get('/books/new',(req, res) => {
  res.render('new-book');
});

//Posts a new book to the database
router.post('/books/new', asyncHandler(async(req, res) => {
  const { title, author, genre, year } = req.body;
  try {
    await Book.create({ 
      title, 
      author, 
      genre, 
      year 
    });
    res.redirect("/books")
  } catch(err){
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(err => err.message);
        res.render('new-book', { 
          errors: err.errors
        })
    } else {
      throw err;
    }
  }
}));

//Shows book detail form
router.get('/books/:id', asyncHandler(async(req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    book ? res.render('update-book', { book }) : next();
  } catch(err) {
    throw err;
  }
}));

//Updates book info in the database
router.post('/books/:id', asyncHandler(async(req, res, next) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    await book.update(req.body)
    res.redirect('/books')
  } catch(err){
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(err => err.message);
        book = await Book.build(req.body)
        book.id = req.params.id
        res.render('update-book', {
          book, 
          errors: err.errors,
          title: "Update Book"
        })
    } else {
      throw err;
    }
  }
}));

//Delete a book entry
router.post('/books/:id/delete', asyncHandler(async(req, res) => {
  try {
    await Book.destroy({ where: {id: req.params.id} });
    res.redirect('/books')
  } catch(err) {
    throw err;
  }
}));


module.exports = router;
