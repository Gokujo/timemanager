import React, {useState} from 'react';
import {formatMinutesWithSeconds} from '../utils/timeUtils';

interface PopupDisplayProps {
    workedMinutes: number;
    plannedWork: number;
    endTime: string;
}

type DisplayMode = 'remaining' | 'worked' | 'end';

const PopupDisplay: React.FC<PopupDisplayProps> = ({
                                                       workedMinutes,
                                                       plannedWork,
                                                       endTime
                                                   }) => {
    const [displayMode, setDisplayMode] = useState<DisplayMode>('remaining');
    const remainingMinutes = Math.max(0, plannedWork - workedMinutes);
    const overtimeMinutes = Math.max(0, workedMinutes - plannedWork);
    const hasOvertime = overtimeMinutes > 0;

    // Determine status color based on remaining time or overtime
    let statusClass = "status-green";
    if (hasOvertime) {
        statusClass = "status-yellow"; // Yellow for overtime
    } else if (remainingMinutes <= 30) {
        statusClass = "status-red";
    } else if (remainingMinutes <= 60) {
        statusClass = "status-yellow";
    }

    // Handle click to cycle through display modes
    const handleClick = () => {
        if (displayMode === 'remaining') {
            setDisplayMode('worked');
        } else if (displayMode === 'worked') {
            setDisplayMode('end');
        } else {
            setDisplayMode('remaining');
        }
    };

    // Determine what to display based on current mode
    let displayTitle = '';
    let displayValue = '';
    let displayClass = statusClass;

    if (displayMode === 'remaining') {
        if (hasOvertime) {
            displayTitle = 'Überstunden';
            displayValue = formatMinutesWithSeconds(overtimeMinutes);
        } else {
            displayTitle = 'Verbleibende Zeit';
            displayValue = formatMinutesWithSeconds(remainingMinutes);
        }
        // Status color based on remaining time or overtime is already set
    } else if (displayMode === 'worked') {
        displayTitle = 'Geleistete Arbeitszeit';
        displayValue = formatMinutesWithSeconds(workedMinutes);
        displayClass = 'status-green'; // Always green for worked time
    } else {
        displayTitle = 'Vorauss. Arbeitsende';
        displayValue = endTime;
        displayClass = 'status-green'; // Always green for end time
    }

    return (
            <div
                className={`text-center ${displayClass} rounded-xl cursor-pointer shadow-sm ring-1 ring-white/10`}
                onClick={handleClick}
                data-ripple-light="true"
            >
                <div className="p-6 sm:p-8 md:p-10">
                    <p className="text-lg sm:text-xl md:text-2xl text-white mb-2 sm:mb-4">{displayTitle}</p>
                    <p className="text-5xl sm:text-6xl md:text-7xl font-bold text-white">{displayValue}</p>
                </div>
            </div>
    );
};

export default PopupDisplay;
