'use client'

import React from 'react'

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl'
  variant?: 'full' | 'icon' | 'text'
  className?: string
}

const sizeClasses = {
  small: 'w-8 h-8',
  medium: 'w-12 h-12',
  large: 'w-16 h-16',
  xl: 'w-24 h-24'
}

const textSizeClasses = {
  small: 'text-lg',
  medium: 'text-xl',
  large: 'text-2xl',
  xl: 'text-3xl'
}

export function Logo({ size = 'medium', variant = 'full', className = '' }: LogoProps) {
  const iconSize = sizeClasses[size]
  const textSize = textSizeClasses[size]

  if (variant === 'icon') {
    return (
      <div className={`${iconSize} ${className}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Abstract Sphere Connection - Two arcs forming a 'C' */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.2"
          />
          <path
            d="M 25 50 Q 50 25 75 50"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 25 50 Q 50 75 75 50"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Connection dots */}
          <circle cx="25" cy="50" r="3" fill="currentColor" />
          <circle cx="50" cy="50" r="3" fill="currentColor" />
          <circle cx="75" cy="50" r="3" fill="currentColor" />
        </svg>
      </div>
    )
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center ${textSize} font-bold text-primary ${className}`}>
        ConnectSphere
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={iconSize}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-primary"
        >
          {/* Abstract Sphere Connection - Two arcs forming a 'C' */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.2"
          />
          <path
            d="M 25 50 Q 50 25 75 50"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 25 50 Q 50 75 75 50"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Connection dots */}
          <circle cx="25" cy="50" r="3" fill="currentColor" />
          <circle cx="50" cy="50" r="3" fill="currentColor" />
          <circle cx="75" cy="50" r="3" fill="currentColor" />
        </svg>
      </div>
      <div className={`${textSize} font-bold text-primary`}>
        ConnectSphere
      </div>
    </div>
  )
}

// Alternative logo variants
export function LogoInterlocking() {
  return (
    <div className="w-12 h-12">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-primary"
      >
        {/* Interlocking rings representing connection */}
        <circle
          cx="35"
          cy="35"
          r="20"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          opacity="0.8"
        />
        <circle
          cx="65"
          cy="35"
          r="20"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          opacity="0.8"
        />
        <circle
          cx="50"
          cy="65"
          r="20"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          opacity="0.8"
        />
        {/* Connection points */}
        <circle cx="50" cy="35" r="4" fill="currentColor" />
        <circle cx="35" cy="50" r="4" fill="currentColor" />
        <circle cx="65" cy="50" r="4" fill="currentColor" />
      </svg>
    </div>
  )
}

export function LogoGlyph() {
  return (
    <div className="w-12 h-12">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-primary"
      >
        {/* Stylized 'C' with connection elements */}
        <path
          d="M 30 20 Q 20 20 20 50 Q 20 80 30 80 L 70 80 Q 80 80 80 50 Q 80 20 70 20 L 30 20 Z"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Connection node in the center */}
        <circle cx="50" cy="50" r="6" fill="currentColor" />
        {/* Small connecting lines */}
        <path
          d="M 50 44 L 50 30"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 50 56 L 50 70"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
