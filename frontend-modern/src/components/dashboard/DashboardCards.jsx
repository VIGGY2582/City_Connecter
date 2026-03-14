import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import {
  FileText,
  People,
  Building,
  CheckCircle,
  Clock,
  ExclamationTriangle,
  GraphUp,
  Activity,
} from 'react-bootstrap-icons';

const DashboardCards = ({ stats = {} }) => {
  // Default stats if not provided
  const defaultStats = {
    totalComplaints: 156,
    pendingComplaints: 23,
    inProgressComplaints: 45,
    resolvedComplaints: 88,
    totalUsers: 342,
    totalDepartments: 5,
    newComplaintsToday: 12,
    avgResolutionTime: '2.5 days',
  };

  const dashboardStats = { ...defaultStats, ...stats };

  const cards = [
    {
      title: 'Total Complaints',
      value: dashboardStats.totalComplaints,
      icon: FileText,
      color: '#3498db',
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Pending',
      value: dashboardStats.pendingComplaints,
      icon: Clock,
      color: '#f39c12',
      change: '+5%',
      changeType: 'neutral',
    },
    {
      title: 'In Progress',
      value: dashboardStats.inProgressComplaints,
      icon: Activity,
      color: '#9b59b6',
      change: '-3%',
      changeType: 'positive',
    },
    {
      title: 'Resolved',
      value: dashboardStats.resolvedComplaints,
      icon: CheckCircle,
      color: '#27ae60',
      change: '+18%',
      changeType: 'positive',
    },
    {
      title: 'Total Users',
      value: dashboardStats.totalUsers,
      icon: People,
      color: '#e74c3c',
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: 'Departments',
      value: dashboardStats.totalDepartments,
      icon: Building,
      color: '#34495e',
      change: '0%',
      changeType: 'neutral',
    },
    {
      title: 'New Today',
      value: dashboardStats.newComplaintsToday,
      icon: ExclamationTriangle,
      color: '#e67e22',
      change: '+25%',
      changeType: 'positive',
    },
    {
      title: 'Avg Resolution',
      value: dashboardStats.avgResolutionTime,
      icon: GraphUp,
      color: '#16a085',
      change: '-15%',
      changeType: 'positive',
    },
  ];

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive':
        return '#27ae60';
      case 'negative':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  return (
    <Row className="g-4 mb-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Col key={index} xs={12} sm={6} lg={3}>
            <Card className="custom-card h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: card.color,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  {card.change && (
                    <div
                      className="small fw-semibold"
                      style={{ color: getChangeColor(card.changeType) }}
                    >
                      {card.change}
                    </div>
                  )}
                </div>
                
                <div className="mb-2">
                  <h3 className="fw-bold mb-1">{card.value}</h3>
                  <p className="text-muted mb-0">{card.title}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default DashboardCards;
