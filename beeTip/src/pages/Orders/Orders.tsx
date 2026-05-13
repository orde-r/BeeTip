// import { useState } from "react";
// import Navbar from "../../component/Navbar/Navbar";
// import Footer from "../../component/Footer/Footer";
// import AvailableOrderCard from "../../component/UserOrderCard/UserOrderCard";
// import { mockAvailableOrders } from "../../mockdata/MockData/mockCards";
import Navbar from "../../component/Navbar/Navbar";
import "./Orders.css";

// const FILTERS = [
//   "All Errands",
//   "Food & Drinks",
//   "Lab / Document",
//   "Item Retrieval",
// ];

export default function Orders() {
  // const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  // const [search, setSearch] = useState("");

  // const filtered = mockAvailableOrders.filter((o) =>
  //   o.title.toLowerCase().includes(search.toLowerCase()),
  // );

  return (
    // <>
    //   <Navbar />
    //   <main className="orders">
    //     <div className="orders-toolbar">
    //       <label className="orders-search">
    //         <span className="orders-search-label">Search errands</span>
    //         <div className="orders-search-input">
    //           <span className="material-symbols-outlined">search</span>
    //           <input
    //             type="text"
    //             placeholder="Starbucks, Printing, Lab..."
    //             value={search}
    //             onChange={(e) => setSearch(e.target.value)}
    //           />
    //         </div>
    //       </label>

    //       <div className="orders-filters">
    //         {FILTERS.map((f) => (
    //           <button
    //             key={f}
    //             className={`orders-filter ${
    //               f === activeFilter ? "orders-filter-active" : ""
    //             }`}
    //             onClick={() => setActiveFilter(f)}
    //           >
    //             {f}
    //           </button>
    //         ))}
    //       </div>
    //     </div>

    //     <div className="orders-grid">
    //       {filtered.map((order) => (
    //         <AvailableOrderCard key={order.id} data={order} />
    //       ))}
    //     </div>
    //   </main>

    //   <button className="orders-fab" aria-label="Refresh orders">
    //     <span className="material-symbols-outlined">refresh</span>
    //   </button>

    //   <Footer />
    // </>
    <>
      Orders
      <Navbar />
    </>
  );
}
