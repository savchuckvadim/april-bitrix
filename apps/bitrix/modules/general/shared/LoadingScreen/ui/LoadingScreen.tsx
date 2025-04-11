// 'use client';

// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import './loading.css';
// // import ScaleLoader from "react-spinners/ScaleLoader";
// import Image from 'next/image';
// const LoadingScreen = () => {
//     const [isVisible, setIsVisible] = useState(true);

//     // useEffect(() => {
//     //     const timer = setTimeout(() => {
//     //         setIsVisible(false);
//     //     }, 3000); // 3 секунды прелоадер

//     //     return () => clearTimeout(timer);
//     // }, []);

//     useEffect(() => {
//         if (typeof window !== "undefined" && window.Pace) {
//             window.Pace.on("done", () => {
//                 setIsVisible(true);
//             });
//         }
//     }, []);

//     if (isVisible) return null;


//     return (
//         <div className="bg-white">
//             {isVisible &&

//                 (
//                     <motion.div
//                         className="loading-screen bg-primary"
//                         initial={{ opacity: 1 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         transition={{ duration: 0.5, ease: 'easeInOut' }}
//                     >
//                         <div className="center-spinner color-primary flex flex-col justify-center items-center">
//                             {/* <div className="spinner color-primary"></div>
//                          */}
//                             {/* <Rabbit size={50} />
//                              */}
//                             <div className='p-5 rounded-xl bg-white'>
//                                 <Image
//                                     src="/volkov.svg"
//                                     alt="Logo"
//                                     width={120}
//                                     height={85}
//                                     className="backgound:invert"
//                                     priority
//                                 />


//                             </div>
//                             <div className='p-2 h-2 flex justify-center items-center  mt-3  rounded-xl bg-white'>
//                                 {/* <ScaleLoader
//                                     className='m-0 p-0 color-foreground '
//                                     height={3}
//                                     width={25}
//                                 // color='foreground'
//                                 /> */}
//                             </div>
//                         </div>

//                         {/* <motion.div
//                         className="horizontal-line"
//                         initial={{ scaleX: 0 }}
//                         animate={{ scaleX: 0.8 }}
//                         transition={{ duration: 1, ease: 'easeInOut' }}
//                     /> */}
//                         {/* <Rabbit size={55} />
//                         <p className='mt-10'>Loading...</p> */}
//                         {/* Верхняя половина */}
//                         <motion.div
//                             className="reveal-top bg-white"
//                             initial={{ y: 0 }}
//                             animate={{ y: '-100%' }}
//                             exit={{ y: '-100%' }}
//                             transition={{ duration: 0.8, delay: 1, ease: 'easeInOut' }}
//                         ></motion.div>


//                         <motion.div
//                             className="reveal-bottom bg-white"
//                             initial={{ y: 0 }}
//                             animate={{ y: '100%' }}
//                             exit={{ y: '100%' }}
//                             transition={{ duration: 0.8, delay: 1, ease: 'easeInOut' }}
//                         ></motion.div>
//                     </motion.div>
//                 )}
//         </div>
//     );
// };

// export default LoadingScreen;






// {/* <Script
//                 id="pace"
//                 strategy="beforeInteractive"
//                 src="/assets/js/pace.min.js"
//             /> */}