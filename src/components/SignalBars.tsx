import {
  Wifi,
  WifiHigh,
  WifiLow,
  WifiOff,
} from "lucide-react"

type SignalBarsProps = {
  strength: number // 0–4
  className?: string
}

const SignalBars: React.FC<SignalBarsProps> = ({
  strength,
  className = "",
}) => {
  if (strength <= 0) {
    return (
      <WifiOff
        className={`h-5 w-5 text-muted-foreground ${className}`}
      />
    )
  }

  if (strength === 1) {
    return (
      <WifiLow
        className={`h-5 w-5 text-red-500 ${className}`}
      />
    )
  }

  if (strength === 2) {
    return (
      <WifiHigh
        className={`h-5 w-5 text-yellow-500 ${className}`}
      />
    )
  }

  if (strength === 3) {
    return (
      <WifiHigh
        className={`h-5 w-5 text-green-500 ${className}`}
      />
    )
  }

  return (
    <Wifi
      className={`h-5 w-5 text-green-600 ${className}`}
    />
  )
}

export default SignalBars
