import { cn } from '@/lib/utils';

// ── Text Input ──
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormInput({ label, error, className, id, ...props }: FormInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-dark mb-1.5">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          error ? 'border-danger' : 'border-gray-200',
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

// ── Textarea ──
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function FormTextarea({ label, error, className, id, ...props }: FormTextareaProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-dark mb-1.5">
        {label}
      </label>
      <textarea
        id={inputId}
        className={cn(
          'w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y min-h-[80px]',
          error ? 'border-danger' : 'border-gray-200',
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

// ── Select ──
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function FormSelect({ label, error, options, className, id, ...props }: FormSelectProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-dark mb-1.5">
        {label}
      </label>
      <select
        id={inputId}
        className={cn(
          'w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white',
          error ? 'border-danger' : 'border-gray-200',
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

// ── Toggle / Switch ──
interface FormToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function FormToggle({ label, checked, onChange, description }: FormToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-dark">{label}</p>
        {description && <p className="text-xs text-neutral-gray">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-gray-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  );
}

// ── Image Upload ──
interface ImageUploadProps {
  label: string;
  preview?: string | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export function ImageUpload({ label, preview, onChange, error }: ImageUploadProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-dark mb-1.5">{label}</label>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-primary/40 transition-colors">
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-1 right-1 w-6 h-6 bg-danger text-white rounded-full text-xs flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="cursor-pointer block py-4">
            <div className="text-neutral-gray text-sm">
              <span className="text-primary font-medium">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-neutral-gray mt-1">PNG, JPG up to 5MB</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onChange(e.target.files?.[0] || null)}
            />
          </label>
        )}
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
