import { PhoneInput as ReactPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Label } from '@/components/ui/label';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  label?: string;
  id?: string;
  required?: boolean;
}

export const PhoneInput = ({ value, onChange, label, id, required = false }: PhoneInputProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <ReactPhoneInput
        defaultCountry="us"
        value={value}
        onChange={onChange}
        inputProps={{
          id,
          required,
        }}
        inputClassName="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        countrySelectorStyleProps={{
          buttonClassName: "h-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          buttonContentWrapperClassName: "flex items-center gap-1",
          dropdownStyleProps: {
            className: "bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto",
            listItemClassName: "px-3 py-2 hover:bg-accent cursor-pointer",
          }
        }}
      />
      {!required && (
        <p className="text-xs text-muted-foreground">
          Optional - Include country code
        </p>
      )}
    </div>
  );
};
