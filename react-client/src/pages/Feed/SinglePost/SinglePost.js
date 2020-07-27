import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: ''
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    const graphQL = {
      query: `
        {
          fetchPost(id : "${postId}") { _id title content image creator{name} createdAt updatedAt }
        }
      `
    };

    // fetch('http://localhost:5000/feed/post/' + postId)
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
          throw new Error('Failed to fetch status');
        }
        */
        return res.json();
      })
      .then(resData => {
        this.setState({
          title: resData.data.fetchPost.title,
          author: resData.data.fetchPost.creator.name,
          image: 'http://localhost:5000/' + resData.data.fetchPost.image,
          date: new Date(resData.data.fetchPost.createdAt).toLocaleDateString('en-US'),
          content: resData.data.fetchPost.content
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
