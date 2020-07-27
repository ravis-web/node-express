import React, { Component, Fragment } from 'react';

// import webSocket from 'socket.io-client';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import './Feed.css';

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {
    const graphQL = {
      query: `
        {
          fetchStatus
        }
      `
    };
    // fetch('http://localhost:5000/feed/status')
    fetch('http://localhost:5000/graphql', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphQL)
    })
      .then(res => {
        /*
        if (res.status !== 200) {
          throw new Error('Failed to fetch user status.');
        }
        */
        return res.json();
      })
      .then(resData => {
        if (resData.errors) throw new Error("loading status failed!");
        this.setState({ status: resData.data.fetchStatus });
      })
      .catch(this.catchError);

    this.loadPosts();

    /* --- Web-Socket : Socket.io ---
    const socket = webSocket('http://localhost:5000');
    socket.on('posts', data => {
      if (data.action === 'create') this.addPost(data.post);
      else if (data.action === 'update') this.updatePost(data.post);
      else if (data.action === 'delete') this.loadPosts();
    });
    */
  }

  /*
  addPost = post => {
    this.setState(prevState => {
      const updatedPosts = [...prevState.posts];
      if (prevState.postPage === 1) {
        if (prevState.posts.length >= 2) {
          updatedPosts.pop();
        }
        updatedPosts.unshift(post);
      }
      return {
        posts: updatedPosts,
        totalPosts: prevState.totalPosts + 1
      };
    });
  };

  updatePost = post => {
    this.setState(prevState => {
      const updatedPosts = [...prevState.posts];
      const updatedPostIndex = updatedPosts.findIndex(p => p._id === post._id);
      if (updatedPostIndex > -1) {
        updatedPosts[updatedPostIndex] = post;
      }
      return {
        posts: updatedPosts
      };
    });
  };
  */

  loadPosts = direction => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }

    const graphQL = {
      query: `
        query LoadPost($page: Int) {
          fetchPosts(page : $page) {posts{_id title content creator{name} image createdAt updatedAt} total}
        }
      `, variables: { page: page }
    };

    // fetch('http://localhost:5000/feed/posts?page=' + page)
    fetch('http://localhost:5000/graphql', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphQL)
    })
      .then(res => {
        /*
        if (res.status !== 200) {
          throw new Error('Failed to fetch posts.');
        }
        */
        return res.json();
      })
      .then(resData => {
        if (resData.errors) throw new Error("loading posts failed!");
        this.setState({
          posts: resData.data.fetchPosts.posts.map(post => {
            return { ...post, imagePath: post.image };
          }),
          totalPosts: resData.data.fetchPosts.total,
          postsLoading: false
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = event => {
    event.preventDefault();

    const graphQL = {
      query: `
        mutation StatusUpdate($status: String!) {
          updateStatus(status : $status)
        }
      `, variables: { status: this.state.status }
    };

    // fetch('http://localhost:5000/feed/status')
    fetch('http://localhost:5000/graphql', {
      method: 'POST',
      // method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphQL)
      // body: JSON.stringify({ status: this.state.status })
    })
      .then(res => {
        /*
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        */
        return res.json();
      })
      .then(resData => {
        if (resData.errors) throw new Error("status update failed!");
        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = { ...prevState.posts.find(p => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = postData => {
    this.setState({
      editLoading: true
    });
    // Set up data (with image!)
    /*
    let url = 'http://localhost:5000/feed/post';
    let method = 'POST'
    if (this.state.editPost) {
      url = 'http://localhost:5000/feed/post/' + this.state.editPost._id;
      method = 'PUT'
    }
    */

    const formData = new FormData();
    // formData.append('title', postData.title);
    // formData.append('content', postData.content);
    formData.append('image', postData.image);
    if (this.state.editPost) formData.append('currImg', this.state.editPost.imagePath);

    fetch('http://localhost:5000/upload', {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + this.props.token },
      body: formData
    }).then(res => res.json())
      .then(res => {
        let graphQL = {
          query: `
            mutation NewPost($title: String!, $content: String!, $image: String!){
              createPost(postInput:{
                title: $title, content: $content, image: $image
              })
              { _id title content image creator{ name } createdAt }
            }
          `, variables: { title: postData.title, content: postData.content, image: res.filepath }
        };

        if (this.state.editPost) {
          graphQL = {
            query: `
              mutation PostUpdate($id: ID!, $title: String!, $content: String!, $image: String!) {
                updatePost(id: $id postInput:{
                  title:$title, content: $content, image: $image
                })
                { _id title content image creator{ name } createdAt }
              }
            `, variables: { id: this.state.editPost._id, title: postData.title, content: postData.content, image: res.filepath || 'undefined' }
          };
        }

        return fetch('http://localhost:5000/graphql', {
          method: 'POST',
          /* method: method,
          // headers: {
          //   'Content-Type': 'application/json'
          // },
          // body: JSON.stringify({
          //   title: postData.title,
          //   content: postData.content
          // })
          body: formData, // multipart/form-data
          */
          headers: {
            Authorization: 'Bearer ' + this.props.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(graphQL)
        })
      })
      .then(res => {
        // if (res.status !== 200 && res.status !== 201) {
        //   throw new Error('Creating or editing a post failed!');
        // }
        return res.json();
      })
      .then(resData => {
        if (resData.errors) throw new Error("user creation/updation failed!");
        let resDataOp = 'createPost';
        if (this.state.editPost) resDataOp = 'updatePost';
        const post = {
          _id: resData.data[resDataOp]._id,
          title: resData.data[resDataOp].title,
          content: resData.data[resDataOp].content,
          creator: resData.data[resDataOp].creator,
          createdAt: resData.data[resDataOp].createdAt,
          imagePath: resData.data[resDataOp].image,
        };
        this.setState(prevState => {
          let updatedPosts = [...prevState.posts];
          let updatedTotalPosts = prevState.totalPosts;
          if (prevState.editPost) {
            const postIndex = prevState.posts.findIndex(
              p => p._id === prevState.editPost._id
            );
            updatedPosts[postIndex] = post;
          } else {
            updatedTotalPosts++;
            if (prevState.posts.length >= 2) {
              updatedPosts.pop();
            }
            updatedPosts.unshift(post);
          }
          return {
            posts: updatedPosts,
            isEditing: false,
            editPost: null,
            editLoading: false,
            totalPosts: updatedTotalPosts
          };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = postId => {
    this.setState({ postsLoading: true });

    const graphQL = {
      query: `
        mutation DeletePost($postId: ID!){
          deletePost(id: $postId)
        }
      `, variables: { postId: postId }
    };

    // fetch('http://localhost:5000/feed/post/')
    fetch('http://localhost:5000/graphql', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphQL)
    })
      .then(res => {
        /*
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Deleting a post failed!');
        }
        */
        return res.json();
      })
      .then(resData => {
        if (resData.errors) throw new Error("post deletion failed!");
        /* 
        this.setState(prevState => {
          const updatedPosts = prevState.posts.filter(p => p._id !== postId);
          return { posts: updatedPosts, postsLoading: false };
        });
        */
        this.loadPosts();
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map(post => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString('en-US')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
