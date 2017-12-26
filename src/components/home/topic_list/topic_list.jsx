import React, { Component } from 'react';
import { Badge, Button, ButtonGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import store_home from '../../../store/home'; 
import configs from '../../../configs'; 
import './topic_list.css'; 
import langService from '../../../services/lang.service';

class Topics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      topics: props.topics
    }
  }

  static propTypes = {
    topics: PropTypes.array.isRequired,
    user: PropTypes.object
  };

  componentWillReceiveProps(nextProps) {
    if (this.state.topics !== nextProps.topics){
      this.setState({
        topics: nextProps.topics
      });
    }
  }
  
  saveScroll() {
    store_home.home_scroll = window.scrollY; 
  }

  render() {
    const { colors } = configs;
    const { user } = this.props;
    const { topics } = this.state;
    
    const badgeStyle = type => { return { 
      backgroundColor: colors[type]
    }};

    const draftStyle = topic => { 
      if (!topic.is_draft) return '';
      if (!user) return 'topic_list__hide';

      const isOwner = topic.owner.username === user.username;
      return isOwner ? 'topic_list__draft' : 'topic_list__hide';
  };

    const EditTopic = ({ owner, id }) => {
      const isOwner = user && (owner === user.username);
      
      return isOwner
        ? <ButtonGroup className="topic_list__edit">
          <Link to={"/edit/" + id + "/"}>
            <Button bsSize="xsmall" className="topic_list__btn">&#9998;</Button>
          </Link>
        </ButtonGroup> 
        : null;
    }

    const List = () =>
      topics.map(topic => {

        return (
          <section className={"topics__item " + draftStyle(topic) + " " + langService.current} key={topic.id}>
            <EditTopic owner={topic.owner.username} id={topic.id} />
            <Link to={'/topic/' + topic.id} onClick={this.saveScroll} className="topics__item-title" data-id={topic.id}>
              <h2>
                <Badge className="home__type" style={badgeStyle(topic.type)}>
                  {' '}
                </Badge> {topic.title}</h2>
            </Link>
          </section>
        )
      });

    return (
      <div className="topics__list">
        <List />
      </div>
    );
  }
}

export default Topics;
