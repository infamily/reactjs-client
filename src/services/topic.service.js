import langService from './lang.service';
import serverService from './server.service';

const getParams = (flag, view) => {
  const f = flag || '';
  var params = `lang=${langService.current}&type=${f}&type__not=0`;
  if (view) {
    params += `&parents__isnull=${view}`;
  }
  return params;
};

const logger = err => {
  console.log(err);
};

class TopicService {
  constructor() {
    this.topics = [];
    this.fromPage = 0;
  }

  async getTopics(flag, view) {
    const { data, error } = await serverService.get(
      `/topics/?${getParams(flag, view)}`
    );
    if (data) {
      this.topics = data.results;
      this.fromPage = 1;
      return data.results;
    } else {
      logger(error);
    }
  }

  async getPage(page, flag, view) {
    const { data, error } = await serverService.get(
      `/topics/?page=${page}&${getParams(flag, view)}`
    );
    if (data) {
      this.fromPage = page;
      this.topics = data.results;
      return data.results;
    } else {
      logger(error);
    }
  }

  async search(query, flag, view) {
    const { data, error } = await serverService.get(
      `/topics/?search=${query}&${getParams(flag, view)}`
    );
    if (data) {
      this.topics = data.results;
      return data.results;
    } else {
      logger(error);
    }
  }

  resetState = () => {
    topicService.fromPage = null;
    topicService.topics = [];
  };
}

const topicService = new TopicService();
export default topicService;
