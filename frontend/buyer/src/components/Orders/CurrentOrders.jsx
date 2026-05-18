import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import useUserStore from "../../Stores/UserStore";
import LoadingSpinner from "../Spinner/Spinner";
import {
  TruckIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ArrowUturnLeftIcon,
  XCircleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

// ─── Status groupings ─────────────────────────────────────────────────────────
const CANCELLABLE_STATUSES = new Set([
  "ORDER_CREATED",
  "PAYMENT_PENDING",
  "PAID",
  "ORDER_PROCESSING",
  "SHIPPING",
]);

const RETURN_FLOW_STATUSES = new Set([
  "RETURN_WINDOW_OPEN",
  "RETURN_REQUESTED",
  "RETURN_PROCESSING",
  "REFUND_INITIATED",
  "RETURNED_SUCCESS",
]);

const CANCELLED_FAILED_STATUSES = new Set([
  "CANCELLED",
  "FAILED",
  "PAYMENT_FAILED",
]);

// ─── Shipping progress config ─────────────────────────────────────────────────
const STATUS_TO_STAGE = {
  ORDER_CREATED:    0,
  PAYMENT_PENDING:  0,
  PAID:             0,
  ORDER_PROCESSING: 1,
  SHIPPING:         2,
  DELIVERED:        4,
};

const STAGES = ["ORDERED", "PROCESSING", "SHIPPED", "OUT FOR DELIVERY", "DELIVERED"];

const getStageIndex = (status) => STATUS_TO_STAGE[status] ?? 0;

const getStageIcon = (stage) => {
  switch (stage) {
    case "ORDERED":          return ShoppingBagIcon;
    case "PROCESSING":       return CubeIcon;
    case "SHIPPED":          return TruckIcon;
    case "OUT FOR DELIVERY": return MapPinIcon;
    case "DELIVERED":        return CheckCircleIcon;
    default:                 return ClockIcon;
  }
};

// ─── Status messages ──────────────────────────────────────────────────────────
const getStatusMessage = (status) => {
  switch (status) {
    case "ORDER_CREATED":
    case "PAID":
    case "PAYMENT_PENDING":    return "🎉 Your order has been confirmed and is being prepared!";
    case "ORDER_PROCESSING":   return "📦 Your order is being packed and will ship soon!";
    case "SHIPPING":           return "🚚 Your order is on its way!";
    case "DELIVERED":          return "✅ Your order has been delivered! Not satisfied? You can request a return.";
    case "RETURN_WINDOW_OPEN": return "🔄 Your order is eligible for return within the return window.";
    case "RETURN_REQUESTED":   return "↩️ Return requested — we'll process it shortly.";
    case "RETURN_PROCESSING":  return "🔄 Your return is being processed.";
    case "REFUND_INITIATED":   return "💸 Refund has been initiated and will reflect in 5–7 business days.";
    case "RETURNED_SUCCESS":   return "✅ Return successful! Refund has been processed.";
    case "PAYMENT_FAILED":     return "❌ Payment failed. Please try placing the order again.";
    case "FAILED":             return "❌ Something went wrong with this order.";
    case "CANCELLED":          return "🚫 This order has been cancelled.";
    default:                   return "🕐 Checking order status...";
  }
};

// ─── Return stages ────────────────────────────────────────────────────────────
const RETURN_STAGES = [
  { label: "Return Window Open", status: "RETURN_WINDOW_OPEN" },
  { label: "Return Requested",   status: "RETURN_REQUESTED"   },
  { label: "Return Processing",  status: "RETURN_PROCESSING"  },
  { label: "Refund Initiated",   status: "REFUND_INITIATED"   },
  { label: "Return Successful",  status: "RETURNED_SUCCESS"   },
];

const getReturnStageIndex = (status) =>
  RETURN_STAGES.findIndex((s) => s.status === status);

// ─── Sub-components ───────────────────────────────────────────────────────────
const ShippingTracker = ({ status }) => {
  const stageIndex = getStageIndex(status);
  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-4">
        {STAGES.map((stage, index) => {
          const Icon     = getStageIcon(stage);
          const isActive = index === stageIndex;
          const isPast   = index < stageIndex;
          return (
            <div key={stage} className="flex-1 relative">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isPast ? "bg-green-500" : isActive ? "bg-blue-500 ring-4 ring-blue-200" : "bg-gray-200"
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className={`mt-2 text-xs font-semibold text-center leading-tight ${
                  isPast || isActive ? "text-slate-900" : "text-slate-400"
                }`}>
                  {stage}
                </p>
              </div>
              {index < STAGES.length - 1 && (
                <div className="absolute top-6 left-1/2 w-full h-1 -z-10">
                  <div className={`h-full transition-all duration-500 ${
                    index < stageIndex ? "bg-green-500" : "bg-gray-200"
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm font-medium text-blue-900">{getStatusMessage(status)}</p>
      </div>
    </div>
  );
};

const ReturnTracker = ({ status }) => {
  const currentStep = getReturnStageIndex(status);
  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-4">
        {RETURN_STAGES.map(({ label }, index) => {
          const isActive = index === currentStep;
          const isPast   = index < currentStep;
          return (
            <div key={label} className="flex-1 relative">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isPast ? "bg-green-500" : isActive ? "bg-yellow-500 ring-4 ring-yellow-200" : "bg-gray-200"
                }`}>
                  <ArrowUturnLeftIcon className="w-5 h-5 text-white" />
                </div>
                <p className={`mt-2 text-xs font-semibold text-center leading-tight ${
                  isPast || isActive ? "text-slate-900" : "text-slate-400"
                }`}>
                  {label}
                </p>
              </div>
              {index < RETURN_STAGES.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-1 -z-10">
                  <div className={`h-full transition-all duration-500 ${
                    index < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <p className="text-sm font-medium text-yellow-900">{getStatusMessage(status)}</p>
      </div>
    </div>
  );
};

const ItemsList = ({ items, itemCount, navigate }) => (
  <div className="mb-6">
    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
      Items ({itemCount})
    </h4>
    <div className="space-y-2">
      {items.map((item) => (
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
);

const OrderSummaryRow = ({ order }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
        <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Order Total</p>
        <p className="text-sm font-semibold text-slate-900">₹{order.totalAmount.toFixed(2)}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
        <CubeIcon className="w-5 h-5 text-green-600" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Qty</p>
        <p className="text-sm font-semibold text-slate-900">
          {order.totalQuantity} item{order.totalQuantity !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
        <MapPinIcon className="w-5 h-5 text-purple-600" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deliver To</p>
        <p className="text-sm font-semibold text-slate-900">
          {order.city ? `${order.city}, ${order.state}` : "—"}
        </p>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CurrentOrdersPage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const isLoggedIn         = useUserStore((state) => state.isLoggedIn);
  const isVerified         = useUserStore((state) => state.isVerified);
  const fetchCurrentOrders = useUserStore((state) => state.fetchCurrentOrders);

  const userId = localStorage.getItem("id");

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
    else if (!isVerified) navigate("/verify-email");
  }, [isLoggedIn, isVerified, navigate]);

  const { data: currentOrders = [], isLoading, isError } = useQuery({
    queryKey: ["currentOrders", userId],
    queryFn: async () => {
      await fetchCurrentOrders();
      return useUserStore.getState().currentOrders ?? [];
    },
    enabled: !!isLoggedIn && !!isVerified && !!userId,
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });

  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: (orderId) =>
      axios.post("/api/buyer/orders/cancel", { orderId }, { withCredentials: true }),
    onSuccess: () => {
      toast.success("Order cancelled successfully!");
      queryClient.invalidateQueries({ queryKey: ["currentOrders"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to cancel order. Try again.");
    },
  });

  const { mutate: requestReturn, isPending: isReturning } = useMutation({
    mutationFn: (orderId) =>
      axios.post("/api/buyer/orders/return", { orderId }, { withCredentials: true }),
    onSuccess: () => {
      toast.success("Return requested successfully!");
      queryClient.invalidateQueries({ queryKey: ["currentOrders"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to request return. Try again.");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg font-semibold mb-4">Failed to load your orders.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (currentOrders.length === 0) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <TruckIcon className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Current Orders</h1>
            <p className="text-slate-600 text-lg mb-8">You have no active orders right now.</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Current Orders</h1>
          <p className="text-slate-600">Track and manage your active orders</p>
        </div>

        <div className="space-y-6">
          {currentOrders.map((order) => {
            const isReturnFlow      = RETURN_FLOW_STATUSES.has(order.status);
            const isCancelledFailed = CANCELLED_FAILED_STATUSES.has(order.status);
            const canCancel         = CANCELLABLE_STATUSES.has(order.status);
            const canReturn         = order.status === "DELIVERED";
            const showRefundInfo    = order.status === "REFUND_INITIATED";

            const headerBg = isCancelledFailed
              ? "bg-red-500"
              : isReturnFlow
              ? "bg-yellow-500"
              : order.status === "DELIVERED"
              ? "bg-green-600"
              : "bg-blue-600";

            const HeaderIcon = isCancelledFailed
              ? XCircleIcon
              : isReturnFlow
              ? ArrowUturnLeftIcon
              : order.status === "DELIVERED"
              ? CheckCircleIcon
              : TruckIcon;

            return (
              <div
                key={order.orderId}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200"
              >
                {/* Header */}
                <div className={`${headerBg} px-6 py-4`}>
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <HeaderIcon className="w-6 h-6" />
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
                  <p className="text-xs text-slate-400 mb-6">
                    Placed on{" "}
                    {new Date(order.purchasedAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>

                  {/* Shipping tracker — all non-return, non-cancelled statuses */}
                  {!isReturnFlow && !isCancelledFailed && (
                    <ShippingTracker status={order.status} />
                  )}

                  {/* Return tracker — once return has been requested */}
                  {isReturnFlow && <ReturnTracker status={order.status} />}

                  {/* Cancelled / Failed banner */}
                  {isCancelledFailed && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <p className="text-sm font-medium text-red-900">
                        {getStatusMessage(order.status)}
                      </p>
                    </div>
                  )}

                  {/* Items — always shown */}
                  {order.items?.length > 0 && (
                    <ItemsList
                      items={order.items}
                      itemCount={order.itemCount}
                      navigate={navigate}
                    />
                  )}

                  {/* Summary */}
                  <OrderSummaryRow order={order} />

                  {/* Action buttons */}
                  {(canCancel || canReturn || showRefundInfo) && (
                    <div className="mt-5 pt-5 border-t border-slate-200 flex flex-col gap-3">

                      {/* Cancel — order still coming */}
                      {canCancel && (
                        <button
                          onClick={(e) => { e.stopPropagation(); cancelOrder(order.orderId); }}
                          disabled={isCancelling}
                          className="w-full flex items-center justify-center gap-2 bg-red-400 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                        >
                          {isCancelling ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                              Cancelling Order...
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-4 h-4" />
                              Cancel Order
                            </>
                          )}
                        </button>
                      )}

                      {/* Return — only when delivered */}
                      {canReturn && (
                        <button
                          onClick={(e) => { e.stopPropagation(); requestReturn(order.orderId); }}
                          disabled={isReturning}
                          className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                        >
                          {isReturning ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                              Requesting Return...
                            </>
                          ) : (
                            <>
                              <ArrowUturnLeftIcon className="w-4 h-4" />
                              Request Return
                            </>
                          )}
                        </button>
                      )}

                      {/* Refund info — no action needed */}
                      {showRefundInfo && (
                        <div className="flex items-center justify-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 font-medium py-3 px-6 rounded-xl">
                          <BanknotesIcon className="w-4 h-4" />
                          Refund is on its way — check your account in 5–7 business days
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}