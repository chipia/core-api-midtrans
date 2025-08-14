import { useState } from 'react'

export default function Home({ initialAmount = 50000 }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(initialAmount)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const finalAmount = parseInt(amount)
      if (isNaN(finalAmount) || finalAmount < 1 || finalAmount > 10000000) {
        setError('Nominal harus antara 1 dan 10.000.000')
        setLoading(false)
        return
      }

      // Panggil API untuk bikin transaksi
      const res = await fetch('/api/create-transaction-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Pembeli',
          amount: finalAmount,
        }),
      })
      const data = await res.json()

      if (!data.token) {
        throw new Error('Token Snap tidak tersedia')
      }

      // Load Snap.js
      if (typeof window.snap === 'undefined') {
        const script = document.createElement('script')
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY)
        script.onload = () => {
          window.snap.pay(data.token)
        }
        document.body.appendChild(script)
      } else {
        window.snap.pay(data.token)
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold mb-4">Bayar dengan Midtrans Snap</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-600">Nama Pembeli</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama"
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-600">Jumlah (IDR)</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-60"
          >
            {loading ? 'Memproses...' : 'Bayar'}
          </button>
        </form>

        {error && <div className="mt-4 text-red-600">Error: {error}</div>}
      </div>
    </div>
  )
}
