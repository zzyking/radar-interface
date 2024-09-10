import React from 'react';

const Alert = ({ message }) => {
  return (
    <div className="absolute top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
      <strong className="font-bold">错误！</strong>
      <span className="block sm:inline"> {message}</span>
    </div>
  );
};

export default Alert;