'use client'
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { useGetDepartmentQuery } from './departament-service';
import { departmentActions, DepartmentState } from './departament-slice';
import { BXUser, BXDepartment } from '@workspace/bx';
import { RootState } from '@/modules/app/model/store';
import { IBXDepartment, IBXUser } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';

export const useDepartment = () => {
    const dispatch = useDispatch();
    // const { data: departmentData, isLoading, error } = useGetDepartmentQuery({ domain: '' });
    const departmentState = useSelector(
        (state: RootState) => state.department,
    ) as DepartmentState;

    const handleSetCurrentDepartmentItem = useCallback(
        (userId: number) => {
            const { items, current } = departmentState;
            const searchingUserInCurrent = current.find(
                (user: IBXUser) => user.ID === userId,
            );
            let updatedCurrent = [...current];

            if (searchingUserInCurrent) {
                updatedCurrent = updatedCurrent.filter(
                    (user: IBXUser) => user.ID !== userId,
                );
            } else {
                const addingUser = items.find(
                    (user: IBXUser) => user.ID === userId,
                );
                if (addingUser) {
                    updatedCurrent.push(addingUser);
                }
            }

            dispatch(departmentActions.setDepartmentCurrent(updatedCurrent));
        },
        [dispatch, departmentState],
    );

    const handleSetCurrentGroup = useCallback(
        (groupId: number) => {
            const { groups, current } = departmentState;
            let currentGroups = [...groups.current];
            const isInCurrent = currentGroups.find(
                (gr: IBXDepartment) => gr.ID === groupId,
            );
            const searchingGroup = groups.items.find(
                (gr: IBXDepartment) => gr.ID === groupId,
            );
            let currentUsers = [...current];

            if (searchingGroup) {
                if (isInCurrent) {
                    currentGroups = currentGroups.filter(
                        (gr: IBXDepartment) => gr.ID !== groupId,
                    );
                    searchingGroup.USERS?.forEach((user: IBXUser) => {
                        currentUsers = currentUsers.filter(
                            (currentUser: IBXUser) => currentUser.ID !== user.ID,
                        );
                    });
                } else {
                    currentGroups.push(searchingGroup);
                    searchingGroup.USERS?.forEach((user: IBXUser) => {
                        if (
                            !currentUsers.find(
                                (currentUser: IBXUser) =>
                                    currentUser.ID === user.ID,
                            )
                        ) {
                            currentUsers.push(user);
                        }
                    });
                }

                dispatch(
                    departmentActions.setGroup({ currentUsers, currentGroups }),
                );
            }
        },
        [dispatch, departmentState],
    );

    return {
        department: departmentState,
        handleSetCurrentDepartmentItem,
        handleSetCurrentGroup,
        // setDepartmentDetalizationCurrent: (user: BXUser) => dispatch(
        //     departmentActions.setDepartmentDetalizationCurrent(user))
    };
};
