import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getFormStyles, validateOptions, optionHelpers, answerHelpers, QUESTION_LIMITS } from '../../../utils/questionFormUtils';
import OptionInput from './OptionInput';
import ValidationMessage from './ValidationMessage';

const CheckAllThatApplyForm = memo(({ options, correctAnswers, onChange, disabled = false, isDark = false }) => {
  const styles = getFormStyles(isDark);
  
  const handleOptionChange = useCallback((index, value) => {
    const newOptions = optionHelpers.updateOption(options, index, value);
    onChange(newOptions, correctAnswers);
  }, [options, correctAnswers, onChange]);

  const handleAddOption = useCallback(() => {
    onChange(optionHelpers.addOption(options), correctAnswers);
  }, [options, correctAnswers, onChange]);

  const handleRemoveOption = useCallback((index) => {
    const newOptions = optionHelpers.removeOption(options, index);
    const newCorrectAnswers = answerHelpers.adjustCheckAllAnswers(correctAnswers, index);
    onChange(newOptions, newCorrectAnswers);
  }, [options, correctAnswers, onChange]);

  const handleCorrectAnswerChange = useCallback((index, isChecked) => {
    const newCorrectAnswers = answerHelpers.toggleCheckAllAnswer(correctAnswers, index, isChecked);
    onChange(options, newCorrectAnswers);
  }, [options, correctAnswers, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={styles.text.heading}>Answer Options (Select all correct answers)</h3>
        <button
          type="button"
          className={styles.button.primary}
          onClick={handleAddOption}
          disabled={disabled || options.length >= QUESTION_LIMITS.MAX_OPTIONS}
        >
          Add Option
        </button>
      </div>

      {options.map((option, index) => (
        <OptionInput
          key={index}
          index={index}
          value={option}
          isCorrect={correctAnswers.includes(index)}
          onValueChange={handleOptionChange}
          onCorrectChange={handleCorrectAnswerChange}
          onRemove={handleRemoveOption}
          disabled={disabled}
          isDark={isDark}
          type="check_all_that_apply"
          totalOptions={options.length}
        />
      ))}

      <ValidationMessage
        type="info"
        message={options.length >= QUESTION_LIMITS.MAX_OPTIONS ? `Maximum of ${QUESTION_LIMITS.MAX_OPTIONS} options allowed` : null}
        isDark={isDark}
      />

      <ValidationMessage
        type="error"
        message={!validateOptions.hasMinimumOptions(options) ? `At least ${QUESTION_LIMITS.MIN_OPTIONS} options are required` : null}
        isDark={isDark}
      />

      <ValidationMessage
        type="error"
        message={correctAnswers.length === 0 ? 'Select at least one correct answer' : null}
        isDark={isDark}
      />

      <ValidationMessage
        type="warning"
        message={correctAnswers.length === options.length && options.length > 0 ? 'Warning: All options are marked as correct' : null}
        isDark={isDark}
      />
    </div>
  );
});

CheckAllThatApplyForm.displayName = 'CheckAllThatApplyForm';

CheckAllThatApplyForm.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  correctAnswers: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isDark: PropTypes.bool
};

export default CheckAllThatApplyForm;
