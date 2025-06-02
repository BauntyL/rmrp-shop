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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  steps: Step[];
  onComplete: (data: any) => void;
  onCancel: () => void;
  category: 'fish' | 'treasure' | 'car' | 'realestate';
  className?: string;
}

const categoryThemes = {
  fish: {
    gradient: 'from-blue-600/20 via-cyan-500/10 to-teal-600/20',
    accent: 'text-cyan-400',
    button: 'bg-cyan-600 hover:bg-cyan-700',
    progress: 'bg-cyan-500',
    icon: '🐟'
  },
  treasure: {
    gradient: 'from-yellow-600/20 via-amber-500/10 to-orange-600/20',
    accent: 'text-amber-400',
    button: 'bg-amber-600 hover:bg-amber-700',
    progress: 'bg-amber-500',
    icon: '💎'
  },
  car: {
    gradient: 'from-red-600/20 via-rose-500/10 to-pink-600/20',
    accent: 'text-rose-400',
    button: 'bg-rose-600 hover:bg-rose-700',
    progress: 'bg-rose-500',
    icon: '🚗'
  },
  realestate: {
    gradient: 'from-green-600/20 via-emerald-500/10 to-teal-600/20',
    accent: 'text-emerald-400',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    progress: 'bg-emerald-500',
    icon: '🏠'
  }
};

export default function StepWizard({ 
  steps, 
  onComplete, 
  onCancel, 
  category, 
  className 
}: StepWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const theme = categoryThemes[category];

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

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= currentStep || steps[stepIndex - 1]?.isValid) {
      setCurrentStep(stepIndex);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'relative w-full overflow-hidden',
        'bg-transparent rounded-2xl',
        'bg-gradient-to-br', theme.gradient,
        className
      )}
    >
      {/* Header */}
      <div className="relative p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{theme.icon}</span>
            <div>
              <h2 className={cn('text-xl font-bold', theme.accent)}>
                {steps[currentStep].title}
              </h2>
              {steps[currentStep].description && (
                <p className="text-sm text-slate-400">
                  {steps[currentStep].description}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </Button>
        </div>
    
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Шаг {currentStep + 1} из {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', `bg-${theme.progress}`)} 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
    
        {/* Step Indicators */}
        <div className="flex justify-center mt-4 space-x-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                index === currentStep
                  ? cn('text-white', theme.button)
                  : index < currentStep
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              )}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </button>
          ))}
        </div>
      </div>
    
        {/* Content */}
        <div className="relative h-[60vh] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 p-6 overflow-y-auto scrollbar-hide"
            >
              {steps[currentStep].component}
            </motion.div>
          </AnimatePresence>
        </div>
    
        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            
            <Button
              onClick={nextStep}
              disabled={steps[currentStep].isValid === false}
              className={theme.button}
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
      </motion.div>
    </div>
  );
}