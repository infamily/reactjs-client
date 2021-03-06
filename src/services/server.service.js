import axios from 'axios';

class ServerService {
  constructor() {
    this.api = null;
    this.paymentAuthorization = null;

    // this.api_servers = [
    //   'https://wefindx.io',
    //   'https://inf.wefindx.com',
    //   'https://inf.globalmindshare.org'
    // ];

    this.api_servers = [`https://${process.env.REACT_APP_API_SERVER}`];

    this.getDefault();
  }

  getDefault = async () => {
    const raw = localStorage.state_if;
    let server = this.api_servers[0];

    // let server = raw && JSON.parse(raw).server;
    // server = await this.changeServerByLink(server);

    // if (!server) {
    //   server = await this.getFastest();
    // }

    this.isLocal(); // add local server in sandbox mode
    this.setDefault(server);
  };

  isLocal = () => {
    let isLocal = false;

    try {
      isLocal = window.location.hostname === 'localhost';
    } catch (error) {
      isLocal = false;
    }

    const server = 'http://0.0.0.0:8000';
    const isIncluded = this.api_servers.indexOf(server) > -1;
    if (isLocal && !isIncluded) this.api_servers.push(server);
  };

  getFastest = async () => {
    const promises = this.api_servers.map(api => this.getResponse(api));
    const first = await Promise.race(promises);
    return first;
  };

  getResponse = async api => {
    await axios.get(`${api}/signature/`);
    return api;
  };

  changeServer(server) {
    const index = this.api_servers.indexOf(server);
    if (index < 0) return;
    this.setDefault(server);
  }

  changeServerByLink = async server => {
    if (!server) return null;
    const url = server.includes('https') ? server : `https://${server}`;

    // check if is known
    // const index = this.api_servers.indexOf(url);
    // if (index > -1) {
    //   this.setDefault(url);
    //   return url;
    // }

    // check if is valid
    const isValidServer = await this.checkIsServerAvailable(url);
    if (isValidServer) {
      this.setDefault(url);
      return url;
    }

    // check if is organization
    const organizationServer = await this.checkOrganization(server);
    if (organizationServer) {
      this.setDefault(organizationServer);
      return organizationServer;
    }

    return null;
  };

  async checkOrganization(server) {
    const url = `https://inf.${server}`;
    const isValidServer = await this.checkIsServerAvailable(url);
    const link = isValidServer ? url : null;
    return link;
  }

  checkIsServerAvailable = async url => {
    const noToken = axios.create();
    try {
      const { data } = await noToken.get(`${url}/signature/`);
      const isInfinity = data && data.service === 'infinity';

      return isInfinity;
    } catch (error) {
      return null;
    }
  };

  setDefault = server => {
    this.api = server;
    this.paymentAuthorization = null;
  };

  getPaymentAuthorization = async () => {
    if (this.paymentAuthorization === null) {
      // this.paymentAuthorization = await this.get('/get-url');
      return true;
    }

    return this.paymentAuthorization;
  };

  get = async url => {
    try {
      const { data } = await axios.get(this.api + url);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };
}

const serverService = new ServerService();
export default serverService;
