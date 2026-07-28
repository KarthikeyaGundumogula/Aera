import { Check } from "lucide-react";

interface PasswordRulesChecklistProps {
  password: string;
}

export function validatePasswordRules(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const rules = validatePasswordRules(password);
  return rules.minLength && rules.hasUppercase && rules.hasLowercase && rules.hasNumber;
}

export function PasswordRulesChecklist({ password }: PasswordRulesChecklistProps) {
  const rules = validatePasswordRules(password);

  const ruleItems = [
    { label: "8+ chars", valid: rules.minLength },
    { label: "Uppercase (A-Z)", valid: rules.hasUppercase },
    { label: "Lowercase (a-z)", valid: rules.hasLowercase },
    { label: "Number (0-9)", valid: rules.hasNumber },
  ];

  return (
    <div className="flex flex-wrap gap-2 text-[10px] font-sans pt-1">
      {ruleItems.map((item, idx) => (
        <div
          key={idx}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all ${
            item.valid
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold"
              : "bg-white/5 border-white/10 text-white/30 font-medium"
          }`}
        >
          {item.valid ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-sm bg-white/20" />
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
