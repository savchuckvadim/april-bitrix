import { FC, useEffect } from 'react';
import { EVCard } from '@workspace/april-ui';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { serviceSignalActions } from '../../model/ServiceSignalSlice';
import CheckList from './CheckList/CheckList';
import { useApp } from '@/modules/app/lib/hooks/app';
import { BBCodeRenderer } from '@/modules/shared/BBCode';

export interface ServiceSignalReportProps {
    type: 'info' | 'all' | 'checkList';
    withClose?: boolean;
}

const ServiceSignalReport: FC<ServiceSignalReportProps> = ({ type = 'info', withClose = true }) => {
    const { fitApp } = useApp();
    useEffect(() => {
        fitApp();
    }, []);
    const dispatch = useAppDispatch();
    const task = useAppSelector(state => state.eventTask.current);

    const close = () => dispatch(serviceSignalActions.setActiveStatus({ status: false }));

    function escapeRegExp(str: string) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function cutAfterPhrase(text: string, phrase: string) {
        const regex = new RegExp(escapeRegExp(phrase) + '.*$', 's');
        return text.replace(regex, '');
    }

    let shortDescription =
        task && task.description
            ? cutAfterPhrase(task.description, '[COLOR=#f00000][B]Не забудьте')
            : '';
    shortDescription = shortDescription ? cutAfterPhrase(shortDescription, 'Не забудьте') : '';

    return (
        <div className="w-full p-0">
            <EVCard
                tooltipTitle={<BBCodeRenderer text={shortDescription} />}
                title={task && task.title ? task.title : 'Отчет Сервисный Сигнал Гарант'}
                width={12}
                size="large"
                withClose={withClose}
                isClose={false}
                closeAction={close}
            >
                <CheckList type={type} />
            </EVCard>
        </div>
    );
};

export default ServiceSignalReport;
