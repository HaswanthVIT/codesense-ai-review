import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export const ScoreCircle = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    const animation = setTimeout(() => setDisplayScore(score), 300);
    return () => clearTimeout(animation);
  }, [score]);

  let pathColor, shadowColor;
  if (score >= 8) {
    pathColor = '#4ade80'; // green-400
    shadowColor = 'shadow-green-500/50';
  } else if (score >= 5) {
    pathColor = '#facc15'; // yellow-400
    shadowColor = 'shadow-yellow-500/50';
  } else {
    pathColor = '#f87171'; // red-400
    shadowColor = 'shadow-red-500/50';
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-semibold text-gray-300 mb-4">Code Quality Score</h3>
      <div className={`w-40 h-40 transition-shadow duration-500 rounded-full ${shadowColor} shadow-2xl`}>
        <CircularProgressbar
          value={displayScore}
          maxValue={10}
          text={`${score}/10`}
          styles={buildStyles({
            rotation: 0.25,
            strokeLinecap: 'round',
            textSize: '22px',
            pathTransitionDuration: 1.5,
            pathColor: pathColor,
            textColor: '#e2e8f0',
            trailColor: '#374151',
          })}
        />
      </div>
    </div>
  );
};