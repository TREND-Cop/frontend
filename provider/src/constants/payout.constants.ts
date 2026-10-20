export const BVN_LENGTH = 11;
export const ACCOUNT_NUMBER_LENGTH = 10;

export const PAYOUT_TERMS_TITLE = 'Payout Privacy & Terms Notice';

export const PAYOUT_TERMS_BODY = `This notice serves to clarify the purpose and requirements of the Payout section on the Trend platform, in accordance with our Privacy Terms.

The Payout section is designated exclusively for business owners to link a valid bank account that maintains a sufficient balance at all times. This account serves the following dual purposes:
To facilitate the disbursement of service provider earnings following the successful completion of a service with a client.
To enable Trend to automatically deduct its applicable commission in instances where a client settles payment in cash.

Should Trend be unable to successfully deduct its commission from the designated account, the associated Trend business account will be suspended for a period of 48 hours.
Persistent non-compliance with the requirement to maintain a sufficiently funded account for commission collection will result in the permanent termination of the business owner’s Trend account.
Please be assured that Trend upholds the highest standards of data security and integrity. Your banking information remains fully protected and confidential; it is inaccessible even to Trend personnel.`;

export interface BankOption {
  id: string;
  name: string;
  logo: any;
  code?: string;
  ussd?: string;
}

/**
 * Major verified Nigerian commercial banks, digital banks, and financial institutions
 * with their exact official logos and CBN routing codes.
 */
export const DEFAULT_BANKS: BankOption[] = [
  {
    id: 'zenith',
    name: 'Zenith Bank',
    code: '057',
    logo: require('../../assets/images/banks/zenith_bank.png'),
  },
  {
    id: 'access',
    name: 'Access Bank',
    code: '044',
    logo: require('../../assets/images/banks/access_bank.png'),
  },
  {
    id: 'gtbank',
    name: 'Guaranty Trust Bank',
    code: '058',
    logo: require('../../assets/images/banks/gtbank.png'),
  },
  {
    id: 'firstbank',
    name: 'First Bank of Nigeria',
    code: '011',
    logo: require('../../assets/images/banks/first_bank.png'),
  },
  {
    id: 'uba',
    name: 'United Bank For Africa',
    code: '033',
    logo: require('../../assets/images/banks/uba.png'),
  },
  {
    id: 'opay',
    name: 'OPay',
    code: '999992',
    logo: require('../../assets/images/banks/opay.png'),
  },
  {
    id: 'palmpay',
    name: 'PalmPay',
    code: '999991',
    logo: require('../../assets/images/banks/palmpay.png'),
  },
  {
    id: 'kuda',
    name: 'Kuda Bank',
    code: '090267',
    logo: require('../../assets/images/banks/kuda_bank.png'),
  },
  {
    id: 'moniepoint',
    name: 'Moniepoint MFB',
    code: '50515',
    logo: require('../../assets/images/banks/moniepoint.png'),
  },
  {
    id: 'fidelity',
    name: 'Fidelity Bank',
    code: '070',
    logo: require('../../assets/images/banks/fidelity_bank.png'),
  },
  {
    id: 'fcmb',
    name: 'First City Monument Bank',
    code: '214',
    logo: require('../../assets/images/banks/fcmb.png'),
  },
  {
    id: 'stanbic',
    name: 'Stanbic IBTC Bank',
    code: '221',
    logo: require('../../assets/images/banks/stanbic_ibtc.png'),
  },
  {
    id: 'sterling',
    name: 'Sterling Bank',
    code: '232',
    logo: require('../../assets/images/banks/sterling_bank.png'),
  },
  {
    id: 'union',
    name: 'Union Bank of Nigeria',
    code: '032',
    logo: require('../../assets/images/banks/union_bank.png'),
  },
  {
    id: 'ecobank',
    name: 'Ecobank Nigeria',
    code: '050',
    logo: require('../../assets/images/banks/ecobank.png'),
  },
  {
    id: 'wema',
    name: 'Wema Bank',
    code: '035',
    logo: require('../../assets/images/banks/wema_bank.png'),
  },
  {
    id: 'alat',
    name: 'ALAT by WEMA',
    code: '035A',
    logo: require('../../assets/images/banks/alat_wema.png'),
  },
  {
    id: 'polaris',
    name: 'Polaris Bank',
    code: '076',
    logo: require('../../assets/images/banks/polaris_bank.png'),
  },
  {
    id: 'keystone',
    name: 'Keystone Bank',
    code: '082',
    logo: require('../../assets/images/banks/keystone_bank.png'),
  },
  {
    id: 'taj',
    name: 'TAJ Bank',
    code: '302',
    logo: require('../../assets/images/banks/taj_bank.png'),
  },
  {
    id: 'lotus',
    name: 'Lotus Bank',
    code: '303',
    logo: require('../../assets/images/banks/lotus_bank.png'),
  },
  {
    id: 'globus',
    name: 'Globus Bank',
    code: '00103',
    logo: require('../../assets/images/banks/globus_bank.png'),
  },
  {
    id: 'standard_chartered',
    name: 'Standard Chartered Bank',
    code: '068',
    logo: require('../../assets/images/banks/standard_chartered.png'),
  },
  {
    id: 'citibank',
    name: 'Citibank Nigeria',
    code: '023',
    logo: require('../../assets/images/banks/citibank.png'),
  },
  {
    id: 'heritage',
    name: 'Heritage Bank',
    code: '030',
    logo: require('../../assets/images/banks/heritage_bank.png'),
  },
  {
    id: 'sparkle',
    name: 'Sparkle Microfinance Bank',
    code: '51310',
    logo: require('../../assets/images/banks/sparkle.png'),
  },
  {
    id: 'paga',
    name: 'Paga',
    code: '327',
    logo: require('../../assets/images/banks/paga.png'),
  },
];
