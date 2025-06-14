import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaChevronDown } from "react-icons/fa";

type Option = {
  value: string;
  label: string;
  avatar?: string | null;
  email?: string;
  icon?: React.ReactNode;
};

type CustomSelectProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder = "Выберите...",
  className = "",
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div 
      ref={dropdownRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer flex items-center justify-between w-full px-3 py-2 text-left border rounded-md transition-all ${
          isOpen ? "ring-2 ring-focus border-focus" : "border-gray-300 hover:border-gray-400"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.avatar && (
                <Image
                  src={selectedOption.avatar}
                  alt="avatar"
                  className="w-6 h-6 rounded-full"
                  width={24}
                  height={24}
                />
              )}
              {selectedOption.icon}
              <span className="truncate">
                {selectedOption.label}
                {selectedOption.email && (
                  <span className="block text-xs text-gray-500 truncate">
                    {selectedOption.email}
                  </span>
                )}
              </span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <FaChevronDown 
          className={`text-gray-500 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          size={14}
        />
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg focus:outline-none max-h-60 overflow-y-auto"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                value === option.value
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              {option.avatar && (
                <Image
                  src={option.avatar}
                  alt="avatar"
                  className="w-6 h-6 rounded-full"
                  width={24}
                  height={24}
                />
              )}
              {option.icon}
              <div className="flex-1 min-w-0">
                <div className="truncate">{option.label}</div>
                {option.email && (
                  <div className="text-xs text-gray-500 truncate">{option.email}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};