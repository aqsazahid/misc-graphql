const { ApolloServer } = require('@apollo/server')
const { GraphQLError } = require('graphql')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const Author = require('./models/author')
const Book = require('./models/book')
let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]
let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const typeDefs = `
 type Book {
  title: String!
  published: Int!
  author: Author!
  genres: [String!]!
  id: ID!
}

 type Author {
  name: String!
  born: Int
  bookCount: Int
  id: ID!
}

  # type Query {
    #bookCount: Int!
    #authorCount: Int!
    # allBooks: [Book!]!
    #allBooks(genre: String, author: String): [Book!]!
    #allAuthors: [Author!]!
  #}

  type Query {
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
}

  type Mutation {
    addBook(
      title: String!
      author: String
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`

const resolvers = {
  Query: {
    // bookCount: () => books.length,
    // authorCount: () => authors.length,
    // allBooks: (root, args) => {
    //   let filteredBooks = books;
    //   if (args.author) {
    //     filteredBooks = filteredBooks.filter(book => book.author === args.author);
    //   }
    //   if (args.genre) {
    //     filteredBooks = filteredBooks.filter(book => book.genres.includes(args.genre));
    //   }

    //   return filteredBooks;
    // },
    // allAuthors: () => {
    //   return authors.map(author => {
    //     const bookCount = books.filter(book => book.author === author.name).length;
    //     return {
    //       ...author,
    //       bookCount: bookCount,  
    //     };
    //   });
    // }
    // allBooks: async (root, args) => {
    //   let filter = {}

    //   // If author is provided, filter by author name
    //   if (args.author) {
    //     const author = await Author.findOne({ name: args.author })
    //     filter.author = author ? author._id : null
    //   }

    //   // If genre is provided, filter by genre
    //   if (args.genre) {
    //     filter.genres = { $in: [args.genre] }
    //   }

    //   return Book.find(filter).populate('author')
    // },
    allBooks: async (root, args) => {
      const filter = {};

      // If an author is provided, filter by author name
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (author) {
          filter.author = author._id; // Filter books by the author's ID
        } else {
          return []; // If no author is found, return an empty list
        }
      }

      // If a genre is provided, filter by genre
      if (args.genre) {
        filter.genres = { $in: [args.genre] }; // Filter books where genres array includes the provided genre
      }

      // Find and return books with applied filters, populate the author field
      return Book.find(filter).populate('author');
    },
    allAuthors: () => Author.find({}),
  },
  Mutation: {
    // addBook: (root, args) => {
    //   try {
    //     const existingAuthor = authors.find(a => a.name === args.author);
    //     if (!existingAuthor) {
    //       const newAuthor = {
    //         name: args.author,
    //         born: null,
    //         bookCount: 1,
    //       };
    //       authors = authors.concat(newAuthor);
    //     } else {
    //       existingAuthor.bookCount += 1;
    //     }
    //     const newBook = {
    //       title: args.title,
    //       author: args.author,
    //       published: args.published,
    //       genres: args.genres,
    //     };

    //     books = books.concat(newBook);
    //     return newBook;
    //   } catch (error) {
    //     console.error("Error in addBook resolver:", error);
    //     throw new Error("Failed to add book");
    //   }
    // },
    // editAuthor: (root, args) => {
    //   const author = authors.find(a => a.name === args.name);
    //   if (!author) {
    //     return null;
    //   }
    //   author.born = args.setBornTo;
    //   return author;
    // }
    addBook: async (root, args) => {
      try {
        let author = await Author.findOne({ name: args.author });

        if (!author) {
          author = new Author({ name: args.author });
          await author.save();
        }

        const book = new Book({
          title: args.title,
          published: args.published,
          author: author._id,
          genres: args.genres,
        });

        await book.save();
        return book.populate('author').execPopulate();
      } catch (error) {
        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
          throw new GraphQLError(`Validation Error: ${error.message}`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args,
              errorMessage: error.message,
            }
          });
        }
        throw new GraphQLError('An error occurred while adding the book');
      }
    },
    editAuthor: async (root, args) => {
      try {
        const author = await Author.findOne({ name: args.name });
        if (!author) {
          throw new GraphQLError('Author not found', {
            extensions: {
              code: 'NOT_FOUND',
              invalidArgs: args.name,
            }
          });
        }

        author.born = args.setBornTo;
        return author.save();
      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new GraphQLError(`Validation Error: ${error.message}`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args,
              errorMessage: error.message,
            }
          });
        }
        throw new GraphQLError('An error occurred while editing the author');
      }
    }
  }
  },
  Author: {
    bookCount: async (root) => {
      return Book.countDocuments({ author: root._id })
    }
  }
}



const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
