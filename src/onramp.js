import { initOnRamp } from '@coinbase/cbpay-js';

let onrampInstance;

async function initOnramp(amount, recipientEmail, cardDesign) {
  try {
    // Disable any existing instance
    if (window.currentOnrampInstance) {
      window.currentOnrampInstance.destroy();
    }

    const response = await fetch(`/get-onramp-options`);
    const baseOptions = await response.json();
    
    const options = {
      ...baseOptions,
      widgetParameters: {
        ...baseOptions.widgetParameters,
        presetFiatAmount: amount,
      },
      experienceLoggedIn: 'new_tab',
      experienceLoggedOut: 'new_tab',
      onSuccess: async (data) => {
        console.log('Onramp transaction successful');
        try {
          // Only send email if we haven't already processed this transaction
          if (!window.processedTransactions?.has(baseOptions.walletId)) {
            await fetch('/send-gift-email-with-wallet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                recipientEmail, 
                amount, 
                cardDesign,
                walletId: baseOptions.walletId
              }),
            });
            
            // Mark this transaction as processed
            if (!window.processedTransactions) {
              window.processedTransactions = new Set();
            }
            window.processedTransactions.add(baseOptions.walletId);
            
            window.location.href = '/success.html';
          }
        } catch (error) {
          console.error('Error sending gift card email:', error);
        }
      },
      onExit: () => {
        console.log('Onramp widget closed');
        // Re-enable the button on exit
        const button = document.getElementById('openOnrampBtn');
        if (button) {
          button.disabled = false;
          button.classList.remove('loading');
        }
      }
    };

    return new Promise((resolve) => {
      const instance = initOnRamp(options, (error, inst) => {
        if (error) {
          console.error('Error in initOnRamp:', error);
          return;
        }
        window.currentOnrampInstance = inst;
        resolve(inst);
      });
    });
  } catch (error) {
    console.error('Error initializing onramp:', error);
    throw error;
  }
}

async function openOnramp() {
  const amountField = document.getElementById('amountField');
  const amount = parseFloat(amountField.value);
  const recipientEmailField = document.getElementById('recipientEmail');
  const recipientEmail = recipientEmailField.value;

  if (isNaN(amount) || amount < 1 || amount > 25) {
    alert('Please enter a valid amount between 1 and 25 USD.');
    return;
  }

  if (!recipientEmail) {
    alert('Please enter the recipient\'s email address.');
    return;
  }

  try {
    // First create and open an empty instance
    onrampInstance = await new Promise((resolve) => {
      initOnRamp({}, (error, instance) => {
        if (error) {
          console.error('Error creating initial instance:', error);
          return;
        }
        resolve(instance);
      });
    });
    
    // Open the widget immediately in response to user action
    onrampInstance.open();

    // Then initialize with the actual options
    const instance = await initOnramp(amount, recipientEmail, selectedDesign);
    onrampInstance = instance;
  } catch (error) {
    console.error('Failed to initialize and open onramp:', error);
    alert('Failed to open onramp widget');
  }
}

window.openOnramp = openOnramp;

window.initOnramp = initOnramp;
