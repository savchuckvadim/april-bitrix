// import { FC, Suspense } from "react";
// import { APP_TYPE } from "@/app/types/app/app-type";
// import { EventContainer } from "@/processes/event";

// import { DocumentRouter } from "@/processes/konstructor";
// import { useAppSelector } from "@/app/lib/hooks/redux";
// import { Preloader } from "@packages/ui";
// import { ROUTE } from "../../model/RouterSlice";

// const CurrentRoute: FC = () => {

//     const currentProcess = useAppSelector(
//         state => state.router.current) as ROUTE

//     let component = <Preloader />

// debugger
//     switch (currentProcess) {

//         case ROUTE.COMPLECT:

//             component = <Suspense fallback={<Preloader />}>
//                 <div>
//                     COMPLECT
//                 </div>
//             </Suspense>
//             break;
//         case ROUTE.DOCUMENT:

//             component = <Suspense fallback={<Preloader />}>
//                 <DocumentRouter />

//             </Suspense>
//             break;
//         default:
//             component = <DocumentRouter />
//     }
//     return component

// }

// export default CurrentRoute




// // const CurrentRoute: FC<CurrentRouteProps> = (
// //     {
// //         currentRoute

// //     }) => {

// //     let component = <Preloader />


// //     switch (currentRoute) {

// //         // case ROUTE.KONSTRUCTOR:
// //         //     component = <Suspense fallback={<Preloader />}> <App /></Suspense>
// //         //     // component = <PostContainer />
// //         //     break;
// //         case ROUTE.CALLING:

// //             component = <EventListPage />//<Report />
// //             break;
// //             // case ROUTE.COMPLECT:

// //             //     component = <Suspense fallback={<Preloader />}> <Complect /></Suspense>
// //             //     break;
// //             // case ROUTE.PRODUCTS:
// //             //     component = <div style={{ minHeight: '100%', minWidth: '100%' }}>
// //             //         <Suspense fallback={<Preloader />}>  <Price />  </Suspense>

// //             //     </div >

// //             // component = <PostContainer2 />
// //             break;
// //         default:
// //             component = <Preloader />
// //     }
// //     return component

// // }

// // export default CurrentRoute