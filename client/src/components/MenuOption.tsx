import { ListboxOption } from "@headlessui/react";

export function MenuOption({ value, text }: { value: number; text: string }) {
  return (
    <ListboxOption
      value={value}
      className="hover:bg-blue-600 cursor-pointer select-none p-2 rounded-lg"
    >
      {text}
    </ListboxOption>
  );
}
