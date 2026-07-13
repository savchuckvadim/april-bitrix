// // import { SendCard, SendCardActionProp } from "@workspace/april-ui";
// import { FC } from 'react';
// interface NewTaskInitQuestionProps {
//     action: () => void
// }

// export const NewTaskInitQuestion: FC<NewTaskInitQuestionProps> = ({ action }) => {
//     const send = {
//         color: 'blue',
//         handler: action,
//         title: 'НАЧАТЬ ПРОДАВАТЬ',
//         isActive: true
//     } as SendCardActionProp

//     const cancel = {
//         color: 'grey',
//         handler: action,
//         title: 'НЕ НАЧИНАТЬ',
//         isActive: false
//     } as SendCardActionProp

//     return <SendCard
//         title='Создание задачи'
//         send={send}
//         cancel={cancel}
//         content={
//             <div style={{ 'height': '300px' }}>
//                 <h3
//                 className={classes.title}
//                 >У вас нет задач по данной компании</h3>
//             </div>
//         }
//     />
// }

// export default NewTaskInitQuestion;