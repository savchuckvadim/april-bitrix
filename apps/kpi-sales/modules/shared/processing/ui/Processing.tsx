import React, { useState } from "react";

//Import Countdown
import { CountdownCircleTimer } from "react-countdown-circle-timer";
// import maintanence from "../../../../assets/big/coming-soon.svg"
// import maintanence from "../../../../assets/big/maintenance.svg"
import Image from "next/image";

const Processing: React.FC = () => {
  const [isFinished, setIsFinished] = useState(false);

  const [key, setKey] = useState(0); // чтобы сбрасывать таймер
  const duration = 7;
  return (
    <div className="bg-background flex flex-col items-center text-center px-4 py-6 z-1">
      <div className="max-w-sm w-full">
        <div className="flex justify-center mb-6 z-0">
          <Image
            src="./cover/coming-soon.svg"
            alt="processing"
            priority
            className="w-full h-auto z-0"
            width={100}
            height={100}
          />
        </div>

        <h4 className="text-foreground text-xl font-semibold mt-6">
          Мы конструируем отчёт для Вас
        </h4>
        <p className="text-foreground text-sm mt-2">
          Это может занять до нескольких минут. Подождите пожалуйста
        </p>

        <div className="mt-10 text-center h-[10px] w-full flex justify-center items-center">
          {isFinished ? (
            <p className="text-foreground text-xs font-bold">Почти готово</p>
          ) : (
            <CountdownCircleTimer
              size={50}
              strokeWidth={4}
              isPlaying
              duration={60}
              colors={[
                // '#000000',

                // '#A0A0A0',
                // '#FFD700',
                // '#FF8C00',
                // '#FFC800',
                // '#FFB400',
                // '#FFA000',
                "#000000",
                "#A078C8",
                "#B48CDC",
                "#FF69B4",
                "#FF1493",
                "#FFFF00",
                "#FF00FF",
                "#8A2BE2",
                "#9400D3",
                "#FF0000",
                "#ADFF2F",
                "#7CFC00",
                "#008000",
                "#00FFFF",
                "#1E90FF",
                "#6495ED",
                "#00008B",
                "#A66EC8",
                "#B48CDC",
                "#A078C8",
                "#8C64B4",
                "#6AB4F2",
                "#30E0E2",
                "#1EB2B2",
                "#44D590",
                "#23BA23",
                "#23BA23",
                "#FF6055",
                "#004777",
                "#F7B801",
                "#A30000",
              ]}
              colorsTime={[
                60, 59, 58, 57, 56, 55, 53, 50, 47, 45, 42, 40, 30, 20, 10, 0,
              ]}
              onComplete={() => {
                // можно делать что-то, когда таймер заканчивается
                console.log("⏰ Время вышло!");
                setIsFinished(true);
                return { shouldRepeat: false }; // или true — повторять
              }}
            >
              {({ remainingTime }) => (
                <div className="text-xs font-bold text-foreground">
                  {remainingTime}
                </div>
              )}
            </CountdownCircleTimer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Processing;
