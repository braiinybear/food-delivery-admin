'use client'

import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import {
  useAdminRestaurants,
  useActivateRestaurant,
  useDeactivateRestaurant,
  useVerifyRestaurant,
  useUnverifyRestaurant,
  useMenuItems,
  useMenuCategories,
} from '@/hooks/useRestaurant'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { MenuCategoryDetailModal } from '@/components/menu-category-detail-modal'
import { MenuItemDetailModal } from '@/components/menu-item-detail-modal'
import { Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Shield, ShieldOff, UtensilsCrossed, BookOpen, Download, Printer, Eye, X, Building2 } from 'lucide-react'
import { AdminRestaurant, MenuItem, MenuCategory } from '@/types/restaurant'

export default function RestaurantsPage() {
  // State management
  const [currentPage, setCurrentPage] = useState(1)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  // Modal states
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)

  // Filter states for restaurants
  const [restaurantNameFilter, setRestaurantNameFilter] = useState('')
  const [restaurantStatusFilter, setRestaurantStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [restaurantVerifiedFilter, setRestaurantVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all')

  // Filter states for categories
  const [categoryNameFilter, setCategoryNameFilter] = useState('')
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<string>('all')

  // Filter states for items
  const [itemNameFilter, setItemNameFilter] = useState('')
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all')
  const [itemAvailabilityFilter, setItemAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all')
  const [itemBestsellerFilter, setItemBestsellerFilter] = useState<'all' | 'bestseller' | 'regular'>('all')

  // Fetch restaurants with pagination
  const {
    data: restaurantsData,
    isLoading: restaurantsLoading,
    hasNextPage,
    fetchNextPage,
  } = useAdminRestaurants({
    storeName: '',
    limit: 10,
  })

  // Fetch menu items
  const {
    data: menuItemsData,
    isLoading: menuItemsLoading,
  } = useMenuItems()

  // Fetch menu categories
  const {
    data: menuCategoriesData,
    isLoading: menuCategoriesLoading,
  } = useMenuCategories()

  // Log restaurants data whenever it changes
  useEffect(() => {
    console.log('📊 Restaurants Data from Hook:', restaurantsData)
    if (restaurantsData?.pages) {
      console.log('🔹 Pages Count:', restaurantsData.pages.length)
      restaurantsData.pages.forEach((page, idx) => {
        console.log(`📄 Page ${idx + 1}:`, {
          data: page.data,
          total: page.total,
          page: page.page,
          limit: page.limit,
          itemCount: page.data?.length || 0,
        })
      })
    }
  }, [restaurantsData])

  // Log menu items data
  useEffect(() => {
    console.log('🍽️ Menu Items Data from Hook:', menuItemsData)
    if (menuItemsData && menuItemsData.length > 0) {
      console.log(`📊 Total Menu Items: ${menuItemsData.length}`)
      menuItemsData.slice(0, 3).forEach((item, idx) => {
        console.log(`🍜 Item ${idx + 1}:`, {
          id: item.id,
          name: item.name,
          price: item.price,
          categoryId: item.categoryId,
          type: item.type,
          isAvailable: item.isAvailable,
        })
      })
    }
  }, [menuItemsData])

  // Log menu categories data
  useEffect(() => {
    console.log('📂 Menu Categories Data from Hook:', menuCategoriesData)
    if (menuCategoriesData && menuCategoriesData.length > 0) {
      console.log(`📊 Total Menu Categories: ${menuCategoriesData.length}`)
      menuCategoriesData.slice(0, 3).forEach((category, idx) => {
        console.log(`📋 Category ${idx + 1}:`, {
          id: category.id,
          name: category.name,
          restaurantId: category.restaurantId,
          itemCount: category.items?.length || 0,
        })
      })
    }
  }, [menuCategoriesData])

  // Mutations
  const activateRestaurant = useActivateRestaurant()
  const deactivateRestaurant = useDeactivateRestaurant()
  const verifyRestaurant = useVerifyRestaurant()
  const unverifyRestaurant = useUnverifyRestaurant()

  // Log mutation responses
  useEffect(() => {
    if (activateRestaurant.data) {
      console.log('✅ Activate Restaurant Response:', activateRestaurant.data)
    }
  }, [activateRestaurant.data])

  useEffect(() => {
    if (deactivateRestaurant.data) {
      console.log('❌ Deactivate Restaurant Response:', deactivateRestaurant.data)
    }
  }, [deactivateRestaurant.data])

  useEffect(() => {
    if (verifyRestaurant.data) {
      console.log('🔐 Verify Restaurant Response:', verifyRestaurant.data)
    }
  }, [verifyRestaurant.data])

  useEffect(() => {
    if (unverifyRestaurant.data) {
      console.log('🔓 Unverify Restaurant Response:', unverifyRestaurant.data)
    }
  }, [unverifyRestaurant.data])

  // Flatten data
  const allRestaurants = restaurantsData?.pages?.flatMap(page => page.data) ?? []

  console.log('📋 All Restaurants (Flattened):', allRestaurants)

  const handleNextPage = async () => {
    if (!hasNextPage) return
    setIsFetchingMore(true)
    await fetchNextPage()
    setCurrentPage(p => p + 1)
    setIsFetchingMore(false)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1)
    }
  }

  const handleActivate = async (restaurantId: string) => {
    console.log('🔄 Activating restaurant:', restaurantId)
    activateRestaurant.mutate(restaurantId, {
      onSuccess: (data) => {
        console.log('✅ Restaurant activated successfully:', data)
      },
      onError: (error) => {
        console.error('❌ Error activating restaurant:', error)
      },
    })
  }

  const handleDeactivate = async (restaurantId: string) => {
    console.log('🔄 Deactivating restaurant:', restaurantId)
    deactivateRestaurant.mutate(restaurantId, {
      onSuccess: (data) => {
        console.log('✅ Restaurant deactivated successfully:', data)
      },
      onError: (error) => {
        console.error('❌ Error deactivating restaurant:', error)
      },
    })
  }

  const handleVerify = async (restaurantId: string) => {
    console.log('🔄 Verifying restaurant:', restaurantId)
    verifyRestaurant.mutate(restaurantId, {
      onSuccess: (data) => {
        console.log('✅ Restaurant verified successfully:', data)
      },
      onError: (error) => {
        console.error('❌ Error verifying restaurant:', error)
      },
    })
  }

  const handleUnverify = async (restaurantId: string) => {
    console.log('🔄 Unverifying restaurant:', restaurantId)
    unverifyRestaurant.mutate(restaurantId, {
      onSuccess: (data) => {
        console.log('✅ Restaurant unverified successfully:', data)
      },
      onError: (error) => {
        console.error('❌ Error unverifying restaurant:', error)
      },
    })
  }

  // Export function
  const exportToExcel = (data: Record<string, string | number>[], filename: string) => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      XLSX.writeFile(workbook, `${filename}.xlsx`)
      console.log('✅ Export successful:', filename)
    } catch (error) {
      console.error('❌ Export error:', error)
    }
  }

  // Print function
  const printData = (data: Record<string, string | number>[], title: string) => {
    try {
      const printWindow = window.open('', '', 'width=1200,height=800')
      if (!printWindow) return

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
              th { background-color: #f5f5f5; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
              .badge-green { background-color: #d4edda; color: #155724; }
              .badge-red { background-color: #f8d7da; color: #721c24; }
              .badge-yellow { background-color: #fff3cd; color: #856404; }
              .badge-blue { background-color: #d1ecf1; color: #0c5460; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  ${Object.keys(data[0] || {})
                    .map((key) => `<th>${key}</th>`)
                    .join('')}
                </tr>
              </thead>
              <tbody>
                ${data
                  .map(
                    (row) => `
                  <tr>
                    ${Object.values(row)
                      .map((value) => `<td>${value}</td>`)
                      .join('')}
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </body>
        </html>
      `
      printWindow.document.write(html)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    } catch (error) {
      console.error('❌ Print error:', error)
    }
  }

  // Filter restaurants
  const filteredRestaurants = allRestaurants.filter((restaurant: AdminRestaurant) => {
    const nameMatch = restaurant.name.toLowerCase().includes(restaurantNameFilter.toLowerCase())
    const statusMatch = restaurantStatusFilter === 'all' || 
      (restaurantStatusFilter === 'active' && restaurant.isActive) ||
      (restaurantStatusFilter === 'inactive' && !restaurant.isActive)
    const verifiedMatch = restaurantVerifiedFilter === 'all' ||
      (restaurantVerifiedFilter === 'verified' && restaurant.isVerified) ||
      (restaurantVerifiedFilter === 'unverified' && !restaurant.isVerified)
    
    return nameMatch && statusMatch && verifiedMatch
  })

  // Filter categories
  const filteredCategories = (menuCategoriesData || []).filter((category: MenuCategory) => {
    const nameMatch = category.name.toLowerCase().includes(categoryNameFilter.toLowerCase())
    const typeMatch = categoryTypeFilter === 'all' || category.type === categoryTypeFilter

    return nameMatch && typeMatch
  })

  // Filter items
  const filteredItems = (menuItemsData || []).filter((item: MenuItem) => {
    const nameMatch = item.name.toLowerCase().includes(itemNameFilter.toLowerCase())
    const typeMatch = itemTypeFilter === 'all' || item.type === itemTypeFilter
    const availabilityMatch = itemAvailabilityFilter === 'all' ||
      (itemAvailabilityFilter === 'available' && item.isAvailable) ||
      (itemAvailabilityFilter === 'unavailable' && !item.isAvailable)
    const bestsellerMatch = itemBestsellerFilter === 'all' ||
      (itemBestsellerFilter === 'bestseller' && item.isBestseller) ||
      (itemBestsellerFilter === 'regular' && !item.isBestseller)

    return nameMatch && typeMatch && availabilityMatch && bestsellerMatch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Restaurants Management</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage restaurants, menu categories, and menu items</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="restaurants" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="restaurants" className="flex items-center gap-2">
            <Search size={16} />
            Restaurants
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <BookOpen size={16} />
            Menu Categories
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <UtensilsCrossed size={16} />
            Menu Items
          </TabsTrigger>
        </TabsList>

        {/* Restaurants Tab */}
        <TabsContent value="restaurants" className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search restaurants by name..."
                  value={restaurantNameFilter}
                  onChange={(e) => setRestaurantNameFilter(e.target.value)}
                  className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">Status</label>
                <select
                  value={restaurantStatusFilter}
                  onChange={(e) => setRestaurantStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 dark:scheme-dark"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">Verified</label>
                <select
                  value={restaurantVerifiedFilter}
                  onChange={(e) => setRestaurantVerifiedFilter(e.target.value as 'all' | 'verified' | 'unverified')}
                  className="w-full text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 dark:scheme-dark"
                >
                  <option value="all">All</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>

              <div className="flex gap-2">
                {(restaurantNameFilter || restaurantStatusFilter !== 'all' || restaurantVerifiedFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setRestaurantNameFilter('')
                      setRestaurantStatusFilter('all')
                      setRestaurantVerifiedFilter('all')
                    }}
                    className="flex-1 h-9 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"
                  >
                    <X size={16} />
                    Reset
                  </button>
                )}
                <button
                  onClick={() => {
                    const data = filteredRestaurants.map((r: AdminRestaurant) => ({
                      'Restaurant Name': r.name,
                      'Manager': r.manager?.name || 'N/A',
                      'Address': r.address,
                      'Rating': r.rating.toFixed(1),
                      'Status': r.isActive ? 'Active' : 'Inactive',
                      'Verified': r.isVerified ? 'Yes' : 'No',
                    }))
                    exportToExcel(data, 'restaurants')
                  }}
                  className="px-4 h-9 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400"
                >
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={() => {
                    const data = filteredRestaurants.map((r: AdminRestaurant) => ({
                      'Restaurant Name': r.name,
                      'Manager': r.manager?.name || 'N/A',
                      'Address': r.address,
                      'Rating': r.rating.toFixed(1),
                      'Status': r.isActive ? 'Active' : 'Inactive',
                      'Verified': r.isVerified ? 'Yes' : 'No',
                    }))
                    printData(data, 'Restaurants Report')
                  }}
                  className="px-4 h-9 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400"
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
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Restaurant Name</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurantsLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map((restaurant: AdminRestaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell>
                          {restaurant.image ? (
                            <img
                              src={restaurant.image}
                              alt={restaurant.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <Building2 size={18} className="text-slate-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {restaurant.name}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                          {restaurant.manager?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm max-w-xs truncate">
                          {restaurant.address}
                        </TableCell>
                        <TableCell className="text-slate-900 dark:text-white font-medium">
                          {restaurant.rating.toFixed(1)} ⭐
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              restaurant.isActive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}
                          >
                            {restaurant.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              restaurant.isVerified
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            }`}
                          >
                            {restaurant.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {restaurant.isActive ? (
                              <button
                                onClick={() => handleDeactivate(restaurant.id)}
                                disabled={deactivateRestaurant.isPending}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Deactivate"
                              >
                                <XCircle size={18} className="text-red-600 dark:text-red-400" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(restaurant.id)}
                                disabled={activateRestaurant.isPending}
                                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Activate"
                              >
                                <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
                              </button>
                            )}

                            {restaurant.isVerified ? (
                              <button
                                onClick={() => handleUnverify(restaurant.id)}
                                disabled={unverifyRestaurant.isPending}
                                className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Unverify"
                              >
                                <ShieldOff size={18} className="text-yellow-600 dark:text-yellow-400" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerify(restaurant.id)}
                                disabled={verifyRestaurant.isPending}
                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Verify"
                              >
                                <Shield size={18} className="text-blue-600 dark:text-blue-400" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No restaurants found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!restaurantsLoading && allRestaurants.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-end gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={handlePreviousPage}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-slate-900 dark:text-white">
                  Page {currentPage}
                </span>
                <button
                  disabled={!hasNextPage || isFetchingMore}
                  onClick={handleNextPage}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isFetchingMore ? (
                    <div className="animate-spin">
                      <ChevronRight size={18} />
                    </div>
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Menu Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search categories by name..."
                  value={categoryNameFilter}
                  onChange={(e) => setCategoryNameFilter(e.target.value)}
                  className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">Type</label>
                <select
                  value={categoryTypeFilter}
                  onChange={(e) => setCategoryTypeFilter(e.target.value)}
                  className="w-full text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 dark:scheme-dark"
                >
                  <option value="all">All Types</option>
                  <option value="MAIN">Main</option>
                  <option value="SIDE">Side</option>
                  <option value="DESSERT">Dessert</option>
                  <option value="BEVERAGE">Beverage</option>
                </select>
              </div>

              <div className="col-span-2 flex gap-2">
                {(categoryNameFilter || categoryTypeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setCategoryNameFilter('')
                      setCategoryTypeFilter('all')
                    }}
                    className="flex-1 h-9 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"
                  >
                    <X size={16} />
                    Reset
                  </button>
                )}
                <button
                  onClick={() => {
                    const data = filteredCategories.map((c: MenuCategory) => ({
                      'Category Name': c.name,
                      'Restaurant': c.restaurant?.name || 'N/A',
                      'Type': c.type || 'N/A',
                      'Items Count': c.items?.length || 0,
                      'Created': new Date(c.createdAt).toLocaleDateString(),
                    }))
                    exportToExcel(data, 'menu-categories')
                  }}
                  className="px-4 h-9 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400"
                >
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={() => {
                    const data = filteredCategories.map((c: MenuCategory) => ({
                      'Category Name': c.name,
                      'Restaurant': c.restaurant?.name || 'N/A',
                      'Type': c.type || 'N/A',
                      'Items Count': c.items?.length || 0,
                      'Created': new Date(c.createdAt).toLocaleDateString(),
                    }))
                    printData(data, 'Menu Categories Report')
                  }}
                  className="px-4 h-9 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400"
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
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Items Count</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuCategoriesLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Skeleton className="h-10 w-10 rounded-lg" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredCategories && filteredCategories.length > 0 ? (
                    filteredCategories.map((category: MenuCategory) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <BookOpen size={18} className="text-slate-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {category.name}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                          {category.restaurant?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                          <span className="inline-block px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700">
                            {category.type || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-900 dark:text-white font-medium">
                          {category.items?.length || 0}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => {
                              setSelectedCategory(category)
                              setIsCategoryModalOpen(true)
                            }}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} className="text-blue-600 dark:text-blue-400" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No menu categories found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Menu Items Tab */}
        <TabsContent value="items" className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search items by name..."
                  value={itemNameFilter}
                  onChange={(e) => setItemNameFilter(e.target.value)}
                  className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">Type</label>
                <select
                  value={itemTypeFilter}
                  onChange={(e) => setItemTypeFilter(e.target.value)}
                  className="w-full text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 dark:scheme-dark"
                >
                  <option value="all">All Types</option>
                  <option value="VEG">Vegetarian</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                </select>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">Availability</label>
                <select
                  value={itemAvailabilityFilter}
                  onChange={(e) => setItemAvailabilityFilter(e.target.value as 'all' | 'available' | 'unavailable')}
                  className="w-full text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 dark:scheme-dark"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">Best Seller</label>
                <select
                  value={itemBestsellerFilter}
                  onChange={(e) => setItemBestsellerFilter(e.target.value as 'all' | 'bestseller' | 'regular')}
                  className="w-full text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 dark:scheme-dark"
                >
                  <option value="all">All</option>
                  <option value="bestseller">Best Sellers</option>
                  <option value="regular">Regular Items</option>
                </select>
              </div>

              <div className="flex gap-2">
                {(itemNameFilter || itemTypeFilter !== 'all' || itemAvailabilityFilter !== 'all' || itemBestsellerFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setItemNameFilter('')
                      setItemTypeFilter('all')
                      setItemAvailabilityFilter('all')
                      setItemBestsellerFilter('all')
                    }}
                    className="flex-1 h-9 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"
                  >
                    <X size={16} />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Export and Print Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const data = filteredItems.map((i: MenuItem) => ({
                    'Item Name': i.name,
                    'Category': i.category?.name || 'N/A',
                    'Price': '$' + i.price.toFixed(2),
                    'Type': i.type || 'N/A',
                    'Available': i.isAvailable ? 'Yes' : 'No',
                    'Best Seller': i.isBestseller ? 'Yes' : 'No',
                    'Created': new Date(i.createdAt).toLocaleDateString(),
                  }))
                  exportToExcel(data, 'menu-items')
                }}
                className="px-4 h-9 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={() => {
                  const data = filteredItems.map((i: MenuItem) => ({
                    'Item Name': i.name,
                    'Category': i.category?.name || 'N/A',
                    'Price': '$' + i.price.toFixed(2),
                    'Type': i.type || 'N/A',
                    'Available': i.isAvailable ? 'Yes' : 'No',
                    'Best Seller': i.isBestseller ? 'Yes' : 'No',
                    'Created': new Date(i.createdAt).toLocaleDateString(),
                  }))
                  printData(data, 'Menu Items Report')
                }}
                className="px-4 h-9 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400"
              >
                <Printer size={16} />
                Print
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Best Seller</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItemsLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Skeleton className="h-10 w-10 rounded-lg" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredItems && filteredItems.length > 0 ? (
                    filteredItems.map((item: MenuItem) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <UtensilsCrossed size={18} className="text-slate-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                          {item.category?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-900 dark:text-white font-medium">
                          ${item.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            item.type === 'VEG' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            item.type === 'NON_VEG' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                            'bg-slate-100 dark:bg-slate-700'
                          }`}>
                            {item.type || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            item.isAvailable
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            item.isBestseller
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}>
                            {item.isBestseller ? '⭐ Yes' : 'No'}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => {
                              setSelectedItem(item)
                              setIsItemModalOpen(true)
                            }}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} className="text-blue-600 dark:text-blue-400" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No menu items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <MenuCategoryDetailModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false)
          setSelectedCategory(null)
        }}
        category={selectedCategory}
      />

      <MenuItemDetailModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false)
          setSelectedItem(null)
        }}
        item={selectedItem}
      />
    </div>
  )
}