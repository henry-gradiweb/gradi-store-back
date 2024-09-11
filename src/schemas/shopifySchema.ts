import { buildSchema } from "graphql";

const schema = buildSchema(`
  type Product {
    id: ID!
    title: String!
    body_html: String
    vendor: String
    product_type: String
    created_at: String
  }
  type Query {
    products: [Product]
  }
  `);

export default schema;
