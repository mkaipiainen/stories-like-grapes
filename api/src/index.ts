let express = require("express")
let { createHandler } = require("graphql-http/lib/use/express")
let { buildSchema } = require("graphql")
const { ruruHTML } = require("ruru/server")
const pg = require('pg');
import resolvers from './resolvers';



const pgpool = new pg.Pool({ database: 'plantminder' });

let schema = buildSchema(`
  type Query {
    hello: String
  }
`)

// The root provides a resolver function for each API endpoint
let root = {
  hello() {
    return "Hello world!"
  },
}

let app = express()
app.use(express.json())

// Create and use the GraphQL handler.
app.all(
  "/graphql",
  createHandler({
    schema: schema,
    rootValue: root,
  })
)
// Serve the GraphiQL IDE.
app.get("/graphql/ruru", (_req: any, res: any) => {
  res.type("html")
  res.end(ruruHTML({ endpoint: "/graphql" }))
})
// Start the server at port
app.listen(80)