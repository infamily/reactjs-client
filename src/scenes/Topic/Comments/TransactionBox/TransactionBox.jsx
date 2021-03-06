import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel,
  InputGroup,
  Modal
} from 'react-bootstrap';
import Select from 'react-select';
import PayCheckout from 'components/PayCheckout';
import commentService from 'services/comment.service';
import transactionService from 'services/transaction.service';
import serverService from 'services/server.service';
import { getUserBalance } from 'services/user.service';
import ProgressBar from 'components/TopicProgressBar';
import { FormattedMessage } from 'react-intl';
import messages from 'scenes/Topic/messages';
import './TransactionBox.css';

export default class TransactionBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      payment_amount: props.comment.remains,
      payment_inCurrency: props.comment.remains,
      symbol: 'HUR',
      payment_currency: '2',
      currency: 'HUR',
      in_hours: 1,
      currencies: [],
      message: '',
      userQuota: 0,
      creditBar: false
    };
  }

  static propTypes = {
    user: PropTypes.object,
    investState: PropTypes.func.isRequired,
    setBalance: PropTypes.func.isRequired,
    updateComments: PropTypes.func.isRequired,
    state: PropTypes.bool.isRequired,
    comment: PropTypes.object.isRequired
  };

  async componentWillMount() {
    const { user, comment } = this.props;
    const isPayment = await serverService.getPaymentAuthorization();
    const data = await transactionService.getCurrencies();
    const balance = await getUserBalance(user.id);
    const currencies = data.map(item => {
      item.value = item.label;
      return item;
    });

    this.setState({
      userQuota: balance.data.credit,
      isPayment
    });

    const payment_amount = this.checkQuota(comment.remains);
    this.setState({ currencies, payment_amount });
    this.selectCurrency(currencies[0]);
  }

  makeTransaction = async () => {
    const { user, comment } = this.props;
    const { payment_currency, payment_amount } = this.state;
    const message = payment_amount < 0 ? 'invalidHours' : '';

    this.setState({ message });
    if (payment_amount < 0) return;

    const data = { payment_currency, payment_amount };

    this.close();
    await transactionService.createTransaction(data, comment, user);
    const updated = await commentService.getComment(comment.id);
    this.props.updateComments(updated);
    const balance = await getUserBalance(user.id);
    this.props.setBalance(balance.data); // update global store
  };

  selectCurrency = item => {
    const { payment_amount } = this.state;
    const { value, id, in_hours } = item;
    const payment_inCurrency = this.inCurrency(payment_amount, in_hours);

    if (item)
      this.setState({
        currency: value,
        payment_currency: id,
        symbol: value,
        in_hours,
        payment_inCurrency
      });
  };

  handleChange = e => {
    const { in_hours } = this.state;
    const { value } = e.target;
    const checked = this.checkQuota(value);
    const payment_inCurrency = this.inCurrency(checked, in_hours);

    this.setState({
      [e.target.name]: checked,
      payment_inCurrency
    });
  };

  checkQuota(value) {
    const { userQuota } = this.state;
    const isQuota = userQuota > value;
    const message = isQuota ? '' : 'quotaOver';
    const aboveNull = value > 0 ? value : 0;

    this.setState({
      message,
      creditBar: !isQuota
    });

    return isQuota ? aboveNull : userQuota;
  }

  close = () => {
    this.props.investState({}, window.scrollY);
  };

  inCurrency = (value, in_hours) => (value / in_hours).toFixed(2);

  render() {
    const { comment, state } = this.props;
    const {
      currencies,
      currency,
      payment_amount,
      payment_inCurrency,
      symbol,
      userQuota,
      creditBar,
      message,
      isPayment
    } = this.state;

    const Bar = () => {
      const invest = parseFloat(payment_amount);
      return <ProgressBar comment={comment} invest={invest} />;
    };

    const CreditBar = () =>
      isPayment && (
        <PayCheckout
          ButtonComponent={() => (
            <Button
              className="transaction__credit"
              bsStyle="success"
              bsSize="large"
              block
            >
              <FormattedMessage {...messages.buy} />
            </Button>
          )}
        />
      );

    return (
      <Modal show={state} className="transaction__modal">
        <Modal.Header>
          <Modal.Title>
            <FormattedMessage {...messages.receiver} /> {comment.owner.username}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Bar />
          <FormGroup controlId="formControlsSelect">
            <ControlLabel>
              <FormattedMessage {...messages.amount} />
            </ControlLabel>
            <InputGroup>
              <InputGroup.Addon>HUR</InputGroup.Addon>
              <FormControl
                type="number"
                name="payment_amount"
                value={payment_amount}
                onChange={this.handleChange}
              />
              <InputGroup.Addon>{symbol}</InputGroup.Addon>
              <FormControl
                type="number"
                name="payment_inCurrency"
                value={payment_inCurrency}
                disable="true"
                readOnly
              />
            </InputGroup>
          </FormGroup>
          <div className="transaction__quota">
            <small>
              <FormattedMessage {...messages.remaining} />{' '}
              <strong>
                {userQuota}{' '}
                <FormattedMessage
                  {...messages.countableHours}
                  values={{ count: userQuota }}
                />
              </strong>
            </small>
          </div>
          <FormGroup controlId="formControlsSelect">
            <ControlLabel>
              <FormattedMessage {...messages.currency} />
            </ControlLabel>
            <Select
              name="currency"
              clearable={false}
              resetValue={currencies[0]}
              value={currency}
              options={currencies}
              onChange={this.selectCurrency}
            />
          </FormGroup>
          {creditBar && <CreditBar />}
        </Modal.Body>
        <Modal.Footer>
          <span className="transaction__error">
            {message && <FormattedMessage {...messages[message]} />}
          </span>
          <Button onClick={this.makeTransaction}>
            <FormattedMessage {...messages.invest} />
          </Button>
          <Button onClick={this.close}>
            <FormattedMessage {...messages.close} />
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
