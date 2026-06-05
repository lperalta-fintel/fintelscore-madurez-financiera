import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Building2, Mail, Triangle, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { PhoneInput } from './PhoneInput';

interface LeadData {
  name: string;
  position: string;
  company: string;
  email: string;
  whatsapp: string;
}

interface LeadCaptureProps {
  onSubmit: (data: LeadData) => void;
  isLoading: boolean;
}

export function LeadCapture({ onSubmit, isLoading }: LeadCaptureProps) {
  const [formData, setFormData] = useState<LeadData>({
    name: '',
    position: '',
    company: '',
    email: '',
    whatsapp: '',
  });

  const [errors, setErrors] = useState<Partial<LeadData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LeadData, boolean>>>({});

  const validateField = (name: keyof LeadData, value: string): string => {
    switch (name) {
      case 'name':
        return value.trim().length < 2 ? 'Nombre requerido' : '';
      case 'position':
        return value.trim().length < 2 ? 'Cargo requerido' : '';
      case 'company':
        return value.trim().length < 2 ? 'Empresa requerida' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email inválido' : '';
      case 'whatsapp':
        return value.trim().length < 8 ? 'WhatsApp requerido' : '';
      default:
        return '';
    }
  };

  const handleChange = (name: keyof LeadData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name: keyof LeadData) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name]) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<LeadData> = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof LeadData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      position: true,
      company: true,
      email: true,
      whatsapp: true,
    });

    if (!hasErrors) {
      onSubmit(formData);
    }
  };

  const isFormValid = Object.keys(formData).every(
    key => !validateField(key as keyof LeadData, formData[key as keyof LeadData])
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl p-8 border border-fintel-border-light shadow-glass-lg overflow-hidden">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center mb-8"
          >
            <div className="mx-auto mb-4 flex items-center justify-center">
              <Triangle className="w-16 h-16 text-fintel-green fill-fintel-green" />
            </div>
            <h2 className="text-2xl font-bold text-fintel-text-primary mb-2">
              Tu análisis está listo
            </h2>
            <p className="text-fintel-text-secondary">
              ¿A dónde enviamos el reporte detallado?
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              icon={<User className="w-5 h-5" />}
              placeholder="Nombre completo"
              value={formData.name}
              onChange={(v) => handleChange('name', v)}
              onBlur={() => handleBlur('name')}
              error={touched.name ? errors.name : undefined}
              delay={0.3}
            />

            <InputField
              icon={<Briefcase className="w-5 h-5" />}
              placeholder="Cargo"
              value={formData.position}
              onChange={(v) => handleChange('position', v)}
              onBlur={() => handleBlur('position')}
              error={touched.position ? errors.position : undefined}
              delay={0.35}
            />

            <InputField
              icon={<Building2 className="w-5 h-5" />}
              placeholder="Empresa"
              value={formData.company}
              onChange={(v) => handleChange('company', v)}
              onBlur={() => handleBlur('company')}
              error={touched.company ? errors.company : undefined}
              delay={0.4}
            />

            <InputField
              icon={<Mail className="w-5 h-5" />}
              type="email"
              placeholder="Email corporativo"
              value={formData.email}
              onChange={(v) => handleChange('email', v)}
              onBlur={() => handleBlur('email')}
              error={touched.email ? errors.email : undefined}
              delay={0.45}
            />

            <PhoneInput
              value={formData.whatsapp}
              onChange={(v) => handleChange('whatsapp', v)}
              onBlur={() => handleBlur('whatsapp')}
              error={touched.whatsapp ? errors.whatsapp : undefined}
              delay={0.5}
            />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="pt-4"
            >
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  'Revelar mi FINTEL Score'
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface InputFieldProps {
  icon: React.ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  delay: number;
}

function InputField({
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  delay,
}: InputFieldProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-fintel-text-secondary">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`w-full bg-fintel-bg-light border rounded-xl pl-12 pr-4 py-3 text-fintel-text-primary placeholder-fintel-text-secondary transition-all duration-200 focus:outline-none ${
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
              : 'border-fintel-border-light focus:border-fintel-cyan focus:shadow-input-focus'
          }`}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-1 pl-4"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
