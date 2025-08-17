import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getFormStyles } from '../../../utils/questionFormUtils';
import ValidationMessage from './ValidationMessage';

const TrueFalseForm = memo(({ correctAnswer, onChange, disabled = false, isDark = false }) => {
  const styles = getFormStyles(isDark);

  const handleTrueChange = useCallback(() => {
    onChange(true);
  }, [onChange]);

  const handleFalseChange = useCallback(() => {
    onChange(false);
  }, [onChange]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className={styles.text.heading + ' mb-4'}>Select Correct Answer</h3>
        <div className="flex gap-6">
          <div className="flex items-start">
            <div className="pt-0.5 pr-2">
              <input
                type="radio"
                name="true-false-answer"
                className={`h-4 w-4 ${styles.radio}`}
                checked={correctAnswer === true}
                onChange={handleTrueChange}
                disabled={disabled}
                required
              />
            </div>
            <label
              className={styles.text.label}
              onClick={disabled ? undefined : handleTrueChange}
            >
              True
            </label>
          </div>

          <div className="flex items-start">
            <div className="pt-0.5 pr-2">
              <input
                type="radio"
                name="true-false-answer"
                className={`h-4 w-4 ${styles.radio}`}
                checked={correctAnswer === false}
                onChange={handleFalseChange}
                disabled={disabled}
                required
              />
            </div>
            <label
              className={styles.text.label}
              onClick={disabled ? undefined : handleFalseChange}
            >
              False
            </label>
          </div>
        </div>
      </div>

      <ValidationMessage
        type="error"
        message={correctAnswer === undefined ? 'Please select the correct answer' : null}
        isDark={isDark}
      />
    </div>
  );
});

TrueFalseForm.displayName = 'TrueFalseForm';

TrueFalseForm.propTypes = {
  correctAnswer: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isDark: PropTypes.bool
};

export default TrueFalseForm;
