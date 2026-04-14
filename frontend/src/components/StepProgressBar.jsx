import React from 'react';

const StepProgressBar = ({ currentStep, totalSteps = 4 }) => {
  const steps = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Mental & Emotional' },
    { num: 3, label: 'Physical Generals' },
    { num: 4, label: 'Complaints' }
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
        {steps.map((step, index) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          const isPending = currentStep < step.num;

          return (
            <div key={index} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300
                  ${isActive ? 'bg-green-600 text-white ring-4 ring-green-100' : ''}
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isPending ? 'bg-gray-200 text-gray-500' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <div 
                className={`absolute top-12 text-xs font-medium w-32 text-center hidden md:block
                  ${(isActive || isCompleted) ? 'text-green-800' : 'text-gray-400'}
                `}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
      {/* Mobile label display */}
      <div className="mt-6 text-center md:hidden font-medium text-green-800">
        Step {currentStep} of {totalSteps}: {steps[currentStep - 1].label}
      </div>
    </div>
  );
};

export default StepProgressBar;
