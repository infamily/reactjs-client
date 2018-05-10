import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PayCheckout from 'components/PayCheckout';
import { Button } from 'components/Layout';
import { makePreviewHtml } from 'services/common.services';
import PreviewTopicBar from 'components/TopicProgressBar/PreviewTopicBar';
import topicService from 'services/topic.service';
import moment from 'moment';
import configs from 'configs';
import './TopicCard.css';

const makeHexDim = (inputHex, opacity) => {
  const hex = inputHex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const result = `rgba(${r},${g},${b},${opacity / 100})`;
  return result;
};
const getTopicLink = id => `${configs.linkBase()}/split/topic/${id}`;
const getColor = type => configs.colors[type];
const getTitleStyle = color => ({
  borderLeft: `3px solid ${makeHexDim(color, 85)}`
});

export default class TopicCard extends Component {
  constructor(props) {
    super(props);
    this.state = { topic: props.topic };
  }

  goToTopic = e => {
    e.stopPropagation();
    const { history } = this.props;
    const {
      topic: { id }
    } = this.state;
    history.push(getTopicLink(id));
  };

  updateData = async () => {
    const { id } = this.state.topic;
    const newTopic = await topicService.getTopic(id);
    this.setState({ topic: newTopic });
  };

  render() {
    const { topic } = this.state;
    const { title, body, type, created_date, funds, url } = topic;
    const color = getColor(type);
    const time = moment(created_date).format('MMMM Do YYYY');

    const hours = parseFloat(parseFloat(funds).toFixed(2));
    return (
      <div className="card__item" style={getTitleStyle(color)}>
        <div className="card__title" onClick={this.goToTopic}>
          <h4 className="card__title-text">{title}</h4>
        </div>
        <div className="card__data">
          <PayCheckout
            topicUrl={url}
            updateOuterData={this.updateData}
            ButtonComponent={() => (
              <div>
                <small className="card__data__hours">{hours}h</small>
                <Button
                  className="card__data__btn"
                  bsStyle="warning"
                  bsSize="xsmall"
                >
                  Fund
                </Button>
              </div>
            )}
          />
        </div>
        <div className="card__description" onClick={this.goToTopic}>
          <div className="card__text">{makePreviewHtml(body)}</div>
          <br />
          <small>{time}</small>
        </div>
        <PreviewTopicBar topic={topic} />
      </div>
    );
  }
}

TopicCard.propTypes = {
  topic: PropTypes.object.isRequired
};
