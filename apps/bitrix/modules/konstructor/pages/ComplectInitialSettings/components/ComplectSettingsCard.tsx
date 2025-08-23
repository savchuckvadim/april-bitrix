// import React, { useState, useEffect, useRef, FC } from 'react'
// import * as classes from './ComplectSettingsCard.module.scss'
// import EventCardAction from '@/shared/ui/Cards/EventEntityCard/CardAction';
// import EVCard from '@/shared/ui/Cards/EventEntityCard/EventCard';
// import ASelect from '@/shared/ui/Inputs/Select/ASelect';
// import { useAppDispatch, useAppSelector } from '@/app/lib/hooks/redux';
// import { GLOBAL_STATE_PROP } from '../model/ComplectSettingsSlice';
// import Page from '@/shared/ui/Page/Page';
// import { Col, Container, Row } from 'reactstrap';
// import { AButton } from '@/shared/ui/Button/AAButton';
// import { navigate } from '@/processes/routes';
// import { APP_TYPE } from '@/app/types/app/app-type';
// import { ROUTE_DOCUMENT } from '@/processes/routes/types/router-type';
// import { SendCard, SendCardActionProp } from '@/shared/ui/Cards/SendCard/SendCard';

// // TODO: https://dev.1c-bitrix.ru/rest_help/js_library/rest/files.php

// interface ComplectSettingsCardProps {
//     // supplies
//     // complects,
//     // regions,
//     // currentSupply,
//     // currentComplectsType,
//     // currentRegion,
//     // status,
//     // // message,
//     // error,
//     // setSupply,
//     // setComplectsType,
//     // setRegion,
//     // changeAndSetGlobalStatus,
//     // cleanError,
// }

// const ComplectSettingsCard: FC<ComplectSettingsCardProps> = ({
//     // supplies,
//     // complects,
//     // regions,
//     // currentSupply,
//     // currentComplectsType,
//     // currentRegion,
//     // status,
//     // // message,
//     // error,
//     // setSupply,
//     // setComplectsType,
//     // setRegion,
//     // changeAndSetGlobalStatus,
//     // cleanError,
// }) => {
//     const settings = useAppSelector(state => state.documentComplectSettings)
//     const dispatch = useAppDispatch()
//     const toComplect = () => dispatch(
//         navigate(
//             APP_TYPE.DOCUMENT,
//             ROUTE_DOCUMENT.COMPLECT
//         )
//     )
//     // const scrollRef = useRef(null);
//     // useEffect(() => {
//     //     const current = scrollRef.current
//     //     if (current) {
//     //         current.scrollIntoView({ behavior: 'smooth' });

//     //     }
//     // }, [status]);

//     const content = <React.Fragment>
//         <ASelect
//             label={settings[GLOBAL_STATE_PROP.REGION].name}
//             nameForHandler={GLOBAL_STATE_PROP.REGION}
//             handleChange={() => console.log('set current region')}
//             //@ts-ignore
//             current={settings.current[GLOBAL_STATE_PROP.REGION] || settings[GLOBAL_STATE_PROP.REGION][0]}
//             //@ts-ignore
//             items={settings[GLOBAL_STATE_PROP.REGION].values}
//         />

//         <ASelect
//             label={settings[GLOBAL_STATE_PROP.COMPLECT].name}
//             nameForHandler={GLOBAL_STATE_PROP.COMPLECT}
//             handleChange={() => console.log('set current COMPLECT')}
//             //@ts-ignore
//             current={settings.current[GLOBAL_STATE_PROP.COMPLECT] || settings[GLOBAL_STATE_PROP.COMPLECT][0]}
//             //@ts-ignore
//             items={settings[GLOBAL_STATE_PROP.COMPLECT].values}
//         />

//         <ASelect
//             label={settings[GLOBAL_STATE_PROP.SUPPLY].name}
//             nameForHandler={GLOBAL_STATE_PROP.SUPPLY}
//             handleChange={() => console.log('set current SUPPLY')}
//             //@ts-ignore
//             current={settings.current[GLOBAL_STATE_PROP.SUPPLY] || settings[GLOBAL_STATE_PROP.SUPPLY][0]}
//             //@ts-ignore
//             items={settings[GLOBAL_STATE_PROP.SUPPLY].values}
//         />
//     </React.Fragment>

