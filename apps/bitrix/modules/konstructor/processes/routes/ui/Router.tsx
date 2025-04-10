// import { FC, useEffect } from "react";
// import { useAppSelector } from "@/app/lib/hooks/redux";
// import CurrentRoute from "./CurrentRoute/CurrentRoute";
// import { Preloader } from "@workspace/ui";




// const Router: FC = () => {
//     const preloader = useAppSelector(state => state.preloader.inProgress)
//     let component = <Preloader />


//     if (!preloader) {

//         component = <CurrentRoute />

//     }

//     return component
// }

// export default Router