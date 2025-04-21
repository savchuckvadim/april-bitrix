import React from 'react'

export default function Preloader() {
    return (
        <div className='flex justify-center items-center h-6'>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
    )
}
