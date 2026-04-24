import React, { useState, createContext, useContext, useEffect, useRef } from "react";

const SelectContext = createContext();

export function Select({ children, className = "", defaultValue = "", value, onValueChange }) {
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || defaultValue);

    useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);

    const handleSelect = (val) => {
        setSelectedValue(val);
        setOpen(false);
        if (onValueChange) onValueChange(val);
    };

    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <SelectContext.Provider value={{ open, setOpen, selectedValue, handleSelect }}>
            <div ref={containerRef} className={`relative w-full ${className}`}>
                {children}
            </div>
        </SelectContext.Provider>
    );
}

export function SelectTrigger({ children, className = "" }) {
    const { open, setOpen } = useContext(SelectContext);
    return (
        <button
            type="button"
            onClick={(e) => { e.preventDefault(); setOpen(!open); }}
            className={`w-full p-2 border rounded-md bg-white flex justify-between items-center ${className}`}
        >
            {children}
            <span className="text-gray-400 text-xs">▼</span>
        </button>
    );
}

export function SelectValue({ placeholder = "Select...", className = "" }) {
    const { selectedValue } = useContext(SelectContext);
    // Determine the label. Since the trigger often just has `<SelectValue />`, 
    // it will display the raw value unless mapped.
    return <span className={`text-gray-700 ${className}`}>{selectedValue || placeholder}</span>;
}

export function SelectContent({ children, className = "" }) {
    const { open } = useContext(SelectContext);
    return (
        open && (
            <div className={`absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto ${className}`}>
                {children}
            </div>
        )
    );
}

export function SelectItem({ value, children, className = "" }) {
    const { selectedValue, handleSelect } = useContext(SelectContext);
    const isSelected = selectedValue === value;
    
    return (
        <div
            onClick={() => handleSelect(value)}
            className={`p-2 cursor-pointer transition-colors ${isSelected ? 'bg-purple-100 text-purple-900' : 'hover:bg-gray-100 text-gray-700'} ${className}`}
        >
            {children}
        </div>
    );
}
