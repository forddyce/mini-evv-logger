import React from "react";

interface ClockOutSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome: () => void;
  date: string;
  timeRange: string;
  duration: string;
}

const ClockOutSuccessModal: React.FC<ClockOutSuccessModalProps> = ({
  isOpen,
  onClose,
  onGoHome,
  date,
  timeRange,
  duration,
}) => {
  const modalContentClass =
    "bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative transform transition-all duration-300 scale-100 opacity-100 md:block hidden";
  const mobileModalContentClass =
    "fixed inset-0 bg-emerald-700 flex flex-col items-center justify-between p-6 sm:p-8 z-50 md:hidden";

  if (!isOpen) return null;

  return (
    <>
      <div className="hidden md:flex fixed inset-0 bg-gray-600 bg-opacity-50 items-center justify-center p-4 z-50">
        <div className={modalContentClass}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="bg-emerald-100 rounded-full p-4 mb-6">
              <svg
                className="w-16 h-16 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Schedule Completed
            </h3>

            <div className="flex items-center text-gray-700 text-base mb-2">
              <svg
                className="w-5 h-5 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <span>{date}</span>
            </div>

            <div className="flex items-center text-gray-700 text-base mb-6">
              <svg
                className="w-5 h-5 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>
                {timeRange} SGT ({duration})
              </span>
            </div>

            <button
              onClick={onGoHome}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors duration-200 w-full"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>

      <div className={mobileModalContentClass}>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:text-gray-200 focus:outline-none"
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <div className="flex flex-col items-center justify-center text-center flex-grow">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-orange-400 rounded-full flex items-center justify-center z-10">
              <svg
                className="w-20 h-20 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <span className="absolute top-0 left-1/4 w-2 h-2 bg-pink-300 rounded-full animate-pulse"></span>
            <span className="absolute top-1/4 right-0 w-3 h-3 bg-blue-300 rounded-full animate-pulse delay-100"></span>
            <span className="absolute bottom-1/4 left-0 w-2 h-2 bg-yellow-300 rounded-full animate-pulse delay-200"></span>
            <span className="absolute bottom-0 right-1/3 w-3 h-3 bg-purple-300 rounded-full animate-pulse delay-300"></span>
            <span className="absolute top-1/2 left-0 w-1 h-8 bg-orange-300 transform rotate-45 animate-pulse delay-400"></span>
            <span className="absolute bottom-1/2 right-0 w-1 h-8 bg-green-300 transform -rotate-45 animate-pulse delay-500"></span>
          </div>

          <h3 className="text-3xl font-bold text-white mb-6">
            Schedule Completed
          </h3>

          <div className="bg-emerald-600 rounded-lg p-5 w-full max-w-xs text-center">
            <div className="flex items-center text-white text-base mb-2">
              <svg
                className="w-5 h-5 mr-2 opacity-80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <span>{date}</span>
            </div>

            <div className="flex items-center text-white text-base">
              <svg
                className="w-5 h-5 mr-2 opacity-80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>
                {timeRange} SGT ({duration})
              </span>
            </div>
          </div>
        </div>

        <div className="w-full">
          <button
            onClick={onGoHome}
            className="bg-white text-emerald-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg shadow-md transition-colors duration-200 w-full"
          >
            Go to Home
          </button>
        </div>
      </div>
    </>
  );
};

export default ClockOutSuccessModal;
