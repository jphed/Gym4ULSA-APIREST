import gql from 'graphql-tag';

export const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: Date
    updatedAt: Date
  }

  type Project {
    id: ID!
    name: String!
    description: String
    owner: User!
    createdAt: Date
    updatedAt: Date
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    users: [User!]!
    projects: [Project!]!
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createProject(name: String!, description: String): Project!
  }
`;
