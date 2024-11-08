document.addEventListener('DOMContentLoaded', async () => {
    const { CoinbaseWalletSDK } = await import('@coinbase/wallet-sdk');

    const walletSDK = new CoinbaseWalletSDK({
        appName: 'My App',
        appLogoUrl: 'https://example.com/logo.png',
        appDescription: 'My App Description',
    });

    const wallet = walletSDK.makeWeb3Provider();

    document.getElementById('createWalletLink').addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent the default link behavior
        try {
            const accounts = await wallet.request({ method: "eth_requestAccounts" });
            const walletAddress = accounts[0]; // Get the first account address
            
            // Show the modal
            const walletModal = document.getElementById('walletModal');
            walletModal.style.display = 'flex';

            document.getElementById('destinationAddress').value = walletAddress;
        } catch (error) {
            console.error('Error creating wallet:', error);
            alert('An error occurred while creating the wallet.');
        }
    });

    // Close modal functionality
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('walletModal').style.display = 'none';
    });

    document.getElementById('goToWallet').addEventListener('click', () => {
        window.open('https://wallet.coinbase.com/assets', '_blank');
        document.getElementById('walletModal').style.display = 'none'; // Close the modal
    });
});