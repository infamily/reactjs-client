import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, Button } from 'react-bootstrap';
import Transaction from './transaction';
import ProgressBar from './progress_bar';
import langService from '../../../services/lang.service';

import ReactHtmlParser from 'react-html-parser';
import showdown from 'showdown';
var mdConverter = new showdown.Converter();

export default class Comments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: props.comments,
      transaction: false,
      invest_comment: {},
    }
  }

  static propTypes = {
    user: PropTypes.object,
    comments: PropTypes.array.isRequired,
    startToEdit: PropTypes.func.isRequired,
    reply: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
  }; 
  
  componentWillReceiveProps(nextProps) {
    this.props.comments !== nextProps.comments &&
    this.setState({
      comments: nextProps.comments
    });
  }

  investState = (comment) => {
    this.setState(prevState => ({
      transaction: !prevState.transaction,
      invest_comment: comment
    }));
  }

  updateComments = (comment) => {
    const { comments } = this.state;
    const updatedList = comments.map(item => {
      return item.id === comment.id ? comment : item;
    });

    this.setState({
      comments: updatedList
    });
  }

  render() {
    const { user } = this.props;
    const { comments, transaction, invest_comment } = this.state;
    
    const Buttons = ({ id, owner, remains, comment }) => {
      return user && (
        <ButtonGroup bsSize="xsmall">
          {
            user.pk === owner.id
              ? <ButtonGroup bsSize="xsmall">
                  <Button onClick={() => this.props.startToEdit(id)}>&#9998;</Button>
                  <Button onClick={() => this.props.remove(id)}>&#10006;</Button>
                </ButtonGroup>
              : <ButtonGroup bsSize="xsmall">
                  <Button onClick={() => this.props.reply(owner.username)}>Reply</Button>
                  {
                    Boolean(remains) 
                    ? <Button onClick={() => this.investState(comment)}>Invest {remains}$h</Button> 
                    : null
                  }
                </ButtonGroup>
          }
        </ButtonGroup>
      );
    }
    
    const Comments = () => comments.map(comment => {
      const { 
        id, 
        text, 
        owner,
        claimed_hours,
        assumed_hours,
        remains
      } = comment;

      const content = ReactHtmlParser(mdConverter.makeHtml(text));

      const Progress = () => (claimed_hours || assumed_hours) ?
        <ProgressBar comment={comment} />
        : null;

      return (
        <div key={id} className="comment__section">
          <div className={langService.current}>{content}</div>
          <Progress />
          <Buttons owner={owner} id={id} remains={remains} comment={comment}/>

          <div className="comment__owner">
            <span>{owner.username}</span>
          </div>
        </div>
      );
    });

    if (comments.length) {
     return (
        <div>
          <h3>Comments</h3>
          <Comments/>
          {
           transaction &&
           <Transaction
             state={transaction}
             comment={invest_comment}
             investState={this.investState}
             updateComments={this.updateComments}
           />
          }
        </div>
      );
    } else {
      return null;
    }
  }
}
