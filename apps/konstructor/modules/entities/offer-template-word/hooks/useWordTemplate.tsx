import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useState, useCallback } from "react";
import { wordTemplateAC } from "../model/WordTemplateSlice";
import {
    WordTemplate,
    UpdateWordTemplateRequest,
    WordTemplateQueryParams,
    WordTemplateIdParams,
    WordTemplatePortalIdParams,
    WordTemplateUserPortalParams,
    WordTemplateSummary,
    CreateWordTemplateThunkDto,
} from "../types/word-template-types";
import {
    fetchAllWordTemplates,
    fetchPublicWordTemplates,
    fetchWordTemplatesByPortal,
    fetchUserWordTemplates,
    fetchWordTemplateById,
    updateWordTemplateAPI,
    setWordTemplateActiveAPI,
    setWordTemplateDefaultAPI,
    downloadWordTemplateAPI,
} from "../lib/word-template-api";
import { setUserCurrentWordTemplateThunk } from "../model/thunks/word-template-set-current-thunk";
import { setUserFavoriteWordTemplate } from "../model/thunks/word-template-set-favorite-thunk";
import { deleteWordTemplateThunk } from "../model/thunks/word-template-delete-thunk";
import { initializeWordTemplates } from "../model";
import { clearWordTemplatePdfPreviewThunk } from "../model/thunks/word-template-preview-thunk";
import { createWordTemplateThunk } from "../model/thunks/word-template-create-thunk";
import { useWordTemplatePdfPreview } from "./useWordTemplatePdfPreview";

