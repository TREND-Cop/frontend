/**
 * MOCK — replace with TODO (Backend) calls
 *
 * Sensitive data rules:
 * - Never console.log BVN, account number, or selfie URI
 * - Never persist BVN or selfie
 */

export interface VerifyPayoutParams {
  selfieUri: string | null;
  bvn: string;
  accountNumber: string;
  bankId: string;
  ownerName?: string;
}

export interface VerifyPayoutResult {
  success: boolean;
  accountName?: string;
  errors?: {
    selfie?: string;
    accountNumber?: string;
    bank?: string;
  };
}

/**
 * Verifies payout details against backend/banking provider.
 * TODO (Backend): send over a secure, authenticated API only
 */
export async function verifyPayout(
  params: VerifyPayoutParams
): Promise<VerifyPayoutResult> {
  // Simulate mock delay of ~900ms
  await new Promise((resolve) => setTimeout(resolve, 950));

  const { accountNumber, ownerName } = params;
  const digitsOnly = (accountNumber || '').replace(/\D/g, '');

  // Mock Rule 1: Account number '0000000000' -> error frame for QA testing
  if (digitsOnly === '0000000000') {
    return {
      success: false,
      errors: {
        selfie: 'Please upload a valid image of yourself registered to the provided BVN.',
        accountNumber: 'Incorrect account number, please try again.',
        bank: 'The provided bank does not match the account number.',
      },
    };
  }

  // Mock Rule 2: Any 10-digit account number succeeds
  if (digitsOnly.length === 10) {
    return {
      success: true,
      accountName: ownerName && ownerName.trim().length > 0 ? ownerName : 'Emmanuel Obinna',
    };
  }

  // Mock Rule 3: Account numbers less than 10 digits fail
  return {
    success: false,
    errors: {
      accountNumber: 'Incorrect account number, please try again.',
    },
  };
}

/**
 * TODO (Backend): Fetch bank options from secure payment gateway API.
 */
export async function getBanks() {
  return [
    {
      id: 'zenith',
      name: 'Zenith Bank',
      logo: require('../../assets/images/payout/zenith_bank_logo.png'),
    },
  ];
}
