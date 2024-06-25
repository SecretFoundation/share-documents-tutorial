'use client'

import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi'
import { Config, SecretDocumentClient, Environment, MetaMaskWallet, PinataStorage } from "@secret-network/share-document";
import { useEffect, useState } from 'react';

function App() {
  const { address } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const [client, setClient] = useState<SecretDocumentClient>();
  const [fileId, setFileId] = useState('');
  const [secretAddress, setSecretAddress] = useState('');

  // Initialize user wallet for the SDK
  useEffect(() => {
    const initializeClient = async () => {
      if (!walletClient) return;

      const config = new Config({ env: Environment.MAINNET });
      config.useEvmWallet({ client: walletClient });
      console.log("config: ", config);

      const wallet = await MetaMaskWallet.create(window.ethereum, address || "");
      config.useSecretWallet(wallet);

      const gateway = "https://gateway.pinata.cloud";
      const accessToken = "your-access-token";
      
      const pinataStorage = new PinataStorage(gateway, accessToken);
      config.useStorage(pinataStorage);

      const secretClient = new SecretDocumentClient(config);
      setClient(secretClient);
      console.log("client: ", secretClient);
    };

    initializeClient();
  }, [walletClient, address]);

  // Store File to Secret Network
  const storeFile = async () => {
    if (!client) {
      console.error('Client is not initialized');
      return;
    }
    try {
      const file = new File(["Hello, world!"], "hello.txt", { type: "text/plain" });
      const res = await client.storeDocument().fromFile(file); 
      console.log('File stored successfully:', res);
    } catch (error) {
      console.error('Error storing file:', error);
    }
  };

  // View file
  const viewFile = async () => {
    if (!client) {
      console.error('Client is not initialized');
      return;
    }
    try {
      const res = await client.viewDocument().getAllFileIds();
      console.log('File viewed successfully:', res);
    } catch (error) {
      console.error('Error viewing file:', error);
    }
  };

  // Download file
  const downloadFile = async (fileId: string) => {
    if (!client) {
      console.error('Client is not initialized');
      return;
    }
    try {
      const uint8Array = await client.viewDocument().download(fileId);

      // Convert Uint8Array to Blob
      const blob = new Blob([uint8Array], { type: 'application/octet-stream' });

      // Create a link element
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'downloaded_file'; // Set the desired file name here

      // Append the link to the body
      document.body.appendChild(link);

      // Programmatically click the link to trigger the download
      link.click();

      // Remove the link from the document
      document.body.removeChild(link);

      console.log('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Share file
  const shareFile = async (fileId: string, secretAddress: string) => {
    if (!client) {
      console.error('Client is not initialized');
      return;
    }
    try {
      const shareDocument = client.shareDocument(fileId);

      // Get existing file access
      const fileAccess = await shareDocument.getFileAccess();
      console.log('Existing file access:', fileAccess);

      // Share viewing access to a file
      const addViewingRes = await shareDocument.addViewing([secretAddress]);
      console.log('Viewing access added:', addViewingRes);

      // Delete viewing access to a file
      // const deleteViewingRes = await shareDocument.deleteViewing([secretAddress]);
      // console.log('Viewing access deleted:', deleteViewingRes);

      // Transfer the ownership
      // const changeOwnerRes = await shareDocument.changeOwner(secretAddress);
      // console.log('Ownership transferred:', changeOwnerRes);

      // All in one share operation
      const shareRes = await shareDocument.share({
        // changeOwner: secretAddress,
        addViewing: [secretAddress],
        // deleteViewing: [secretAddress],
      });
      console.log('All-in-one share operation completed:', shareRes);

    } catch (error) {
      console.error('Error sharing file:', error);
    }
  };

  return (
    <>
      <div>
        <h2>Connect Wallet</h2>
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
      <div>
        <h2>Disconnect Wallet</h2>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
      <div>
        <h2>Store File</h2>
        <button onClick={storeFile}>Store File</button>
      </div>
      <div>
        <h2>View File</h2>
        <button onClick={viewFile}>View File</button>
      </div>
      <div>
        <h2>Download File</h2>
        <input
          type="text"
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
          placeholder="Enter file ID"
        />
        <button onClick={() => downloadFile(fileId)}>Download File</button>
      </div>
      <div>
        <h2>Share File</h2>
        <input
          type="text"
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
          placeholder="Enter file ID"
        />
        <input
          type="text"
          value={secretAddress}
          onChange={(e) => setSecretAddress(e.target.value)}
          placeholder="Enter secret address"
        />
        <button onClick={() => shareFile(fileId, secretAddress)}>Share File</button>
      </div>
    </>
  );
};

export default App;
