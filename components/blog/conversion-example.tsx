"use client";

import { useEffect, useState } from "react";

const examples = [
  { visitors: "1,000", conversion: "1%", customers: "10" },
  { visitors: "10,000", conversion: "0.5%", customers: "50" },
];

export function ConversionExample() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((value) => (value + 1) % examples.length), 2000);
    return () => clearInterval(timer);
  }, []);

  const example = examples[index];
  return (
    <p className="conversion-example">
      <span className="sr-only">Illustrative examples: 1,000 visitors at 1% conversion means 10 paying customers; 10,000 visitors at 0.5% means 50 paying customers.</span>
      <span aria-hidden="true" title="Illustrative conversion example">
        <span className="rotating-value-window"><strong className="rotating-value" key={`visitors-${index}`}>{example.visitors}</strong></span> visitors
        <span className="conversion-arrow"> → </span>
        <span className="rotating-value-window"><strong className="rotating-value" key={`conversion-${index}`}>{example.conversion}</strong></span> conversion
        <span className="conversion-arrow"> → </span>
        <span className="rotating-value-window"><strong className="rotating-value" key={`customers-${index}`}>{example.customers}</strong></span> paying customers
      </span>
    </p>
  );
}
