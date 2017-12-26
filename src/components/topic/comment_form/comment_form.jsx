import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormGroup, FormControl, ControlLabel, Button } from 'react-bootstrap';

import langService from '../../../services/lang.service';
import './comment_form.css';

class Comment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: props.text || '',
      editing: Boolean(props.id),
    }
  }

  static propTypes = {
    edit: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    clear: PropTypes.func.isRequired,
    text: PropTypes.string,
    user: PropTypes.object,
  };

  componentWillReceiveProps(nextProps) {
    const { text, id } = nextProps;
    if (text !== this.props.text) {
      this.setState({
        text: text || '',
        editing: Boolean(id),
      });
    }
  }

  componentDidMount() {
    this.props.text && this.refs.field.focus();
  }

  submitComment = e => {
    e.preventDefault();
    const { editing, text } = this.state;
    if (!text) return;
    
    editing
    ? this.props.edit(text)
    : this.props.create(text);

    this.setState({ text: '' });
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  } 

  render() {
    const { user, clear } = this.props;
    const { text, editing } = this.state;

    if (!user) return ( 
      <div className="comment__placeholder">
        <p><Link to="/page/otp">Sign in</Link> to leave a comment.</p>
      </div>
    );

    const comment_classes = "comment__text " + langService.current;

    return (
      <div className="comment__section">
        <form onSubmit={this.submitComment}>
          <FormGroup controlId="formControlsTextarea">
            <ControlLabel>Leave your comment</ControlLabel>
            <FormControl 
              componentClass="textarea"
              ref={(ip) => this.myInp = ip}
              className={comment_classes}
              rows="4"
              name="text" 
              value={text} 
              onChange={this.handleChange}
            />
          </FormGroup>
          { editing ?
            <div>
              <Button type="submit" >Edit</Button>
              <Button onClick={clear} bsSize="xsmall" className="comment__btn">Cancel</Button>
            </div>
            : <Button type="submit">Submit</Button>
          }
        </form>
      </div>
    );
  }
}

export default Comment; 
