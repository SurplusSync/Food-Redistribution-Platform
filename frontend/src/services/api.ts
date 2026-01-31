export type DonationStatus = 'ACTIVE' | 'CLAIMED' | 'DELIVERED'

export type Donation = {
  id: string
  name: string
  quantity: number
  status: DonationStatus
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

let MOCK_DONATIONS: Donation[] = [
  { id: '1', name: 'Vegetable Biryani', quantity: 5, status: 'ACTIVE' },
  { id: '2', name: 'Sandwich Pack', quantity: 10, status: 'ACTIVE' },
  { id: '3', name: 'Canned Beans', quantity: 20, status: 'CLAIMED' },
]

export const loginUser = async (email: string) => {
  await sleep(400)
  if (email === 'test@demo.com') {
    return { id: 'demo-user', email, name: 'Demo User' }
  }
  throw new Error('Invalid credentials')
}

export const getDonations = async (): Promise<Donation[]> => {
  await sleep(400)
  // return a shallow copy to simulate fresh fetch
  return MOCK_DONATIONS.map((d) => ({ ...d }))
}

export const claimDonation = async (id: string) => {
  await sleep(500)
  const idx = MOCK_DONATIONS.findIndex((d) => d.id === id)
  if (idx === -1) throw new Error('Not found')
  MOCK_DONATIONS[idx] = { ...MOCK_DONATIONS[idx], status: 'CLAIMED' }
  return { ...MOCK_DONATIONS[idx] }
}
