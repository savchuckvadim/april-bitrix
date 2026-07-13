import { FC } from 'react';
import LogoSVG from './LogoSVG';

const Logo: FC<{}> = () => {
    return (
        <div className="flex items-center">
            <LogoSVG />
        </div>
    );
};

export default Logo;
