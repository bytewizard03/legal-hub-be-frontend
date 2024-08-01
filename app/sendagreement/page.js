"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from  './sendagreement.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const SendAgreement = () => {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 8040; // Adjust this as necessary

  // Function to extract URL parameters
  const getUrlParameter = (name) => {
    let results = null;
    if (typeof window !== 'undefined'){
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    results = regex.exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
  };

  const fileUrl = getUrlParameter('filled_document_path');

  const getPresignedLink = async (fileUrl) => {
    try {
      const response = await fetchPresignedLink(fileUrl);
      const data = await response.json();
      if (data && data.presigned_link) {
        window.open(data.presigned_link, '_blank');
      } else {
        console.error('Error: No presigned link returned');
      }
    } catch (error) {
      console.error('Error fetching presigned link:', error);
      alert('Failed to fetch presigned link. Please try again later.');
    }
  };

  const fetchPresignedLink = async (fileUrl) => {
    const formData = new FormData();
    formData.append('file_url', fileUrl);

    const response = await fetch('/legal/api/generate-presigned-link', {
      method: 'POST',
      body: formData,
    });

    return response;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const fileInput = document.getElementById('file');
    const loader = document.getElementById('loader');
    const id = getUrlParameter('id');
    const tempLink = getUrlParameter('temp_file_path');
    const name = document.getElementById('signatory_name').value;

    const formData = new FormData();
    formData.append('email', email);
    formData.append('subject', subject);
    formData.append('id', id);
    formData.append('name', name);

    // Check if the file is correct
    const isCorrect = document.getElementById('correct_file').checked;
    if (isCorrect) {
      formData.append('file_path', String(tempLink));
    } else {
      if (!fileInput.files[0]) {
        alert('Please select a file to upload.');
        return;
      }
      formData.append('file', fileInput.files[0]);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${baseUrl}/legal/api/send-envelops`, true);

    xhr.onloadstart = () => {
      loader.style.display = 'block'; // Show the loader
    };

    xhr.onload = () => {
      loader.style.display = 'none'; // Hide the loader

      if (xhr.status === 200) {
        alert('Form submitted successfully!');
        router.push(`${baseUrl}/legal/ui/`);
      } else {
        alert('Form submission failed. Status: ' + xhr.status);
      }
    };

    xhr.onerror = () => {
      loader.style.display = 'none'; // Hide the loader
      alert('An error occurred during the file upload.');
    };

    xhr.send(formData);
  };

  useEffect(() => {
    document.getElementById('uploadForm').addEventListener('submit', handleSubmit);
  }, []);

  return (
    <div className={styles.container}>
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <div className={styles['form-container']}>
            <a className="navbar-brand d-flex justify-content-center align-items-center flex-column mb-3" href="#">
              <div className="py-3 d-flex justify-content-center align-items-center">
                <img src="https://d1idiaqkpcnv43.cloudfront.net/assets/webimages/logo.png" alt="Logo" className="img-fluid" style={{ maxHeight: '50px', marginRight: '10px' }} />
              </div>
            </a>
            <h2><b>Send Agreement</b></h2>
            <form id="uploadForm" className="mt-3">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Signatory's Name:</label>
                <input type="text" id="signatory_name" name="name" className="form-control" placeholder="Please enter your signatory's name..." required />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Signatory's Email:</label>
                <input type="email" id="email" name="email" className="form-control" placeholder="Please enter your signatory's email..." required />
              </div>
              <div className="mb-3">
                <label htmlFor="subject" className="form-label">Subject:</label>
                <input type="text" id="subject" name="subject" className="form-control" placeholder="Please enter the email subject..." required />
              </div>
              <div className="mb-3 form-check">
                <input type="checkbox" id="correct_file" name="correct_file" className="form-check-input" />
                <label htmlFor="correct_file" className="form-check-label">Generated file is correct?</label>
              </div>
              <div id="file-input" className="mb-3">
                <label htmlFor="file" className="form-label">Choose File:</label>
                <input type="file" id="file" name="file" accept=".docx" className="form-control" />
              </div>
              <div className="d-flex justify-content-between">
                <button type="button" id="downloadButton" className="btn btn-success" onClick={() => getPresignedLink(fileUrl)}>Download populated file</button>
                <button type="submit" className="btn btn-success">Submit</button>
              </div>
            </form>
            <div className={styles.loader} id="loader"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendAgreement;