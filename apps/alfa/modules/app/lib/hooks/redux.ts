import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/modules/app/model/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// import { createReduxHooks } from "@/modules/konstructor/app/lib/hooks/redux";
// import { AppDispatch, RootState } from "@/app/model/store";

// // Создаем хуки с типизацией для приложения
// const { useAppDispatch, useAppSelector } = createReduxHooks<RootState, AppDispatch>();

// export { useAppDispatch, useAppSelector };