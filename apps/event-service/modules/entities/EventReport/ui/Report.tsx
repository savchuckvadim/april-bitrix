import { FC } from 'react';
import Noresult from './components/Noresult/Noresult';
import Result from './components/Result/Result';
import { useReport } from '../lib/hooks/use-report';

interface ReportProps {
    isNoResult: boolean;
}

const Report: FC<ReportProps> = ({ isNoResult }) => {
    const { report, handleChange } = useReport();

    return !isNoResult ? (
        <Result report={report} handleChange={handleChange} />
    ) : (
        <Noresult report={report} handleChange={handleChange} />
    );
};

export default Report;
