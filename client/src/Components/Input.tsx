import type React from "react";

interface InputProps {
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({ placeholder, value, onChange }: InputProps) {
  return (
    <input
      placeholder={placeholder}
      className="border focus:outline-blue-400 border-gray-400 rounded-full py-1 px-3"
      value={value}
      onChange={onChange}
    />
  );
}
