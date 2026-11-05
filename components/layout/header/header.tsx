"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from 'next/image';
import Link from "next/link";

function getNextMidnightUTC() {
  const now = new Date();
  const nextMidnight = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0
    )
  );
  return nextMidnight;
}

function getTimeLeft(endTime: Date) {
  const now = new Date();
  const difference = endTime.getTime() - now.getTime();

  if (difference <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, isExpired: false };
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const endTime = getNextMidnightUTC();
    setTimeLeft(getTimeLeft(endTime));

    const timer = setInterval(() => {
      const newTimeLeft = getTimeLeft(endTime);
      setTimeLeft(newTimeLeft);
      if (newTimeLeft.isExpired) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (timeLeft.isExpired) return null;

  const units = [
    { value: timeLeft.hours, label: "H" },
    { value: timeLeft.minutes, label: "M" },
    { value: timeLeft.seconds, label: "S" },
  ];

  return (
    <div className="flex flex-col items-end gap-1">
      <p className="text-xs font-semibold tracking-tighter text-muted-foreground">Deal ends in</p>
      <div className="flex gap-1">
      {units.map((item, index) => (
        <div key={index} className="flex  items-center">
          <div className="bg-black text-white rounded-xl px-2 py-1 min-w-[48px] text-center">
            <span className=" font-bold text-xl tracking-tight">
              {item.value.toString().padStart(2, "0")}
            </span>
            <span className="text-muted-foreground font-bold text-[10px] ml-0.5">{item.label}</span>
          </div>
          {/* {index < units.length - 1 && (
            <span className="mx-1 text-black font-bold">:</span>
          )} */}
        </div>
      ))}
      </div>
    </div>
  );
}

const Header = () => {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 w-full  bg-background ">
      <div className="container flex px-4 py-2 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
         <Link href="/">
         <Image 
            src={'/logo-56.avif'} 
            width={100} 
            height={100} 
            alt="Mag Shoppy" 
            className="w-14 h-14 object-contain"
          /></Link>
        </div>

        {/* Countdown Timer */}
        <CountdownTimer />
      </div>
    </header>
  );
};

export default Header;