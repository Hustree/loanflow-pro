import { 
  validatePnpBfpId, 
  validateLoanAmount, 
  validateMonthlyIncome,
  validateEmail,
  validatePhoneNumber,
  validateRequiredField,
  validateLoanEligibility
} from './validators';

describe('Validators', () => {
  describe('validatePnpBfpId', () => {
    it('should return true for valid PNP/BFP ID', () => {
      expect(validatePnpBfpId('PNP123456')).toBe(true);
      expect(validatePnpBfpId('BFP987654')).toBe(true);
      expect(validatePnpBfpId('123456789012')).toBe(true);
    });

    it('should return false for invalid PNP/BFP ID', () => {
      expect(validatePnpBfpId('12345')).toBe(false); // Too short
      expect(validatePnpBfpId('1234567890123')).toBe(false); // Too long
      expect(validatePnpBfpId('')).toBe(false); // Empty
    });
  });

  describe('validateLoanAmount', () => {
    it('should return true for valid loan amounts', () => {
      expect(validateLoanAmount(10000)).toBe(true);
      expect(validateLoanAmount(250000)).toBe(true);
      expect(validateLoanAmount(500000)).toBe(true);
    });

    it('should return false for invalid loan amounts', () => {
      expect(validateLoanAmount(999)).toBe(false); // Below minimum
      expect(validateLoanAmount(500001)).toBe(false); // Above maximum
      expect(validateLoanAmount(0)).toBe(false);
      expect(validateLoanAmount(-1000)).toBe(false);
    });
  });

  describe('validateMonthlyIncome', () => {
    it('should return true for valid monthly income', () => {
      expect(validateMonthlyIncome(15000)).toBe(true);
      expect(validateMonthlyIncome(50000)).toBe(true);
      expect(validateMonthlyIncome(100000)).toBe(true);
    });

    it('should return false for invalid monthly income', () => {
      expect(validateMonthlyIncome(0)).toBe(false);
      expect(validateMonthlyIncome(-5000)).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('john.doe@company.co.uk')).toBe(true);
      expect(validateEmail('test+tag@email.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should return true for valid Philippine phone numbers', () => {
      expect(validatePhoneNumber('+639171234567')).toBe(true);
      expect(validatePhoneNumber('09171234567')).toBe(true);
      expect(validatePhoneNumber('639171234567')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(validatePhoneNumber('1234567')).toBe(false);
      expect(validatePhoneNumber('+1234567890')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  describe('validateRequiredField', () => {
    it('should return true for non-empty values', () => {
      expect(validateRequiredField('test')).toBe(true);
      expect(validateRequiredField('   spaces   ')).toBe(true);
      expect(validateRequiredField('123')).toBe(true);
    });

    it('should return false for empty values', () => {
      expect(validateRequiredField('')).toBe(false);
      expect(validateRequiredField('   ')).toBe(false);
      expect(validateRequiredField(null as any)).toBe(false);
      expect(validateRequiredField(undefined as any)).toBe(false);
    });
  });

  describe('validateLoanEligibility', () => {
    it('should return eligible for valid income-to-loan ratio', () => {
      const result = validateLoanEligibility(50000, 100000, 12);
      expect(result.isEligible).toBe(true);
      expect(result.maxLoanAmount).toBeGreaterThan(100000);
    });

    it('should return not eligible for high loan-to-income ratio', () => {
      const result = validateLoanEligibility(20000, 500000, 12);
      expect(result.isEligible).toBe(false);
      expect(result.reason).toContain('income');
    });

    it('should calculate correct debt-to-income ratio', () => {
      const result = validateLoanEligibility(50000, 150000, 24);
      expect(result.debtToIncomeRatio).toBeLessThan(0.5);
    });

    it('should provide recommendations for borderline cases', () => {
      const result = validateLoanEligibility(30000, 200000, 12);
      expect(result.recommendation).toBeDefined();
      expect(result.recommendation).toContain('lower amount');
    });
  });
});

describe('Integration Tests', () => {
  it('should validate complete loan application data', () => {
    const applicationData = {
      name: 'Juan Dela Cruz',
      pnpBfpId: 'PNP123456',
      email: 'juan@example.com',
      phone: '+639171234567',
      monthlyIncome: 50000,
      loanAmount: 150000,
      term: 24,
    };

    // All validations should pass
    expect(validateRequiredField(applicationData.name)).toBe(true);
    expect(validatePnpBfpId(applicationData.pnpBfpId)).toBe(true);
    expect(validateEmail(applicationData.email)).toBe(true);
    expect(validatePhoneNumber(applicationData.phone)).toBe(true);
    expect(validateMonthlyIncome(applicationData.monthlyIncome)).toBe(true);
    expect(validateLoanAmount(applicationData.loanAmount)).toBe(true);
    
    const eligibility = validateLoanEligibility(
      applicationData.monthlyIncome,
      applicationData.loanAmount,
      applicationData.term
    );
    expect(eligibility.isEligible).toBe(true);
  });

  it('should handle edge cases in validation', () => {
    // Test with minimum valid values
    const minData = {
      pnpBfpId: '123456', // 6 chars minimum
      monthlyIncome: 1,
      loanAmount: 1000,
      term: 6,
    };

    expect(validatePnpBfpId(minData.pnpBfpId)).toBe(true);
    expect(validateMonthlyIncome(minData.monthlyIncome)).toBe(true);
    expect(validateLoanAmount(minData.loanAmount)).toBe(true);
  });
});