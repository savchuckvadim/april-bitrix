import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { initializeWordTemplates, wordTemplateAC } from "../model";
import { useCallback, useEffect } from "react";


export const useWordTemplatePage = () => {
    const dispatch = useAppDispatch();
    const { isSettingsOpen, isInitialized, isLoading } = useAppSelector(state => state.offerTemplateWord);

    const initialize = useCallback(() => {
        dispatch(initializeWordTemplates());
        dispatch(wordTemplateAC.setSettingsOpen(true));
    }, [dispatch]);


    useEffect(() => {
        if (!isSettingsOpen) {
            initialize();
        }
    }, [initialize]);
    return {
        isSettingsOpen,
        initialize,
        isInitialized,
        isLoading
    };
};
