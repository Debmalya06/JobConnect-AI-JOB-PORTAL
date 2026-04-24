import React, { useState, createContext, useContext } from "react";

const PopoverContext = createContext();

export function Popover({ children, className = "" }) {
    const [open, setOpen] = useState(false);
    return (
        <PopoverContext.Provider value={{ open, setOpen }}>
            <div className={`relative ${className}`}>
                {children}
            </div>
        </PopoverContext.Provider>
    );
}

export function PopoverTrigger({ onClick, children, className = "", asChild }) {
    const context = useContext(PopoverContext);
    
    const handleClick = (e) => {
        if (context) context.setOpen(!context.open);
        if (onClick) onClick(e);
    };

    if (asChild) {
        return React.cloneElement(children, { onClick: handleClick });
    }

    return (
        <button type="button" onClick={handleClick} className={`p-2 bg-gray-200 rounded-md ${className}`}>
            {children}
        </button>
    );
}

export function PopoverContent({ children, className = "", align = "start" }) {
    const context = useContext(PopoverContext);
    const alignmentClass = align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2";
    
    if (!context || !context.open) return null;
    
    return (
        <div className={`absolute z-50 mt-2 bg-white shadow-md p-2 rounded-md border ${alignmentClass} ${className}`}>
            {children}
        </div>
    );
}
