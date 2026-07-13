import { FC, useEffect, useState } from "react";
import { EV_PLAN_CODE, EV_PLAN_PROP } from "../type/event-plan-type";
import { EV_PLAN_STATE_ITEM } from "../model/EventPlanSlice";
import { DEPARTAMENT_STATE_PROP } from "@/modules/features/Departament/type/department-type";
import { Department } from "@/modules/features/Departament";
import { useAppDispatch, useAppSelector } from "@/modules/app/lib/hooks/redux";
import { EventItemResultType } from "@/modules/widgets/EventItem/model/EventItemSlice";
import { ErrorsCode, eventActions } from "@/modules/processes/event/model/EventSlice";
import { EventContact } from "@/modules/entities/EventContact";
import useWindowSize from "@/modules/app/lib/hooks/display";
import { EV_CONTACT_PROP, EV_CONTACT_TYPE } from "@/modules/entities/EventContact/type/event-contact-type";
import { ASelect, EventCardAction, EVCard, AInput, ADate } from "@workspace/april-ui";
import { usePlan } from "../lib/hooks/use-plan";

const Plan: FC = () => {
  const { date, type, isNoResultMenu, planPropChange } = usePlan();
  const { width } = useWindowSize();
  const [isSmallDisplay, setIsSmallDisplay] = useState(width < 577);
  useEffect(() => {
    const isSmall = width < 577;
    setIsSmallDisplay(isSmall);
  }, [width]);

  // const [isRequiredError, setIsRequiredError] = useState(false)
  // const [nameErrorMessge, setIsNameErrorMessge] = useState('')
  const [isDepartmentShow, setIsDepartmentShow] = useState(false);
  const [planActionName, setPlanActionName] = useState("Сотрудник");

  const currentDepartmentMode = useAppSelector((state) => state.department[DEPARTAMENT_STATE_PROP.MODE].current);
  const isTmcMode = currentDepartmentMode.code === "tmc";

  const menuType = useAppSelector((state) => state.eventItemMenu.type);

  const isNoResult = menuType === EventItemResultType.NORESULT;

  const isNoresultTmc = isTmcMode && isNoResult;
  const isPresentationPlaning = type.current.code === EV_PLAN_CODE.PRESENTATION;

  const dispatch = useAppDispatch();

  const handleOnNameFocus = (code: EV_PLAN_PROP | EV_CONTACT_PROP, error: string) => {
    if (error) {
      if (code) {
        if (code === EV_PLAN_PROP.NAME) {
          const resCode = code as ErrorsCode;

          dispatch(
            eventActions.setError({
              code: resCode,
              value: "",
            })
          );
        } else if (
          code === EV_CONTACT_PROP.NAME ||
          code === EV_CONTACT_PROP.PHONE ||
          code === EV_CONTACT_PROP.EMAIL ||
          code === EV_CONTACT_PROP.POST
        ) {
        }
      }
    }
  };

  const planModeHendler = () => {
    let actionName = "Сотрудник";
    if (!isDepartmentShow) {
      actionName = "Вернуться";
    }
    setPlanActionName(actionName);
    setIsDepartmentShow(!isDepartmentShow);
  };

  //  <React.Fragment>

  const errors = useAppSelector((state) => state.event.errors.current);

  return (
    <>
      {" "}
      <EVCard
        title={isNoResultMenu ? "Перенос" : "Планирование"}
        width={12}
        // size={(isSmallDisplay) ? "smallest" : (isNoresultTmc || !isTmcMode || (isTmcMode && !isPresentationPlaning)) ? 'big' : "full"}
        size={isSmallDisplay ? "smallest" : "big"}
        actionComponent={!isTmcMode && <EventCardAction title={planActionName} hendler={planModeHendler} />}
      >
        {isDepartmentShow ? (
          <Department from={DEPARTAMENT_STATE_PROP.PLAN} />
        ) : (
          <>
            {" "}
            {/* <Communication /> */}
            {!isNoResultMenu && <EventContact type={EV_CONTACT_TYPE.PLAN} />}
            {!isNoResultMenu && (
              <AInput
                label={"Название - что нужно сделать"}
                errorMessage={errors[EV_PLAN_PROP.NAME]}
                nameForHandler={EV_PLAN_PROP.NAME}
                handleChange={planPropChange}
                handleOnFocus={handleOnNameFocus}
              />
            )}
            {!isNoResultMenu && (
              <ASelect
                label={"Тип звонка"}
                nameForHandler={EV_PLAN_PROP.TYPE}
                handleChange={planPropChange}
                current={type.current}
                //@ts-ignore
                items={type.items}
              />
            )}
            <ADate
              label={"Дата и время звонка"}
              value={date}
              // errorMessage={null}
              nameForHandler={EV_PLAN_PROP.DATE}
              handleChange={planPropChange}
              // handleOnFocus={false}
            />
            {/* {!isNoResultMenu && isTmcMode && isPresentationPlaning && <>
                    <AInput
                        label={'ФИО контактного лица'}
                        errorMessage={errors[EV_PLAN_PROP.CONTACT_NAME]}
                        nameForHandler={EV_PLAN_PROP.CONTACT_NAME}
                        handleChange={planPropChange}
                        handleOnFocus={handleOnNameFocus}
                    />
                    <AInput
                        label={'Телефон контактного лица'}
                        errorMessage={errors[EV_PLAN_PROP.CONTACT_PHONE]}
                        nameForHandler={EV_PLAN_PROP.CONTACT_PHONE}
                        handleChange={planPropChange}
                        handleOnFocus={handleOnNameFocus}
                    />
                    <AInput
                        label={'E-mail контактного лица'}
                        errorMessage={errors[EV_PLAN_PROP.CONTACT_EMAIL]}
                        nameForHandler={EV_PLAN_PROP.CONTACT_EMAIL}
                        handleChange={planPropChange}
                        handleOnFocus={handleOnNameFocus}
                    />

                    <Department
                        from={DEPARTAMENT_STATE_PROP.PLAN}
                    />
                </>
                } */}
          </>
        )}
        {/* </Col> */}
      </EVCard>
    </>
  );
};

export default Plan;
