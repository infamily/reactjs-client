import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import langService from 'services/lang.service';
import serverService from 'services/server.service';
import serverImg from 'images/server.png';
import getMessages from './messages';
import './server_select.css';

const messages = getMessages(langService.current);

const getName = api => {
  const names = langService.getServers();
  const server = api.split('//')[1];
  const organization = api.split('inf.')[1];
  const name = organization || server;
  return names[name] || name;
};

class ServerButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      server: props.server
    };
  }

  static propTypes = {
    mobile: PropTypes.bool.isRequired,
    setServer: PropTypes.func.isRequired,
    signIn: PropTypes.func.isRequired,
    server: PropTypes.string.isRequired,
    userServerData: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  changeServer = api => {
    const { history } = this.props;

    const url = api.split('//')[1];
    history.push(`/${url}/@`);
  };

  render() {
    const servers = serverService.api_servers;
    const { mobile } = this.props;
    const { server } = this.state;

    const style = api => (server === api ? { backgroundColor: '#90B249' } : {});

    const Servers = () =>
      servers.map(api => (
        <MenuItem
          className="select-lang__link"
          key={api}
          eventKey={api}
          onSelect={this.changeServer}
        >
          <div className="server_select__bullet" style={style(api)}>
            {' '}
          </div>
          {` ${getName(api)}`}
        </MenuItem>
      ));
    const Icon = () => (
      <img src={serverImg} className="server_select__img" alt="server" />
    );

    return (
      <DropdownButton
        id="dropdown-server"
        className={mobile ? 'server_select__btn--mobile' : 'server_select__btn'}
        pullRight
        dropup
        bsSize={mobile ? 'small' : null}
        title={mobile ? <Icon /> : getName(server)}
      >
        <MenuItem>{messages.server}</MenuItem>
        <MenuItem divider />
        <Servers />
      </DropdownButton>
    );
  }
}

export default ServerButton;
