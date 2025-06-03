// frontend/src/components/common/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-2',
    lg: 'h-16 w-16 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-primary-600 border-gray-300 ${sizeClasses[size]}`}></div>
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;

// frontend/src/components/common/ErrorMessage.js
import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ErrorMessage = ({ 
  title = 'Something went wrong', 
  message = 'Please try again later.',
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

// frontend/src/components/common/EmptyState.js
import React from 'react';

const EmptyState = ({ 
  icon: Icon,
  title,
  message,
  action,
  actionText = 'Get Started'
}) => {
  return (
    <div className="text-center py-12">
      {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      {action && (
        <button onClick={action} className="btn-primary">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

// frontend/src/components/common/ConfirmDialog.js
import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' // danger, warning, info
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="btn-outline"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`btn text-white ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;