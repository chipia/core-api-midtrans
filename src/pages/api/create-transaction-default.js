// pages/api/create-transaction.js
import midtransClient from 'midtrans-client'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name = 'Pembeli', amount = 50000 } = req.body

    if (!amount || Number(amount) < 1000) {
      return res.status(400).json({ error: 'Amount must be >= 1000' })
    }

    // Configure Snap client
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    })

    // Build transaction object for Snap
    const parameter = {
      transaction_details: {
        order_id: `ORDER-${Date.now()}`,
        gross_amount: Number(amount)
      },
      customer_details: {
        first_name: name
      },
      enabled_payments: ['gopay', 'qris', 'bank_transfer']
    }

    const snapResponse = await snap.createTransaction(parameter)

    // Snap token
    return res.status(200).json({ token: snapResponse.token })
  } catch (err) {
    console.error('Midtrans Snap error', err)
    return res.status(500).json({ error: 'Midtrans Snap error', detail: err.message || err.toString() })
  }
}
