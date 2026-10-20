import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export function ArrowLeft02Icon({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HelpCircleIcon({
  size = 24,
  color = '#141B34',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} />
      <Path
        d="M9.5 9.5C9.5 8.12 10.62 7 12 7C13.38 7 14.5 8.12 14.5 9.5C14.5 11 12.5 11.75 12.5 13.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle cx="12.5" cy="16.5" r="0.75" fill={color} />
    </Svg>
  );
}

export function Time04Icon({
  size = 18,
  color = 'rgba(96, 96, 102, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} />
      <Path
        d="M12 7v5l3 2"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BriefcaseIcon({
  size = 18,
  color = 'rgba(192, 192, 204, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7 2.5h6a1.5 1.5 0 011.5 1.5V5H5.5V4A1.5 1.5 0 017 2.5z"
        stroke={color}
        strokeWidth={1.2}
      />
      <Path
        d="M2.5 7.5a2.5 2.5 0 012.5-2.5h10a2.5 2.5 0 012.5 2.5v7.5a2.5 2.5 0 01-2.5 2.5H5a2.5 2.5 0 01-2.5-2.5V7.5z"
        stroke={color}
        strokeWidth={1.2}
      />
      <Path d="M2.5 9.5h15" stroke={color} strokeWidth={1.2} />
    </Svg>
  );
}

export function BrainExperienceIcon({
  size = 18,
  color = 'rgba(192, 192, 204, 0.96)',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth={1.2} />
      <Path d="M10 9V14" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
      <Circle cx="10" cy="6.5" r="0.8" fill={color} />
    </Svg>
  );
}

export function PlusSignCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
      <Path d="M12 8v8M8 12h8" stroke="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function CircleXDeleteIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="rgba(204, 41, 41, 0.9)" stroke="rgba(204, 41, 41, 0.9)" strokeWidth={1.5} />
      <Path
        d="M9 9l6 6M15 9l-6 6"
        stroke="#FFFFFF"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function DarkCheckCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="10" fill="rgba(0, 8, 20, 0.96)" />
      <Path
        d="M6.5 10.5L8.8 12.8L13.5 8"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function GreenCheckCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="10" fill="rgba(12, 121, 12, 0.96)" />
      <Path
        d="M6.5 10.5L8.8 12.8L13.5 8"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
