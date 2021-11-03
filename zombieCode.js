const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require(`graphql`);

// defines query section
const schema = new GraphQLSchema({
  // defines all of the use cases for querying- right now it is just a single hello-world object, but multiple objects represent multiple use cases.
  query: new GraphQLObjectType({
    name: 'HelloWorld',
    // inside of each object there is a fields property that represent all the different sections of that object that we can return data from.
    fields: () => ({
      message: {
        type: GraphQLString,
        // what actual information are we returning from this field. How do we actually get the info for this field and return it.
        // resolve function can also take a couple arguments, such as parent, and args
        resolve: () => 'Hello World',
      },
    }),
  }),
});

console.log(schema);
