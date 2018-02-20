import React, { Component } from 'react';
import langService from 'services/lang.service';
import serverService from 'services/server.service';

export default class ConfigRoute extends Component {

  async componentWillMount() {
    const { match, setServer, signIn, userServerData } = this.props;
    const { server, lang } = match.params; // get configs
    
    // set configs
    const serverNum = serverService.changeServerByLink(server);
    serverNum && setServer(serverNum);
    await langService.changeLangByLink(lang);

    // switch user data
    const serverData = userServerData[serverService.api] || null;
    signIn(serverData);
  }
  
  render() {
    return <div>{this.props.children}</div>;
  }
}