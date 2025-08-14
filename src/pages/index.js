import { useState } from 'react'

export default function Home({ initialAmount = 50000, initialMethod = 'qris' }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(initialAmount)
  const [method, setMethod] = useState(initialMethod)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [qrString, setQrString] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setShowModal(false)
    setQrString('')
    setQrCodeUrl('')

    try {
      let finalAmount = parseInt(amount)
      if (isNaN(finalAmount) || finalAmount < 1 || finalAmount > 10000000) {
        setError('Nominal harus antara 1 dan 10.000.000')
        return
      }

      // Call Midtrans API for all methods
      const res = await fetch('/api/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Pembeli',
          amount: Number(amount),
          method,
        }),
      })
      const data = await res.json()
      setResult(data)

      if (method === 'qris') {
        if (!data.qr_string) {
          throw new Error('QR string tidak ditemukan dari respons Midtrans')
        }
        setQrString(data.qr_string)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qr_string)}`
        setQrCodeUrl(qrUrl)
      }

      setShowModal(true)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold mb-4">Custom Payment — QRIS Popup</h1>

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

          <label className="block">
            <span className="text-sm text-slate-600">Metode Pembayaran</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2"
            >
              <option value="qris">QRIS</option>
              <option value="gopay">GoPay</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Pembayaran {method.toUpperCase()}</h2>

            {method === 'qris' && (
              <div className="flex flex-col items-center">
                {qrCodeUrl ? (
                  <>
                    <img src={qrCodeUrl} alt="QRIS Code" className="w-64 h-64 mb-4" />
                    <p className="text-xs break-all text-gray-500">{qrString}</p>
                  </>
                ) : (
                  <p className="text-red-600">Gagal memuat QR code</p>
                )}
              </div>
            )}

            {method !== 'qris' && result && (
              <pre className="bg-slate-50 p-3 rounded text-xs max-h-64 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      initialAmount: 50000,
      initialMethod: 'qris',
    },
  }
}