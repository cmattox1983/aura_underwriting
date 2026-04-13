interface TrayCardProps {
  children: React.ReactNode;
  className?: string;
  accentLeft?: boolean;
}

export default function TrayCard({
  children,
  className = "",
  accentLeft = false,
}: TrayCardProps) {
  return (
    <div
      className={`bg-surface-container-lowest rounded-xl shadow-editorial ghost-border ${
        accentLeft ? "tray-accent" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
