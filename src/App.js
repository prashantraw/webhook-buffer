import React, { useState, useEffect } from 'react';
import axios from 'axios';

const webhookUrl = 'https://webhook.site/da2b574f-7a6f-4046-8665-934dbf7e2b7d';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Listen for online/offline changes
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        sendBufferedRequests();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Check if there are any buffered requests in localStorage
    if (navigator.onLine) {
      sendBufferedRequests();
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleClick = async () => {
    if (navigator.onLine) {
      sendRequest();
    } else {
      bufferRequest();
    }
  };

  const sendRequest = async () => {
    try {
      await axios.post(webhookUrl, { data: 'Hit Me!' });
      console.log('Request sent successfully.');
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const bufferRequest = () => {
    // Save the request to localStorage
    const bufferedRequests = JSON.parse(localStorage.getItem('bufferedRequests')) || [];
    bufferedRequests.push({ data: 'Hit Me!' });
    localStorage.setItem('bufferedRequests', JSON.stringify(bufferedRequests));
    console.log('Request buffered.');
  };

  const sendBufferedRequests = async () => {
    const bufferedRequests = JSON.parse(localStorage.getItem('bufferedRequests')) || [];
    while (bufferedRequests.length > 0) {
      const request = bufferedRequests.shift();
      try {
        await axios.post(webhookUrl, request);
        console.log('Buffered request sent.');
      } catch (error) {
        console.error('Error sending buffered request:', error);
        // Put the failed request back in the front of the buffer and stop sending
        bufferedRequests.unshift(request);
        break;
      }
    }
    // Update the localStorage with any remaining buffered requests
    localStorage.setItem('bufferedRequests', JSON.stringify(bufferedRequests));
  };

  return (
    <div style={styles.container}>
      <h1>Webhook Offline Buffer</h1>
      <button onClick={handleClick} style={styles.button}>Hit Me</button>
      <p>{isOnline ? 'You are online' : 'You are offline'}</p>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default App;
