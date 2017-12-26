import React, { Component } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { 
  FormGroup, 
  FormControl, 
  InputGroup,
  Button 
} from 'react-bootstrap';

import Topics from './topic_list';
import Menu from '../utils/menu';
import Language from '../utils/lang_select';
import Flag from '../utils/flag_toggle';

import topicService from '../../services/topic.service';
import langService from '../../services/lang.service';
import store_home from '../../store/home';
import './home.css';

class Home extends Component {
  constructor() {
    super();
    this.state = {
      search: langService.current,
      content: langService.homeContent(),
      page: store_home.home_page || 1,
      flag: store_home.flag || 0,
      query: '',
      topics: [],
      last_pack: [],
    }
  }

  componentWillMount() {
    const self = this;
    const { page, flag } = this.state;
    const { fromPage, topics } = topicService;

    fromPage === page && topics.length
    ?  self.setState({ topics })
    : topicService.setTopics(flag).then(topics => {
        self.setState({ topics, last_pack: topics });
      }); 
  }

  componentDidMount() {
    const scrollTo = store_home.home_scroll;
    scrollTo && window.scrollTo(0, scrollTo)
  }

  makeSearch = e => {
    e.preventDefault();
    const { query, flag } = this.state;
    const self = this;

    topicService.search(query, flag).then(topics => {
      self.setState({
        topics: topics,
        last_pack: topics,
        page: 1,
      });
    });
  }

  hasMore = () => {
    const { last_pack } = this.state;
    return last_pack.length >= 25;
  }

  loadMore = () => {
    const { page, topics, flag, last_pack } = this.state;
    const self = this;
    const next = page + 1;
    
    if (last_pack < 25) return;

    store_home.home_page = next;

    topicService.getPage(next, flag).then(newTopics => {
      const main_pack = topics.concat(newTopics);

      topicService.topics = main_pack;
      self.setState({
        topics: main_pack,
        last_pack: topics,
        page: next,
      });
    });
  }

  setFlag = key => {
    const self = this;
    const { flag } = this.state;
    
    store_home.flag = key;

    flag !== key &&
      topicService.setTopics(key).then(topics => {
        self.setState({
          flag: key,
          topics,
        });
      }); 
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    const { title, button } = this.state.content;
    const { flag } = this.state;
    const isVisible = this.hasMore && 'home--hidden';
    const hasMore = this.hasMore();
    const classes = 'topics__title '+this.state.search;

    return (
      <div className="main">
        <article className="topics"> 
          <div className="header">
            <h1 className={classes}>{title}</h1>

            <form onSubmit={this.makeSearch}>
              <FormGroup >
                <InputGroup>
                  <Flag setFlag={this.setFlag} flag={flag}/>
                  <FormControl type="search" name="query" value={this.state.query} onChange={this.handleChange} className={langService.current} />
                  <InputGroup.Button>
                    <Button type="submit">{button}</Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </form>

          </div> 
          <div className="topics__content">
          <InfiniteScroll
            pageStart={1}
            loadMore={this.loadMore}
            hasMore={hasMore}
            loader={<div className={isVisible}>Loading ...</div>}>
            <Topics topics={this.state.topics}/>
          </InfiniteScroll>
          </div>
          
          <Menu page='Home'/>
          <Language/>
        </article>
      </div>
    );
  }
}

export default Home;
