import React, { useEffect } from 'react';
import { useLayoutEffect, useRef } from "react";

export function OrbitCanvas() {  
  const canvasRef = useRef<HTMLCanvasElement>(null)

    // assumed dims 860 x 742
    const orbitConfigs = [
      {
        rotationAngle: 30,
        offsetX: 180,
        offsetY: 172,
        diameterX: 190,
        diameterY: 270,
        color: "rgba(0, 0, 0, 0.25)",
        circles: [
          {
            color: "#9642d7",
            size: 8,
            angle: 0,
            speed: 0.003,
          },
          {
            color: "#c42b7a",
            size: 11,
            angle: (Math.PI / 3) * 1,
            speed: 0.003,
          },
          {
            color: "#ebfe7d",
            size: 8,
            angle: (Math.PI / 3) * 2,
            speed: 0.003,
          },
          {
            color: "#9642d7",
            size: 8,
            angle: (Math.PI / 3) * 3,
            speed: 0.003,
          },
          {
            color: "#c42b7a",
            size: 11,
            angle: (Math.PI / 3) * 4,
            speed: 0.003,
          },
          {
            color: "#ebfe7d",
            size: 8,
            angle: (Math.PI / 3) * 5,
            speed: 0.003,
          },
        ],
      },
      {
        rotationAngle: -15,
        offsetX: -30,
        offsetY: 110,
        diameterX: 210,
        diameterY: 290,
        color: "rgba(0, 0, 0, 0.25)",
        circles: [
          {
            color: "#9642d7",
            size: 8,
            angle: 0,
            speed: 0.0035,
          },
          {
            color: "#9642d7",
            size: 8,
            angle: Math.PI,
            speed: 0.0035,
          },
        ],
      },
      {
        rotationAngle: -70,
        offsetX: -100,
        offsetY: 140,
        diameterX: 210,
        diameterY: 290,
        color: "rgba(0, 0, 0, 0.25)",
        circles: [
          {
            color: "#ebfe7d",
            size: 7,
            angle: 0,
            speed: 0.004,
          },
          {
            color: "#9642d7",
            size: 7,
            angle: 0.5,
            speed: 0.004,
          },
          {
            color: "#ebfe7d",
            size: 7,
            angle: Math.PI,
            speed: 0.004,
          },
          {
            color: "#9642d7",
            size: 7,
            angle: Math.PI + 0.5,
            speed: 0.004,
          },
        ],
      },
      {
        rotationAngle: -10,
        offsetX: 20,
        offsetY: 100,
        diameterX: 235,
        diameterY: 400,
        color: "#000000",
        circles: [
          {
            color: "#9642d7",
            size: 7,
            angle: 0,
            speed: 0.003,
          },
          {
            color: "#ebfe7d",
            size: 7,
            angle: 0.9,
            speed: 0.003,
          },
          {
            color: "#ebfe7d",
            size: 7,
            angle: 3.0,
            speed: 0.003,
          },
          {
            color: "#c42b7a",
            size: 7,
            angle: 5.28,
            speed: 0.003,
          },
        ],
      },
      {
        rotationAngle: -30,
        offsetX: -70,
        offsetY: 160,
        diameterX: 215,
        diameterY: 375,
        color: "#000000",
        circles: [
          {
            color: "#ebfe7d",
            size: 9,
            angle: 0,
            speed: 0.005,
          },
          {
            color: "#ebfe7d",
            size: 9,
            angle: Math.PI,
            speed: 0.005,
          },
        ],
      },
      {
        rotationAngle: -70,
        offsetX: -180,
        offsetY: 150,
        diameterX: 110,
        diameterY: 250,
        color: "#000000",
        circles: [
          {
            color: "#c42b7a",
            size: 7,
            angle: 0,
            speed: 0.004,
          },
          {
            color: "#c42b7a",
            size: 7,
            angle: Math.PI,
            speed: 0.004,
          },
        ],
      },
      {
        rotationAngle: 20,
        offsetX: 90,
        offsetY: 120,
        diameterX: 210,
        diameterY: 380,
        color: "#000000",
        circles: [
          {
            color: "#ebfe7d",
            size: 13,
            angle: 0,
            speed: 0.004,
          },
          {
            color: "#72e5f7",
            size: 7,
            angle: Math.PI / 2,
            speed: 0.004,
          },
          {
            color: "#72e5f7",
            size: 7,
            angle: Math.PI,
            speed: 0.004,
          },
          {
            color: "#72e5f7",
            size: 7,
            angle: (Math.PI * 3) / 2,
            speed: 0.004,
          },
        ],
      },
      {
        rotationAngle: 18,
        offsetX: 130,
        offsetY: 120,
        diameterX: 200,
        diameterY: 250,
        color: "#000000",
        circles: [
          {
            color: "#c42b7a",
            size: 8,
            angle: 0,
            speed: 0.0035,
          },
          {
            color: "#c42b7a",
            size: 8,
            angle: Math.PI,
            speed: 0.0035,
          },
        ],
      },
    ];
    
    const setupAnimation = function () {
      if (!canvasRef.current) return;
      const animationFrames: number[] = [];
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d");
    
      const animate = function () {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        canvas.width = width;
        canvas.height = height;
    
        const centerX = width / 2;
        const centerY = height - 400;
    
        const MARGINS = 90;
        const MAX_WIDTH = 750;
        let WIDTH_FACTOR = 1;
        let HEIGHT_FACTOR = 1;
    
        if (width - MARGINS < MAX_WIDTH) {
          WIDTH_FACTOR = (width - MARGINS) / MAX_WIDTH;
          HEIGHT_FACTOR = (width - MARGINS) / MAX_WIDTH;
        }
    
        const drawOrbit = function (config) {
          ctx.save();
          ctx.translate(
            config.offsetX * WIDTH_FACTOR,
            config.offsetY * HEIGHT_FACTOR
          );
          ctx.rotate((Math.PI / 180) * config.rotationAngle);
    
          ctx.beginPath();
          ctx.ellipse(
            0,
            0,
            config.diameterX * WIDTH_FACTOR,
            config.diameterY * HEIGHT_FACTOR,
            0,
            0,
            2 * Math.PI
          );
          ctx.strokeStyle = config.color;
          ctx.stroke();
    
          ctx.restore();
        };
    
        const drawCircle = function (orbitConfig, config) {
          const circleX = Math.cos(config.angle) * orbitConfig.diameterX * WIDTH_FACTOR;
          const circleY = Math.sin(config.angle) * orbitConfig.diameterY * HEIGHT_FACTOR;
    
          ctx.save();
          ctx.translate(
            orbitConfig.offsetX * WIDTH_FACTOR,
            orbitConfig.offsetY * HEIGHT_FACTOR
          );
          ctx.rotate((Math.PI / 180) * orbitConfig.rotationAngle);
    
          ctx.beginPath();
          ctx.fillStyle = config.color;
          ctx.arc(circleX, circleY, config.size, 0, Math.PI * 2);
          ctx.fill();
    
          config.angle += config.speed;
    
          ctx.restore();
        };
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.translate(centerX, centerY);
    
        orbitConfigs.forEach(function (orbitConfig) {
          drawOrbit(orbitConfig);
        });
    
        // separate so that circles always appear on top of all orbits
        orbitConfigs.forEach(function (orbitConfig) {
          orbitConfig.circles.forEach(function (circleConfig) {
            drawCircle(orbitConfig, circleConfig);
          });
        });
    
        animationFrames.push(window.requestAnimationFrame(animate));
      };
    
      animationFrames.push(window.requestAnimationFrame(animate));

      return () => {
        animationFrames.forEach((frame) => {
          window.cancelAnimationFrame(frame);
        })
      }
    };

  useEffect(() =>{
    console.log("animation loaded", canvasRef.current);
    setupAnimation();
  }, [canvasRef.current, setupAnimation])

  return <canvas className="h-full w-full" ref={canvasRef}></canvas>
}