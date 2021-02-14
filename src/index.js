const { ApolloServer } = require("apollo-server");
const typeDefs = require("./typedefs");
const resolvers = require("./resolvers");
const {
  FormatDateDirective,
  AuthenticationDirective,
  AuthorizationDirective,
} = require("./directives");
const { createToken, getUserFromToken } = require("./auth");
const db = require("./db");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    formatDate: FormatDateDirective,
    authorized: AuthorizationDirective,
    authenicated: AuthenticationDirective,
  },
  context({ req, connection }) {
    if (connection) {
      return { ...db, ...connection.context };
    }
    const token = req.headers.authorization;
    const user = getUserFromToken(token);
    return { ...db, user, createToken };
  },
  subscriptions: {
    onConnect(headers) {
      const token = headers.authToken;
      const user = getUserFromToken(token);
      if (!user) {
        throw new Error("Nope");
      }
      return { user };
    },
  },
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
