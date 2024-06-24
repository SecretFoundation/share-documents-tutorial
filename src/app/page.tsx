'use client'

import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi'
import { Config, SecretDocumentClient, Environment, MetaMaskWallet } from "@secret-network/share-document";
import { useEffect, useState } from 'react';

function App() {
  const { address } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const [client, setClient] = useState<SecretDocumentClient>();
  const [fileId, setFileId] = useState('');

  // Initialize user wallet for the SDK
  useEffect(() => {
    const initializeClient = async () => {
      if (!walletClient) return;

      const config = new Config({ env: Environment.MAINNET });
      config.useEvmWallet({ client: walletClient });
      console.log("config: ", config);

      const wallet = await MetaMaskWallet.create(window.ethereum, address || "");
      config.useSecretWallet(wallet);
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
      const res = await client.viewDocument().download(fileId);
      console.log('File downloaded successfully:', res);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Share file
  const shareFile = async () => {
    // Share file logic here
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
        <button onClick={shareFile}>Share File</button>
      </div>
    </>
  );
};

export default App;
