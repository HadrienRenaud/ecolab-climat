import { formatValue, Unit } from 'publicodes'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import NumberFormat from 'react-number-format'
import { currencyFormat, debounce } from '../../utils'
import InputEstimation from './InputEstimation'
import InputSuggestions from './InputSuggestions'
import { InputCommonProps } from './RuleInput'

// TODO: fusionner Input.js et CurrencyInput.js
export default function Input({
	suggestions,
	onChange,
	onSubmit,
	id,
	value,
	defaultValue,
	autoFocus,
	unit,
	inputEstimation,
}: InputCommonProps & { unit?: Unit; onSubmit: (source: string) => void }) {
	const debouncedOnChange = useCallback(debounce(550, onChange), [])
	const { language } = useTranslation().i18n
	const { thousandSeparator, decimalSeparator } = currencyFormat(language)

	// const [currentValue, setCurrentValue] = useState(value)
	return (
		<div className="step input">
			<div>
				<InputSuggestions
					suggestions={suggestions}
					onFirstClick={(value) => {
						onChange(value)
					}}
					onSecondClick={() => onSubmit?.('suggestion')}
					unit={unit}
				/>
				<NumberFormat
					autoFocus={autoFocus}
					className="suffixed ui__"
					id={id}
					placeholder={defaultValue?.nodeValue ?? defaultValue}
					thousandSeparator={thousandSeparator}
					decimalSeparator={decimalSeparator}
					allowEmptyFormatting={true}
					// We don't want to call `onValueChange` in case this component is
					// re-render with a new "value" prop from the outside.
					onValueChange={({ floatValue }) => {
						if (floatValue !== value) {
							debouncedOnChange(floatValue)
						}
					}}
					value={value}
					autoComplete="off"
				/>
				<span className="suffix">
					{formatValue({ nodeValue: value ?? 0, unit }, { language }).replace(
						/[\d,.]*/g,
						''
					)}
				</span>
			</div>
			<div css="width: 100%">
				{inputEstimation && (
					<InputEstimation
						inputEstimation={inputEstimation}
						setFinalValue={(value) => {
							setFormValue(value)
						}}
					/>
				)}
			</div>
		</div>
	)
}