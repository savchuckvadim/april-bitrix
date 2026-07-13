import { FC } from 'react';
import { ABadge } from '@workspace/april-ui';

interface NavigationProps {
    items: Array<{
        name: string;
        code: string;
        redirect: () => void;
    }>;
    current: string;
}

const Navigation: FC<NavigationProps> = ({ items, current }) => {
    return (
        <div className="flex items-center">
            {items.map((item, i) => (
                <div key={`ss-navigation-item-${item.code}`} className={i ? 'ms-2' : ''}>
                    <ABadge
                        title={item.name}
                        clickHendler={item.redirect}
                        isActive={item.code == current}
                        color="april"
                        size="xsmall"
                    />
                </div>
            ))}
        </div>
    );
};

export default Navigation;
