import type { User } from "../../types/user";
import type { Order } from "../../types/order";
import type { Message } from "../../types/chat";
import type { Transaction } from "../../types/payment";
import type { Rating } from "../../types/rating";

/**
 * Test accounts (all passwords: "password123")
 *
 *  u1  Bryan  bryan@binus.ac.id
 *  u2  Andi   andi@binus.ac.id
 *  u3  Siti   siti@binus.ac.id
 *
 * Orders to test each status:
 *  o1  (u1→open)         OPEN           — accept as Andi/Siti; escrow check
 *  o2  (u3, courier u2)  ACCEPTED       — login as u2 to propose price
 *  o3  (u1, courier u2)  PRICE_PROPOSED — login as u1 to accept/dispute
 *  o4  (u2, courier u1)  PRICE_ACCEPTED — login as u2 to confirm delivery
 *  o5  (u3, courier u1)  DELIVERED      — login as u3 to process payment
 *  o6  (u2, courier u3)  PAID           — completed; ratings already submitted
 *  o7  (u1, courier u2)  PRICE_DISPUTED — disputed items; revise or cancel
 */

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Bryan",
    email: "bryan@binus.ac.id",
    password: "password123",
    walletBalance: 200000,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "u2",
    name: "Andi",
    email: "andi@binus.ac.id",
    password: "password123",
    walletBalance: 150000,
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "u3",
    name: "Siti",
    email: "siti@binus.ac.id",
    password: "password123",
    walletBalance: 100000,
    createdAt: "2024-01-03T00:00:00Z",
  },
];

export const mockOrders: Order[] = [
  {
    id: "o1",
    customerId: "u1",
    courierId: null,
    location: "Jl. Kebon Jeruk No. 5, Jakarta Barat",
    detail:
      "Beliin nasi goreng spesial + es teh manis dari warung Pak Budi yang di ujung gang",
    budgetCap: 30000,
    status: "OPEN",
    proposedPrice: null,
    itemBreakdown: null,
    notaImageUrl: null,
    hadDispute: false,
    serviceFee: 5000,
    createdAt: "2024-06-01T10:00:00Z",
    updatedAt: "2024-06-01T10:00:00Z",
  },
  {
    id: "o2",
    customerId: "u3",
    courierId: "u2",
    location: "Jl. Anggrek Rosliana No. 8, Jakarta Barat",
    detail:
      "Tolong beliin ayam geprek level 3 + nasi putih + teh botol dari Geprek Bensu",
    budgetCap: 45000,
    status: "ACCEPTED",
    proposedPrice: null,
    itemBreakdown: null,
    notaImageUrl: null,
    hadDispute: false,
    serviceFee: 5000,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:20:00Z",
  },
  {
    id: "o3",
    customerId: "u1",
    courierId: "u2",
    location: "Jl. Panjang No. 12, Jakarta Barat",
    detail:
      "Beli mie ayam bakso 2 porsi dari warung depan Indomaret, minta level pedas biasa",
    budgetCap: 40000,
    status: "PRICE_PROPOSED",
    proposedPrice: 35000,
    itemBreakdown: [
      { name: "Mie Ayam Bakso (porsi 1)", price: 17500 },
      { name: "Mie Ayam Bakso (porsi 2)", price: 17500 },
    ],
    notaImageUrl: null,
    hadDispute: false,
    serviceFee: 5000,
    createdAt: "2024-06-01T09:00:00Z",
    updatedAt: "2024-06-01T09:30:00Z",
  },
  {
    id: "o4",
    customerId: "u2",
    courierId: "u1",
    location: "Jl. Pos Pengumben No. 3, Jakarta Barat",
    detail:
      "Pesan martabak manis coklat keju ukuran besar dari Martabak Bangka 65",
    budgetCap: 60000,
    status: "PRICE_ACCEPTED",
    proposedPrice: 55000,
    itemBreakdown: [
      { name: "Martabak Manis Coklat Keju (besar)", price: 55000 },
    ],
    notaImageUrl: null,
    hadDispute: false,
    serviceFee: 5000,
    createdAt: "2024-06-01T07:00:00Z",
    updatedAt: "2024-06-01T07:45:00Z",
  },
  {
    id: "o5",
    customerId: "u3",
    courierId: "u1",
    location: "Komp. Taman Meruya Blok D No. 9, Jakarta Barat",
    detail:
      "Beliin susu UHT full cream 1L × 4 + roti tawar dari Alfamart terdekat",
    budgetCap: 80000,
    status: "DELIVERED",
    proposedPrice: 72000,
    itemBreakdown: [
      { name: "Susu UHT Full Cream 1L", price: 16000 },
      { name: "Susu UHT Full Cream 1L", price: 16000 },
      { name: "Susu UHT Full Cream 1L", price: 16000 },
      { name: "Susu UHT Full Cream 1L", price: 16000 },
      { name: "Roti Tawar", price: 8000 },
    ],
    notaImageUrl: null,
    hadDispute: false,
    serviceFee: 5000,
    createdAt: "2024-06-01T06:00:00Z",
    updatedAt: "2024-06-01T07:00:00Z",
  },
  {
    id: "o6",
    customerId: "u2",
    courierId: "u3",
    location: "Jl. Raya Joglo No. 22, Jakarta Barat",
    detail: "Beli kopi susu gula aren + croissant dari Kopi Kenangan Joglo",
    budgetCap: 50000,
    status: "PAID",
    proposedPrice: 42000,
    itemBreakdown: [
      { name: "Kopi Susu Gula Aren", price: 28000 },
      { name: "Croissant", price: 14000 },
    ],
    notaImageUrl: null,
    hadDispute: false,
    serviceFee: 5000,
    createdAt: "2024-05-31T14:00:00Z",
    updatedAt: "2024-05-31T15:30:00Z",
  },
  {
    id: "o7",
    customerId: "u1",
    courierId: "u2",
    location: "Jl. Srengseng Raya No. 4, Jakarta Barat",
    detail: "Beliin ayam bakar + nasi putih dari warung Bu Tini",
    budgetCap: 50000,
    status: "PRICE_DISPUTED",
    proposedPrice: 48000,
    itemBreakdown: [
      { name: "Ayam Bakar", price: 28000 },
      { name: "Nasi Putih", price: 5000 },
      { name: "Teh Botol Sosro", price: 8000, disputeReason: "UNORDERED_ITEM" },
      { name: "Es Jeruk", price: 7000, disputeReason: "UNORDERED_ITEM" },
    ],
    notaImageUrl: null,
    hadDispute: true,
    serviceFee: 5000,
    createdAt: "2024-06-01T11:00:00Z",
    updatedAt: "2024-06-01T11:45:00Z",
  },
];

