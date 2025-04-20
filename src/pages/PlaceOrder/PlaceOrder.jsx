import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';

const RazorpayPaymentForm = () => {
  const { token, amount } = useContext(StoreContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    amount: amount,
    description: '',
    product_name: '',
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(import.meta.env.VITE_API_URL + '/api/order/place', formData, {
        headers: {
          token,
        },
      });

      const res = response.data;

      if (res.success) {
        const options = {
          key: res.key_id,
          amount: res.amount,
          currency: 'INR',
          name: res.product_name,
          description: res.description,
          image: 'https://dummyimage.com/600x400/000/fff',
          order_id: res.order_id,
          handler: function (response) {
            alert('Payment Succeeded!');
          },
          prefill: {
            name: res.name,
            email: res.email,
            contact: res.contact,
          },
          notes: {
            description: res.description,
          },
          theme: {
            color: '#1D4ED8',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
          alert('Payment Failed. Try again.');
        });
        rzp.open();
      } else {
        alert(res.msg || 'Something went wrong while creating the order.');
      }
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      alert('Something went wrong! Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-indigo-600 text-center mb-8">Pay with Razorpay</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              name="product_name"
              placeholder="Product Name"
              value={formData.product_name}
              onChange={handleChange}
              required
              className="input-field"
            />
            <input
              type="text"
              name="description"
              placeholder="Product Description"
              value={formData.description}
              onChange={handleChange}
              required
              className="input-field"
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount (in INR)"
              value={formData.amount}
              onChange={handleChange}
              required
              className="input-field"
            />
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
            />
            <input
              type="tel"
              name="contact"
              placeholder="Your Contact Number"
              value={formData.contact}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
          >
            💸 Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default RazorpayPaymentForm;
