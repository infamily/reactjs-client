import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Cards from 'react-credit-cards';
import Modal from 'components/Modal';
import LoadingElements from 'components/Loading/LoadingElements';
import SignInLine from 'components/SignInLine';
import { getUserBalance } from 'services/user.service';
import 'react-credit-cards/es/styles-compiled.css';
import messages from './messages';
import Payment from './Payment';
import {
  formatCreditCardNumber,
  formatCVC,
  formatExpirationDate,
  defaultState
} from './helpers';
import { postPayment } from './services';
import './PayCheckout.css';

export default class PayCheckout extends Component {
  constructor() {
    super();
    this.state = { isOpen: false, buttonText: '', ...defaultState };
  }

  static defaultProps = {
    topicUrl: '',
    updateOuterData: null,
    user: null
  };

  static propTypes = {
    ButtonComponent: PropTypes.func.isRequired,
    topicUrl: PropTypes.string,
    history: PropTypes.object.isRequired,
    setBalance: PropTypes.func.isRequired,
    user: PropTypes.object,
    updateOuterData: PropTypes.func
  };

  showMessage = buttonText => {
    this.setState({ buttonText });
    setTimeout(() => {
      this.setState({ buttonText: '' });
    }, 3000);
  };

  handleOpen = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }));
  };

  handleCallback = ({ issuer }, isValid) => {
    if (isValid) {
      this.setState({ issuer });
    }
  };

  handleInputFocus = ({ target }) => {
    this.setState({ focused: target.name });
  };

  handleInputChange = ({ target }) => {
    if (target.name === 'number') {
      target.value = formatCreditCardNumber(target.value);
    } else if (target.name === 'expiry') {
      target.value = formatExpirationDate(target.value);
    } else if (target.name === 'cvc') {
      target.value = formatCVC(target.value);
    }

    this.setState({
      [target.name]: target.value
    });
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.setState({ loading: true });
    const { topicUrl, updateOuterData } = this.props;
    const response = await postPayment(this.state, 1, topicUrl); // 1 = stripe

    if (response.data) {
      const { user } = this.props;
      const { data } = await getUserBalance(user.id);
      this.props.setBalance(data); // update global store

      this.setState({ ...defaultState });
      this.form.reset();
      this.handleOpen();
      if (updateOuterData) updateOuterData(response.data);
    } else {
      this.setState({ loading: false });
      this.showMessage(
        response.error.message || <FormattedMessage {...messages.serverError} />
      );
    }
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  render() {
    const { ButtonComponent, user } = this.props;

    const { isOpen, currency, amount, buttonText } = this.state;
    const ButtonText = () =>
      buttonText || (
        <span className="pay_checkout__pay">
          <FormattedMessage {...messages.pay} /> {amount || 0} {currency}
        </span>
      );

    return (
      <div>
        <Modal isOpen={isOpen} close={this.handleOpen}>
          <div className="pay_checkout__box">
            <Cards
              number={this.state.number}
              name={this.state.name}
              expiry={this.state.expiry}
              cvc={this.state.cvc}
              focused={this.state.focused}
            />
            <br />
          </div>
          <form
            ref={c => {
              this.form = c;
            }}
            onSubmit={this.handleSubmit}
          >
            <div className="form-group">
              <FormattedMessage {...messages.card}>
                {msg => (
                  <input
                    type="tel"
                    name="number"
                    value={this.state.number}
                    className="form-control"
                    placeholder={msg}
                    pattern="[\d| ]{16,22}"
                    required
                    onChange={this.handleInputChange}
                    onFocus={this.handleInputFocus}
                  />
                )}
              </FormattedMessage>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group">
                  <FormattedMessage {...messages.name}>
                    {msg => (
                      <input
                        type="text"
                        name="name"
                        value={this.state.name}
                        className="form-control"
                        placeholder={msg}
                        required
                        onChange={this.handleInputChange}
                        onFocus={this.handleInputFocus}
                      />
                    )}
                  </FormattedMessage>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form-group">
                  <FormattedMessage {...messages.date}>
                    {msg => (
                      <input
                        type="tel"
                        name="expiry"
                        value={this.state.expiry}
                        className="form-control"
                        placeholder={msg}
                        pattern="\d\d/\d\d"
                        required
                        onChange={this.handleInputChange}
                        onFocus={this.handleInputFocus}
                      />
                    )}
                  </FormattedMessage>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group">
                  <FormattedMessage {...messages.cvc}>
                    {msg => (
                      <input
                        type="tel"
                        name="cvc"
                        value={this.state.cvc}
                        className="form-control"
                        placeholder={msg}
                        pattern="\d{3,4}"
                        required
                        onChange={this.handleInputChange}
                        onFocus={this.handleInputFocus}
                      />
                    )}
                  </FormattedMessage>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form-group">
                  <FormattedMessage {...messages.zip}>
                    {msg => (
                      <input
                        type="tel"
                        name="zip"
                        value={this.state.zip}
                        className="form-control"
                        placeholder={msg}
                        required
                        onChange={this.handleInputChange}
                        onFocus={this.handleInputFocus}
                      />
                    )}
                  </FormattedMessage>
                </div>
              </div>
            </div>
            <Payment
              amount={this.state.amount}
              description={this.state.description}
              currency={this.state.currency}
              handleChange={this.handleChange}
            />
            <input type="hidden" name="issuer" value={this.state.issuer} />
            {user ? (
              <div className="form-actions">
                <button className="btn btn-primary btn-block">
                  {this.state.loading ? (
                    <LoadingElements size={20} />
                  ) : (
                    <ButtonText />
                  )}
                </button>
              </div>
            ) : (
              <div className="pay_checkout__signin">
                <SignInLine text={<FormattedMessage {...messages.toFund} />} />
              </div>
            )}
          </form>
        </Modal>
        <div onClick={this.handleOpen}>
          <ButtonComponent />
        </div>
      </div>
    );
  }
}
