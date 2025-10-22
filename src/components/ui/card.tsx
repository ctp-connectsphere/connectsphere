'use client'

import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outlined' | 'filled'
    padding?: 'none' | 'small' | 'medium' | 'large'
    interactive?: boolean
    children: React.ReactNode
}

const variantClasses = {
    default: 'card',
    elevated: 'card card-elevated',
    outlined: 'bg-transparent border-2 border-gray-200',
    filled: 'bg-gray-50 border border-gray-200'
}

const paddingClasses = {
    none: 'p-0',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
}

export function Card({
    children,
    variant = 'default',
    padding = 'medium',
    interactive = false,
    className = '',
    ...props
}: CardProps) {
    const baseClasses = 'rounded-xl transition-all duration-200'
    const variantClass = variantClasses[variant]
    const paddingClass = paddingClasses[padding]
    const interactiveClass = interactive ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''

    const classes = `${baseClasses} ${variantClass} ${paddingClass} ${interactiveClass} ${className}`

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    )
}

// Card Header
export function CardHeader({
    children,
    className = '',
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`mb-4 ${className}`} {...props}>
            {children}
        </div>
    )
}

// Card Title
export function CardTitle({
    children,
    className = '',
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={`text-title-3 font-semibold text-gray-900 ${className}`} {...props}>
            {children}
        </h3>
    )
}

// Card Description
export function CardDescription({
    children,
    className = '',
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={`text-body text-gray-600 mt-1 ${className}`} {...props}>
            {children}
        </p>
    )
}

// Card Content
export function CardContent({
    children,
    className = '',
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`${className}`} {...props}>
            {children}
        </div>
    )
}

// Card Footer
export function CardFooter({
    children,
    className = '',
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`} {...props}>
            {children}
        </div>
    )
}

// Profile Card Component
export function ProfileCard({
    name,
    email,
    university,
    courses,
    availability,
    image,
    className = '',
    ...props
}: {
    name: string
    email: string
    university: string
    courses: string[]
    availability: string
    image?: string
    className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <Card interactive className={`${className}`} {...props}>
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    {image ? (
                        <img
                            src={image}
                            alt={name}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                                {name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <CardTitle>{name}</CardTitle>
                    <CardDescription>{email}</CardDescription>
                    <p className="text-sm text-gray-500 mt-1">{university}</p>

                    <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                            {courses.slice(0, 3).map((course, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                    {course}
                                </span>
                            ))}
                            {courses.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    +{courses.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Available: {availability}
                    </div>
                </div>
            </div>
        </Card>
    )
}
