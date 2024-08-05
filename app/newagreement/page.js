"use client";
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './newagreement.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation

const NewAgreementPage = () => {
  const [loaderVisible, setLoaderVisible] = useState(false);
  const router = useRouter(); // Initialize router

  // Use refs for form inputs
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileTypeInputRef = useRef(null);
  const reviewerNameInputRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fileInput = fileInputRef.current;
    const imageInput = imageInputRef.current;
    const fileTypeInput = fileTypeInputRef.current;
    const reviewerNameInput = reviewerNameInputRef.current;

    if (!fileInput.files.length || !imageInput.files.length) {
      alert('Please select both files to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('image', imageInput.files[0]);
    formData.append('docFileType', fileTypeInput.value);
    formData.append('reviewerName', reviewerNameInput.value);

    // Debug: Log FormData entries
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      setLoaderVisible(true); // Show the loader

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}legal/api/upload`, {
        method: 'POST',
        body: formData,
      });

      setLoaderVisible(false); // Hide the loader

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data); // Debug response
        const { id, uploaded_file, temp_file_path, filled_document_path } = data;

        if (id && uploaded_file && temp_file_path && filled_document_path) {
          // Handle successful response
          const a = document.createElement('a');
          a.href = uploaded_file;
          a.download = 'agreement.docx'; // The name of the downloaded file
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a); // Remove the anchor from the body

          // Navigate to the next page using Next.js router
          router.push(`/sendagreement?id=${data.id}&temp_file_path=${data.temp_file_path}&filled_document_path=${data.filled_document_path}`);
        } else {
          console.error('Expected data is missing from the response.');
        }
      } else {
        alert('File upload failed. Status: ' + response.status);
      }
    } catch (error) {
      setLoaderVisible(false); // Hide the loader
      alert('An error occurred during the file upload.');
      console.error('Error:', error);
    }
  };

  return (
    <div className={styles.body}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">
            <div className={styles.formContainer}>
              <a
                className="navbar-brand py-3"
                href="#"
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                    src="/eduvanz_logo.jpg"
                    alt="Logo"
                    width={100}
                    height={40}
                    style={{ marginRight: '10px' }}
                  />
                </div>
              </a>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h2><b>Agreement Generator & Reviewer</b></h2>
              </div>
              <form id="uploadForm" className="mt-3" encType="multipart/form-data" method="post" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="reviewerNameInput" className="form-label">Enter Reviewer's Name:</label>
                  <input
                    type="text"
                    id="reviewerNameInput"
                    name="reviewer_name"
                    className="form-control"
                    placeholder="Please enter your name..."
                    required
                    ref={reviewerNameInputRef}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="fileInput" className="form-label">Choose PQFQ Excel file:</label>
                  <input
                    type="file"
                    id="fileInput"
                    name="file"
                    className="form-control"
                    accept=".xlsx, .xls"
                    required
                    ref={fileInputRef}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="imageInput" className="form-label">Choose Product Image file:</label>
                  <input
                    type="file"
                    id="imageInput"
                    name="image"
                    className="form-control"
                    accept="image/*"
                    required
                    ref={imageInputRef}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="fileTypeInput" className="form-label">Select File Type:</label>
                  <select className="form-control" id="fileTypeInput" name="file_type" required ref={fileTypeInputRef}>
                    <option value="no_liability">No liability agreement</option>
                    <option value="institute_isa">Institute ISA agreement</option>
                    <option value="digital_partner">Digital Partner agreement</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-success w-100">
                  Upload
                </button>
              </form>
              {loaderVisible && <div className={styles.loader} id="loader"></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAgreementPage;