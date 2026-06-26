import { BankingDetails, CompanyInfo } from '@/types/invoice';

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'JE Productions',
  tagline: 'Professional Digital Solutions',
  email: 'abeljackson33@gmail.com',
  address: 'Modimolle, Limpopo, South Africa',
  phone: '+27 62 677 5823',
  website: 'www.aj4200.dev',
  regNo: '---',
  vatNo: '---',
};

export const DEFAULT_BANKING_DETAILS: BankingDetails = {
  bankName: 'Capitec',
  accountNumber: '1534094529',
  branchCode: '470010',
  payShapCell: '062 677 5823',
};

export const DEFAULT_INVOICE_CURRENCY = 'ZAR';
export const DEFAULT_BUSINESS_CURRENCY = 'ZAR';
