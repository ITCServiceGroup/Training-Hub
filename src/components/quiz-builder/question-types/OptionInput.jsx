import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getFormStyles, QUESTION_LIMITS } from '../../../utils/questionFormUtils';

const OptionInput = memo(({ 
  index, 
  value, 
  isCorrect, 
  onValueChange, 
  onCorrectChange, 
  onRemove, 
  disabled = false, 
  isDark = false,
  type = 'multiple_choice', // 'multiple_choice' or 'check_all_that_apply'
  canRemove = true,
  totalOptions = 0
}) => {
  const styles = getFormStyles(isDark);

  const handleValueChange = useCallback((e) => {
    onValueChange(index, e.target.value);
  }, [index, onValueChange]);

  const handleCorrectChange = useCallback((e) => {
    if (type === 'multiple_choice') {
      onCorrectChange(index);
    } else {
      onCorrectChange(index, e.target.checked);
    }
  }, [index, onCorrectChange, type]);

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  const isRemoveDisabled = disabled || !canRemove || totalOptions <= QUESTION_LIMITS.MIN_OPTIONS;

  return (
    <div className="mb-2">
      {type === 'multiple_choice' ? (
        // Multiple Choice Layout
        <div className="flex items-start" style={{ position: 'relative' }}>
          <div className="pt-2 pr-3">
            <input
              type="radio"
              name="correct-answer"
              className={styles.radio}
              checked={isCorrect}
              onChange={handleCorrectChange}
              disabled={disabled}
              required={index === 0}
            />
          </div>
          <div className="flex-1" style={{ paddingRight: '90px' }}>
            <input
              type="text"
              value={value}
              onChange={handleValueChange}
              className={styles.input}
              placeholder={`Option ${index + 1}`}
              required
              disabled={disabled}
              style={{ height: '38px' }}
            />
          </div>
          <div style={{ position: 'absolute', right: 0, top: 0 }}>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoveDisabled}
              className={styles.button.remove}
              style={{
                height: '38px',
                padding: '0 12px',
                marginTop: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        // Check All That Apply Layout
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={isCorrect}
            onChange={handleCorrectChange}
            disabled={disabled}
          />
          <input
            type="text"
            value={value}
            onChange={handleValueChange}
            className={styles.input}
            placeholder={`Option ${index + 1}`}
            required
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoveDisabled}
            className={styles.button.remove}
            style={{
              padding: '0.5rem 0.75rem',
              lineHeight: '1',
              height: '38px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
});

OptionInput.displayName = 'OptionInput';

OptionInput.propTypes = {
  index: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
  isCorrect: PropTypes.bool.isRequired,
  onValueChange: PropTypes.func.isRequired,
  onCorrectChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isDark: PropTypes.bool,
  type: PropTypes.oneOf(['multiple_choice', 'check_all_that_apply']),
  canRemove: PropTypes.bool,
  totalOptions: PropTypes.number
};

export default OptionInput;