const express = require(`express`);
const { graphqlHTTP } = require('express-graphql');
const {
  // gets passed an object that has properties defining the type of queries you can perform. Example: query, mutation.
  GraphQLSchema,

  //design your own data type in a sense... or like a table. Like a schema for a table
  GraphQLObjectType,

  // specifies multiple entries will be returned
  GraphQLList,

  // states that you can never return a null value for this type- pass another type for it's parameter
  GraphQLNonNull,

  // conventional data types.
  GraphQLString,
  GraphQLInt,
} = require(`graphql`);
const app = express();
const PORT = process.env.PORT || 3000;

const data = require(`./data`);

// import dummy data (mock database)
const { authors, books } = require(`./data`);

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents an author of a book',
  // fields is set to a function returning an object because if it just returns the object, then there are issues with order of definition and trying to access the fields obj without it being defined yet in the script. setting the value to a function that returns the value eliminates this issue.
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => books.filter((book) => book.authorId === author.id),
    },

    // apparently do not need to pass resolve to this section because the object already has an ID property and will automatically pull the id from that object.
  }),
});

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'This represents a book written by an author',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      // remember that the resolve takes in it's parent as the first argument
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId);
      },
    },
    // apparently do not need to pass resolve to this section because the object already has an ID property and will automatically pull the id from that object.
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    book: {
      // BookType is not enclosed in a list class here because it is only returning a single result.
      type: BookType,
      description: 'A Single Book',
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'List of All Books',
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of All Authors',
      resolve: () => authors,
    },
    author: {
      type: AuthorType,
      description: 'A Single Author',
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addBook: {
      type: BookType,
      description: 'Add a Book',
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add an Author',
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name,
        };
        authors.push(author);
        return author;
      },
    },
  }),
});

// defines the types of interactions we can make with the database... the types are defined via the objectType graphql class
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(
  PORT,
  console.log(
    `App is listening at http://localhost:${PORT} \nView GraphQL Interface at http://localhost:3000/graphql`
  )
);
