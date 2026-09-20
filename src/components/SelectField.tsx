export default function SelectField({ label, example, value, options, onChange, customValue = '', onCustomChange }: {
  label: string
  example: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  customValue?: string
  onCustomChange?: (value: string) => void
}) {
  const choices = onCustomChange && !options.includes('その他') ? [...options, 'その他'] : options
  return <div className="field">
    <label>{label}
      <span className="field-help">例：{example}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {choices.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
    {value === 'その他' && onCustomChange && <label className="custom-field">
      {label}（その他）
      <input value={customValue} placeholder={`例：${example}`} onChange={(event) => onCustomChange(event.target.value)} />
    </label>}
  </div>
}
