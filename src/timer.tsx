import React, { useState, useEffect } from "react";

type CountdownTimerProps = {
  onStart: () => void;
  onReset: () => void;
};

function CountdownTimer({ onStart, onReset }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (timerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    }
    return () => clearInterval(timer!);
  }, [timerRunning, timeLeft]);

  const handleStartClick = () => {
    setTimerRunning(true);
    onStart();
  };

  const handleResetClick = () => {
    setTimerRunning(false);
    setTimeLeft(60);
    onReset();
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div>
      <div>{formatTime(timeLeft)}</div>
      <button onClick={handleStartClick}>Start</button>
      <button onClick={handleResetClick}>Reset</button>
    </div>
  );
}

export default CountdownTimer;