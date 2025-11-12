'use client';

import { LoadingScreen } from '@/modules/general';
import { useApp } from '../lib/hooks/useApp';

export const App = ({ children }: { children: React.ReactNode }) => {
    const { initialized, isMounted, isExpired, isLoading } = useApp();


    return (
        <div className="h-calc(100vh - 300px) p-4">
            {isMounted && initialized && !isLoading ? (
                children
            ) : (
                <LoadingScreen />
            )}
        </div>
    );
};

export default App;

// const App = ({
//     inBitrix,
//     envBitrix,
// }: {
//     inBitrix: boolean;
//     envBitrix: boolean | string | undefined;
// }) => {
//     console.log('KPI SALES APP');
//     console.log('envBitrix', envBitrix);

//     return <AppRoot inBitrix={inBitrix} />;
// };

// const AppRoot = ({ inBitrix }: { inBitrix: boolean }) => {
//     const dispatch = useAppDispatch();
//     const app = useAppSelector(state => state.app);
//     const [isClient, setIsClient] = useState(false);

//     useEffect(() => {
//         setIsClient(true);
//     }, []);

//     useEffect(() => {
//         if (isClient && !app.initialized && !app.isLoading) {
//             dispatch(initial(inBitrix));
//         }
//     }, [isClient, app.initialized, app.isLoading, dispatch, inBitrix]);

//     if (!isClient) {
//         return <LoadingScreen />;
//     }

//     logClient(
//         {
//             title: 'AppRoot',
//             level: 'info',
//             context: 'AppRoot KPI REPORT SALES',
//             message: 'AppRoot is mounted',
//             domain: app.domain,
//             userId: app.bitrix.user?.ID,
//         },
//         {},
//     );
//     return (
//         <ErrorBoundary>
//             <div className="min-h-screen bg-background">
//                 {app.initialized ? <AppContent /> : <LoadingScreen />}
//             </div>
//         </ErrorBoundary>
//     );
// };

// const AppContent = () => {
//     const { isExpired } = useAppSelector(state => state.app.client);
//     const dispatch = useAppDispatch();
//     const expiredClientReady = () => {
//         dispatch(appActions.setExpiredClient({ isExpired: false }));
//     };
//     if (isExpired) {
//         return (
//             <ExpiredClientPage
//                 onComplete={expiredClientReady}
//                 onDispatch={() => {
//                     console.log('onDispatch');
//                 }}
//             />
//         );
//     }
//     return <Report />;
// };

// export default App;
