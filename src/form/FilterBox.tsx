import { useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';

export const FilterBox = ({ autoFocus, ...props }: any) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!autoFocus) {
      return;
    }
    if (!inputRef) {
      return;
    }
    inputRef?.current.focus();
  }, [inputRef, autoFocus]);
  return (
    <div className="position-relative">
      <span className="svg-icon svg-icon-3 svg-icon-gray-500 position-absolute top-50 translate-middle ms-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <rect
            opacity="0.5"
            x="17.0365"
            y="15.1223"
            width="8.15546"
            height="2"
            rx="1"
            transform="rotate(45 17.0365 15.1223)"
            fill="black"
          />
          <path
            d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z"
            fill="black"
          />
        </svg>
      </span>
      <Form.Control
        type="text"
        className="form-control-solid ps-10"
        {...props}
        ref={inputRef}
      />
    </div>
  );
};
