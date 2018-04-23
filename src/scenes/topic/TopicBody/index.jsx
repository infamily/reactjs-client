import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Balance from 'components/Balance/Balance';
import UserBalance from 'components/Balance/UserBalance';
import TopicInfo from 'components/Balance/TopicInfo';
import { makeHtml } from 'services/common.services';
import configs from 'configs';
import { badgeStyle, getColor } from '../helpers/badge';
import Categories from './Categories';
import Tags from '../tags';

const TopicBody = ({
  topic,
  children,
  parents,
  user,
  categories,
  handleEditSection
}) => {
  if (!topic.title) return null;
  const isOwner = user && topic.owner.id === user.id;

  const EditTopic = ({ isOwner, id }) => {
    if (!isOwner) return null;
    return (
      <Link
        to={`${configs.linkBase()}/split/edit/${id}/`}
        className="topic__edit"
      >
        {' '}
        <Button>Edit</Button>
      </Link>
    );
  };

  const isSplit = window.location.href.includes('/split');
  const DraftTag = () =>
    topic.is_draft ? (
      <span className="topic__draft">
        <i>draft</i>
      </span>
    ) : (
      ''
    );

  return (
    <div className="topic__container">
      <EditTopic isOwner={isOwner} id={topic.id} />

      <h1>
        {isSplit ? (
          <Link to={`${configs.linkBase()}/topic/${topic.id}`}>
            {topic.title}
          </Link>
        ) : (
          <span>{topic.title}</span>
        )}
        <DraftTag />
      </h1>
      <TopicInfo
        type={configs.topic_types[topic.type]}
        hours={topic.matched}
        color={getColor(topic)}
      />
      <Categories categories={categories} />

      <Tags title="Parents" items={parents} />
      <div className="topic__body">{makeHtml(topic.body)}</div>
      <Tags title="Children" items={children} />

      <div className="topic__bottom">
        <div>
          <span>{topic.owner.username}</span>
          {isOwner ? (
            <UserBalance id={topic.owner.id} showQuota={false} />
          ) : (
            <Balance id={topic.owner.id} />
          )}
        </div>
      </div>
    </div>
  );
};

TopicBody.propTypes = {
  topic: PropTypes.object.isRequired,
  children: PropTypes.array.isRequired,
  parents: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  user: PropTypes.object
};

export default TopicBody;
