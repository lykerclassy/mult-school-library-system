// frontend/src/components/common/QrScanner.jsx

import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QrScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader', // ID of the div to render the scanner in
      {
        qrbox: { width: 250, height: 250 }, // Size of the scanning box
        fps: 10, // Frames per second
      },
      false // verbose
    );

    const handleSuccess = (decodedText, decodedResult) => {
      // decodedText is the string from the QR code (e.g., the ISBN)
      onScanSuccess(decodedText);
      scanner.clear(); // Stop the scanner
    };

    const handleError = (errorMessage) => {
      // You can ignore errors (e.g., QR code not found)
      // console.warn(errorMessage);
    };

    scanner.render(handleSuccess, handleError);

    // Cleanup function to stop the camera when the component unmounts
    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner on unmount", error);
      });
    };
  }, [onScanSuccess]);

  return (
    <div id="qr-reader-container" className="relative">
      <div id="qr-reader" className="w-full"></div>
      <p className="text-center text-sm text-gray-500 mt-2">
        Place the book's QR code within the frame
      </p>
    </div>
  );
};

export default QrScanner;