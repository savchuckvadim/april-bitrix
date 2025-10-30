



import dynamic from "next/dynamic";

const ArrowBackDynamic = dynamic(() => import('./ArrowBack').then(mod => mod.ArrowBack), {
    ssr: false,
});
const ThemeTogglePanelDynamic = dynamic(() => import('./ThemeTogglePanel').then(mod => mod.ThemeTogglePanel), {
    ssr: false,
});
export const HeaderMenu = () => {

    return (
        <div className="w-full h-10  flex justify-between items-start mb-5">

            <ArrowBackDynamic />
            <div className=' flex justify-end items-center'>
                <ThemeTogglePanelDynamic />
            </div>
        </div>
    )
}
