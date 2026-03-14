import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Spinner, Form } from 'react-bootstrap';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GraphUp, Calendar, People, FileText, Building, GraphDownArrow } from 'react-bootstrap-icons';
import { complaintAPI, userAPI, departmentAPI } from '../services/api';
import { toast } from 'react-toastify';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [analyticsData, setAnalyticsData] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    totalUsers: 0,
    totalDepartments: 0,
    complaintsByCategory: [],
    complaintsByStatus: [],
    complaintsOverTime: [],
    departmentPerformance: [],
    resolutionTimes: [],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from backend
      const [complaintsResponse, usersResponse, departmentsResponse] = await Promise.all([
        complaintAPI.getAllComplaints(),
        userAPI.getAllUsers(),
        departmentAPI.getAllDepartments(),
      ]);

      const complaints = complaintsResponse.data.data || [];
      const users = usersResponse.data.data || [];
      const departments = departmentsResponse.data.data || [];

      // Process data for analytics
      const processedData = processAnalyticsData(complaints, users, departments);
      setAnalyticsData(processedData);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
      // Set empty data if error
      setAnalyticsData({
        totalComplaints: 0,
        resolvedComplaints: 0,
        pendingComplaints: 0,
        inProgressComplaints: 0,
        totalUsers: 0,
        totalDepartments: 0,
        complaintsByCategory: [],
        complaintsByStatus: [],
        complaintsOverTime: [],
        departmentPerformance: [],
        resolutionTimes: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (complaints, users, departments) => {
    // Basic statistics
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
    const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
    const inProgressComplaints = complaints.filter(c => c.status === 'in-progress').length;
    const totalUsers = users.length;
    const totalDepartments = departments.length;

    // Complaints by category
    const categoryCount = {};
    complaints.forEach(complaint => {
      const category = complaint.category || 'unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    const complaintsByCategory = Object.entries(categoryCount).map(([name, value]) => ({
      name: name.replace('-', ' ').toUpperCase(),
      value,
      fill: getCategoryColor(name),
    }));

    // Complaints by status
    const statusCount = {};
    complaints.forEach(complaint => {
      const status = complaint.status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    const complaintsByStatus = Object.entries(statusCount).map(([name, value]) => ({
      name: name.replace('-', ' ').toUpperCase(),
      value,
      fill: getStatusColor(name),
    }));

    // Complaints over time (last 7 days)
    const complaintsOverTime = generateTimeSeriesData(complaints);

    // Department performance
    const departmentPerformance = departments.map(dept => {
      const deptComplaints = complaints.filter(c => c.department_id === dept.id);
      const resolved = deptComplaints.filter(c => c.status === 'resolved').length;
      const total = deptComplaints.length;
      const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;
      
      return {
        name: dept.department_name,
        total,
        resolved,
        pending: deptComplaints.filter(c => c.status === 'pending').length,
        inProgress: deptComplaints.filter(c => c.status === 'in-progress').length,
        resolutionRate: Math.round(resolutionRate),
      };
    });

    // Resolution times (mock data for now)
    const resolutionTimes = [
      { department: 'Electricity', avgHours: 24 },
      { department: 'Sanitation', avgHours: 18 },
      { department: 'Water Supply', avgHours: 36 },
      { department: 'Public Works', avgHours: 48 },
      { department: 'Traffic', avgHours: 12 },
    ];

    return {
      totalComplaints,
      resolvedComplaints,
      pendingComplaints,
      inProgressComplaints,
      totalUsers,
      totalDepartments,
      complaintsByCategory,
      complaintsByStatus,
      complaintsOverTime,
      departmentPerformance,
      resolutionTimes,
    };
  };

  const getCategoryColor = (category) => {
    const colors = {
      sanitation: '#27ae60',
      'water-supply': '#3498db',
      electricity: '#f39c12',
      'public-works': '#9b59b6',
      traffic: '#e74c3c',
    };
    return colors[category] || '#95a5a6';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      'in-progress': '#3498db',
      resolved: '#27ae60',
      rejected: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  const generateTimeSeriesData = (complaints) => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const count = complaints.filter(c => {
        const complaintDate = new Date(c.created_at);
        return complaintDate.toDateString() === date.toDateString();
      }).length;
      
      data.push({ date: dateStr, complaints: count });
    }
    
    return data;
  };

  const resolutionRate = analyticsData.totalComplaints > 0 
    ? Math.round((analyticsData.resolvedComplaints / analyticsData.totalComplaints) * 100)
    : 0;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading analytics...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Analytics Dashboard</h2>
          <p className="text-muted mb-0">System performance and insights</p>
        </div>
        <div className="d-flex gap-2">
          <Form.Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} style={{ width: '150px' }}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </Form.Select>
          <Button variant="outline-primary" onClick={fetchAnalyticsData}>
            <GraphUp className="me-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <FileText size={24} />
                </div>
                <Badge bg="primary">Total</Badge>
              </div>
              <h3 className="fw-bold mb-1">{analyticsData.totalComplaints}</h3>
              <p className="text-muted mb-0">Total Complaints</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <GraphUp size={24} />
                </div>
                <Badge bg="success">{resolutionRate}%</Badge>
              </div>
              <h3 className="fw-bold mb-1">{analyticsData.resolvedComplaints}</h3>
              <p className="text-muted mb-0">Resolved</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <Calendar size={24} />
                </div>
                <Badge bg="warning">Active</Badge>
              </div>
              <h3 className="fw-bold mb-1">{analyticsData.pendingComplaints + analyticsData.inProgressComplaints}</h3>
              <p className="text-muted mb-0">Pending</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <People size={24} />
                </div>
                <Badge bg="info">Total</Badge>
              </div>
              <h3 className="fw-bold mb-1">{analyticsData.totalUsers}</h3>
              <p className="text-muted mb-0">Users</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="custom-card">
            <Card.Header className="card-header-custom">
              <h5 className="mb-0">Complaints Trend (Last 7 Days)</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.complaintsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="complaints" stroke="#3498db" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="custom-card">
            <Card.Header className="card-header-custom">
              <h5 className="mb-0">Complaints by Status</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.complaintsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.complaintsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="custom-card">
            <Card.Header className="card-header-custom">
              <h5 className="mb-0">Complaints by Category</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.complaintsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3498db" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="custom-card">
            <Card.Header className="card-header-custom">
              <h5 className="mb-0">Department Performance</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.departmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="resolved" fill="#27ae60" name="Resolved" />
                  <Bar dataKey="pending" fill="#f39c12" name="Pending" />
                  <Bar dataKey="inProgress" fill="#3498db" name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Department Performance Table */}
      <Card className="custom-card">
        <Card.Header className="card-header-custom">
          <h5 className="mb-0">Department Resolution Rates</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total Complaints</th>
                  <th>Resolved</th>
                  <th>Pending</th>
                  <th>In Progress</th>
                  <th>Resolution Rate</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.departmentPerformance.map((dept, index) => (
                  <tr key={index}>
                    <td className="fw-semibold">{dept.name}</td>
                    <td>{dept.total}</td>
                    <td>
                      <Badge bg="success">{dept.resolved}</Badge>
                    </td>
                    <td>
                      <Badge bg="warning">{dept.pending}</Badge>
                    </td>
                    <td>
                      <Badge bg="info">{dept.inProgress}</Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress" style={{ width: '100px', height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${dept.resolutionRate}%` }}
                          />
                        </div>
                        <span className="fw-semibold">{dept.resolutionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Analytics;
