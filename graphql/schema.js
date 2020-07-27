/* --- GraphQL : Schemas --- */

const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type authInfo {
    token : String!
    userId : String!
  }

  type postList {
    posts : [Post!]!
    total : Int!
  }

  type RootQ {
    loginUser(email: String! password: String!) : authInfo!
    fetchPosts(page : Int) : postList!
    fetchPost(id : ID!) : Post!
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

  input userData {
    name : String!
    email : String!
    password : String!
  }

  input postData {
    title : String!
    content : String!
    image : String!
  }

  type RootM {
    regUser(userInput : userData) : User!
    createPost(postInput : postData) : Post!
    updatePost(id: ID! postInput: postData) : Post!
    deletePost(id: ID!) : Boolean
  }
  
  schema {
    query : RootQ
    mutation : RootM
  }
`); // export schema as GraphQL-String
