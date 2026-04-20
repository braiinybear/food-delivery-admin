'use client'
import { useState, useEffect } from "react"
import { useAdminStats } from "@/hooks/useDashboard"
import { useAdminOrders } from "@/hooks/useDashboard"
import { useModal } from "@/lib/modal-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderDetailsModal } from "@/components/order-details-modal"
import { Users, UtensilsCrossed, ShoppingBag, Clock, Truck, CheckCircle2, AlertCircle, MapPin, Phone, Mail, Download, Printer, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import * as XLSX from "xlsx"
import { AdminOrder } from "@/types/dashboard"

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: ordersData, isLoading: ordersLoading, hasNextPage, fetchNextPage } = useAdminOrders({ page: 1, limit: 5 })
  const { setIsModalOpen } = useModal()
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // Flatten paginated orders data - response has 'data' property
  const allOrders = ordersData?.pages?.flatMap((page) => page.data || []) ?? []

  // Update modal context when selectedOrder changes
  useEffect(() => {
    setIsModalOpen(!!selectedOrder)
  }, [selectedOrder, setIsModalOpen])

  // Filter orders
  const filteredOrders = allOrders.filter((order: AdminOrder) => {
    const matchesStatus = filterStatus === "ALL" || order.status === filterStatus;
    
    let matchesDate = true;
    if (startDate || endDate) {
      const orderDate = new Date(order.placedAt);
      orderDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) matchesDate = false;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        if (orderDate > end) matchesDate = false;
      }
    }

    return matchesStatus && matchesDate;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PLACED":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
      case "ACCEPTED":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
      case "PICKED_UP":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
      case "DELIVERED":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      case "CANCELLED":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
      default:
        return "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      "PLACED": "Order Placed",
      "ACCEPTED": "Accepted",
      "PICKED_UP": "Picked Up",
      "DELIVERED": "Delivered",
      "CANCELLED": "Cancelled",
    }
    return labels[status] || status
  }

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredOrders.map((order: AdminOrder) => ({
      "Order ID": order.id,
      "Customer": order.customer?.name || "N/A",
      "Email": order.customer?.email || "N/A",
      "Restaurant": order.restaurant?.name || "N/A",
      "Status": getStatusLabel(order.status),
      "Item Total": order.itemTotal || 0,
      "Delivery": order.deliveryCharge || 0,
      "Platform Fee": order.platformFee || 0,
      "Tax": order.tax || 0,
      "Discount": order.discount || 0,
      "Total": order.totalAmount || 0,
      "Payment Mode": order.paymentMode || "N/A",
      "Paid": order.isPaid ? "Yes" : "No",
      "Placed At": order.placedAt ? new Date(order.placedAt).toLocaleString() : "N/A",
      "Delivered At": order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : "N/A",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders")
    
    // Set column widths
    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 8 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 8 },
      { wch: 18 },
      { wch: 18 },
    ]
    
    XLSX.writeFile(workbook, `Orders_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Print orders
  const printOrders = () => {
    const printWindow = window.open("", "", "width=1200,height=800")
    if (!printWindow) return

    const html = `
      <html>
        <head>
          <title>Orders Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: white; }
            h1 { text-align: center; color: #1f2937; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border: 1px solid #e5e7eb; }
            th { background: #f3f4f6; font-weight: bold; color: #374151; }
            tr:nth-child(even) { background: #f9fafb; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .status-placed { background: #dbeafe; color: #1e40af; }
            .status-accepted { background: #fef3c7; color: #b45309; }
            .status-picked { background: #e9d5ff; color: #6b21a8; }
            .status-delivered { background: #dcfce7; color: #15803d; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <h1>Orders Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Restaurant</th>
                <th>Status</th>
                <th>Total</th>
                <th>Placed At</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map((order: AdminOrder) => `
                <tr>
                  <td>${order.id}</td>
                  <td>${order.customer?.name || "N/A"}</td>
                  <td>${order.restaurant?.name || "N/A"}</td>
                  <td><span class="status status-${order.status.toLowerCase().replace('_', '')}">${getStatusLabel(order.status)}</span></td>
                  <td>${formatCurrency(order.totalAmount || 0)}</td>
                  <td>${order.placedAt ? new Date(order.placedAt).toLocaleString() : "N/A"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome back! Here&apos;s your platform overview.</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="admin-stats" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="admin-stats" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            Admin Stats
          </TabsTrigger>
          <TabsTrigger value="recent-orders" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            Recent Orders
          </TabsTrigger>
        </TabsList>

        {/* Admin Stats Tab */}
        <TabsContent value="admin-stats" className="space-y-6 mt-6">
          {/* Loading State */}
          {statsLoading ? (
            <>
              {/* Revenue Card Skeleton */}
              <Skeleton className="h-32 w-full rounded-2xl" />

              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>

              {/* Secondary Stats Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
              </div>
            </>
          ) : stats ? (
            <>
              {/* Revenue Card */}
              <div className="bg-linear-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg">
                <p className="text-indigo-200 text-sm font-medium uppercase tracking-wide mb-2">Total Revenue</p>
                <h2 className="text-4xl font-bold mb-4">{formatCurrency(stats.totalRevenue || 0)}</h2>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Users Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Users size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">Total Users</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalUsers || 0}</h3>
                </div>

                {/* Restaurants Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <UtensilsCrossed size={24} className="text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">Restaurants</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalRestaurants || 0}</h3>
                </div>

                {/* Total Orders Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <ShoppingBag size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">Total Orders</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalOrders || 0}</h3>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Today's Orders */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <Clock size={20} className="text-slate-600 dark:text-slate-400" />
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Today&apos;s Orders</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.todayOrders || 0}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">No activity</p>
                </div>

                {/* Active Drivers */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <Truck size={20} className="text-slate-600 dark:text-slate-400" />
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Active Drivers</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeDrivers || 0}</p>
                </div>

                {/* Restaurant Regs */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <CheckCircle2 size={20} className="text-slate-600 dark:text-slate-400" />
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Restaurant Regs</p>
                </div>

                {/* Delivery Regs */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <AlertCircle size={20} className="text-slate-600 dark:text-slate-400" />
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Delivery Regs</p>
                </div>
              </div>
            </>
          ) : null}
        </TabsContent>

        {/* Recent Orders Tab */}
        <TabsContent value="recent-orders" className="mt-6">
          {/* Filter & Action Bar */}
          <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Status</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <Filter size={16} className="text-slate-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="bg-transparent text-slate-900 dark:text-white text-sm font-medium focus:outline-none min-w-[120px]"
                  >
                    <option value="ALL">All Orders</option>
                    <option value="PLACED">Order Placed</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="PICKED_UP">Picked Up</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("")
                    setEndDate("")
                  }}
                  className="mt-6 text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors"
                >
                  Clear Dates
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 mb-0.5">
              <button
                onClick={printOrders}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors text-sm font-medium"
              >
                <Download size={16} />
                Excel
              </button>
            </div>
          </div>

          {ordersLoading && allOrders.length === 0 ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 w-32" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-150">
                <div className="overflow-y-auto flex-1">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                      <TableRow className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900">
                        <TableHead className="text-slate-900 dark:text-white">Order ID</TableHead>
                        <TableHead className="text-slate-900 dark:text-white">Customer</TableHead>
                        <TableHead className="text-slate-900 dark:text-white">Restaurant</TableHead>
                        <TableHead className="text-slate-900 dark:text-white">Amount</TableHead>
                        <TableHead className="text-slate-900 dark:text-white">Status</TableHead>
                        <TableHead className="text-slate-900 dark:text-white">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order: AdminOrder) => (
                        <TableRow
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer"
                        >
                          <TableCell className="text-sm text-slate-900 dark:text-slate-300 font-medium">#{order.id}</TableCell>
                          <TableCell className="text-sm text-slate-600 dark:text-slate-400">{order.customer?.name || "N/A"}</TableCell>
                          <TableCell className="text-sm text-slate-600 dark:text-slate-400">{order.restaurant?.name || "N/A"}</TableCell>
                          <TableCell className="text-sm text-slate-900 dark:text-slate-300 font-semibold">{formatCurrency(order.totalAmount || 0)}</TableCell>
                          <TableCell className="text-sm">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                            {order.placedAt ? new Date(order.placedAt).toLocaleDateString() : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {filteredOrders.length} orders
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium">Page {currentPage}</span>
                  <button
                    disabled={!hasNextPage || isFetchingMore}
                    onClick={async () => {
                      setIsFetchingMore(true)
                      setCurrentPage(p => p + 1)
                      await fetchNextPage()
                      setIsFetchingMore(false)
                    }}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isFetchingMore ? (
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-300 rounded-full animate-spin" />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-slate-500 dark:text-slate-400">No orders found</div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        formatCurrency={formatCurrency}
        getStatusBadgeColor={getStatusBadgeColor}
        getStatusLabel={getStatusLabel}
      />
    </div>
  )
}