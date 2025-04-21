'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './loading.css';
import Image from 'next/image';
import { usePace } from '../hooks/usePace';

const LoadingScreen = () => {
    const [isVisible, setIsVisible] = useState(true);

    usePace()
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 3000); // 3 секунды прелоадер

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-white">
            {isVisible &&

                (
                    <motion.div
                        // className="loading-screen bg-primary"
                        className="loading-screen bg-background"
                        initial={{ opacity: 1 }}

                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
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
                            className="horizontal-line h-[2px] line-indigo-400"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                        />
                        {/* <Rabbit size={55} />
                        <p className='mt-10'>Loading...</p> */}
                        {/* Верхняя половина */}
                        <motion.div
                            className="reveal-top bg-primary"
                            initial={{ y: 0 }}
                            animate={{ y: '-100%' }}
                            exit={{ y: '-100%' }}
                            transition={{ duration: 0.8, delay: 1, ease: 'easeInOut' }}
                        ></motion.div>


                        <motion.div
                            className="reveal-bottom bg-primary"
                            initial={{ y: 0 }}
                            animate={{ y: '100%' }}
                            exit={{ y: '100%' }}
                            transition={{ duration: 0.8, delay: 1, ease: 'easeInOut' }}
                        ></motion.div>
                    </motion.div>
                )}
        </div>
    );
};

export default LoadingScreen;






{/* <Script
                id="pace"
                strategy="beforeInteractive"
                src="/assets/js/pace.min.js"
            /> */}