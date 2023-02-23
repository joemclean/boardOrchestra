import React, { useState, useEffect } from "react";
import './timer.css';

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
      <div>
        <h1>{formatTime(timeLeft)}</h1>
      </div>
      <div className="button-wrapper">
        <button className="button button-primary" onClick={handleStartClick}>Start</button>
        <button className="button button-primary" onClick={handleResetClick}>Reset</button>
      </div>
    </div>
  );
}

export default CountdownTimer;