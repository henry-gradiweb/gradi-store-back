import express from 'express';
import dotenv from 'dotenv';
import { graphqlHTTP } from 'express-graphql';
import root from './resolvers/shopifyResolver';
import schema from './schemas/shopifySchema';
import ngrok from 'ngrok';

dotenv.config();

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/graphql`);

  const url = await ngrok.connect(Number(PORT));
  console.log(`ngrok URL pública: ${url}/graphql`);
});
