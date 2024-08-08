"use client";
import React, {useState, useEffect} from 'react';
import styles from  './page.module.css';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';

function Home() {
  const [data,setData] = useState([]);
  const [countData,setCountData] = useState({
    total_agreement: 0,
    expiring_next_month: 0,
    reviewal_count: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 20;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  
  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const fetchData = async (page = 1, searchTerm = "") => {
    const loader = document.getElementById('loader');
    loader.style.display = 'block'; // Show loader

    try {
      // to recheck
      let apiUrl = `${baseUrl}legal/api/get-envelops?page=${page}&limit=${itemsPerPage}`;
      if (searchTerm) {
        apiUrl += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(apiUrl);
      const responseData = await response.json();
      console.log("Fetched data:", responseData); // Log the fetched data for debugging

      loader.style.display = 'none';

      const data = responseData.envelops || [];
      setData(data);

      if (Array.isArray(data) && data.length > 0) {
        // Handle counts from responseData if available
        const countData = {
          total_agreement: responseData.counts.total_agreement,
          expiring_next_month: responseData.counts.expiring_next_month,
          reviewal_count: responseData.counts.reviewal_count,
        };

        console.log("Count data:", countData); // Log the count data for debugging
        setCountData(countData);

        if (countData.total_agreement) {
          setTotalItems(countData.total_agreement);
          updatePagination(countData.total_agreement, currentPage);
        }
      } else {
        console.error("Invalid data structure:", data);
        showError("Failed to load data. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      loader.style.display = 'none'; // Hide loader on error
      showError("Failed to load data. Please check your connection and try again.");
    }
  };

  const formatDate = (datetime) => {
    if (!datetime) return "";
    const date = new Date(datetime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPresignedLink = async (fileUrl) => {
    try {
      const response = await fetchPresignedLink(fileUrl);
      const data = await response.json();
      if (data && data.presigned_link) {
        window.open(data.presigned_link, "_blank");
      } else {
        console.error("Error: No presigned link returned");
      }
    } catch (error) {
      console.error("Error fetching presigned link:", error);
      alert("Failed to fetch presigned link. Please try again later.");
    }
  };

  const fetchPresignedLink = async (fileUrl) => {
    const formData = new FormData();
    formData.append("file_url", fileUrl);

    const response = await fetch(`${baseUrl}legal/api/generate-presigned-link`, {
      method: "POST",
      body: formData,
    });

    return response;
  };

  const updateCardCounts = (countData) => {
    setCountData(countData);
  };

  const updatePagination = (totalItems, currentPage) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    const prevPageItem = document.createElement("li");
    prevPageItem.className = "page-item";
    prevPageItem.innerHTML = `
      <a class="page-link" href="#" aria-label="Previous" onClick={() => changePage('prev')}>
        <span aria-hidden="true">&laquo;</span>
      </a>
    `;
    paginationContainer.appendChild(prevPageItem);

    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement("li");
      pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
      pageItem.innerHTML = `<a class="page-link" href="#" onClick={() => changePage(${i})}>${i}</a>`;
      paginationContainer.appendChild(pageItem);
    }

    const nextPageItem = document.createElement("li");
    nextPageItem.className = "page-item";
    nextPageItem.innerHTML = `
      <a class="page-link" href="#" aria-label="Next" onClick={() => changePage('next')}>
        <span aria-hidden="true">&raquo;</span>
      </a>
    `;
    paginationContainer.appendChild(nextPageItem);
  };

  const changePage = (action) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (action === "prev" && currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    } else if (action === "next" && currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    } else if (typeof action === "number") {
      setCurrentPage(action);
    }
  };

  const performSearch = () => {
    setCurrentPage(1); // Reset to first page when performing a new search
    fetchData(1, searchTerm);
  };

  function applyFilters() {
    fetchData(1);
 }

  const showError = (message) => {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = `<tr><td colspan="13" class="text-center text-danger">${message}</td></tr>`;
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
                <p className="card-text">Renewal Count: {countData.reviewal_count}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 p-2">
            <div className={`card border border-danger-subtle ${styles.card}`} id="card2">
              <div className="card-header bg-white">Expiring next month</div>
              <div className="card-body bg-danger-subtle" id="card2Body">
                <p className="card-text">Expiring Agreements Next Month: {countData.expiring_next_month}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 p-2">
            <div className={`card border border-success-subtle ${styles.card}`} id="card3">
              <div className="card-header bg-white">Total Number of Agreements</div>
              <div className="card-body bg-success-subtle" id="card3Body">
                <p className="card-text">Total Number of Agreements: {countData.total_agreement}</p>
              </div>
            </div>
          </div>
        </div>
        <div className={`row custom-border p-3 ${styles.tableContainer}`}>
          {/* Loader element */}
          <div id="loader" className="text-center my-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading data...</p>
          </div>

          {/* search box */}
        <div className="row">
          <div className="col-md-3">
            <div className="input-group mb-3">
              <select id="agreementStatus" className="form-select">
                <option value="">Select Agreement Status</option>
                <option value="sent">Sent</option>
                <option value="completed">Completed</option>
              </select>
              <button className="btn btn-outline-success" type="button" onClick={applyFilters}>Filter</button>
            </div>
          </div>

          <div className="col-md-3">
            <div className="input-group mb-3">
              <select id="fileType" className="form-select">
                <option value="">Select document type</option>
                <option value="no_liability">No liability agreement</option>
                <option value="institute_isa">Institute ISA agreement</option>
                <option value="digital_partner">Digital Partner agreement</option>
              </select>
              <button className="btn btn-outline-success" type="button" onClick={applyFilters}>Filter</button>
            </div>
          </div>

          <div className="col-md-3">
            <div className="input-group mb-3">
              <input type="text" id="searchInput" className="form-control" placeholder="Search by key terms..." aria-label="Search by key terms" aria-describedby="searchButton" />
              <button className="btn btn-outline-success" type="button" onClick={applyFilters}>Search</button>
            </div>
          </div>

          <div className="col-md-3">
            <div className="input-group mb-3">
              <input type="date" id="dateFilter" className="form-control" aria-label="Filter by date" />
              <select id="dateType" className="form-select">
                <option value="date_of_agreement">Date of Agreement</option>
                <option value="expiry_date">Expiry Date</option>
              </select>
              <button className="btn btn-outline-success" type="button" onClick={applyFilters}>Filter</button>
            </div>
          </div>
        </div>
{/* search box end */}

          <div className={styles['table-responsive']}>
          <table className={`table table-bordered ${styles.table}`}>
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
                  const expiryDate = new Date(rowData.expiry_date);
                  const today = new Date();
                  const timeDifference = expiryDate - today;
                  const daysLeftToExpire = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={rowData.id}>
                      <td>{rowData.id || ""}</td>
                      <td>{rowData.cin || ""}</td>
                      <td>{rowData.name || ""}</td>
                      <td>{rowData.email || ""}</td>
                      <td>{rowData.registered_entity_name || ""}</td>
                      <td>{formatDate(rowData.date_of_agreement) || ""}</td>
                      <td>{rowData.validity || ""}</td>
                      <td>{rowData.expiry_date || ""}</td>
                      <td>{daysLeftToExpire || ""}</td>
                      <td>{rowData.envelope_status || ""}</td>
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
              <ul className="pagination justify-content-center" id="pagination">
                {/* Pagination will be generated dynamically */}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home