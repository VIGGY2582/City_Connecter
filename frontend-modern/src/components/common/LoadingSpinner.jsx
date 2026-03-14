import React from 'react';
import { Spinner, Card } from 'react-bootstrap';
import { Building } from 'react-bootstrap-icons';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Card className="text-center p-4 shadow-lg border-0">
        <Card.Body>
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white mb-3"
            style={{ width: '60px', height: '60px' }}>
            <Building size={30} />
          </div>
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h5 className="text-muted mb-0">{message}</h5>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoadingSpinner;
