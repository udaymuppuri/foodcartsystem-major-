import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
  Tabs,
  Tab,
  Modal,
  Accordion,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import { motion } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./StudentDashboard.css";
import { QRCodeCanvas } from "qrcode.react";




export default function StudentDashboard() {
  const { studentId } = useParams();
  const navigate = useNavigate(); // ✅ for logout redirect

  const [student, setStudent] = useState({});
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("breakfast");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [todaysOrders, setTodaysOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [recentOrder, setRecentOrder] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [allOrders, setAllOrders] = useState([]);

  const [showWalletModal, setShowWalletModal] = useState(false);
const [otpSent, setOtpSent] = useState(false);
const [enteredOtp, setEnteredOtp] = useState("");
const [otpMessage, setOtpMessage] = useState("");



  // Fetch student + menu data
  useEffect(() => {
    if (!studentId) return;
    setLoading(true);

    fetch(`http://192.168.134.13:5000/api/student/profile/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setStudent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching student:", err);
        setStudent({ name: "Error Loading", walletBalance: 0 });
        setLoading(false);
      });

    fetch("http://localhost:5000/api/menu")
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch((err) => console.error("Menu fetch error:", err));

    fetchTodaysOrders();
  }, [studentId]);


  const handleSendWalletOtp = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/wallet/otp/${studentId}`, {
      method: "POST",
    });

    const data = await res.json();

    if (res.ok) {
      setOtpSent(true);
      setOtpMessage("OTP sent to your registered email.");
    } else {
      setOtpMessage(data.message || "Failed to send OTP.");
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    setOtpMessage("Server error while sending OTP.");
  }
};

const handleVerifyOtp = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/wallet/verify/${studentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enteredOtp }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      setOtpMessage("OTP verified successfully!");
      setShowWalletModal(false);
      navigate(`/addwallet/${studentId}`); // ✅ redirect to add wallet page
    } else {
      setOtpMessage(data.message || "Invalid OTP!");
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    setOtpMessage("Error verifying OTP.");
  }
};


  const fetchTodaysOrders = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/today/${studentId}`
      );
      if (res.ok) {
        const data = await res.json();
        setTodaysOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching today's orders:", err);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/history/${studentId}`
      );
      if (res.ok) {
        const data = await res.json();
        setAllOrders(data);
      }
    } catch (err) {
      console.error("Error fetching all orders:", err);
    }
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    fetchAllOrders();
  };

  const getMenuByCategory = (category) =>
    menu.filter((item) => item.category === category);

  const getTodaysOrdersByType = (type) =>
    todaysOrders.filter((order) => order.orderType === type);

  const addToCart = (item) => {
    const existing = cart.find((i) => i._id === item._id);
    if (existing) {
      setCart((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        )
      );
    } else {
      setCart((prev) => [...prev, { ...item, quantity: 1 }]);
    }
    setMessage(`${item.name} added to cart`);
    setTimeout(() => setMessage(""), 1500);
  };

  const totalAmount = cart.reduce(
    (sum, i) => sum + i.price * (i.quantity || 1),
    0
  );

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, q) => {
    if (q < 1) return removeFromCart(index);
    setCart((prev) =>
      prev.map((i, idx) => (idx === index ? { ...i, quantity: q } : i))
    );
  };

  const handlePlaceOrderClick = () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    if (student.walletBalance < totalAmount)
      return alert("Insufficient wallet balance!");
    setShowConfirmModal(true);
  };

  const handleSubmitOrder = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    const currentTotal = totalAmount;

    try {
      const orderData = {
        studentId,
        items: cart.map((i) => ({
          _id: i._id,
          name: i.name,
          price: i.price,
          category: i.category,
          imageUrl: i.imageUrl,
          quantity: i.quantity,
        })),
        orderType: activeTab,
      };

      const res = await fetch("http://localhost:5000/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (res.ok) {
        setRecentOrder(data.order);
        setOrderTotal(currentTotal);
        setShowOrderModal(true);
        setCart([]);
        fetchTodaysOrders();
      }else {
        setOrderError(data.message || "Order failed!");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setOrderError("Network error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout functionality
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading && !student.name)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="info" />
        <p>Loading dashboard...</p>
      </div>
    );

  const orderCounts = {
    breakfast: getTodaysOrdersByType("breakfast").length,
    lunch: getTodaysOrdersByType("lunch").length,
    dinner: getTodaysOrdersByType("dinner").length,
  };

  return (
    <Container className="mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>Hello, {student.name || "Student"} 👋</h3>
        </div>
        <div className="d-flex align-items-center">
          <h5 className="me-3">
            Wallet: <Badge bg="success">₹{student.walletBalance ?? 0}</Badge>
          </h5>
          <FaUserCircle
            size={35}
            color="#0d6efd"
            style={{ cursor: "pointer" }}
            title="View Order History"
            onClick={handleProfileClick}
          />
        </div>
      </div>

      {message && <Alert variant="success">{message}</Alert>}
      {orderError && <Alert variant="danger">{orderError}</Alert>}

      {/* Today's Summary */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5>📊 Today's Order Summary</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col className="text-center">
              🍳 Breakfast <Badge bg="warning">{orderCounts.breakfast}</Badge>
            </Col>
            <Col className="text-center">
              🍽️ Lunch <Badge bg="info">{orderCounts.lunch}</Badge>
            </Col>
            <Col className="text-center">
              🌙 Dinner <Badge bg="secondary">{orderCounts.dinner}</Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Menu Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} justify>
        {["breakfast", "lunch", "dinner"].map((type) => (
          <Tab
            key={type}
            eventKey={type}
            title={
              type === "breakfast"
                ? "🍳 Breakfast"
                : type === "lunch"
                ? "🍽️ Lunch"
                : "🌙 Dinner"
            }
          >
            <Row>
              {getMenuByCategory(type).map((item) => (
                <Col md={3} key={item._id} className="mb-4">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Card className="shadow-sm food-card">
                      <Card.Img
                        variant="top"
                        src={item.imageUrl}
                        className="food-image"
                      />
                      <Card.Body>
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Text>₹{item.price}</Card.Text>
                        <Button onClick={() => addToCart(item)}>
                          Add to Cart
                        </Button>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Tab>
        ))}
      </Tabs>

      {/* Cart Section */}
      {cart.length > 0 && (
        <Card className="p-3 mt-4 shadow-sm sticky-cart">
          <h5>🛒 Your {activeTab} Cart</h5>
          <ul className="list-group mb-3">
            {cart.map((item, idx) => (
              <li
                key={idx}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{item.name}</strong>{" "}
                  <Badge bg="secondary">{item.category}</Badge>
                </div>
                <div className="d-flex align-items-center">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => updateQuantity(idx, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => updateQuantity(idx, item.quantity + 1)}
                  >
                    +
                  </Button>
                  <span className="mx-3">
                    ₹{item.price * item.quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => removeFromCart(idx)}
                  >
                    ✕
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="d-flex justify-content-between align-items-center">
            <h5>Total: ₹{totalAmount}</h5>
            <Button variant="success" onClick={handlePlaceOrderClick}>
              {loading ? "Placing Order..." : `Place ${activeTab} Order`}
            </Button>
          </div>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Your Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>Items:</h6>
          <ListGroup className="mb-3">
            {cart.map((item, idx) => (
              <ListGroup.Item key={idx}>
                {item.name} × {item.quantity} = ₹{item.price * item.quantity}
              </ListGroup.Item>
            ))}
          </ListGroup>
          <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
          <p><strong>Current Wallet:</strong> ₹{student.walletBalance}</p>
          <p>
            <strong>Remaining Wallet:</strong>{" "}
            ₹{student.walletBalance - totalAmount}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitOrder}>
            Confirm Order
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Order Success Modal */}
      <Modal
  show={showOrderModal}
  onHide={() => setShowOrderModal(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>✅ Order Placed Successfully!</Modal.Title>
  </Modal.Header>
  <Modal.Body className="text-center">
    <p>
      Your {activeTab} order has been placed for ₹{orderTotal}.<br />
      Remaining wallet balance: ₹{student.walletBalance}
    </p>

    {/* ✅ QR Code Display */}
    {recentOrder && (
      <div className="mt-3">
        <h6>Show this QR code at counter:</h6>
        <QRCodeCanvas
  value={JSON.stringify({
    orderId: recentOrder._id,
    studentId: studentId,
    studentName: student.name,
    amount: orderTotal,
    type: activeTab,
    time: new Date().toLocaleString(),
  })}
  size={180}
  bgColor="#ffffff"
  fgColor="#0d6efd"
  level="Q"
  includeMargin={true}
/>

        <p className="mt-2 small text-muted">
          Order ID: {recentOrder._id}
        </p>
      </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={() => setShowOrderModal(false)}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>

      {/* Profile Modal - with Logout */}
      <Modal
        show={showProfile}
        onHide={() => setShowProfile(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>🧾 {student.name}'s Order History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {allOrders.length === 0 ? (
            <Alert variant="info">No previous orders found.</Alert>
          ) : (
            <Accordion defaultActiveKey="0">
              {allOrders.map((day, idx) => (
                <Accordion.Item key={idx} eventKey={idx.toString()}>
                  <Accordion.Header>
                    📅 {day._id} — {day.totalOrders} orders (₹
                    {day.totalSpent})
                  </Accordion.Header>
                  <Accordion.Body>
                    {day.orders.map((order, i) => (
                      <div key={i} className="mb-2 border-bottom pb-2">
                        <strong>{order.orderType.toUpperCase()}</strong>
                        <ul>
                          {order.items.map((item, j) => (
                            <li key={j}>
                              {item.name} × {item.quantity} = ₹
                              {item.price * item.quantity}
                            </li>
                          ))}
                        </ul>
                        <div className="text-muted small">
                          Time:{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
  <div>
    <Button variant="success" onClick={() => setShowWalletModal(true)}>
      💰 Wallet
    </Button>
  </div>
  <div>
    <Button variant="secondary" onClick={() => setShowProfile(false)}>
      Close
    </Button>
    &nbsp; &nbsp;
    <Button variant="danger" onClick={handleLogout}>
      Logout
    </Button>
  </div>
</Modal.Footer>

      </Modal>
      {/* 💰 Wallet OTP Modal */}
<Modal show={showWalletModal} onHide={() => setShowWalletModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Wallet Access Verification</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {!otpSent ? (
      <>
        <p>Click below to receive a 6-digit OTP on your registered email.</p>
        <Button variant="primary" onClick={handleSendWalletOtp}>
          Send OTP
        </Button>
      </>
    ) : (
      <>
        <p>Enter the 6-digit OTP sent to <strong>{student.email}</strong>.</p>
        <input
          type="text"
          value={enteredOtp}
          onChange={(e) => setEnteredOtp(e.target.value)}
          className="form-control mb-3"
          placeholder="Enter OTP"
        />
        <Button variant="success" onClick={handleVerifyOtp}>
          Verify OTP
        </Button>
      </>
    )}
    {otpMessage && <Alert className="mt-3">{otpMessage}</Alert>}
  </Modal.Body>
</Modal>

    </Container>
  );
}

