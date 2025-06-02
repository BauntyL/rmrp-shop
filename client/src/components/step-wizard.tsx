import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  isValid?: boolean;
}

interface StepWizardProps {
  steps: Step[];
  onComplete: (data: any) => void;
  onCancel: () => void;
  category: 'fish' | 'treasure' | 'car' | 'realestate';
  className?: string;
  defaultValues?: any;
}

const categoryConfig = {
  fish: {
    color: 'blue',
    icon: '🐟',
    title: 'Добавить рыбу'
  },
  treasure: {
    color: 'amber',
    icon: '💎',
    title: 'Добавить сокровище'
  },
  car: {
    color: 'red',
    icon: '🚗',
    title: 'Добавить автомобиль'
  },
  realestate: {
    color: 'green',
    icon: '🏠',
    title: 'Добавить недвижимость'
  }
};

const colorClasses = {
  blue: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'text-blue-600',
    progress: 'bg-blue-600'
  },
  amber: {
    primary: 'bg-amber-600 hover:bg-amber-700 text-white',
    secondary: 'text-amber-600',
    progress: 'bg-amber-600'
  },
  red: {
    primary: 'bg-red-600 hover:bg-red-700 text-white',
    secondary: 'text-red-600',
    progress: 'bg-red-600'
  },
  green: {
    primary: 'bg-green-600 hover:bg-green-700 text-white',
    secondary: 'text-green-600',
    progress: 'bg-green-600'
  }
};

export default function StepWizard({ 
  steps, 
  onComplete, 
  onCancel, 
  category, 
  className,
  defaultValues = {}
}: StepWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(defaultValues);
  
  const config = categoryConfig[category];
  const colors = colorClasses[config.color];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">{config.icon}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-gray-600 mt-1">{steps[currentStep].title}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Шаг {currentStep + 1} из {steps.length}</span>
            <span>{Math.round(progress)}% завершено</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', colors.progress)}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center mt-6 space-x-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex items-center',
                index < steps.length - 1 && 'mr-8'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  index === currentStep
                    ? colors.primary
                    : index < currentStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'w-8 h-0.5 ml-3',
                  index < currentStep ? 'bg-green-300' : 'bg-gray-200'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-8"
          >
            {React.cloneElement(steps[currentStep].component as React.ReactElement, {
              data: formData,
              onDataChange: setFormData,
              onValidationChange: (isValid: boolean) => {
                // Handle validation
              }
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          
          <Button
            onClick={nextStep}
            className={colors.primary}
          >
            {currentStep === steps.length - 1 ? (
              'Создать объявление'
            ) : (
              <>
                Далее
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}