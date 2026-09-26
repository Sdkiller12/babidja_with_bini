import http from '../http'

export interface Referral {
  id: string
  referrerId: string
  referredId: string
  rewardAmount: string | number
  rewardStatus: 'PENDING' | 'CREDITED' | 'CANCELLED'
  createdAt: string
  referred?: {
    firstName: string
    lastName: string
    email: string
  }
}

export const fetchMyReferrals = async (): Promise<Referral[]> => {
  const { data } = await http.get('/referrals/me')
  return data
}
