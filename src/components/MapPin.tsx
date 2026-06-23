interface Props {
  size?: number
  pulse?: boolean
  className?: string
}

/** Animated teal teardrop pin with three concentric pulse rings. Also the logo. */
export default function MapPin({ size = 48, pulse = true, className = '' }: Props) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {pulse &&
        [0, 0.8, 1.6].map((delay) => (
          <span
            key={delay}
            className="absolute rounded-full border border-primary/60 animate-pulse-ring"
            style={{ width: size * 0.7, height: size * 0.7, animationDelay: `${delay}s` }}
          />
        ))}
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        className="relative drop-shadow-[0_4px_10px_rgba(10,191,191,0.5)]"
      >
        <path
          d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7Z"
          fill="#0ABFBF"
        />
        <circle cx="12" cy="9" r="2.6" fill="#ffffff" />
      </svg>
    </div>
  )
}
