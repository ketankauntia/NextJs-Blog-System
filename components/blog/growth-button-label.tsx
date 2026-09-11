"use client";

import { useEffect, useState } from "react";

const words = ["visibility", "traffic", "audience", "revenue"];

export function GrowthButtonLabel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((value) => (value + 1) % words.length), 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span>
      <span className="sr-only">Grow your visibility, traffic, audience, and revenue</span>
      <span aria-hidden="true">Grow your <span className="rotating-value-window"><strong key={index} className="rotating-value font-semibold">{words[index]}</strong></span></span>
    </span>
  );
}
