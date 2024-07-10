import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import { getDocs, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/Firebase";

const ModalEditBidang = ({ show, handleClose, bidang, onSave }) => {
  const [namaBidang, setNamaBidang] = useState(bidang.nama_bidang);
  const [pengurus, setPengurus] = useState(bidang.pengurus || []);
  const [alumni, setAlumni] = useState([]);
  
  useEffect(() => {
    setNamaBidang(bidang.nama_bidang);
    setPengurus(bidang.pengurus || []);
    fetchAlumni();
  }, [bidang]);

  const fetchAlumni = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const alumniData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlumni(alumniData);
    } catch (error) {
      console.error("Error fetching alumni data: ", error.message);
    }
  };

  const handlePengurusChange = (index, field, value) => {
    const newPengurus = pengurus.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    setPengurus(newPengurus);
  };

  const handleAddPengurus = () => {
    setPengurus([...pengurus, { nama_pengurus: "", jabatan_pengurus: "" }]);
  };

  const handleRemovePengurus = (index) => {
    const newPengurus = pengurus.filter((_, i) => i !== index);
    setPengurus(newPengurus);
  };

  const handleSave = async () => {
    try {
      const bidangRef = doc(db, "jabatan", bidang.id);
      await updateDoc(bidangRef, {
        nama_bidang: namaBidang,
        pengurus: pengurus.filter(p => p.nama_pengurus && p.jabatan_pengurus)
      });
      onSave({ id: bidang.id, nama_bidang: namaBidang, pengurus });
      handleClose();
    } catch (error) {
      console.error("Error updating bidang: ", error.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Bidang</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formNamaBidang">
            <Form.Label>Nama Bidang</Form.Label>
            <Form.Control
              type="text"
              value={namaBidang}
              onChange={(e) => setNamaBidang(e.target.value)}
            />
          </Form.Group>
          {pengurus.map((p, index) => (
            <div key={index} className="mt-3">
              <Form.Group controlId={`formNamaPengurus${index}`}>
                <div className="d-flex justify-content-between">
                <Form.Label>Nama Pengurus {index + 1}</Form.Label>
                <span className="text-muted">*Untuk input manual</span>
                </div>
                <Row>
                  <Col md={8}>
                    <Form.Control
                      as="select"
                      value={p.nama_pengurus}
                      onChange={(e) =>
                        handlePengurusChange(index, "nama_pengurus", e.target.value)
                      }
                    >
                      <option value="">Pilih Alumni</option>
                      {alumni.map((alumnus) => (
                        <option key={alumnus.id} value={alumnus.name}>
                          {alumnus.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      placeholder="Nama Pengurus"
                      value={p.nama_pengurus}
                      onChange={(e) =>
                        handlePengurusChange(index, "nama_pengurus", e.target.value)
                      }
                    />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId={`formJabatanPengurus${index}`} className="mt-2">
                <Form.Label>Jabatan Pengurus {index + 1}</Form.Label>
                <Form.Control
                  type="text"
                  value={p.jabatan_pengurus}
                  onChange={(e) =>
                    handlePengurusChange(index, "jabatan_pengurus", e.target.value)
                  }
                />
              </Form.Group>
              {index > 0 && (
                <Button
                  variant="danger"
                  className="mt-2"
                  onClick={() => handleRemovePengurus(index)}
                >
                  Remove Pengurus
                </Button>
              )}
            </div>
          ))}
          <Button variant="secondary" className="mt-3" onClick={handleAddPengurus}>
            Add Pengurus
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="success" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEditBidang;
