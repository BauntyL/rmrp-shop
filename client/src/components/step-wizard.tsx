import React, { useState, ReactNode } from 'react';
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

interface StepWizardProps<T> {
  steps: Step[];
  onComplete: (data: T) => void;
  onCancel: () => void;
  category: 'fish' | 'treasure' | 'car' | 'realestate';
  className?: string;
  defaultValues?: Partial<T>;
}

const categoryConfig = {
  fish: {
    gradient: 'from-blue-400 via-cyan-400 to-teal-400',
    bgGradient: 'from-blue-900/20 via-cyan-900/20 to-teal-900/20',
    icon: '🌊',
    title: 'Добавить рыбу',
    accent: 'text-cyan-300'
  },
  treasure: {
    gradient: 'from-yellow-400 via-amber-400 to-orange-400',
    bgGradient: 'from-yellow-900/20 via-amber-900/20 to-orange-900/20',
    icon: '✨',
    title: 'Добавить сокровище',
    accent: 'text-amber-300'
  },
  car: {
    gradient: 'from-red-400 via-pink-400 to-purple-400',
    bgGradient: 'from-red-900/20 via-pink-900/20 to-purple-900/20',
    icon: '🚀',
    title: 'Добавить автомобиль',
    accent: 'text-pink-300'
  },
  realestate: {
    gradient: 'from-green-400 via-emerald-400 to-teal-400',
    bgGradient: 'from-green-900/20 via-emerald-900/20 to-teal-900/20',
    icon: '🏰',
    title: 'Добавить недвижимость',
    accent: 'text-emerald-300'
  }
};

export default function StepWizard<T>({ 
  steps, 
  onComplete, 
  onCancel, 
  category, 
  className,
  defaultValues = {}
}: StepWizardProps<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<T>>(defaultValues);
  
  const config = categoryConfig[category];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData as T);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn('relative flex flex-col h-[90vh] overflow-hidden', className)}>
      {/* Animated Background */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-30',
        config.bgGradient
      )} />
      
      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      <div className="relative z-10 p-8 bg-white/5 backdrop-blur-sm border-b border-white/10">
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
        <div className="flex justify-center mt-8 space-x-4">
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
                onClick={() => setCurrentStep(index)}
              >
                {index < currentStep ? (
                  <Check className="w-6 h-6" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'w-12 h-1 mx-2 rounded-full transition-all duration-300',
                  index < currentStep ? cn('bg-gradient-to-r', config.gradient) : 'bg-white/20'
                )} />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-8 min-h-full bg-white/5 backdrop-blur-sm"
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
      <div className="relative z-10 p-8 bg-white/5 backdrop-blur-sm border-t border-white/10">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="border-white/20 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
          
          <Button
            onClick={nextStep}
            className={cn(
              'bg-gradient-to-r text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105',
              config.gradient
            )}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Создать объявление
              </>
            ) : (
              <>
                Далее
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}