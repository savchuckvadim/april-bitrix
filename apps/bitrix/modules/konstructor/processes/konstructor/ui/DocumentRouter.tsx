// import { useAppSelector } from "@/app/lib/hooks/redux";
// import { Complect } from "@/entities/KonstructorComplect";
// import { DInfoblocks } from "@/entities/KonstructorInfoblock";

// import { ROUTE_DOCUMENT } from "@/processes/routes/types/router-type";
// import { Preloader } from "@packages/ui";

// import { FC } from "react";

// // interface DocumentRouterProps {
// //     route: ROUTE_DOCUMENT
// // }

// const DocumentRouter: FC = () => {

//     let component = <Preloader />

//     const route = useAppSelector(state => state.documentRouter.current.route) as ROUTE_DOCUMENT

//     switch (route) {

//         case ROUTE_DOCUMENT.COMPLECT_SETTINGS:
//             component = <DInfoblocks />
//             break;

//         case ROUTE_DOCUMENT.COMPLECT:
//             component = <Complect />
//             break;

//         case ROUTE_DOCUMENT.PRODUCTS:
//             component = <div>PRODUCTS</div>
//             break;

//         case ROUTE_DOCUMENT.DOCUMENT_SETTINGS:
//             component = <div>DOCUMENT SETTINGS</div>
//             break;

//         default:
//             component = <Complect />
//     }
//     return component

// }

// export default DocumentRouter
