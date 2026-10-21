interface InfoProps {
  header: string;
  value: string;
}

export function Info({ header, value }: InfoProps) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-700">{header}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}
