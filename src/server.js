const { GraphQLServer } = require('graphql-yoga');

const path = require('path');
const resolvers = require('./resolvers');

const server = new GraphQLServer({
  typeDefs: path.resolve(__dirname, 'schema.graphql'),
  resolvers
});

server.start(() => {
  require('./crawler').find()
  console.log('Server is running on localhost:4000');
})
module.exports = server;