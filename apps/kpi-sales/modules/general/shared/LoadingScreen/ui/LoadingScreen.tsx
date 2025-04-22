'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './loading.css';
import Image from 'next/image';
import { usePace } from '../hooks/usePace';
import Script from 'next/script';

const LoadingScreen = () => {
    const [isVisible, setIsVisible] = useState(true);

    usePace()
    useEffect(() => {
        // const timer = setTimeout(() => {
        //     setIsVisible(false);
        // }, 3000); // 3 секунды прелоадер

        // return () => clearTimeout(timer);
        if (typeof window !== 'undefined') {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 1200); // 3 секунды прелоадер

            return () => clearTimeout(timer);
            // setIsVisible(false)
        }

    }, []);

    return (
        <div className="bg-background w-full h-full p-0 m-0">

            {isVisible &&

                (<div className="bg-background w-[97%] h-[97%]  p-0 m-0 z-50">
                    <motion.div
                        // className="loading-screen bg-primary"
                        className="loading-screen bg-background p-0 m-0"
                        initial={{ opacity: 1 }}

                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 10, }}
                    >
                        <div className="center-spinner flex flex-col justify-center items-center">
                            {/* <div className="spinner color-primary"></div>
                         */}
                            {/* <Rabbit size={50} />
                             */}
                            <div className='p-4 rounded-xl bg-white border-2 border-indigo-600'>
                                <Image
                                    src="/logo/logo.svg"
                                    alt="Logo"
                                    width={45}
                                    height={45}
                                    className="backgound:invert"
                                    priority
                                />



                            </div> <p className='mt-1 text-md tracking-widest font-semibold text-indigo-600'>Апрель</p>
                            {/* <div className='p-5 h-2 flex justify-center items-center  mt-3  rounded-xl bg-white'> */}
                            {/* <ScaleLoader
                                    className='m-0 p-0 color-foreground '
                                    height={3}
                                    width={25}
                                // color='foreground'
                                /> */}
                            {/* <p className='text-background'>Апрель. App. Crm for Crm</p>  */}
                            {/* </div>  */}
                        </div>

                        <motion.div
                            className=" p-0 m-0 horizontal-line h-[2px] bg-indigo-600"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.6, ease: 'easeInOut' }}
                        />
                        {/* <Rabbit size={55} />
                        <p className='mt-10'>Loading...</p> */}
                        {/* Верхняя половина */}
                        <motion.div
                            className=" p-0 m-0 reveal-top bg-foreground"
                            initial={{ y: 0 }}
                            animate={{ y: '-100%' }}
                            exit={{ y: '-100%' }}
                            transition={{ duration: 0.4, delay: 0.2, ease: 'easeInOut' }}
                        ></motion.div>


                        <motion.div
                            className=" p-0 m-0 reveal-bottom bg-foreground"
                            initial={{ y: 0 }}
                            animate={{ y: '100%' }}
                            exit={{ y: '100%' }}
                            transition={{ duration: 0.4, delay: 0.2, ease: 'easeInOut' }}
                        ></motion.div>
                    </motion.div>
                </div>
                )}

            {/* <Script
                id="pace"
                strategy="beforeInteractive"
                src="/assets/js/pace.min.js"
            /> */}
        </div>
    );
};

export default LoadingScreen;






{/* <Script
                id="pace"
                strategy="beforeInteractive"
                src="/assets/js/pace.min.js"
            /> */}