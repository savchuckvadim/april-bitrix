import React from 'react'
import { APP_TITLE } from '../app/consts/app'

export default function StartPage() {
    return (
        <div className='h-screen w-screen'>
            <div>

            </div>
            <div className='h-full min-w-full flex justify-center items-center'>
                <h1>
                    {APP_TITLE}
                </h1>

            </div>
        </div>
    )
}
