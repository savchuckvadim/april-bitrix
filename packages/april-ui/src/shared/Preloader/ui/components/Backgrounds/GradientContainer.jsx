import { connect } from "react-redux"
import Gradient from "./Gradient"



const mapStateToProps = (state, ownProps) => {

    return{
        isResized: state.app.isResized,
        isActive: ownProps.isActive
       
    }
}

export default connect(mapStateToProps,{
    
})(Gradient)