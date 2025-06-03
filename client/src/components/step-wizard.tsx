import React, { useState, ReactNode, cloneElement, isValidElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

interface Step {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  isValid?: boolean;
}

const categoryConfig = {
  fish: {
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/20 to-cyan-500/20",
    icon: "🐟",
    title: "Рыба",
    accent: "blue",
  },
  treasure: {
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/20 to-pink-500/20",
    icon: "💎",
    title: "Сокровище",
    accent: "purple",
  },
  car: {
    gradient: "from-red-500 to-orange-500",
    bgGradient: "from-red-500/20 to-orange-500/20",
    icon: "🚗",
    title: "Автомобиль",
    accent: "red",
  },
  realestate: {
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-500/20 to-emerald-500/20",
    icon: "🏠",
    title: "Недвижимость",
    accent: "green",
  },
  listing: {
    gradient: "from-violet-500 to-indigo-500",
    bgGradient: "from-violet-500/20 to-indigo-500/20",
    icon: "📦",
    title: "Объявление",
    accent: "violet",
  },
};

interface StepWizardProps<T = any> {
  steps: Step[];
  onComplete: (data: T) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  category: keyof typeof categoryConfig;
  className?: string;
  defaultValues?: T;
  additionalProps?: any;
}

export default function StepWizard<T>({ 
  steps: initialSteps, 
  onComplete, 
  onCancel, 
  isLoading,
  category,
  className,
  defaultValues = {} as T,
  additionalProps
}: StepWizardProps<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<T>>(defaultValues);
  const [isStepValid, setIsStepValid] = useState(false);
  
  const config = categoryConfig[category];

  // Создаем копии компонентов с актуальными данными и обработчиками
  const steps = initialSteps.map((step) => ({
    ...step,
    component: isValidElement(step.component)
      ? cloneElement(step.component, {
          data: formData,
          onDataChange: (newData: Partial<T>) => {
            console.log('Step data update:', newData);
            setFormData((prev) => ({
              ...prev,
              ...newData,
            }));
          },
          onValidationChange: (isValid: boolean) => {
            console.log('Step validation:', isValid);
            setIsStepValid(isValid);
          },
          ...additionalProps,
        })
      : step.component,
  }));

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsStepValid(false);
    } else {
      console.log('Final form data:', formData);
      onComplete(formData as T);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsStepValid(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn('relative flex flex-col min-h-[500px] max-h-[80vh]', className)}>
      {/* Animated Background */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-30',
        config.bgGradient
      )} />
      
      {/* Floating Orbs */}
      <div className="relative">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className={cn(
            'absolute top-20 right-20 w-32 h-32 rounded-full blur-xl opacity-20 bg-gradient-to-r',
            config.gradient
          )}
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 120, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
          className={cn(
            'absolute bottom-20 left-20 w-24 h-24 rounded-full blur-xl opacity-15 bg-gradient-to-r',
            config.gradient
          )}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="text-4xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {config.icon}
            </motion.div>
            <div>
              <h1 className={cn(
                'text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
                config.gradient
              )}>
                {config.title}
              </h1>
              <p className="text-white/70 mt-1 text-lg">{steps[currentStep].title}</p>
            </div>
          </div>
          <Sparkles className={cn('w-8 h-8', config.accent)} />
        </div>

        {/* Progress */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-white/60">
            <span>Шаг {currentStep + 1} из {steps.length}</span>
            <span>{Math.round(progress)}% завершено</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className={cn(
                'h-full rounded-full bg-gradient-to-r',
                config.gradient
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex items-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 cursor-pointer',
                  index === currentStep
                    ? cn('bg-gradient-to-r text-white shadow-lg', config.gradient)
                    : index < currentStep
                    ? 'bg-green-500/80 text-white backdrop-blur-sm'
                    : 'bg-white/10 text-white/50 backdrop-blur-sm hover:bg-white/20'
                )}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-white/20" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1 p-6 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {steps[currentStep].component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="relative p-6 border-t border-white/10">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : prevStep}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            {currentStep === 0 ? 'Отмена' : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Назад
              </>
            )}
          </Button>
          <Button
            onClick={nextStep}
            disabled={!isStepValid}
            className={cn(
              'text-white',
              isStepValid ? cn('bg-gradient-to-r shadow-lg', config.gradient) : 'bg-white/10'
            )}
          >
            {currentStep === steps.length - 1 ? (
              isLoading ? 'Создание...' : 'Создать'
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