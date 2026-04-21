'use client'

import { useState} from "react"
import { 
  useAdminRequests, 
  useApproveRestaurantRequest, 
  useRejectRestaurantRequest, 
  useApproveDeliveryRequest, 
  useRejectDeliveryRequest 
} from "@/hooks/useRequest"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { RestaurantRequestDetailModal } from "@/components/restaurant-request-modal"
import { DeliveryRequestDetailModal } from "@/components/delivery-request-modal"
import { Download, Printer, Filter, Building2, Truck, ChevronLeft, ChevronRight } from "lucide-react"
import * as XLSX from "xlsx"
import { RestaurantRequest, DeliveryRequest, ApproveRestaurantRequestResponse, RejectRestaurantRequestResponse, ApproveDeliveryRequestResponse, RejectDeliveryRequestResponse } from "@/types/request"

type RequestData = RestaurantRequest | DeliveryRequest

export default function RequestsPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantRequest | null>(null)
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRequest | null>(null)
  const [restaurantStatusFilter, setRestaurantStatusFilter] = useState<string>("ALL")
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<string>("ALL")
  const [restaurantDateFrom, setRestaurantDateFrom] = useState<string>("")
  const [restaurantDateTo, setRestaurantDateTo] = useState<string>("")
  const [deliveryDateFrom, setDeliveryDateFrom] = useState<string>("")
  const [deliveryDateTo, setDeliveryDateTo] = useState<string>("")
  const [restaurantCurrentPage, setRestaurantCurrentPage] = useState(1)
  const [deliveryCurrentPage, setDeliveryCurrentPage] = useState(1)
  const [restaurantFetchingMore, setRestaurantFetchingMore] = useState(false)
  const [deliveryFetchingMore, setDeliveryFetchingMore] = useState(false)

  // Fetch Requests
  const {
    data: restaurantRequestsData,
    isLoading: restaurantLoading,
    hasNextPage: restaurantHasNextPage,
    fetchNextPage: restaurantFetchNextPage,
  } = useAdminRequests({
    type: "restaurant",
    limit: 10,
  })

  const {
    data: deliveryRequestsData,
    isLoading: deliveryLoading,
    hasNextPage: deliveryHasNextPage,
    fetchNextPage: deliveryFetchNextPage,
  } = useAdminRequests({
    type: "delivery",
    limit: 10,
  })

  // Mutations for Restaurant Requests
  const approveRestaurantMutation = useApproveRestaurantRequest()
  const rejectRestaurantMutation = useRejectRestaurantRequest()

  // Mutations for Delivery Requests
  const approveDeliveryMutation = useApproveDeliveryRequest()
  const rejectDeliveryMutation = useRejectDeliveryRequest()

  // Flatten data
  const restaurantRequests = restaurantRequestsData?.pages?.flatMap(page => page.data) || []
  const deliveryRequests = deliveryRequestsData?.pages?.flatMap(page => page.data) || []

  // Filter restaurant requests
  const filteredRestaurantRequests = (restaurantRequests as RestaurantRequest[]).filter((req) => {
    const matchesStatus = restaurantStatusFilter === "ALL" || req.status === restaurantStatusFilter
    let matchesDate = true

    if (restaurantDateFrom || restaurantDateTo) {
      const createdDate = new Date(req.createdAt)
      createdDate.setHours(0, 0, 0, 0)

      if (restaurantDateFrom) {
        const from = new Date(restaurantDateFrom)
        from.setHours(0, 0, 0, 0)
        if (createdDate < from) matchesDate = false
      }

      if (restaurantDateTo) {
        const to = new Date(restaurantDateTo)
        to.setHours(0, 0, 0, 0)
        if (createdDate > to) matchesDate = false
      }
    }

    return matchesStatus && matchesDate
  })

  // Filter delivery requests
  const filteredDeliveryRequests = (deliveryRequests as DeliveryRequest[]).filter((req) => {
    const matchesStatus = deliveryStatusFilter === "ALL" || req.status === deliveryStatusFilter
    let matchesDate = true

    if (deliveryDateFrom || deliveryDateTo) {
      const createdDate = new Date(req.createdAt)
      createdDate.setHours(0, 0, 0, 0)

      if (deliveryDateFrom) {
        const from = new Date(deliveryDateFrom)
        from.setHours(0, 0, 0, 0)
        if (createdDate < from) matchesDate = false
      }

      if (deliveryDateTo) {
        const to = new Date(deliveryDateTo)
        to.setHours(0, 0, 0, 0)
        if (createdDate > to) matchesDate = false
      }
    }

    return matchesStatus && matchesDate
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
      case "APPROVED":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      case "REJECTED":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
      default:
        return "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400"
    }
  }

  const exportToExcel = (data: RequestData[], filename: string) => {
    const exportData = data.map((item: RequestData) => ({
      "ID": item.id,
      "Name": (item as RestaurantRequest).restaurantName || item.user?.name || "N/A",
      "Email": item.user?.email || "N/A",
      "Phone": item.user?.phoneNumber || "N/A",
      "Status": item.status,
      "Created At": new Date(item.createdAt).toLocaleString(),
      ...((item as RestaurantRequest).restaurantName && {
        "Restaurant Name": (item as RestaurantRequest).restaurantName,
        "Address": (item as RestaurantRequest).address,
        "Cuisine Types": (item as RestaurantRequest).cuisineTypes?.join(", "),
        "Cost For Two": (item as RestaurantRequest).costForTwo,
      }),
      ...((item as DeliveryRequest).vehicleType && {
        "Vehicle Type": (item as DeliveryRequest).vehicleType,
        "License Number": (item as DeliveryRequest).licenseNumber,
        "Vehicle Plate": (item as DeliveryRequest).vehiclePlate,
      }),
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Requests")
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const printRequests = (data: RequestData[], title: string) => {
    const printWindow = window.open("", "", "width=1200,height=800")
    if (!printWindow) return

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold; }
            td { padding: 12px; border: 1px solid #e5e7eb; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .pending { background-color: #fef3c7; color: #92400e; }
            .approved { background-color: #dcfce7; color: #166534; }
            .rejected { background-color: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  <td>${item.id}</td>
                  <td>${(item as RestaurantRequest).restaurantName || item.user?.name || 'N/A'}</td>
                  <td>${item.user?.email || 'N/A'}</td>
                  <td>${item.user?.phoneNumber || 'N/A'}</td>
                  <td><span class="status ${item.status.toLowerCase()}">${item.status}</span></td>
                  <td>${new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Requests Management</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Review and manage restaurant and delivery partner applications</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="restaurants" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="restaurants" className="flex items-center gap-2">
            <Building2 size={16} />
            Restaurant Requests
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Truck size={16} />
            Delivery Requests
          </TabsTrigger>
        </TabsList>

        {/* Restaurant Requests Tab */}
        <TabsContent value="restaurants" className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={16} className="text-slate-600 dark:text-slate-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Filters & Actions</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2 block">Status</label>
                <select
                  value={restaurantStatusFilter}
                  onChange={(e) => {
                    setRestaurantStatusFilter(e.target.value)
                    setRestaurantCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2 block">From Date</label>
                <input
                  type="date"
                  value={restaurantDateFrom}
                  onChange={(e) => {
                    setRestaurantDateFrom(e.target.value)
                    setRestaurantCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2 block">To Date</label>
                <input
                  type="date"
                  value={restaurantDateTo}
                  onChange={(e) => {
                    setRestaurantDateTo(e.target.value)
                    setRestaurantCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => exportToExcel(filteredRestaurantRequests, "Restaurant_Requests")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={() => printRequests(filteredRestaurantRequests, "Restaurant Requests")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <TableHead className="text-slate-900 dark:text-white font-semibold">Restaurant</TableHead>
                    <TableHead className="text-slate-900 dark:text-white font-semibold">Owner</TableHead>
                    <TableHead className="text-slate-900 dark:text-white font-semibold">Cuisines</TableHead>
                    <TableHead className="text-slate-900 dark:text-white font-semibold">Cost</TableHead>
                    <TableHead className="text-slate-900 dark:text-white font-semibold">Status</TableHead>
                    <TableHead className="text-slate-900 dark:text-white font-semibold">Created At</TableHead>
                    <TableHead className="text-slate-900 dark:text-white font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurantLoading ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <TableRow key={i} className="border-slate-200 dark:border-slate-700">
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : filteredRestaurantRequests.length === 0 ? (
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No restaurant requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRestaurantRequests.map((req: RestaurantRequest) => (
                      <TableRow key={req.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <TableCell className="font-medium text-slate-900 dark:text-white">{req.restaurantName}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">{req.user?.name}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{req.cuisineTypes?.slice(0, 2).join(", ")}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">₹{req.costForTwo}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(req.status)}`}>
                            {req.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => setSelectedRestaurant(req)}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                          >
                            Review
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!restaurantLoading && filteredRestaurantRequests.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-end gap-2">
                <button
                  disabled={restaurantCurrentPage === 1}
                  onClick={() => setRestaurantCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-slate-900 dark:text-white">Page {restaurantCurrentPage}</span>
                <button
                  disabled={!restaurantHasNextPage || restaurantFetchingMore}
                  onClick={async () => {
                    setRestaurantFetchingMore(true)
                    setRestaurantCurrentPage(p => p + 1)
                    await restaurantFetchNextPage()
                    setRestaurantFetchingMore(false)
                  }}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {restaurantFetchingMore ? (
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-300 rounded-full animate-spin" />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Delivery Requests Tab */}
        <TabsContent value="delivery" className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={16} className="text-slate-600 dark:text-slate-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Filters & Actions</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2 block">Status</label>
                <select
                  value={deliveryStatusFilter}
                  onChange={(e) => {
                    setDeliveryStatusFilter(e.target.value)
                    setDeliveryCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2 block">From Date</label>
                <input
                  type="date"
                  value={deliveryDateFrom}
                  onChange={(e) => {
                    setDeliveryDateFrom(e.target.value)
                    setDeliveryCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2 block">To Date</label>
                <input
                  type="date"
                  value={deliveryDateTo}
                  onChange={(e) => {
                    setDeliveryDateTo(e.target.value)
                    setDeliveryCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => exportToExcel(filteredDeliveryRequests, "Delivery_Requests")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={() => printRequests(filteredDeliveryRequests, "Delivery Requests")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <TableHead className="text-slate-900 dark:text-white font-semibold">Driver Name</TableHead>
                    <TableHead className="text-slate-900 dark:text-white font-semibold">Email</TableHead>
                    <TableHead className="text-slate-900 dark:text-white font-semibold">Vehicle Type</TableHead>
                    <TableHead className="text-slate-900 dark:text-white font-semibold">License Plate</TableHead>
                    <TableHead className="text-slate-900 dark:text-white font-semibold">Status</TableHead>
                    <TableHead className="text-slate-900 dark:text-white font-semibold">Created At</TableHead>
                    <TableHead className="text-slate-900 dark:text-white font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryLoading ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <TableRow key={i} className="border-slate-200 dark:border-slate-700">
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : filteredDeliveryRequests.length === 0 ? (
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No delivery requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDeliveryRequests.map((req: DeliveryRequest) => (
                      <TableRow key={req.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <TableCell className="font-medium text-slate-900 dark:text-white">{req.user?.name}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">{req.user?.email}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">{req.vehicleType}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 font-mono text-sm">{req.vehiclePlate}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(req.status)}`}>
                            {req.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => setSelectedDelivery(req)}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                          >
                            Review
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!deliveryLoading && filteredDeliveryRequests.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-end gap-2">
                <button
                  disabled={deliveryCurrentPage === 1}
                  onClick={() => setDeliveryCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-slate-900 dark:text-white">Page {deliveryCurrentPage}</span>
                <button
                  disabled={!deliveryHasNextPage || deliveryFetchingMore}
                  onClick={async () => {
                    setDeliveryFetchingMore(true)
                    setDeliveryCurrentPage(p => p + 1)
                    await deliveryFetchNextPage()
                    setDeliveryFetchingMore(false)
                  }}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deliveryFetchingMore ? (
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-300 rounded-full animate-spin" />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <RestaurantRequestDetailModal
        isOpen={!!selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        request={selectedRestaurant}
        approveMutation={approveRestaurantMutation}
        rejectMutation={rejectRestaurantMutation}
      />
      <DeliveryRequestDetailModal
        isOpen={!!selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        request={selectedDelivery}
        approveMutation={approveDeliveryMutation}
        rejectMutation={rejectDeliveryMutation}
      />
    </div>
  );
}
