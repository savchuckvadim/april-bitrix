'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './loading.css';
import Image from 'next/image';
import { usePace } from '../hooks/usePace';
import Orb from '@workspace/ui/components/Orb';
import GradientText from '@workspace/ui/components/GradientText';
const LoadingScreen = () => {
    const [isVisible, setIsVisible] = useState(true);

    usePace();
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2000); // 3 секунды прелоадер

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-orange-500">

            {isVisible && (
                <div

                >
                    <div className="bg-gray-700 center-spinner flex flex-col justify-center items-center h-full w-full">

                        <div className="p-4 rounded-xl bg-white border-2 border-indigo-600">
                            <Image
                                src="/logo/logo.svg"
                                alt="Logo"
                                width={45}
                                height={45}
                                className="backgound:invert"
                                priority
                            />
                        </div>{' '}
                        <GradientText
                            colors={['#bb52d4', '#30c3ef', '#bb52d4', '#30c3ef',]}
                        >   <p className="mt-1 text-md tracking-widest font-bold ">
                                Апрель
                            </p>
                        </GradientText>
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



                </div>
            )}
        </div>
    );
};

export default LoadingScreen;

{
    /* <Script
                id="pace"
                strategy="beforeInteractive"
                src="/assets/js/pace.min.js"
            /> */
}
