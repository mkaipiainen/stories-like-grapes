import { createSchema } from 'graphql-yoga'
import { db } from './db';
import resolvers from './resolvers';
const typeDefs = /* GraphQL */ `
  type Plant {
    id: ID!
    name: String!
    description: String
    wateringInterval: Int
    lastWatered: String
    tags: [String]
  }

  type Query {
    Plants: [Plant]
  }
  
  type Mutation {
    createPlant(name: String!, description: String, tags: [String]): Plant
  }
`

export const schema = createSchema({
  resolvers: resolvers,
  typeDefs: [typeDefs]
})