export const useWordTemplate = () => {
    const dispatch = useAppDispatch();
    const preview = useWordTemplatePdfPreview();

    // Redux state
    const isSuperUser = useAppSelector(state =>
        Boolean((state.app as { isSuperUser?: boolean }).isSuperUser),
    );
    const userId = useAppSelector(state => Number(state.app.bitrix.user?.ID) || 0);
    const portalId = useAppSelector(state => state.portal.current?.id);

    const templates = useAppSelector(state => state.offerTemplateWord.templates);
    const publicTemplates = useAppSelector(state => state.offerTemplateWord.publicTemplates);
    const userTemplates = useAppSelector(state => state.offerTemplateWord.userTemplates);
    const portalTemplates = useAppSelector(state => state.offerTemplateWord.portalTemplates);
    const currentTemplate = useAppSelector(state => state.offerTemplateWord.currentTemplate);
    const selectedTemplate = useAppSelector(state => state.offerTemplateWord.selectedTemplate);
    const favorites = useAppSelector(state => state.offerTemplateWord.favorites);
    const isLoading = useAppSelector(state => state.offerTemplateWord.isLoading);
    const isFetched = useAppSelector(state => state.offerTemplateWord.isFetched);
    const error = useAppSelector(state => state.offerTemplateWord.error);
    const isDeleting = useAppSelector(state => state.offerTemplateWord.isDeleting);
    // Local state
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);


    const getIsOwnTemplate = useCallback((template: WordTemplateSummary) => {
        if (isSuperUser) {
            return true;
        }
        return template.user_id === userId;
    }, [userId, portalId]);


    //init-refresh
    const refresh = useCallback(async () => {
        dispatch(wordTemplateAC.setInitialized(false));
        dispatch(initializeWordTemplates());
    }, [dispatch]);

    // Actions
    const fetchAll = useCallback(
        async (query?: WordTemplateQueryParams) => {
            try {
                dispatch(wordTemplateAC.setLoading(true));
                const result = await fetchAllWordTemplates(query);
                dispatch(wordTemplateAC.setTemplates(result));
                return result;
            } catch (err) {
                dispatch(wordTemplateAC.setError(err instanceof Error ? err.message : 'Failed to fetch templates'));
                throw err;
            } finally {
                dispatch(wordTemplateAC.setLoading(false));
            }
        },
        [dispatch]
    );

    const fetchPublic = useCallback(async () => {
        try {
            dispatch(wordTemplateAC.setLoading(true));
            const result = await fetchPublicWordTemplates();
            dispatch(wordTemplateAC.setPublicTemplates(result));
            return result;
        } catch (err) {
            dispatch(wordTemplateAC.setError(err instanceof Error ? err.message : 'Failed to fetch public templates'));
            throw err;
        } finally {
            dispatch(wordTemplateAC.setLoading(false));
        }
    }, [dispatch]);

    const fetchByPortal = useCallback(
        async (params: WordTemplatePortalIdParams) => {
            try {
                dispatch(wordTemplateAC.setLoading(true));
                const result = await fetchWordTemplatesByPortal(params);
                dispatch(wordTemplateAC.setPortalTemplates(result));
                return result;
            } catch (err) {
                dispatch(wordTemplateAC.setError(err instanceof Error ? err.message : 'Failed to fetch templates by portal'));
                throw err;
            } finally {
                dispatch(wordTemplateAC.setLoading(false));
            }
        },
        [dispatch]
    );

    const fetchByUserPortal = useCallback(
        async (params: WordTemplateUserPortalParams) => {
            try {
                dispatch(wordTemplateAC.setLoading(true));
                const result = await fetchUserWordTemplates(params);
                dispatch(wordTemplateAC.setUserTemplates(result.templates));
                dispatch(wordTemplateAC.setFetchedSelectedTemplates(result.selected));
                return result;
            } catch (err) {
                dispatch(wordTemplateAC.setError(err instanceof Error ? err.message : 'Failed to fetch user templates'));
                throw err;
            } finally {
                dispatch(wordTemplateAC.setLoading(false));
            }
        },
        [dispatch]
    );

    const fetchById = useCallback(
        async (params: WordTemplateIdParams) => {
            try {
                dispatch(wordTemplateAC.setLoading(true));
                const result = await fetchWordTemplateById(params);
                dispatch(wordTemplateAC.setCurrentTemplate(result));
                return result;
            } catch (err) {
                dispatch(wordTemplateAC.setError(err instanceof Error ? err.message : 'Failed to fetch template'));
                throw err;
            } finally {
                dispatch(wordTemplateAC.setLoading(false));
            }
        },
        [dispatch]
    );

    const create = useCallback(
        (data: CreateWordTemplateThunkDto) => {
            setIsCreating(true);
            dispatch(
                createWordTemplateThunk(
                    data,
                    () => {
                        setIsCreating(false);
                    }
                )
            )
        },
        [dispatch]
    );

    const update = useCallback(
        async (id: string, data: UpdateWordTemplateRequest) => {
            try {
                setIsUpdating(true);
                dispatch(wordTemplateAC.setLoading(true));
                dispatch(wordTemplateAC.setError(null));
                const result = await updateWordTemplateAPI(id, data);
                dispatch(wordTemplateAC.updateTemplate(result));

                if (currentTemplate?.id === id) {
                    dispatch(wordTemplateAC.setCurrentTemplate(result));
                }
                return result;
            } catch (err) {
                dispatch(wordTemplateAC.setError(err instanceof Error ? err.message : 'Failed to update template'));
                throw err;
            } finally {
                setIsUpdating(false);
                dispatch(wordTemplateAC.setLoading(false));
            }
        },
        [dispatch, currentTemplate]
    );

    const remove = useCallback(
        (params: WordTemplateIdParams) => {

            dispatch(deleteWordTemplateThunk(params));
        },
        [dispatch, currentTemplate]
    );

    const setActive = useCallback(
        async (id: string, is_active: boolean) => {
            try {
                dispatch(wordTemplateAC.setError(null));
                const result = await setWordTemplateActiveAPI(id, is_active);
                dispatch(wordTemplateAC.updateTemplate(result));
                if (currentTemplate?.id === id) {
                    dispatch(wordTemplateAC.setCurrentTemplate(result));
                }
                return result;
            } catch (err) {
                dispatch(wordTemplateAC.setError(err instanceof Error ? err.message : 'Failed to set active status'));
                throw err;
            }
        },
        [dispatch, currentTemplate]
    );

    const setDefault = useCallback(
        async (id: string, is_default: boolean) => {
            try {
                dispatch(wordTemplateAC.setError(null));
                const result = await setWordTemplateDefaultAPI(id, is_default);
                dispatch(wordTemplateAC.updateTemplate(result));
                if (currentTemplate?.id === id) {
                    dispatch(wordTemplateAC.setCurrentTemplate(result));
                }
                return result;
            } catch (err) {
                dispatch(wordTemplateAC.setError(err instanceof Error ? err.message : 'Failed to set default status'));
                throw err;
            }
        },
        [dispatch, currentTemplate]
    );

    const clear = useCallback(() => {
        dispatch(clearWordTemplatePdfPreviewThunk());
        dispatch(wordTemplateAC.clear());
    }, [dispatch]);

    const setCurrent = useCallback(
        (template: WordTemplate | null) => {
            dispatch(setUserCurrentWordTemplateThunk(template));
        },
        [dispatch]
    );


    const toggleFavorite = useCallback(
        (templateId: string) => {
            dispatch(setUserFavoriteWordTemplate(templateId));
        },
        [dispatch]
    );



    const openSettings = useCallback(() => {
        dispatch(wordTemplateAC.setSettingsOpen(true));
    }, [dispatch]);

    const closeSettings = useCallback(() => {
        dispatch(wordTemplateAC.setSettingsOpen(false));
    }, [dispatch]);

    const download = useCallback(
        async (id: string, templateName?: string) => {
            try {
                await downloadWordTemplateAPI({ id }, templateName);
            } catch (err) {
                dispatch(wordTemplateAC.setError(err instanceof Error ? err.message : 'Failed to download template'));
                throw err;
            }
        },
        [dispatch]
    );

    return {
        // State
        templates,
        publicTemplates,
        userTemplates,
        portalTemplates,
        currentTemplate,
        selectedTemplate,
        favorites,
        isLoading,
        isFetched,
        error,
        isCreating,
        isUpdating,
        isDeleting,
        ...preview,

        // Utils
        getIsOwnTemplate,

        // Actions
        fetchAll,
        fetchPublic,
        fetchByPortal,
        fetchByUserPortal,
        fetchById,
        create,
        update,
        remove,
        setActive,
        setDefault,
        clear,
        setCurrent,
        toggleFavorite,

        download,
        openSettings,
        closeSettings,
        refresh,
    };
};

