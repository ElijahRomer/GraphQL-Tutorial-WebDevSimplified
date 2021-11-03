const express = require(`express`);
const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  // states that you can never return a null value for this type
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
} = require(`graphql`);
const app = express();
const PORT = process.env.PORT || 3000;

const data = require(`./data`);

// import dummy data (mock database)
const { authors, books } = require(`./data`);

// added object collapse lines in the IDE
{
  // // defines query section
  // const schema = new GraphQLSchema({
  //   // defines all of the use cases for querying- right now it is just a single hello-world object, but multiple objects represent multiple use cases.
  //   query: new GraphQLObjectType({
  //     name: 'HelloWorld',
  //     // inside of each object there is a fields property that represent all the different sections of that object that we can return data from.
  //     fields: () => ({
  //       message: {
  //         type: GraphQLString,
  //         // what actual information are we returning from this field. How do we actually get the info for this field and return it.
  //         // resolve function can also take a couple arguments, such as parent, and args
  //         resolve: () => 'Hello World',
  //       },
  //     }),
  //   }),
  // });
}

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents an author of a book',
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
      // remember that the resolve takes in it's parent as an argument
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
      description: 'A single Author',
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
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
