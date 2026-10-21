import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

export default function PageLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-md lg:max-w-none">
        <Outlet />
      </main>
      <Footer />
      <div className="h-24 lg:hidden" />
      <BottomNav />
    </div>
  );
}