import React from 'react';

interface IconeDoneSVGProps {
    width: number;
    height: number;
}

const IconeDoneSVG: React.FC<IconeDoneSVGProps> = ({ width, height }) => {
    return (
        <svg
            width={width}
            height={height}
            className="text-muted-foreground"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 1.5C5.30514 1.5 1.5 5.30514 1.5 10C1.5 14.6949 5.30514 18.5 10 18.5C14.6949 18.5 18.5 14.6949 18.5 10C18.5 5.30514 14.6949 1.5 10 1.5ZM0.5 10C0.5 4.75286 4.75286 0.5 10 0.5C15.2471 0.5 19.5 4.75286 19.5 10C19.5 15.2471 15.2471 19.5 10 19.5C4.75286 19.5 0.5 15.2471 0.5 10ZM14.4786 7.02145C14.6738 7.21671 14.6738 7.53329 14.4786 7.72855L8.85355 13.3536C8.75672 13.4504 8.62441 13.5033 8.48751 13.4998C8.35061 13.4964 8.22111 13.437 8.12923 13.3355L5.75423 10.7105C5.56896 10.5057 5.58477 10.1895 5.78954 10.0042C5.99431 9.81896 6.3105 9.83477 6.49577 10.0395L8.51812 12.2748L13.7714 7.02145C13.9667 6.82618 14.2833 6.82618 14.4786 7.02145Z"
                fill="currentColor"
            />
        </svg>
    );
};

export default IconeDoneSVG;
