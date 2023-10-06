const { nanoid } = require('nanoid')
const books = require('./books')

// Meyimpan buku
const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading
  } = request.payload

  if (!name) {
    // Client tidak memasukan properti name pada request body
    const response = h
      .response({
        status: 'fail',
        message: 'Gagal menambahkan buku. Mohon isi nama buku'
      })
      .code(400)
    return response
  }

  if (readPage > pageCount) {
    const response = h
      .response({
        status: 'fail',
        message:
          'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
      })
      .code(400)
    return response
  }

  const id = nanoid(16)
  const finished = pageCount === readPage
  const insertedAt = new Date().toISOString()
  const updatedAt = insertedAt

  const newBook = {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    id,
    finished,
    insertedAt,
    updatedAt
  }

  books.push(newBook) // push to books array

  const isSuccess = books.filter((note) => note.id === id).length > 0 // cek if newBook pushed

  if (isSuccess) {
    // Bila buku berhasil dimasukkan
    const response = h
      .response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id
        }
      })
      .code(201)
    return response
  }

  const response = h
    .response({
      status: 'fail',
      message: 'Buku gagal ditambahkan'
    })
    .code(500)
  return response
}
// Menampilkan semua buku
const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query

  if (!name && !reading && !finished) {
    // kalau tidak ada query
    const response = h
      .response({
        status: 'success',
        data: {
          books: books.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher
          }))
        }
      })
      .code(200)

    return response
  }

  if (name) {
    const filteredBooksName = books.filter((book) => {
    // kalau ada query name
      const nameRegex = new RegExp(name, 'gi')
      return nameRegex.test(book.name)
    })

    const response = h
      .response({
        status: 'success',
        data: {
          books: filteredBooksName.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher
          }))
        }
      })
      .code(200)

    return response
  }

  if (reading) {
    // kalau ada query reading
    const filteredBooksReading = books.filter(
      (book) => Number(book.reading) === Number(reading)
    )

    const response = h
      .response({
        status: 'success',
        data: {
          books: filteredBooksReading.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher
          }))
        }
      })
      .code(200)

    return response
  }

  // kalau ada query finished
  const filteredBooksFinished = books.filter(
    (book) => Number(book.finished) === Number(finished)
  )

  const response = h
    .response({
      status: 'success',
      data: {
        books: filteredBooksFinished.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher
        }))
      }
    })
    .code(200)

  return response
}
// Menampilkan detail buku
const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params

  const book = books.filter((n) => n.id === bookId)[0] // menemukan book by id

  if (book) {
    // apabila buku dengan id yang dimasukan ditemukan
    const response = h
      .response({
        status: 'success',
        data: {
          book
        }
      })
      .code(200)
    return response
  }

  // Apabila buku dengan id yang dimasukan oleh client tidak ditemukan
  const response = h
    .response({
      status: 'fail',
      message: 'Buku tidak ditemukan'
    })
    .code(404)
  return response
}
// Mengupdate atau edit buku
const ubahBookByIdHandler = (request, h) => {
  const { bookId } = request.params

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading
  } = request.payload

  if (!name) {
    // Client tidak memasukan properti name pada request body
    const response = h
      .response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku'
      })
      .code(400)
    return response
  }

  if (readPage > pageCount) {
    // Client memasukan nilai properti readPage yang lebih besar dari nilai properti pageCount
    const response = h
      .response({
        status: 'fail',
        message:
            'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
      })
      .code(400)
    return response
  }

  const finished = pageCount === readPage
  const updatedAt = new Date().toISOString()

  const index = books.findIndex((note) => note.id === bookId) // menemukan book by id

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      updatedAt
    }

    // apabila buku berhasil diperbarui
    const response = h
      .response({
        status: 'success',
        message: 'Buku berhasil diperbarui'
      })
      .code(200)
    return response
  }

  // id yang dimasukan oleh client tidak ditemukkan oleh server
  const response = h
    .response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan'
    })
    .code(404)
  return response
}

// Menghapus buku
const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params

  const index = books.findIndex((note) => note.id === bookId) // find book by id

  if (index !== -1) {
    books.splice(index, 1)

    // Apabila id dimiliki oleh salah satu buku
    const response = h
      .response({
        status: 'success',
        message: 'Buku berhasil dihapus'
      })
      .code(200)
    return response
  }

  // Apabila  id yang dimasukan tidak dimiliki oleh buku manapun
  const response = h
    .response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan'
    })
    .code(404)
  return response
}

module.exports = { addBookHandler, getAllBooksHandler, getBookByIdHandler, ubahBookByIdHandler, deleteBookByIdHandler }
