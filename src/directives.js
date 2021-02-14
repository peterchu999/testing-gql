const {
  SchemaDirectiveVisitor,
  AuthenticationError,
} = require("apollo-server");
const { defaultFieldResolver, GraphQLString } = require("graphql");
const { formatDate } = require("./utils");

class FormatDateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { format: defaultFormat } = this.args;

    field.args.push({
      name: "format",
      type: GraphQLString,
    });

    field.resolve = async function (root, { format, ...rest }, ctx, info) {
      const date = await resolve.call(this, root, rest, ctx, info);
      return formatDate(date, format || defaultFormat);
    };
  }
}

class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    field.resolve = async function (root, args, ctx, info) {
      if (!ctx.user) {
        throw new AuthenticationError("not authorize");
      }
      return resolver(root, args, ctx, info);
    };
  }
}

class AuthorizationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    const { role } = this.args;
    field.resolve = async function (root, args, ctx, info) {
      if (!ctx.user || ctx.user.role !== role) {
        throw new AuthenticationError("Wrong role lho");
      }
      return resolver(root, args, ctx, info);
    };
  }
}

module.exports = {
  FormatDateDirective,
  AuthenticationDirective,
  AuthorizationDirective,
};
