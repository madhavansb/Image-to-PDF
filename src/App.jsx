import React, { useRef, useState } from 'react';
import { Document, Page, Image, pdf, StyleSheet, View } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

import './App.css';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: 'auto',
    marginBottom: 10,
  }
});

export default function App() {
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [twoPerPage, setTwoPerPage] = useState(true); 
  const fileInputRef = useRef(null);

  const Convert = async () => {
    const files = fileInputRef.current.files;
    if (!files || files.length === 0) {
      alert('Please select images first.');
      return;
    }

    const images = [];
    let fileReadCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        images.push(event.target.result);
        fileReadCount++;

        if (fileReadCount === files.length) {
          setShowProgressBar(true);
          pdfdown(images);
          fileInputRef.current.value = "";
        }
      };

      reader.onerror = (error) => {
        console.error("Error reading the file", error);
      };

      reader.readAsDataURL(file);
    }
  };

  const pdfdown = (images) => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress > 100) {
        clearInterval(interval);
        generate(images);
        setProgress(0);
        setShowProgressBar(false);
        setCompleted(true);
        setTimeout(() => setCompleted(false), 3000); 
      } else {
        setProgress(currentProgress);
      }
    }, 300);
  };

  const generate = async (images) => {
    try {
      const pages = [];
      let index = 0;

      while (index < images.length) {
        if (twoPerPage && index + 1 < images.length) {
          // Two images per page
          pages.push(
            <Page key={index} size="A4" style={styles.page}>
              <Image src={images[index]} style={styles.image} />
              <Image src={images[index + 1]} style={styles.image} />
            </Page>
          );
          index += 2; // Move by 2 images
        } else {
          // One image per page
          pages.push(
            <Page key={index} size="A4" style={styles.page}>
              <Image src={images[index]} style={styles.image} />
            </Page>
          );
          index += 1; // Move by 1 image
        }
      }

      const doc = <Document>{pages}</Document>;
      const asPDF = pdf();
      asPDF.updateContainer(doc);
      const PDFBlob = await asPDF.toBlob();
      saveAs(PDFBlob, 'converted.pdf');
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className='container'>
      <div className='card'>
        <h1>Convert Image to PDF</h1>

        <label>
          <input
            type="checkbox"
            checked={twoPerPage}
            onChange={() => setTwoPerPage(!twoPerPage)}
          />
          Two images per page
        </label>
        <br />
        <br />
        <input type='file' ref={fileInputRef} multiple accept="image/*" />
        <br />
        <br />
        <button onClick={Convert} className='btn-convert'>Convert</button>

        {/* Progress Bar */}
        {showProgressBar && (
        <div style={{ width: '100%', height: '20px', border: '1px solid #ccc', marginTop: '50px', marginBottom: '30px', borderRadius: '10px', overflow: 'hidden' }}>
          <div className='progress'
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius:'10px',
              backgroundColor: '#2196f3',
              transition: 'width 0.3s ease-in-out'
            }}
          />
        </div>
      )}
      {completed && (
        <p style={{ color: 'green', fontWeight: 'bold' }}>Conversion completed!</p>
      )}
      </div>
    </div>
  );
}
