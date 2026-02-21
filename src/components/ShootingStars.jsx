import React from "react";

// Stars fanning out from the top-left corner at different angles.
// Each entry: [top%, left%, angleDeg, widthPx, durationSec, delaySec, opacity]
const STARS = [
    // Tight cluster near top-left, angles spread from ~10° to ~80°
    ["1%", "0%", 12, 200, 4.5, 0.0, 0.85],
    ["0%", "2%", 20, 160, 5.5, 1.8, 0.75],
    ["3%", "0%", 28, 220, 5.0, 0.6, 0.90],
    ["0%", "5%", 36, 180, 6.0, 3.0, 0.70],
    ["5%", "1%", 44, 240, 4.0, 1.2, 0.95],
    ["1%", "8%", 50, 150, 7.0, 0.3, 0.65],
    ["7%", "2%", 57, 200, 5.5, 2.5, 0.80],
    ["2%", "10%", 63, 170, 6.5, 4.0, 0.72],
    ["9%", "0%", 70, 260, 4.8, 0.9, 0.88],
    ["0%", "13%", 76, 130, 6.0, 2.1, 0.62],
    ["11%", "3%", 80, 190, 5.2, 3.5, 0.78],
    ["4%", "15%", 83, 145, 7.5, 1.0, 0.60],
    // Second wave — slightly further from corner for depth
    ["0%", "1%", 16, 280, 8.0, 5.0, 0.55],
    ["2%", "4%", 32, 210, 9.0, 6.5, 0.50],
    ["6%", "0%", 48, 300, 7.0, 4.8, 0.60],
    ["0%", "9%", 60, 175, 8.5, 7.2, 0.48],
    ["8%", "5%", 72, 230, 6.8, 5.8, 0.58],
    ["1%", "12%", 85, 155, 9.5, 8.0, 0.45],
    // Sparse long-travel stars for atmosphere
    ["0%", "0%", 24, 340, 11.0, 2.8, 0.40],
    ["3%", "7%", 55, 310, 10.5, 9.0, 0.38],
    ["12%", "1%", 78, 280, 12.0, 6.0, 0.42],
    ["0%", "16%", 40, 260, 10.0, 11.0, 0.35],
    ["14%", "4%", 65, 320, 11.5, 3.5, 0.40],
    ["5%", "18%", 88, 200, 9.0, 13.0, 0.33],
    ["16%", "0%", 42, 290, 12.5, 7.5, 0.38],
    ["2%", "20%", 18, 380, 10.0, 5.2, 0.32],
    ["18%", "2%", 54, 260, 11.0, 10.5, 0.36],
    ["0%", "22%", 30, 320, 13.0, 8.5, 0.30],
    ["20%", "5%", 68, 240, 10.5, 4.2, 0.35],
    ["7%", "24%", 82, 180, 12.0, 15.0, 0.28],
];

const ShootingStars = () => (
    <div className="stars-wrap" aria-hidden="true">
        {STARS.map(([top, left, angle, width, dur, delay, opacity], i) => (
            // Outer arm: positioned & rotated to set travel direction
            <div
                key={i}
                className="star-arm"
                style={{
                    top,
                    left,
                    transform: `rotate(${angle}deg)`,
                }}
            >
                {/* Inner streak: travels along X (= travels in the arm's direction) */}
                <div
                    className="star"
                    style={{
                        width: `${width}px`,
                        opacity,
                        animationDuration: `${dur}s`,
                        animationDelay: `${delay}s`,
                    }}
                />
            </div>
        ))}
    </div>
);

export default ShootingStars;
