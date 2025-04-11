'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function PageLoader({ visible }: { visible: boolean }) {
    return (
        <div>
            {visible && (
                <motion.div
                    className="loading-screen bg-primary"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                    <div className="center-spinner color-primary flex flex-col justify-center items-center">
                        {/* <div className="spinner color-primary"></div>
                                        */}
                        {/* <Rabbit size={50} />
                                            */}
                        <div className='p-5 rounded-xl bg-white'>
                            <Image
                                src="/logo.svg"
                                alt="Logo"
                                width={120}
                                height={85}
                                className="backgound:invert"
                                priority
                            />


                        </div>
                        <div className='p-2 h-2 flex justify-center items-center  mt-3  rounded-xl bg-white'>
                            {/* <ScaleLoader
                                                   className='m-0 p-0 color-foreground '
                                                   height={3}
                                                   width={25}
                                               // color='foreground'
                                               /> */}
                        </div>
                    </div>

                    {/* <motion.div
                                       className="horizontal-line"
                                       initial={{ scaleX: 0 }}
                                       animate={{ scaleX: 0.8 }}
                                       transition={{ duration: 1, ease: 'easeInOut' }}
                                   /> */}
                    {/* <Rabbit size={55} />
                                       <p className='mt-10'>Loading...</p> */}
                    {/* Верхняя половина */}
                    <motion.div
                        className="reveal-top bg-white"
                        initial={{ y: 0 }}
                        animate={{ y: '-100%' }}
                        exit={{ y: '-100%' }}
                        transition={{ duration: 0.8, delay: 1, ease: 'easeInOut' }}
                    ></motion.div>


                    <motion.div
                        className="reveal-bottom bg-white"
                        initial={{ y: 0 }}
                        animate={{ y: '100%' }}
                        exit={{ y: '100%' }}
                        transition={{ duration: 0.8, delay: 1, ease: 'easeInOut' }}
                    ></motion.div>
                </motion.div>
            )}
        </div>
    )
}
