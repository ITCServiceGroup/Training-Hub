import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getFormStyles, validateOptions, optionHelpers, answerHelpers, QUESTION_LIMITS } from '../../../utils/questionFormUtils';
import OptionInput from './OptionInput';
import ValidationMessage from './ValidationMessage';

const MultipleChoiceForm = memo(({ options, correctAnswer, onChange, disabled = false, isDark = false }) => {
  const styles = getFormStyles(isDark);
  const handleOptionChange = useCallback((index, value) => {
    const newOptions = optionHelpers.updateOption(options, index, value);
    onChange(newOptions, correctAnswer);
  }, [options, correctAnswer, onChange]);

  const handleAddOption = useCallback(() => {
    onChange(optionHelpers.addOption(options), correctAnswer);
  }, [options, correctAnswer, onChange]);

  const handleRemoveOption = useCallback((index) => {
    const newOptions = optionHelpers.removeOption(options, index);
    const newCorrectAnswer = answerHelpers.adjustMultipleChoiceAnswer(correctAnswer, index);
    onChange(newOptions, newCorrectAnswer);
  }, [options, correctAnswer, onChange]);

  const handleCorrectAnswerChange = useCallback((index) => {
    onChange(options, index);
  }, [options, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={styles.text.heading}>Answer Options</h3>
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
          isCorrect={correctAnswer === index}
          onValueChange={handleOptionChange}
          onCorrectChange={handleCorrectAnswerChange}
          onRemove={handleRemoveOption}
          disabled={disabled}
          isDark={isDark}
          type="multiple_choice"
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
    </div>
  );
});

MultipleChoiceForm.displayName = 'MultipleChoiceForm';

MultipleChoiceForm.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  correctAnswer: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isDark: PropTypes.bool
};

export default MultipleChoiceForm;