//     const send = {
//         color: 'blue',
//         handler: toComplect ,
//         title: 'НАЧАТЬ',
//         isActive: true
//     } as SendCardActionProp

//     const cancel = {
//         color: 'grey',
//         handler:() => console.log('back') ,
//         title: 'НАЗАД',
//         isActive: false
//     } as SendCardActionProp

//     const action = {
//         color: 'blue',
//         handler: toComplect,
//         title: 'фича',
//         isActive: false
//     } as SendCardActionProp

//     return (
//         <Page color="grey">
//             <div className={classes.wrapper}>
//                 <Row className={`p-10 ${classes.content}`}>
//                     <Col sm={6} xs={12} >
//                         <SendCard
//                             title={'Выберете основные параметры Комплекта'}
//                             content={content}
//                             send={send}
//                             cancel={cancel}
//                             action={action}
//                         />

//                         {/* </SendCard> */}
//                     </Col>
//                 </Row>
//             </div>
//         </Page>
//         // <div
//         //     ref={scrollRef}
//         //     className="global__page">
//         //     <div className='global__header'>
//         //         <div className='logo__wrapper'>
//         //             {/* <img className='globalLogo' alt='logo' src={logo} /> */}
//         //         </div>
//         //     </div>
//         //     <div className='menu__wrapper'>
//         //         <div className="menu__frame">
//         //             <div className='menu__header'>
//         //                 <h1 className='global__title'>Конструктор Коммерческих Предложений</h1>
//         //                 <p>Выберете основные параметры Комплекта</p>
//         //             </div>

//         //             <div className='menu__main'>
//         //                 <div className='global__select__region'>
//         //                     <div className='select__wrapper_region' key={`select-${345}`}>
//         //                         {/* <RegionSelect
//         //                             status={status}
//         //                             name={regions.name}
//         //                             current={region}
//         //                             values={regions.values}
//         //                             errorMessage={error.region}
//         //                             selectCallback={setRegion}
//         //                             cleanError={cleanError}

//         //                         /> */}

//         //                     </div>
//         //                 </div>
//         //                 <div className='global__select'>
//         //                     <div className='select__wrapper' key={`select-${346}`}>
//         //                         {/* <SelectRadioButtons
//         //                             currentId={currentComplectsType?.id}
//         //                             key={'global-select-complect'}
//         //                             name={complects.name}
//         //                             values={complects.values}
//         //                             errorMessage={error.complect}
//         //                             selectCallback={setComplectsType}
//         //                             cleanError={cleanError}
//         //                         /> */}
//         //                     </div>
//         //                 </div>
//         //                 <div className='global__select'>
//         //                     <div className='select__wrapper' key={`select-${347}`}>
//         //                         {/* <SelectRadioButtons
//         //                             currentId={currentSupply?.id}
//         //                             key={'global-select-supply'}
//         //                             name={supplies.name}
//         //                             values={supplies.values}
//         //                             errorMessage={error.supply}
//         //                             selectCallback={setSupply}
//         //                             cleanError={cleanError}
//         //                         /> */}
//         //                     </div>
//         //                 </div>

//         //                 <div className='global__button__wrapper'>
//         //                     {/* <Button
//         //                         type="button"
//         //                         sx={{
//         //                             lineHeight: 150,

//         //                         }}

//         //                         className='start_btn'
//         //                         name='Начать'
//         //                         key={'start-button'}
//         //                         onClick={() => changeAndSetGlobalStatus(true)}
//         //                     >
//         //                         <p className='start__title'>
//         //                             Начать
//         //                         </p>
//         //                     </Button> */}
//         //                 </div>

//         //             </div>
//         //         </div>

//         //     </div>

//         // </div>
//     )
// }

// export default ComplectSettingsCard
