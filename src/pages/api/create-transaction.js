// Next.js API route
import midtransClient from 'midtrans-client'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name = 'Pembeli', amount = 50000, method = 'gopay' } = req.body

    // Validate minimal
    if (!amount || Number(amount) < 1000) {
      return res.status(400).json({ error: 'Amount must be >= 1000' })
    }

    // Configure Core API client
    const core = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
    })

    // Build basic transaction object
    const transaction = {
      payment_type: method === 'gopay' ? 'gopay' : (method === 'bank_transfer' ? 'bank_transfer' : 'qris'),
      transaction_details: {
        order_id: `ORDER-${Date.now()}`,
        gross_amount: Number(amount)
      },
      customer_details: {
        first_name: name
      }
    }

    // Payment-method specific additions
    if (method === 'bank_transfer') {
      // Let Midtrans decide VA (BCA, BNI, etc.) OR specify with 'bank_transfer': {bank: 'bca'}
      transaction.bank_transfer = {
        bank: 'bca' // contoh: pakai bca; ubah jika perlu atau kirim dari client
      }
    }

    if (method === 'gopay') {
      // GoPay specific options (opsional)
      transaction.gopay = {
        enable_callback: true,
        callback_url: 'https://your-site.com/gopay-callback' // optional: replace with your callback url
      }
    }

    if (method === 'qris') {
      // For QRIS (may require merchant enablement)
      transaction.qris = {
        acquirer: 'gopay' // contoh. remove/ubah jika merchant berbeda
      }
    }

    // Charge (Core API)
    const response = await core.charge(transaction)

    // Return entire Midtrans response to client (be careful: it's server -> client but no serverKey exposure)
    return res.status(200).json(response)
  } catch (err) {
    console.error('Midtrans error', err)
    return res.status(500).json({
      error: 'Midtrans error',
      detail: err.message || err.toString()
    })
  }
}
