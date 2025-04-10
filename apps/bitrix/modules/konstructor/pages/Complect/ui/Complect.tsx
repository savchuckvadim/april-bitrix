// import { useAppDispatch } from '@/modules/konstructor/app/lib/hooks/redux';
// import { APP_TYPE } from '@/modules/konstructor/app/types/app/app-type';
// import { navigate } from '@/modules/konstructor/processes/routes/model/RouterThunk';
import { ROUTE_DOCUMENT } from '@/modules/konstructor/processes/routes/types/router-type';



const Complect = ({ }) => {
    // 
    // const dispatch = useAppDispatch()
    const navigateHandler = (route: ROUTE_DOCUMENT) => {
        // dispatch(
        //     navigate(
        //         APP_TYPE.DOCUMENT,
        //         route
        //     )
        // )
    }
    return (
        <div>
            <div className="post__list">

                
                <p
                    onClick={() => navigateHandler(ROUTE_DOCUMENT.COMPLECT_SETTINGS)}
                >Глобал</p>
                <p
                    onClick={() => navigateHandler(ROUTE_DOCUMENT.COMPLECT)}
                >Прайс</p>

                <p
                    onClick={() => navigateHandler(ROUTE_DOCUMENT.DOCUMENT_SETTINGS)}
                >Конструктор</p>
            </div>
            <div>
                <p>
                    
                    Идейные соображения высшего порядка, а также дальнейшее развитие различных форм деятельности требуют от нас анализа существенных финансовых и административных условий. С другой стороны реализация намеченных плановых заданий позволяет оценить значение соответствующий условий активизации. Равным образом рамки и место обучения кадров играет важную роль в формировании форм развития. Задача организации, в особенности же дальнейшее развитие различных форм деятельности требуют от нас анализа направлений прогрессивного развития. Разнообразный и богатый опыт сложившаяся структура организации требуют от нас анализа дальнейших направлений развития.

                    Таким образом консультация с широким активом играет важную роль в формировании систем массового участия. Задача организации, в особенности же рамки и место обучения кадров требуют от нас анализа существенных финансовых и административных условий. С другой стороны консультация с широким активом обеспечивает широкому кругу (специалистов) участие в формировании существенных финансовых и административных условий.
                </p>
            </div>
        </div>
    );
}

export default Complect;