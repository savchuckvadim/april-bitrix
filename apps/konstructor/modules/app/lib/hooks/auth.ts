import { useAppSelector } from "./redux";

export const useAuth = () => {
    const user = useAppSelector((state) => state.app.bitrix.user);
    const isSuperUser = useAppSelector((state) => state.app.isSuperUser);
    const userId: number = Number(user?.ID) || 0;
    if (!userId) {
        throw new Error('User ID is not found');
    }
    return {
        user,
        userId,
        isSuperUser,
    };
};
