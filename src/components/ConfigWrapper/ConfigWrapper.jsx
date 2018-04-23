import React, { Component } from 'react';
import PropTypes from 'prop-types';
import langService from 'services/lang.service';
import serverService from 'services/server.service';
import Loading from 'components/Loading';
import configs from 'configs';

export default class ConfigWrapper extends Component {
  constructor() {
    super();
    this.state = { loading: true, serverName: 'the server' };
  }

  static propTypes = {
    setServer: PropTypes.func.isRequired,
    signIn: PropTypes.func.isRequired,
    userServerData: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
    server: PropTypes.string
  };

  async componentWillMount() {
    await this.setParams();
    this.setLoading(false);
  }

  async componentWillReceiveProps(nextProps) {
    const getConfigs = props => props.match.params.configs;

    // check for new configs
    const nextConfigs = getConfigs(nextProps);
    if (getConfigs(this.props) !== nextConfigs) {
      this.setLoading(true);
      await this.setParams(nextConfigs);
    }
  }

  setParams = async (nextConfigs = null) => {
    const {
      match,
      history,
      setServer,
      signIn,
      userServerData,
      server
    } = this.props;
    const params = nextConfigs || match.params.configs; // get configs
    const [serverName, lang] = params.split(':');
    this.setState({ serverName });

    // check configs
    const prevAPI = server;
    const newURL = await serverService.changeServerByLink(serverName);
    const API = serverService.api;

    // no valid serverName
    if (!newURL && !API) {
      history.push('/'); // get the nearest serverName (DefaultWrapper)
      return;
    }

    // provided invalid server
    if (!newURL && API) {
      const link = `${configs.linkBase()}/no-server?server=${serverName}`;
      history.push(link); // show NoServer page
      return;
    }

    // new API is provided
    if (newURL && prevAPI !== API) {
      setServer(newURL); // set configs
    }

    // switch user authorization data
    const serverData = userServerData[API] || null;
    signIn(serverData);

    // set language
    await this.checkLanguage(lang);

    if (newURL && nextConfigs) {
      this.setLoading(true);
      window.location.reload(false);
    }
  };

  setLoading = bool => {
    this.setState({ loading: bool });
  };

  checkLanguage = async lang => {
    if (!lang) {
      const { history } = this.props;
      history.replace(configs.linkBase());
    } else {
      await langService.changeLangByLink(lang);
    }
  };

  render() {
    if (this.state.loading || !this.props.server) {
      return <Loading text={`Connecting ${this.state.serverName}...`} />;
    }

    return <div>{this.props.children}</div>;
  }
}