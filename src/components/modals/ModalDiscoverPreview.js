import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

const ModalDiscoverPreview = ({ show, handleClose, discoverData }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [secondImageUrl, setSecondImageUrl] = useState("");

  useEffect(() => {
    const fetchImageUrls = async () => {
      try {
        if (discoverData.imageUrl) {
          setImageUrl(discoverData.imageUrl);
        }

        if (discoverData.secondImageUrl) {
          setSecondImageUrl(discoverData.secondImageUrl);
        }
      } catch (error) {
        console.error("Gagal mengambil Gambar: ", error.message);
      }
    };

    fetchImageUrls();
  }, [discoverData.imageUrl, discoverData.secondImageUrl]);

  const formatContent = (content) => {
    return content.split("\n").map((str, index) => (
      <React.Fragment key={index}>
        {str}
        <br />
      </React.Fragment>
    ));
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Pratinjau</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <h4 className="mb-4">{discoverData.title}</h4>

          <p className="text-gray-500">
            {formatDate(discoverData.createdAt.toDate())}
          </p>
          {imageUrl ? (
            <img
              className="my-2"
              src={imageUrl}
              alt="discover_image"
              style={{ width: "200px", height: "auto" }}
            />
          ) : (
            <p>Loading image...</p>
          )}
          <p className="text-muted">{discoverData.content}</p>
          {secondImageUrl ? (
            <img
              className="my-2"
              src={secondImageUrl}
              alt="second_image"
              style={{ width: "auto", height: "200px" }}
            />
          ) : (
            <p>Loading second image...</p>
          )}
        </div>
        <div className="d-flex justify-content-center my-4">
          <p style={{ textAlign: "justify" }}>
            {formatContent(discoverData.closingContent)}
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalDiscoverPreview;
