"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './sendagreement.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const SendAgreement = () => {
  const router = useRouter();
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [iscorrect_file, setIscorrect_file] = useState(false);
  const [tempLink, setTempLink] = useState('');
  const [id, setId] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setTempLink(urlParams.get('temp_file_path') || '');
    console.log('Temp link from URL:', urlParams);
    setId(urlParams.get('id') || '');
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleCorrectFileChange = (event) => {
    setIscorrect_file(event.target.checked);
  };

  const getPresignedLink = async (fileUrl) => {
    try {
      const response = await fetchPresignedLink(fileUrl);
      const data = await response.json();
      if (data && data.presigned_link) {
        window.open(data.presigned_link, "_blank");
      } else {
        console.error("Error: No presigned link returned");
        alert("No presigned link returned. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching presigned link:", error);
      alert("Failed to fetch presigned link. Please try again later.");
    }
  };

  const fetchPresignedLink = async (fileUrl) => {
    const response = await fetch(`${baseUrl}legal/api/generate-presigned-link`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ file_url: fileUrl })
    });

    return response;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('email', email);
    formData.append('subject', subject);
    formData.append('name', name);
    formData.append('id', id);
    formData.append('correct_file',iscorrect_file);
    formData.append('file',file);
    console.log("temp link is",tempLink)
    if (tempLink) {
      formData.append('filePath', tempLink);
    } else if (file) {
      formData.append('file', file);
    } else {
      alert('Please select a file to upload.');
      return;
    }
    // if (iscorrect_file) {
    //   if (tempLink) {
    //     formData.append('filePath', tempLink);
    //   } else {
    //     alert('No file available for download. Please check the generated file.');
    //     return;
    //   }
    // } else {
    //   if (file) {
    //     formData.append('file', file);
    //   }
    //   // If no file is selected and `iscorrect_file` is unchecked, no error is thrown
    // }


    // Debug: Log FormData entries
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      setLoaderVisible(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}legal/api/send-envelops`, {
        method: 'POST',
        body: formData,
      });

      setLoaderVisible(false);

      if (response.ok) {
        const responseData = await response.text();
        console.log('Response Data:', responseData);
        alert('Form submitted successfully!');
        router.push('/');
      } else {
        const responseData = await response.text();
        console.log('Failed Response Data:', responseData);
        alert('Form submission failed. Status: ' + response.status + ', Message: ' + responseData);
      }
    } catch (error) {
      setLoaderVisible(false);
      alert('An error occurred during the file upload.');
      console.error('Error:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <div className={styles['form-container']}>
            <a className="navbar-brand d-flex justify-content-center align-items-center flex-column mb-3" href="#">
              <div className="py-3 d-flex justify-content-center align-items-center">
                <Image
                  src="/eduvanz_logo.jpg"
                  alt="Logo"
                  width={100}
                  height={40}
                  style={{ marginRight: '10px' }}
                />
              </div>
            </a>
            <h2><b>Send Agreement</b></h2>
            <form id="uploadForm" className="mt-3" encType="multipart/form-data" method="post" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="signatory_name" className="form-label">Signatory's Name:</label>
                <input
                  type="text"
                  id="signatory_name"
                  name="name"
                  className="form-control"
                  placeholder="Please enter your signatory's name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Signatory's Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Please enter your signatory's email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="subject" className="form-label">Subject:</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="form-control"
                  placeholder="Please enter the email subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  id="correct_file"
                  name="correct_file"
                  className="form-check-input"
                  checked={iscorrect_file}
                  onChange={handleCorrectFileChange}
                />
                <label htmlFor="correct_file" className="form-check-label">Generated file is correct?</label>
              </div>
              <div id="file-input" className="mb-3">
                <label htmlFor="file" className="form-label">Choose File:</label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".docx"
                  className="form-control"
                  onChange={handleFileChange}
                  //disabled={!iscorrect_file}
                />
              </div>
              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  id="downloadButton"
                  className="btn btn-success"
                  onClick={() => getPresignedLink(tempLink)}
                >
                  Download populated file
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                >
                  Submit
                </button>
              </div>
            </form>
            {loaderVisible && <div className={styles.loader} id="loader"></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendAgreement;