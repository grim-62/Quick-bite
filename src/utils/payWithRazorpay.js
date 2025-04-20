import axios from "axios";
import { toast } from "react-toastify";

export const payWithRazorpay = async ({ amount, name, email, contact, orderItems, address, token, userId }) => {
  try {
    console.log("Starting Razorpay payment process...");
    console.log("API URL:", import.meta.env.VITE_API_URL);
    
    // Create order on your backend
    const orderData = {
      amount,
      name,
      email,
      contact,
      orderItems,
      address,
      userId
    };
    
    console.log("Sending order data to backend:", orderData);
    
    const res = await axios.post(
      import.meta.env.VITE_API_URL + "/api/order/place", 
      orderData,
      {
        headers: { 
          token,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Backend response:", res.data);

    if (!res.data.success) {
      toast.error(res.data.message || "Failed to create order");
      return;
    }

    const razorpayOrder = res.data.razorpayOrder;
    const mongoOrderId = res.data.mongoOrderId;

    if (!razorpayOrder || !razorpayOrder.id) {
      console.error("Invalid Razorpay order response:", razorpayOrder);
      toast.error("Invalid payment gateway response");
      return;
    }

    console.log("Razorpay order created:", razorpayOrder);
    console.log("MongoDB order ID:", mongoOrderId);

    const options = {
      key: import.meta.env.VITE_RAZOR_PAY_KEY_ID,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      name: "Food Delivery",
      description: "Order Payment",
      order_id: razorpayOrder.id,
      handler: async function (response) {
        console.log("Payment successful, verifying with backend:", response);
        try {
          // Verify payment on backend and place final order
          const verifyData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            orderItems,
            address,
            amount,
            mongoOrderId
          };
          
          console.log("Sending verification data to backend:", verifyData);
          
          const verifyRes = await axios.post(
            import.meta.env.VITE_API_URL + "/api/order/verify",
            verifyData,
            {
              headers: { 
                token,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log("Verification response:", verifyRes.data);

          if (verifyRes.data.success) {
            toast.success("Payment Successful! Order Placed.");
            // Redirect to orders page
            window.location.href = "/myorders";
          } else {
            toast.error(verifyRes.data.message || "Payment verification failed.");
          }
        } catch (err) {
          console.error("Payment verification error:", err);
          console.error("Error details:", err.response?.data || err.message);
          toast.error("Something went wrong during payment verification.");
        }
      },
      prefill: {
        name,
        email,
        contact,
      },
      notes: {
        order_id: mongoOrderId,
      },
      theme: {
        color: "#3399cc",
      },
    };

    console.log("Razorpay options:", options);

    // Check if Razorpay key is available
    if (!import.meta.env.VITE_RAZOR_PAY_KEY_ID) {
      console.error("Razorpay key is missing");
      toast.error("Payment gateway configuration error");
      return;
    }

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      console.log("Loading Razorpay script...");
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        console.log("Razorpay script loaded, opening payment modal");
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      
      script.onerror = (error) => {
        console.error("Failed to load Razorpay script:", error);
        toast.error("Failed to load payment gateway");
      };
    } else {
      console.log("Razorpay already loaded, opening payment modal");
      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  } catch (error) {
    console.error("Razorpay payment failed:", error);
    console.error("Error details:", error.response?.data || error.message);
    
    // More specific error messages based on the error type
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Server error response:", error.response.status, error.response.data);
      toast.error(`Server error: ${error.response.status} - ${error.response.data.message || "Unknown error"}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      toast.error("No response from server. Please check your internet connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
      toast.error(`Request error: ${error.message}`);
    }
  }
};