import React, { createContext, useContext, useState } from "react";

const RadioGroupContext = createContext();

export function RadioGroup({ name, defaultValue, onChange, children, className = "" }) {
    const [selectedValue, setSelectedValue] = useState(defaultValue);
    
    const handleChange = (e) => {
        setSelectedValue(e.target.value);
        if (onChange) onChange(e);
    };

    return (
        <RadioGroupContext.Provider value={{ name, selectedValue, handleChange }}>
            <div className={`flex flex-col space-y-2 ${className}`}>
                {children}
            </div>
        </RadioGroupContext.Provider>
    );
}

export function RadioGroupItem({ value, id, className = "" }) {
    const context = useContext(RadioGroupContext);
    
    if (!context) {
        return <input type="radio" value={value} id={id} className={`form-radio text-purple-600 ${className}`} />;
    }
    
    const { name, selectedValue, handleChange } = context;

    return (
        <input
            type="radio"
            name={name}
            value={value}
            id={id}
            checked={selectedValue === value}
            onChange={handleChange}
            className={`form-radio text-purple-600 ${className}`}
        />
    );
}

export default RadioGroup;
