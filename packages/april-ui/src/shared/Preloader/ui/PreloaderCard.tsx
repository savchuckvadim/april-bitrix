import { FC } from 'react';
import { Gradient } from './components/Backgrounds/Gradient';
import EVCard from '../../ui/Cards/EventEntityCard/EventCard';

const PreloaderCard: FC<{ isNeedScroll?: boolean }> = ({ isNeedScroll }) => {
    return (
        <EVCard title={''} width={12}>
            <div className="w-full">
                <Gradient
                    isComponent={true}
                    isNeedScroll={isNeedScroll}
                    isActive={true}
                    white
                    phrase={'Загрузка . . .'}
                />
            </div>
        </EVCard>
    );
};

export default PreloaderCard;
