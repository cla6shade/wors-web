import CardIcon from "./CardIcon";
import CardIconFallback from "./CardIconFallback";
import UndefinedBoundary from "./UndefinedBoundary";

interface DirectionIconProps {
  scale?: number;
  direction?: number;
  variant: 'wind' | 'wave' | 'current';
}

export default function DirectionIcon({ scale, direction, variant }: DirectionIconProps) {
  if (variant === 'current') {
    return (
      <UndefinedBoundary value={scale} fallback={<CardIconFallback />}>
        <CardIcon>

          <svg
            width="80%"
            height="80%"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="fill-indigo-500 stroke-indigo-500"
            style={{ transform: `rotate(${(direction! + 180) % 360}deg)` }}
          >
            <path d="M12 2L19 19L12 15L5 19L12 2Z" stroke="none" />

            <path
              d="M10 24 Q 11 22.5 10 21 Q 9 19.5 10 18"
              strokeWidth="0.8"
              fill="none"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M12 24 Q 13 22.5 12 21 Q 11 19.5 12 18"
              strokeWidth="0.8"
              fill="none"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M14 24 Q 15 22.5 14 21 Q 13 19.5 14 18"
              strokeWidth="0.8"
              fill="none"
              strokeLinecap="round"
              opacity="0.8"
            />
          </svg>
        </CardIcon>
      </UndefinedBoundary>
    )
  }

  return (
    <UndefinedBoundary value={scale} fallback={<CardIconFallback />}>
      <CardIcon>
        {
          variant === 'wave' ? (

            <svg
              width="80%"
              height="80%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="fill-blue-500 stroke-blue-500"
              style={{ transform: `rotate(${(direction! + 180) % 360}deg)` }}
            >
              <path d="M12 2L19 19L12 15L5 19L12 2Z" stroke="none" />

              <path
                d="M15 17.5 Q 13.5 18.5 12 17.5 Q 10.5 16.5 9 17.5"
                strokeWidth="0.8"
                fill="none"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M15 19.5 Q 13.5 20.5 12 19.5 Q 10.5 18.5 9 19.5"
                strokeWidth="0.8"
                fill="none"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M15 21.5 Q 13.5 22.5 12 21.5 Q 10.5 20.5 9 21.5"
                strokeWidth="0.8"
                fill="none"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          ) : (

            <svg
              width="80%"
              height="80%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className=" fill-cyan-500"
              style={{ transform: `rotate(${(direction! + 180) % 360}deg)` }}
            >
              <path d="M12 2L19 19L12 15L5 19L12 2Z" strokeWidth="1" strokeLinejoin="round" />
            </svg>
          )
        }
      </CardIcon>
    </UndefinedBoundary >
  )
}