export const mockMessages: Message[] = [
  // o2: ACCEPTED — Andi (courier) just picked up Siti"s order
  {
    id: "m1",
    orderId: "o2",
    senderId: "u2",
    text: "Halo Siti, pesanan kamu udah aku ambil ya!",
    createdAt: "2024-06-01T08:21:00Z",
  },
  {
    id: "m2",
    orderId: "o2",
    senderId: "u3",
    text: "Wah cepet banget! Makasih ya Andi",
    createdAt: "2024-06-01T08:22:00Z",
  },
  {
    id: "m3",
    orderId: "o2",
    senderId: "u2",
    text: "Ini lagi antri di kasirnya, bentar ya",
    createdAt: "2024-06-01T08:25:00Z",
  },

  // o3: PRICE_PROPOSED — Andi proposed price to Bryan
  {
    id: "m4",
    orderId: "o3",
    senderId: "u2",
    text: "Bro, aku udah di warungnya. Mie ayam bakso 2 porsi totalnya 35rb ya",
    createdAt: "2024-06-01T09:20:00Z",
  },
  {
    id: "m5",
    orderId: "o3",
    senderId: "u1",
    text: "Oke siap, lagi aku cek dulu notanya",
    createdAt: "2024-06-01T09:25:00Z",
  },
  {
    id: "m6",
    orderId: "o3",
    senderId: "u2",
    text: "Udah aku kirim harganya di atas ya, cek aja",
    createdAt: "2024-06-01T09:28:00Z",
  },

  // o4: PRICE_ACCEPTED — Bryan is delivering Andi"s martabak
  {
    id: "m7",
    orderId: "o4",
    senderId: "u1",
    text: "Andi, martabaknya udah jadi. Lagi OTW ke lokasi kamu",
    createdAt: "2024-06-01T07:40:00Z",
  },
  {
    id: "m8",
    orderId: "o4",
    senderId: "u2",
    text: "Sip! Aku tunggu di depan ya. Makasih Bryan",
    createdAt: "2024-06-01T07:42:00Z",
  },
  {
    id: "m9",
    orderId: "o4",
    senderId: "u1",
    text: "ETA 10 menit lagi",
    createdAt: "2024-06-01T07:43:00Z",
  },

  // o7: PRICE_DISPUTED — Bryan disputes items Andi added
  {
    id: "m10",
    orderId: "o7",
    senderId: "u2",
    text: "Udah aku beliin semuanya, total 48rb ya",
    createdAt: "2024-06-01T11:30:00Z",
  },
  {
    id: "m11",
    orderId: "o7",
    senderId: "u1",
    text: "Eh ini kok ada teh botol sama es jeruk? Aku ga mesen itu",
    createdAt: "2024-06-01T11:40:00Z",
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: "t1",
    orderId: "o6",
    fromUserId: "u2",
    toUserId: "u3",
    amount: 47000,
    type: "ORDER_PAYMENT",
    createdAt: "2024-05-31T15:30:00Z",
  },
];

export const mockRatings: Rating[] = [
  {
    id: "r1",
    orderId: "o6",
    raterId: "u2",
    ratedUserId: "u3",
    ratedRole: "courier",
    score: 4,
    createdAt: "2024-05-31T16:00:00Z",
  },
  {
    id: "r2",
    orderId: "o6",
    raterId: "u3",
    ratedUserId: "u2",
    ratedRole: "customer",
    score: 5,
    createdAt: "2024-05-31T16:05:00Z",
  },
];
