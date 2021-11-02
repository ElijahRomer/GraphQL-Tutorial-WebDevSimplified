const express = require(`express`);
const { graphqlHTTP } = require('express-graphql');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  '/graphql',
  graphqlHTTP({
    graphiql: true,
  })
);

app.listen(
  PORT,
  console.log(
    `App is listening at http://localhost:${PORT} \nView GraphQL Interface at http://localhost:3000/graphql`
  )
);
