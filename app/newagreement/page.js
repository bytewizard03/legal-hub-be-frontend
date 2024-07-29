"use client";
import React from 'react';
import Image from 'next/image';
import styles from  './newagreement.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';

const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      const dataList = document.querySelector('.data-list > div');
      dataList.innerHTML = ''; // Clear existing list items
      data.forEach((item) => {
        const div = document.createElement('div');
        div.style.backgroundColor = '#fff';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        div.style.width = 'auto';
        div.style.padding = '20px';
        div.style.margin = '10px';
        div.innerHTML = `
          <h2 style="font-size: 18px; margin-bottom: 10px;">${item.registered_entity_name}</h2>
          <p style="font-size: 14px; color: #000;">CIN: <b>${item.cin}</b></p>
          <p style="font-size: 14px; color: #000;">Reviewer's Name: <b>${item.name}</b></p>
          <p style="font-size: 14px; color: #000;">Reviewer's Email: <span style="font-size: 14px; color: #000;"><b>${item.email}</b></span></p>
          <p style="font-size: 14px; color: #000;">Subject: <b>${item.subject}</b></p>
          <p style="font-size: 14px; color: #000;">Uploaded PQFQ : <b><a href ="${item.uploaded_file}" >Link</a></b></p>
          <p style="font-size: 14px; color: #000;">Final Agreement : <b><a href ="${item.final_link}" >Link</a></b></p>
          <p style="font-size: 14px; color: #000;">Registered Entity Name: <b>${item.registered_entity_name}</b></p>
          <p style="font-size: 14px; color: #000;">Date of agreement: <b>${item.date_of_agreement}</b></p>
          <p style="font-size: 14px; color: #000;">Validity(in months): <b>${item.validity}</b></p>
          <p style="font-size: 14px; color: #000;">Expiry date: <b>${item.expiry_date}</b></p>
          <p style="font-size: 14px; color: #000;">Envelope Status: <b>${item.envelope_status}</b></p>
        `;
        dataList.appendChild(div);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('file');
    const imageInput = document.getElementById('image');
    const loader = document.getElementById('loader');
    const fileType = document.getElementById('fileType').value;
    const reviewerName = document.getElementById('reviewer_name').value;

    if (fileInput.files.length === 0 || imageInput.files.length === 0) {
      alert('Please select both files to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('image', imageInput.files[0]);
    formData.append('file_type', fileType);
    formData.append('reviewer_name', reviewerName);

    try {
      loader.style.display = 'block'; // Show the loader

      // to review the api

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      loader.style.display = 'none'; // Hide the loader

      if (response.ok) {
        const data = await response.json();
        const { id, uploaded_file, temp_file_path, filled_document_path } = data;

        if (id) {
          const a = document.createElement('a');
          a.href = uploaded_file;
          a.download = 'agreement.docx'; // The name of the downloaded file
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a); // Remove the anchor from the body
          window.location.href = filled_document_path;

          window.location.href = `final_page.html?id=${id}&temp_file_path=${temp_file_path}&filled_document_path=${filled_document_path}`;
        } else {
          console.error('Expected data is missing from the response.');
        }
      } else {
        alert('File upload failed. Status: ' + response.status);
      }
    } catch (error) {
      loader.style.display = 'none'; // Hide the loader
      alert('An error occurred during the file upload.');
      console.error('Error:', error);
    }
  };


const NewAgreementPage = () => {
  return (
    <>
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
              <form id="uploadForm" className="mt-3" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Enter Reviewer's Name:</label>
                  <input
                    type="text"
                    id="reviewer_name"
                    name="name"
                    className="form-control"
                    placeholder="Please enter your name..."
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="file" className="form-label">Choose PQFQ Excel file:</label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    className="form-control"
                    accept=".xlsx, .xls"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">Choose Product Image file:</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    className="form-control"
                    accept="image/*"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="fileType" className="form-label">Select File Type:</label>
                  <select className="form-control" id="fileType" name="fileType" required>
                    <option value="no_liability">No liability agreement</option>
                    <option value="institute_isa">Institute ISA agreement</option>
                    <option value="digital_partner">Digital Partner agreement</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-success w-100">
                  Upload
                </button>
              </form>
              <div className={styles.loader} id="loader"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default NewAgreementPage;