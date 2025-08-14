import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { amount } = req.body;

    const data = {
      transaction_details: {
        order_id: "ORDER-" + new Date().getTime(),
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: "Fauzan",
        last_name: "Hafizh",
        email: "fauzan@example.com",
        phone: "08123456789",
      },
    };

    try {
      const response = await axios.post(
        "https://app.sandbox.midtrans.com/snap/v1/transactions",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Basic " +
              Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64"),
          },
        }
      );

      res.status(200).json({ token: response.data.token });
    } catch (err) {
      console.error("Midtrans error:", err.response?.data || err.message);
      res.status(500).json({ message: "Error membuat transaksi" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
