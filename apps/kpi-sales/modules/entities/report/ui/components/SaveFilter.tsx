
// // import { useAppDispatch, useAppSelector } from '@/hooks/redux';
// // import { ReportStateType } from '@/redux/reducers/report/report-reducer';
// // import { saveFilter } from '@/redux/reducers/report/report-thunk';
// // import React from 'react';
// // import { BarLoader } from 'react-spinners';

// // const SaveFilter = ({ }) => {
// //     const dispatch = useAppDispatch()
// //     const save = () => dispatch(
// //         saveFilter()
// //     )
// //     const isLoading = useAppSelector(state => (state.report as ReportStateType).isFilterLoading)
// //     return (
// //         <div className='d-flex align-items-center'>
// //             {isLoading
// //                 ? <BarLoader width={100} height={4} color='#1E90FF' />
// //                 : <label className="filter-label mb-1 text-primary"
// //                     style={{ cursor: "pointer", fontWeight: "900" }}
// //                     onClick={save}
// //                 >Сохранить фильтр</label>}
// //         </div>

// //     );
// // }

// // export default SaveFilter;


// import { useState, useEffect } from "react";
// import { useAppDispatch, useAppSelector } from '@/hooks/redux';
// import { saveFilter } from '@/redux/reducers/report/report-thunk';
// import { BarLoader } from "react-spinners";
// import { ReportStateType } from "@/redux/reducers/report/report-reducer";
// import { ThumbsUp } from "lucide-react";

// const SaveFilter = () => {
//     const dispatch = useAppDispatch();
//     const isLoading = useAppSelector(state => (state.report as ReportStateType).isFilterLoading);

//     const [showSaved, setShowSaved] = useState(false);
//     const [prevLoading, setPrevLoading] = useState(isLoading);

//     useEffect(() => {
//         if (prevLoading && !isLoading) {
//             // Когда загрузка завершилась, показываем "Сохранено!"
//             setShowSaved(true);

//             // Убираем сообщение через 3 секунды
//             setTimeout(() => setShowSaved(false), 3000);
//         }
//         setPrevLoading(isLoading);
//     }, [isLoading, prevLoading]);

//     const save = () => {
//         dispatch(saveFilter());
//     };

//     return (
//         <div className="d-flex align-items-center">
//             {isLoading ? (
//                 <BarLoader width={100} height={4} color="#1E90FF" />
//             ) : (
//                 <label
//                     className="filter-label mb-1 text-primary"

//                     onClick={save}
//                 >
//                     {showSaved ? <div className="d-flex flex-direction-row align-items-center">
//                         <p>Сохранено!</p>
//                         <ThumbsUp className="ms-2" size={15} />
//                     </div> : <div
//                         style={{ cursor: "pointer", fontWeight: "900" }}
//                     ><p>Сохранить фильтр</p></div>}
//                 </label>
//             )}
//         </div>
//     );
// };

// export default SaveFilter;
