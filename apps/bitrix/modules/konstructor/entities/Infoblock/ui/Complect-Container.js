import { connect } from 'react-redux';
import ComplectsButtons from './DocumentInfoblock';
import { createComplect } from '../../../../redux/reducers/complect/current-complect-reducer';

let mapStateToProps = state => {
    return {
        currentComplect: state.currentComplect,
        currentComplectsType:
            state.global.currentComplectsType &&
            state.global.currentComplectsType.title,
        // currentSupplyName: state.global.currentSupply && state.global.currentSupply.title,
        // currentRegion: state.global.currentRegion && state.global.currentRegion.title,
        profs: state.profs,
        universals: state.universals.complects, //state with universal complects and universal currentComplect
    };
};

let mapDispatchToProps = dispatch => {
    return {
        createComplect: (defaultComplect, index) => {
            dispatch(createComplect(defaultComplect, index)); //диспатч Санки (thunk from currentComplect)
        },
    };
};
const ComplectsContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ComplectsButtons);
export default ComplectsContainer;
