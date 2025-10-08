import { connect } from 'react-redux';
import ThreatsPage from 'components/pages/ThreatsPage';
import { getThreatsList } from 'actions/threats';

const mapStateToProps = (state) => ({
  threats: state.threats.list
});

const mapDispatchToProps = (dispatch) => ({
  getThreatsList: () => dispatch(getThreatsList())
});


export default connect(mapStateToProps, mapDispatchToProps)(ThreatsPage);
