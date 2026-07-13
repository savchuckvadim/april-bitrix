// import './Preloader.css'
import Logo from '../../ui/Logo/Logo'
import Gradient from '../../ui/Backgrounds/Gradient'
import GradientContainer from '../../ui/Backgrounds/GradientContainer'

export const PreloaderComponent = ({ currentRoute }) => {

    return (
        <GradientContainer
            isComponent={true}
            currentRoute={currentRoute}
            isActive={true}>
            <Logo />
        </GradientContainer>
    )
}
// export default PreloaderComponent