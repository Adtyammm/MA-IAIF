import { getDownloadURL, ref } from "firebase/storage";
import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { storage } from "../../config/Firebase";

const ModalNewsPreview = ({ show, handleClose, newsData }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const url = await getDownloadURL(ref(storage, `news/${newsData.image}`));
        setImageUrl(url);
      } catch (error) {
        console.error("Error fetching image URL: ", error.message);
      }
    };

    if (newsData.image) {
      fetchImageUrl();
    }
  }, [newsData.image]);

  const formatContent = (content) => {
    return content.split('\n').map((str, index) => (
      <React.Fragment key={index}>
        {str}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Pratinjau</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <h4 className="mb-4">{newsData.title}</h4>
          <p className="text-muted">Oleh {newsData.author}</p>
          <p>{newsData.date}</p>
          {imageUrl ? (
            <img className="my-2" src={imageUrl} alt="news_image" />
          ) : (
            <p>Loading image...</p>
          )}
        </div>
        <div className="d-flex justify-content-center my-4">
          <p style={{ textAlign: "justify" }}>{formatContent(newsData.content)}</p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalNewsPreview;
