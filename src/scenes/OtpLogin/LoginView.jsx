import React, { Component } from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import ifIcon from 'images/if.png';
import messages from './messages';

export default class LoginView extends Component {
  constructor() {
    super();
    this.state = { password: '' };
  }

  static propTypes = {
    view: PropTypes.string.isRequired,
    login: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    changePassword: PropTypes.func.isRequired
  };

  submit = () => {
    const { password } = this.state;
    this.props.login(password);
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  render() {
    const { password } = this.state;
    const { goBack } = this.props;

    if (this.props.view !== 'login') return null;

    return (
      <div>
        <Alert bsStyle="info" className="otp__alert">
          <FormattedHTMLMessage {...messages.otpHasBeenSent} />
        </Alert>
        <img src={ifIcon} className="otp__logo" alt="infinity" />
        <div className="center-block otp__box">
          <div>
            <div className="form-group">
              <FormattedMessage {...messages.otpPlaceholder}>
                {msg => (
                  <input
                    className="form-control otp__input"
                    value={password}
                    name="password"
                    type="password"
                    placeholder={msg}
                    autoComplete="off"
                    required
                    onChange={this.handleChange}
                  />
                )}
              </FormattedMessage>
            </div>
            <button className="primaryAction btn otp__btn" onClick={goBack}>
              <FormattedMessage {...messages.resend} />
            </button>
            <button className="btn btn-primary otp__btn" onClick={this.submit}>
              <FormattedMessage {...messages.submit} />
            </button>
          </div>
        </div>
      </div>
    );
  }
}
