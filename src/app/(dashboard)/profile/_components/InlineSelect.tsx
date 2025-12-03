'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { createOrUpdateProfile } from '@/lib/actions/profile';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface InlineSelectProps {
  value: string | null;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  fieldName: 'preferredLocation' | 'studyStyle' | 'studyPace';
  icon?: React.ReactNode;
  label: string;
}

export function InlineSelect({
  value,
  options,
  onChange,
  fieldName,
  icon,
  label,
}: InlineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption?.label || 'Not set';

  const handleSelect = (optionValue: string) => {
    if (optionValue === value) {
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append(fieldName, optionValue);
      const result = await createOrUpdateProfile(formData);

      if (result.success) {
        onChange(optionValue);
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1a1a1a] border border-white/5 hover:border-indigo-500/50 transition text-left group disabled:opacity-50"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
          <span className="text-sm text-gray-300 flex-shrink-0">{label}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-medium text-white truncate">
            {displayValue}
          </span>
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform flex-shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden">
          {options
            .filter(opt => opt.value !== '') // Filter out empty placeholder
            .map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                disabled={isPending}
                className={`w-full px-4 py-2.5 text-left text-sm transition ${
                  value === option.value
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                } disabled:opacity-50`}
              >
                {option.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
