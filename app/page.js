"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';

function Home() {
  const [data, setData] = useState([]);
  const [countData, setCountData] = useState({
    totalAgreement: 0,
    expiringNextMonth: 0,
    reviewalCount: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const itemsPerPage = 20;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const loaderRef = useRef(null);
  const tableBodyRef = useRef(null);
  const agreementStatusRef = useRef(null);
  const docFileTypeRef = useRef(null);
  const searchTermRef = useRef(null);
  const dateFilterRef = useRef(null);
  const dateTypeRef = useRef(null);

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    updatePagination(totalItems, currentPage);
  }, [totalItems, currentPage]);

  const fetchData = async (page = 1, searchTerm = "") => {
    setLoading(true);
    setError('');

    if (loaderRef.current) {
      loaderRef.current.style.display = 'block'; // Show loader
    }

    try {
      let apiUrl = `${baseUrl}legal/api/get-envelops?page=${page}&limit=${itemsPerPage}`;
      if (searchTerm) {
        apiUrl += searchTerm;
      }

      const response = await fetch(apiUrl);
      const responseData = await response.json();

      setData(responseData.envelops || []);
      setCountData(responseData.counts || {});
      setTotalItems(responseData.counts.totalAgreement || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please check your connection and try again.");
    } finally {
      setLoading(false);
      if (loaderRef.current) {
        loaderRef.current.style.display = 'none'; // Hide loader
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(`&search_term=${e.target.value}`);
    fetchData(1, `&search_term=${e.target.value}`);
  };

  const formatDate = (datetime) => {
    if (!datetime) return "";
    const date = new Date(datetime);
    return date.toISOString().split("T")[0];
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

  const updatePagination = (totalItems, currentPage) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <li key={i} className={`page-item ${i === currentPage ? "active" : ""}`}>
          <a className="page-link" href="#" onClick={(e) => {
            e.preventDefault();
            setCurrentPage(i);
          }}>{i}</a>
        </li>
      );
    }

    setPagination([
      <li key="prev" className="page-item">
        <a className="page-link" href="#" aria-label="Previous" onClick={(e) => {
          e.preventDefault();
          setCurrentPage(prev => Math.max(prev - 1, 1));
        }}>
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>,
      ...pages,
      <li key="next" className="page-item">
        <a className="page-link" href="#" aria-label="Next" onClick={(e) => {
          e.preventDefault();
          setCurrentPage(prev => Math.min(prev + 1, totalPages));
        }}>
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    ]);
  };

  const applyFilters = () => {
    const agreementStatus = agreementStatusRef.current?.value;
    const fileType = docFileTypeRef.current?.value;
    const searchInput = searchTermRef.current?.value;
    const dateFilter = dateFilterRef.current?.value;
    const dateType = dateTypeRef.current?.value;

    let filters = [];
    if (agreementStatus) filters.push(`envelope_status=${encodeURIComponent(agreementStatus)}`);
    if (fileType) filters.push(`doc_name=${encodeURIComponent(fileType)}`);
    if (searchInput) filters.push(`search_term=${encodeURIComponent(searchInput)}`);
    if (dateType && dateFilter) filters.push(`${dateType}=${encodeURIComponent(dateFilter)}`);

    const filterParams = filters.length ? `&${filters.join('&')}` : '';

    fetchData(1, filterParams);
  };

  return (
    <>
      <div className="container py-3">
        <nav className="navbar navbar-expand-lg bg-body-light">
          <div className="container-fluid">
            <a className="navbar-brand" href="#">
              <Image
                src="/eduvanz_logo.jpg"
                alt="Logo"
                className={styles.logo}
                width={100}
                height={40} 
              />
              Agreement Generator & Reviewer
            </a>
            <Link href="/newagreement" className="btn btn-success ms-auto" role="button">
              Generate New Agreement
            </Link>
          </div>
        </nav>
        <div className="row py-5">
          <div className={`col-md-4 p-2 ${styles.cardsContainer}`}>
            <div className={`card border border-warning-subtle ${styles.card}`} id="card1">
              <div className="card-header bg-white">Reviewal Attention</div>
              <div className="card-body bg-warning-subtle" id="card1Body">
                <p className="card-text">Renewal Count: {countData.reviewalCount}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 p-2">
            <div className={`card border border-danger-subtle ${styles.card}`} id="card2">
              <div className="card-header bg-white">Expiring next month</div>
              <div className="card-body bg-danger-subtle" id="card2Body">
                <p className="card-text">Expiring Agreements Next Month: {countData.expiringNextMonth}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 p-2">
            <div className={`card border border-success-subtle ${styles.card}`} id="card3">
              <div className="card-header bg-white">Total Number of Agreements</div>
              <div className="card-body bg-success-subtle" id="card3Body">
                <p className="card-text">Total Number of Agreements: {countData.totalAgreement}</p>
              </div>
            </div>
          </div>
        </div>
        <div className={`row custom-border p-3 ${styles.tableContainer}`}>
          {/* Loader element */}
          {loading && (
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* search box */}
          {error && <div className="text-center text-danger">{error}</div>}
        <div className="row">
          <div className="col-md-3">
            <div className="input-group mb-3">
              <select id="agreementStatus" className="form-select" ref={agreementStatusRef}>
                <option value="">Select Agreement Status</option>
                <option value="sent">Sent</option>
                <option value="completed">Completed</option>
              </select>
              <button className="btn btn-outline-success" type="button" onClick={applyFilters}>Filter</button>
            </div>
          </div>

          <div className="col-md-3">
            <div className="input-group mb-3">
              <select id="doc_file_type" className="form-select" ref={docFileTypeRef}>
                <option value="">Select document type</option>
                <option value="no_liability">No liability agreement</option>
                <option value="institute_isa">Institute ISA agreement</option>
                <option value="digital_partner">Digital Partner agreement</option>
              </select>
              <button className="btn btn-outline-success" type="button" onClick={applyFilters}>Filter</button>
            </div>
          </div>

          {/* <div className="col-md-3">
            <div className="input-group mb-3">
              <input type="text" id="searchTerm" className="form-control"  placeholder="Search by key terms..." 
              // value={searchTerm}
               onChange={(e) => handleSearchChange(e)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter') {
                    // performSearch();
                   applyFilters();
                 }
               }}
               aria-label="Search by key terms" aria-describedby="searchButton" />
              <button className="btn btn-outline-success" type="button" onClick={applyFilters}>Search</button>
            </div>
          </div> */}
             <div className="col-md-3">
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="searchTerm"
                  ref={searchTermRef}
                  placeholder="Search"
                  onChange={handleSearchChange}
                />
                <button className="btn btn-outline-success" type="button" onClick={applyFilters}>Search</button>
              </div>
            </div>

          <div className="col-md-3">
            <div className="input-group mb-3">
              <input type="date" id="dateFilter" className="form-control" ref={dateFilterRef} />
              <select id="dateType" className="form-select" ref={dateTypeRef}>
                <option value="date_of_agreement">Date of Agreement</option>
                <option value="expiryDate">Expiry Date</option>
              </select>
              <button className="btn btn-outline-success" type="button" onClick={applyFilters}>Filter</button>
            </div>
          </div>
        </div>
{/* search box end */}

          <div className={styles['table-responsive']}>
          <table className={`table table-bordered ${styles.table}`} ref={tableBodyRef}>
              <thead className="thead-dark">
                <tr>
                  <th>ID</th>
                  <th>CIN</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Date of Agreement</th>
                  <th>Validity (in months)</th>
                  <th>Expiry Date</th>
                  <th>Days Left to Expire</th>
                  <th>Agreement Status</th>
                  <th>Uploaded PQFQ</th>
                  <th>Final Agreement</th>
                </tr>
              </thead>
              <tbody id="tableBody">
                {data.map(rowData => {
                  const expiryDate = new Date(rowData.expiryDate);
                  const today = new Date();
                  const timeDifference = expiryDate - today;
                  const daysLeftToExpire = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={rowData.id}>
                      <td>{rowData.id || ""}</td>
                      <td>{rowData.cin || ""}</td>
                      <td>{rowData.reviewer_name || ""}</td>
                      <td>{rowData.email || ""}</td>
                      <td>{rowData.registered_entity_name || ""}</td>
                      {/* <td>{formatDate(rowData.date_of_agreement) || ""}</td> */}
                      <td>{rowData.date_of_agreement || ""}</td>
                      <td>{rowData.validity || ""}</td>
                      <td>{rowData.expiryDate || ""}</td>
                      <td>{daysLeftToExpire || ""}</td>
                      <td>{rowData.envelopeStatus || ""}</td>
                      <td>
                        {rowData.uploaded_file && (
                          <button className="btn btn-success" onClick={() => getPresignedLink(rowData.uploaded_file)}>
                            Get Link
                          </button>
                        )}
                      </td>
                      <td>
                        {rowData.final_link && (
                          <button className="btn btn-success" onClick={() => getPresignedLink(rowData.final_link)}>
                            Get Link
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pagination-container py-2" style={{ textAlign: 'center' }}>
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center" >
                {pagination}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home