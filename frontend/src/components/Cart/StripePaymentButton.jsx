import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';

// Replace with your publishable key
const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');

const StripeCheckoutButton = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();

  const handlePayment = async () => {
    if (!stripe) {
      return;
    }

    try {
      // Create a Checkout Session via Stripe.js directly
      const { error, session } = await stripe.redirectToCheckout({
        lineItems: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Purchase',
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        successUrl: `${window.location.origin}/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/stripe-cancel`,
      });

      if (error) {
        onError(error);
      } else {
        // This won't actually execute immediately since redirectToCheckout redirects the page
        onSuccess(session);
      }
    } catch (err) {
      onError(err);
    }
  };

  return (
    <button 
      onClick={handlePayment}
      disabled={!stripe}
      className="stripe-checkout-button"
    >
      Pay ${parseFloat(amount).toFixed(2)} with Stripe
    </button>
  );
};

// Wrapper component with Elements provider
const StripePaymentButton = ({ amount, onSuccess, onError }) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutButton 
        amount={amount} 
        onSuccess={onSuccess} 
        onError={onError} 
      />
    </Elements>
  );
};

export default StripePaymentButton;