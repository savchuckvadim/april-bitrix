import { FC } from "react"

interface IErrorPage {
    error?: Error 
    resetError: () => void
}


export const ErrorPage: FC<IErrorPage> = ({ error, resetError }) => {

    return <div className="h-screen w-screen">

        <div>
            {error?.message || 'что то не так'}
        </div>
    </div>
}