/* --- GraphQL : Schemas --- */

const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type authInfo {
    token : String!
    userId : String!
  }

  type RootQ {
    loginUser(email: String! password: String!) : authInfo!
  }

  type Post {
    _id : ID!
    title : String!
    image : String!
    content : String!
    creator : User!
    createdAt : String!
    updatedAt : String!
  }

  type User {
    _id : ID!
    name : String!
    email : String!
    status : String!
    password : String
    posts : [Post]
  }

  input inputData {
    name : String!
    email : String!
    password : String!
  }

  type RootM {
    regUser(userInput : inputData) : User!
  }
  
  schema {
    query : RootQ
    mutation : RootM
  }
`); // export schema as GraphQL-String
