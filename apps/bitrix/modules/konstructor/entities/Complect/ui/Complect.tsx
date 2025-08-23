// import * as classes from"./Complect.module.scss"
// import React from 'react';
// import { useAppDispatch, useAppSelector } from "@/app/lib/hooks/redux";
// import type { Complect as ComplectType } from "../type/document-complect-type";
// import { AButton } from "@packages/ui";
// import { ComponentPropsColors } from "@packages/ui";

// export const Complect = ({

// }) => {
//     const dispatch = useAppDispatch()
//     const globalSettings = useAppSelector(state => state.documentComplectSettings)
//     const currentComplectsType = globalSettings
//     const currentComplect = useAppSelector(state => state.complectCurrent) as null | ComplectType
//     const profs = useAppSelector(state => state.complectProf.items) as ComplectType[]
//     const universals = useAppSelector(state => state.complectUniversal.items)

//     const createComplect = () => (
//         // dispatch(
//         console.log('createComplect')
//         // )
//     )
//     let buttons = [];
//     const colors = ['green', 'blue', 'fiolet', 'orange', 'light', 'dark', 'april', 'warning', 'danger', 'success', 'grey'] as Array<ComponentPropsColors>
//     // if (currentComplectsType === PROF) {
//     buttons = profs.map((complect, index) => {
//         //ATTENTION NEW Version
//         // ATTENTION NEW VERSION
//         // currentComplect.name  - old version
//         // currentComplect.title  - new version
//         const complectName = complect.shortTitle || complect.title || complect.name       //to state

//         return <AButton
//             title={complectName}
//             key={`btn-${index}`}
//             color={colors[index]}
//             // style={{
//             //     lineHeight: '1px',

//             // }}
//             clickHendler={() => {
//                 createComplect(
//                     // complect,
//                     // index

//                 )
//             }}

//         // className={`${currentComplect && currentComplect.number === complect.number ? `${complect.className}--active` : complect.className} complect__grid-item`}
//         // number={index}
//         // type="button" > {complectName}
//         />

//     })

//     return (
//         buttons
//     )
// }
