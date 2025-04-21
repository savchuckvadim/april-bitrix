// import { getRandomColor } from '@/utils/reducers-utils/report/report-utils';
// import React, { FC, useEffect, useRef } from 'react';
// import { Button, Tooltip } from 'reactstrap';
// import { useState } from 'react';
// import { useAppDispatch } from '@/hooks/redux';
// import './ReportFilterBadge.scss'
// import { BXUser } from '@/types/bitrix/bitrix-type';
// import { setCurentDepartamentItem } from '@/redux/reducers/departament/departament-reducer';
// //@ts-ignore
// import done from '../../../../assets/img/product-row/icon-done.svg'
// //@ts-ignore
// import cancel from '../../../../assets/img/product-row/icon-cancel.svg'
// import '../Report.scss'

// interface ReportFilterBadge {
//     user: BXUser
//     isCurrent: boolean;
// }
// const ReportUserBadge: FC<ReportFilterBadge> = ({
//     user,
//     isCurrent,
// }) => {
//     const backgroundColorActive = 'rgb(23, 80, 165)'
//     const backgroundColorNoactive = 'rgb(238, 242, 244)'
//     const backgroundColor = isCurrent ? backgroundColorActive : backgroundColorNoactive
//     const color = isCurrent ? "white" : 'black'

//     const [tooltipOpen, setTooltipOpen] = useState(false);
//     const buttonRef = useRef(null); // Ссылка на кнопку

//     useEffect(() => {
//         if (buttonRef.current) {
//             setTooltipOpen(false); // Убеждаемся, что Tooltip не открывается раньше времени
//         }
//     }, []);

//     const dispatch = useAppDispatch()
//     const departamentChange = (
//         e: React.MouseEvent<HTMLButtonElement, MouseEvent>, userId: number) => {
//         e.preventDefault()
//         dispatch(setCurentDepartamentItem(userId))

//     }

//     return (
//         <>
//             <Button
//                 innerRef={buttonRef} // Привязываем ссылку
//                 id={`tooltip-user-${user.ID}`} // ID для тултипа
//                 style={{
//                     backgroundColor,
//                     color

//                 }}
//                 size="sm"
//                 className={'filter-item'}
//                 value={user.ID}
//                 onClick={(e) => departamentChange(e, user.ID)}
//             >
//                 <p>
//                     {user.NAME}
//                 </p>
//                 <img className="filter-item-icon" color="white" src={isCurrent ? cancel : done} alt="" />
//             </Button>

//             {/* Tooltip */}
//             <Tooltip
//                 placement="top"
//                 isOpen={tooltipOpen}
//                 target={`tooltip-user-${user.ID}`}
//                 toggle={() => setTooltipOpen(!tooltipOpen)}
//             >
//                 {`${user.NAME} ${user.LAST_NAME}`}
//             </Tooltip>
//         </>
//     );
// }

// export default ReportUserBadge;