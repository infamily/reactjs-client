import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { setServer } from 'actions/server';
import { signIn } from 'actions/user';
import ConfigWrapper from './ConfigWrapper';

function mapStateToProps(state) {
  return {
    server: state.server,
    userServerData: state.userServerData
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setServer: api => dispatch(setServer(api)),
    signIn: user => dispatch(signIn(user))
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConfigWrapper)
);
