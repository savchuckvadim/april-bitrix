import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BXUser, BXDepartment } from '@workspace/bx';
import { RootState } from '@/modules/app/model/store';
import { departmentActions, DepartmentState } from './department-slice';

export const useDepartment = () => {
    const dispatch = useDispatch();
    const departmentState = useSelector(
        (state: RootState) => state.department,
    ) as DepartmentState;

    const handleSetCurrentDepartmentItem = useCallback(
        (userId: number) => {
            const { items, current } = departmentState;
            const searchingUserInCurrent = current.find(
                (user: BXUser) => Number(user.ID) === Number(userId),
            );
            let updatedCurrent = [...current];

            if (searchingUserInCurrent) {
                updatedCurrent = updatedCurrent.filter(
                    (user: BXUser) => Number(user.ID) !== Number(userId),
                );
            } else {
                const addingUser = items.find(
                    (user: BXUser) => Number(user.ID) === Number(userId),
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
                (gr: BXDepartment) => Number(gr.ID) === Number(groupId),
            );
            const searchingGroup = groups.items.find(
                (gr: BXDepartment) => Number(gr.ID) === Number(groupId),
            );
            let currentUsers = [...current];

            if (searchingGroup) {
                if (isInCurrent) {
                    currentGroups = currentGroups.filter(
                        (gr: BXDepartment) => Number(gr.ID) !== Number(groupId),
                    );
                    searchingGroup.USERS?.forEach((user: BXUser) => {
                        currentUsers = currentUsers.filter(
                            (currentUser: BXUser) =>
                                Number(currentUser.ID) !== Number(user.ID),
                        );
                    });
                } else {
                    currentGroups.push(searchingGroup);
                    searchingGroup.USERS?.forEach((user: BXUser) => {
                        if (
                            !currentUsers.find(
                                (currentUser: BXUser) =>
                                    Number(currentUser.ID) === Number(user.ID),
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
    };
};
