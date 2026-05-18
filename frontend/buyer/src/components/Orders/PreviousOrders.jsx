import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../../Stores/UserStore";
import LoadingSpinner from "../Spinner/Spinner";
import {
  ShoppingBagIcon,
  CubeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export default function PreviousOrdersPage() {
  const navigate = useNavigate();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const isVerified = useUserStore((state) => state.isVerified);
  const fetchPreviousOrders = useUserStore((state) => state.fetchPreviousOrders);
  const previousOrders = useUserStore((state) => state.previousOrders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }
      if (!isVerified) {
        navigate("/verify-email");
        return;
      }
      try {
        await fetchPreviousOrders();
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, [isLoggedIn, isVerified, navigate, fetchPreviousOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (previousOrders.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBagIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Previous Orders</h1>
            <p className="text-slate-600 text-lg mb-8">No Completed Orders.</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Previous Orders</h1>
          <p className="text-slate-600">Your orders placed more than 5 days ago</p>
        </div>

        <div className="space-y-4">
          {previousOrders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className="bg-slate-700 px-6 py-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <ShoppingBagIcon className="w-5 h-5" />
                    <span className="font-semibold">
                      {order.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    Order #{order.orderId.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Date + status */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-slate-400">
                    Placed on{" "}
                    {new Date(order.purchasedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    <CheckCircleIcon className="w-4 h-4" />
                    {order.status?.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Items list */}
                {order.items?.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Items ({order.itemCount})
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.productVariantId}
                          onClick={() => navigate(`/product/${item.productId}`)}
                          className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 rounded-lg px-4 py-3 cursor-pointer transition-colors duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <CubeIcon className="w-5 h-5 text-slate-400 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {item.title ?? `Product #${item.productId.slice(0, 8)}`}
                              </p>
                              <p className="text-xs text-slate-500">
                                Size: {item.size} · Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 shrink-0">
                            ₹{item.lineTotal.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Order Total
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <CubeIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Total Qty
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {order.totalQuantity} item{order.totalQuantity !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <MapPinIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Delivered To
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {order.city ? `${order.city}, ${order.state}` : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}