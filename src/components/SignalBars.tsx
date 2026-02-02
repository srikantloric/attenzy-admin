interface SignalBarsProps {
  strength: number; // 0 to 4
}

const SignalBars: React.FC<SignalBarsProps> = ({ strength }) => {
  return (
    <div className="flex items-end gap-1">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={`w-1 rounded-sm transition-colors ${
            bar <= strength
              ? "bg-green-600"
              : "bg-muted"
          }`}
          style={{ height: `${bar * 6}px` }}
        />
      ))}
    </div>
  );
};

export default SignalBars;
