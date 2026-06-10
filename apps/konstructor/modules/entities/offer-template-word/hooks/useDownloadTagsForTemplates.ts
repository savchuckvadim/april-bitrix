import { useCallback, useState } from "react";
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { wordTemplateAC } from "../model/WordTemplateSlice";
import { downloadTagsForTemplatesAPI } from "../lib/word-template-api";

export const useDownloadTagsForTemplates = () => {
    const dispatch = useAppDispatch();
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadTagsExample = useCallback(async () => {
        try {
            setIsDownloading(true);
            dispatch(wordTemplateAC.setError(null));
            await downloadTagsForTemplatesAPI();
        } catch (err) {
            dispatch(
                wordTemplateAC.setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to download tags example"
                )
            );
            throw err;
        } finally {
            setIsDownloading(false);
        }
    }, [dispatch]);

    return {
        downloadTagsExample,
        isDownloading,
    };
};
