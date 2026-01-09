import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Container, Row, Col, Card, Button, Table, 
  Modal, Form, Alert, Badge, Nav, Tabs, Tab,
  Spinner, ProgressBar
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import './StaffDashboard.css';


export default function StaffDashboard() {
  const { staffId } = useParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuItems, setMenuItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Modal states
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  // Form state
  const [menuForm, setMenuForm] = useState({ 
    name: "", 
    price: "", 
    category: "breakfast", 
    imageUrl: "" 
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchMenuItems();
    fetchMenuStats();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://192.168.134.130:5000/api/staff/menu");
      const data = await res.json();
      if (res.ok) {
        setMenuItems(data);
      }
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setError("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/staff/stats");
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Filter menu items by category
  const getMenuByCategory = (category) => {
    return menuItems.filter(item => item.category === category);
  };

  // Menu Management Functions
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/staff/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuForm),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Menu item added successfully!");
        setShowMenuModal(false);
        setMenuForm({ name: "", price: "", category: "breakfast", imageUrl: "" });
        fetchMenuItems();
        fetchMenuStats();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMenuItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/staff/menu/${selectedMenuItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuForm),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Menu item updated successfully!");
        setShowMenuModal(false);
        fetchMenuItems();
        fetchMenuStats();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to update menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/staff/menu/${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Menu item deleted successfully!");
        fetchMenuItems();
        fetchMenuStats();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to delete menu item");
    }
  };

  // Modal handlers
  const openMenuModal = (item = null) => {
    setSelectedMenuItem(item);
    if (item) {
      setMenuForm({ 
        name: item.name, 
        price: item.price, 
        category: item.category, 
        imageUrl: item.imageUrl 
      });
    } else {
      setMenuForm({ name: "", price: "", category: "breakfast", imageUrl: "" });
    }
    setShowMenuModal(true);
  };

  // Get category counts
  const getCategoryCounts = () => {
    return {
      breakfast: getMenuByCategory("breakfast").length,
      lunch: getMenuByCategory("lunch").length,
      dinner: getMenuByCategory("dinner").length
    };
  };

  const categoryCounts = getCategoryCounts();
  const handleLogout = () => {
      // Remove any authentication data (token, staff ID, etc.)
      localStorage.removeItem("staffToken");
      localStorage.removeItem("staffId");

      // Redirect to login page
      window.location.href = "/";
    
};

  return (
    <Container fluid className="staff-dashboard">
      {/* Header */}
      <Row className="staff-header py-3 mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">👨‍🍳 FoodCard Staff Dashboard</h2>
              <p className="text-muted mb-0">Welcome, Staff! Manage menu items efficiently</p>
            </div>
            <div className="d-flex align-items-center">
              <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                🚪 Logout
              </Button>
            </div>

          </div>
        </Col>
      </Row>

      {message && <Alert variant="success" onClose={() => setMessage("")} dismissible>{message}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

      {/* Navigation Tabs */}
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="dashboard" title="📊 Dashboard">
          <DashboardTab 
            stats={stats}
            categoryCounts={categoryCounts}
            menuItems={menuItems}
          />
        </Tab>
        <Tab eventKey="breakfast" title="🍳 Breakfast">
          <MenuCategoryTab 
            category="breakfast"
            items={getMenuByCategory("breakfast")}
            loading={loading}
            onEditItem={openMenuModal}
            onDeleteItem={handleDeleteMenuItem}
            onAddItem={() => openMenuModal()}
          />
        </Tab>
        <Tab eventKey="lunch" title="🍽️ Lunch">
          <MenuCategoryTab 
            category="lunch"
            items={getMenuByCategory("lunch")}
            loading={loading}
            onEditItem={openMenuModal}
            onDeleteItem={handleDeleteMenuItem}
            onAddItem={() => openMenuModal()}
          />
        </Tab>
        <Tab eventKey="dinner" title="🌙 Dinner">
          <MenuCategoryTab 
            category="dinner"
            items={getMenuByCategory("dinner")}
            loading={loading}
            onEditItem={openMenuModal}
            onDeleteItem={handleDeleteMenuItem}
            onAddItem={() => openMenuModal()}
          />
        </Tab>
        <Tab eventKey="all" title="📋 All Items">
          <AllItemsTab 
            items={menuItems}
            loading={loading}
            onEditItem={openMenuModal}
            onDeleteItem={handleDeleteMenuItem}
            onAddItem={() => openMenuModal()}
          />
        </Tab>
      </Tabs>

      {/* Menu Modal */}
      <MenuModal
        show={showMenuModal}
        onHide={() => setShowMenuModal(false)}
        item={selectedMenuItem}
        form={menuForm}
        setForm={setMenuForm}
        onSubmit={selectedMenuItem ? handleUpdateMenuItem : handleAddMenuItem}
        loading={loading}
      />
    </Container>
  );
}

// Dashboard Tab Component
const DashboardTab = ({ stats, categoryCounts, menuItems }) => (
  <div className="dashboard-tab">
    {/* Stats Cards */}
    <Row className="g-4 mb-4">
      <Col md={3}>
        <Card className="stat-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="card-title">Total Menu Items</h6>
                <h2 className="text-primary">{menuItems.length}</h2>
                <small className="text-muted">All categories</small>
              </div>
              <div className="stat-icon">🍕</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="stat-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="card-title">Breakfast Items</h6>
                <h2 className="text-warning">{categoryCounts.breakfast}</h2>
                <small className="text-muted">Morning menu</small>
              </div>
              <div className="stat-icon">🍳</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="stat-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="card-title">Lunch Items</h6>
                <h2 className="text-success">{categoryCounts.lunch}</h2>
                <small className="text-muted">Afternoon menu</small>
              </div>
              <div className="stat-icon">🍽️</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="stat-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="card-title">Dinner Items</h6>
                <h2 className="text-info">{categoryCounts.dinner}</h2>
                <small className="text-muted">Evening menu</small>
              </div>
              <div className="stat-icon">🌙</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    {/* Category Distribution */}
    <Row className="g-4">
      <Col md={6}>
        <Card className="chart-card">
          <Card.Header>
            <h5 className="mb-0">Menu Distribution</h5>
          </Card.Header>
          <Card.Body>
            <div className="distribution-chart">
              <div className="distribution-item mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="distribution-label">
                    <span className="color-indicator breakfast"></span>
                    Breakfast
                  </span>
                  <span className="distribution-value">
                    {categoryCounts.breakfast} items
                  </span>
                </div>
                <ProgressBar 
                  now={(categoryCounts.breakfast / menuItems.length) * 100} 
                  variant="warning"
                  style={{height: '12px'}}
                  className="distribution-bar"
                />
              </div>
              <div className="distribution-item mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="distribution-label">
                    <span className="color-indicator lunch"></span>
                    Lunch
                  </span>
                  <span className="distribution-value">
                    {categoryCounts.lunch} items
                  </span>
                </div>
                <ProgressBar 
                  now={(categoryCounts.lunch / menuItems.length) * 100} 
                  variant="success"
                  style={{height: '12px'}}
                  className="distribution-bar"
                />
              </div>
              <div className="distribution-item">
                <div className="d-flex justify-content-between mb-1">
                  <span className="distribution-label">
                    <span className="color-indicator dinner"></span>
                    Dinner
                  </span>
                  <span className="distribution-value">
                    {categoryCounts.dinner} items
                  </span>
                </div>
                <ProgressBar 
                  now={(categoryCounts.dinner / menuItems.length) * 100} 
                  variant="info"
                  style={{height: '12px'}}
                  className="distribution-bar"
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="chart-card">
          <Card.Header>
            <h5 className="mb-0">Popular Items Today</h5>
          </Card.Header>
          <Card.Body>
            <div className="popular-items">
              {stats.popularItems && stats.popularItems.length > 0 ? (
                stats.popularItems.map((item, index) => (
                  <div key={index} className="popular-item mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="item-name">{item.name}</span>
                      <Badge bg="primary" className="order-count">
                        {item.count} orders
                      </Badge>
                    </div>
                    <ProgressBar 
                      now={(item.count / (stats.popularItems[0]?.count || 1)) * 100} 
                      variant="primary"
                      style={{height: '8px'}}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-3">
                  No orders today
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    {/* Quick Actions */}
    <Row className="mt-4">
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Quick Actions</h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={3}>
                <Card className="action-card text-center">
                  <Card.Body>
                    <div className="action-icon mb-2">🍳</div>
                    <h6>Add Breakfast</h6>
                    <small className="text-muted">Create new breakfast item</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="action-card text-center">
                  <Card.Body>
                    <div className="action-icon mb-2">🍽️</div>
                    <h6>Add Lunch</h6>
                    <small className="text-muted">Create new lunch item</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="action-card text-center">
                  <Card.Body>
                    <div className="action-icon mb-2">🌙</div>
                    <h6>Add Dinner</h6>
                    <small className="text-muted">Create new dinner item</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="action-card text-center">
                  <Card.Body>
                    <div className="action-icon mb-2">📋</div>
                    <h6>View All</h6>
                    <small className="text-muted">See all menu items</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </div>
);

// Menu Category Tab Component
const MenuCategoryTab = ({ category, items, loading, onEditItem, onDeleteItem, onAddItem }) => (
  <div>
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0 text-capitalize">{category} Menu</h5>
          <small className="text-muted">{items.length} items available</small>
        </div>
        <Button variant="primary" onClick={onAddItem}>
          + Add {category.charAt(0).toUpperCase() + category.slice(1)} Item
        </Button>
      </Card.Header>
    </Card>

    {loading ? (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2 text-muted">Loading menu items...</p>
      </div>
    ) : items.length === 0 ? (
      <Card className="text-center py-5">
        <Card.Body>
          <div className="empty-state-icon mb-3">🍽️</div>
          <h5>No {category} items yet</h5>
          <p className="text-muted mb-3">Start by adding your first {category} item to the menu</p>
          <Button variant="primary" onClick={onAddItem}>
            Add First {category.charAt(0).toUpperCase() + category.slice(1)} Item
          </Button>
        </Card.Body>
      </Card>
    ) : (
      <Row>
        {items.map((item) => (
          <Col md={4} key={item._id} className="mb-4">
            <Card className="menu-item-card h-100">
              <div className="menu-item-image-container">
                <Card.Img variant="top" src={item.imageUrl} className="menu-item-image" />
                <div className="menu-item-overlay">
                  <div className="action-buttons">
                    <Button
                      variant="outline-light"
                      size="sm"
                      className="me-2"
                      onClick={() => onEditItem(item)}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="outline-light"
                      size="sm"
                      onClick={() => onDeleteItem(item._id)}
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              </div>
              <Card.Body>
                <Card.Title className="menu-item-title">{item.name}</Card.Title>
                <Card.Text className="menu-item-details">
                  <div className="price">₹{item.price}</div>
                  <div className="category">
                    <Badge bg={
                      item.category === 'breakfast' ? 'warning' :
                      item.category === 'lunch' ? 'success' : 'info'
                    }>
                      {item.category}
                    </Badge>
                  </div>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    )}
  </div>
);

// All Items Tab Component
const AllItemsTab = ({ items, loading, onEditItem, onDeleteItem, onAddItem }) => (
  <div>
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">All Menu Items</h5>
          <small className="text-muted">{items.length} total items</small>
        </div>
        <Button variant="primary" onClick={onAddItem}>
          + Add New Item
        </Button>
      </Card.Header>
    </Card>

    {loading ? (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    ) : (
      <Card>
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="table-item-image"
                    />
                  </td>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td className="price-cell">
                    <Badge bg="success" className="price-badge">
                      ₹{item.price}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={
                      item.category === 'breakfast' ? 'warning' :
                      item.category === 'lunch' ? 'success' : 'info'
                    }>
                      {item.category}
                    </Badge>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => onEditItem(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDeleteItem(item._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    )}
  </div>
);

// Menu Modal Component
const MenuModal = ({ show, onHide, item, form, setForm, onSubmit, loading }) => (
  <Modal show={show} onHide={onHide} centered className="custom-modal">
    <Modal.Header closeButton className="modal-header-custom">
      <Modal.Title>{item ? "Edit Menu Item" : "Add New Menu Item"}</Modal.Title>
    </Modal.Header>
    <Form onSubmit={onSubmit}>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Item Name</Form.Label>
          <Form.Control
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="form-control-custom"
            placeholder="Enter item name"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Price (₹)</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            className="form-control-custom"
            placeholder="Enter price"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="form-control-custom"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Image URL</Form.Label>
          <Form.Control
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            required
            className="form-control-custom"
            placeholder="Enter image URL"
          />
          <Form.Text className="text-muted">
            Provide a direct link to the food image
          </Form.Text>
        </Form.Group>
        {form.imageUrl && (
          <div className="image-preview mb-3">
            <small className="text-muted">Preview:</small>
            <div className="preview-image-container mt-2">
              <img 
                src={form.imageUrl} 
                alt="Preview" 
                className="preview-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="modal-footer-custom">
        <Button variant="secondary" onClick={onHide} className="btn-custom">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={loading} className="btn-custom">
          {loading ? "Saving..." : item ? "Update Item" : "Add Item"}
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
);
