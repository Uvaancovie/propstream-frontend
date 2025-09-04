import React from 'react';

// Simple input component that prevents scroll behaviors
const SimpleInput = ({ 
  type = 'text',
  value,
  onChange,
  placeholder,
  className,
  disabled,
  required,
  autoComplete,
  ...props 
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      autoComplete={autoComplete}
      {...props}
    />
  );
};

export default SimpleInput;
