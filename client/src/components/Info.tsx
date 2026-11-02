interface InfoProps {
  header: string;
  value: string;
}

export function Info({ header, value }: InfoProps) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-400">{header}</span>
      <span className="text-lg font-bold text-gray-300">{value}</span>
    </div>
  );
}
