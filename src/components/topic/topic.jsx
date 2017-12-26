import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink, Link } from 'react-router-dom';
import { Button, Badge } from 'react-bootstrap';

import topicService from '../../services/topic.service.js';
import commentService from '../../services/comment.service.js';
import langService from '../../services/lang.service';
import configs from '../../configs';

import Menu from '../utils/menu';
import Language from '../utils/lang_select';
import CommentForm from './comment_form';
import Comments from './comments';

import './topic.css';

import ReactHtmlParser from 'react-html-parser';
import showdown from 'showdown';
var mdConverter = new showdown.Converter();

class Topic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      topic: {},
      type: '',
      comments: [],
      parents: [],
      comment_id: 0,  
      comment_text: '',
    }
  }

  static propTypes = { 
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    user: PropTypes.object,
  };

  async componentWillMount() {
    const id = this.props.match.params.id;    
    await this.loadTopicData(id);
  }

  async componentWillReceiveProps(nextProps) {
    const id = props => props.match.params.id;
    const solve = id(this.props) !== id(nextProps);
    solve && await this.loadTopicData(id(nextProps));
  }

  loadTopicData = async (id) => {
    const self = this;
    const topic = await topicService.getTopic(id);

    if (!topic) {
      this.props.history.push('/404');
      return;
    }

    const comments = await topicService.getComments(id, topic.lang);
    const type = configs.flags[topic.type];
    const parents = await this.getParents(topic.parents);
    
    self.setState({
      topic,
      comments,
      parents,
      type
    });
  }

  async getParents(parents) {
    const formatted = [];

    for (let link of parents) {
      const parednt_id = link.match(/topics\/(\d+)/)[1];
      const { title, id, type } = await topicService.getTopic(parednt_id);
      formatted.push({ title, id, type });
    }

    return formatted;
  } 

  scrollToEdit() {
    const com_sec = this.refs.com_sec;
    const position = com_sec.getBoundingClientRect().top;
    position < 0 && com_sec.scrollIntoView(); 
  }

  startToEdit = (id) => {
    const comment = this.state.comments.find(comment => comment.id === id);
    this.setState({
      comment_id: id,
      comment_text: comment.text,
    });

    this.scrollToEdit();     
  }
  
  reply = (name) => {
    const response = `[${name}], `
    this.setState({
      comment_text: response
    });

    this.scrollToEdit();
  }

  clear() {
    this.setState({
      comment_id: 0,
      comment_text: '',
    });
  }

  edit = async (text) => {
    try{ 
      const { token } = this.props.user;
      const id = this.state.comment_id;
      await commentService.updateComment(id, text, token);
  
      const comments = this.state.comments.map(comment => {
        if (comment.id === id) 
          comment.text = text; 
        return comment;
      });
      this.setState({ 
        comments,
        comment_id: 0,
        comment_text: '',
      });
    } catch(e) {
      console.error(e);
    }
  }

  remove = async (id) => {
    const { token } = this.props.user;
    const status = await commentService.deleteComment(id, token);
    const comments = this.state.comments.filter(comment => comment.id !== id);
    status === 'success' && this.setState({
      comments,
      comment_text: '',
      comment_id: 0,
    });
    this.clear();
  }

  create = async (text) => {
    const { url } = this.state.topic;
    const { token } = this.props.user;
    const comment = await commentService.createComment(url, text, token);
    const comments = [comment].concat(this.state.comments);
    this.setState({ 
      comments,
      comment_text: '',    
    });
  }

  render() {
    const { topic, comments, parents, type } = this.state;
    const user = this.props.user;
    const { colors } = configs;

    const badgeStyle = type => {
      return {
        backgroundColor: colors[type]
      }
    };

    const Tags = () => parents[0]
      ? <div className="topic__tag-box">
          <span>Tags: </span> <span className="topic__tags">{type}</span>
          {
            parents.map(topic => {
            return <Link to={`/topic/${topic.id}`} key={topic.title} className="topic__tags"> 
              <Badge className="topic__badge" style={badgeStyle(topic.type)}>{' '}</Badge>
              {' ' + topic.title}
            </Link>
            })
          }
        </div>
      : <div>Type: <span className="topic__tags">{type}</span><br /></div>;

    const Topic = () => topic.title ?
      <div className="topic__container">
        
        <h1 className={langService.current}>{topic.title}</h1>
        <i>{topic.is_draft ? <p>draft</p> : ''}</i>

        <EditTopic owner={topic.owner.username} id={topic.id}/>
        <Tags /> <br /> 
        
        <div className={langService.current}>{ReactHtmlParser(mdConverter.makeHtml(topic.body))}</div> <br />
        <span>{topic.owner.username}</span>
        <br /><br /> 
      </div> 
      : null;

    const EditTopic = ({ owner, id }) => {
      const isOwner = user && (owner === user.username);
      
      return isOwner &&
        <Link to={'/edit/' + id + '/'} className="topic__edit"> <Button>Edit</Button></Link>;
    }
    
    return (
      <div className="main">
        <div className="topics__content-item" style={{display: 'block'}}>
          <NavLink to="/" className="topics__back">&#10094; Home</NavLink>

          <Topic />
          {
            topic.id && 
            <div ref="com_sec">
              <CommentForm
                create={this.create}
                edit={this.edit}
                clear={this.clear}
                text={this.state.comment_text}
                id={this.state.comment_id}
              />
            </div>
          }
          <Comments 
            comments={comments}
            startToEdit={this.startToEdit}
            reply={this.reply}
            remove={this.remove}
          />
          <Language />
          <Menu page='Menu'/>
        </div>
      </div>
    );
  }
}

export default Topic; 
