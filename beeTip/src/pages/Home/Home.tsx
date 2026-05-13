import Navbar from "../../component/Navbar/Navbar";
import "./Home.css";
import { mockOrders } from "../../mockdata/MockData/mockData";
import UserOrderCard from "../../component/UserOrderCard/UserOrderCard";

export default function Home() {
  return (
    <>
      <section className="home navbar-section">
        <p className="home-header">My Orders</p>
        <div className="userorders-container">
          {mockOrders.map((order) => (
            <UserOrderCard key={order.id} data={order} />
          ))}
        </div>
      </section>
      <Navbar />
    </>
  );
}
