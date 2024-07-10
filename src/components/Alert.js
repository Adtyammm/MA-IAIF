import React, { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";

const Alert = ({ show, handleClose, message, timeout }) => {
  useEffect(() => {
    if (show && timeout) {
      const timer = setTimeout(() => {
        handleClose();
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [show, timeout, handleClose]);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Notifikasi</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Alert;
