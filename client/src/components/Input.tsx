import type React from "react";

interface Properties {
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Input({ placeholder, value, onChange }: Properties) {
  return (
    <input
      placeholder={placeholder}
      className="border focus:outline-blue-400 border-gray-400 bg-blue-50 rounded-full py-1 px-3"
      value={value}
      onChange={onChange}
    />
  );
}
