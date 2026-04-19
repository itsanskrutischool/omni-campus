/**
 * Mock MockPaymentGateway to prevent using actual Stripe/APIs right now.
 * We will architect the frontend around these stubs.
 */
export const processPaymentMock = async (amount: number) => {
  return { 
    status: 'success', 
    amountProcessed: amount,
    transactionId: 'txn_' + Date.now() 
  };
};
