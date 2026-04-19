"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin, Navigation, Bus, Clock, AlertTriangle, CheckCircle2,
  RefreshCw, Filter, Search, Phone, Route, Users, Fuel,
  Settings, Play, Pause, Maximize2, ChevronRight
} from "lucide-react"

const mockBuses = [
  {
    id: "bus-1",
    vehicleNo: "KA-01-AB-1234",
    registrationNo: "KA-01-AB-1234",
    model: "Tata Starbus",
    capacity: 40,
    driverId: "DRV-001",
    driverName: "Ramesh Kumar",
    driverPhone: "+91-9876543210",
    routeId: "route-1",
    routeName: "Route 1 - City Center",
    gpsDeviceId: "GPS-001",
    status: "ACTIVE",
    lastLocation: { lat: 12.9716, lng: 77.5946, timestamp: new Date().toISOString() },
    speed: 35,
    fuel: 75,
    studentsOnboard: 32,
  },
  {
    id: "bus-2",
    vehicleNo: "KA-02-CD-5678",
    registrationNo: "KA-02-CD-5678",
    model: "Eicher",
    capacity: 50,
    driverId: "DRV-002",
    driverName: "Suresh Reddy",
    driverPhone: "+91-9876541234",
    routeId: "route-2",
    routeName: "Route 2 - East Side",
    gpsDeviceId: "GPS-002",
    status: "ACTIVE",
    lastLocation: { lat: 12.9352, lng: 77.6245, timestamp: new Date().toISOString() },
    speed: 28,
    fuel: 60,
    studentsOnboard: 45,
  },
  {
    id: "bus-3",
    vehicleNo: "KA-03-EF-9012",
    registrationNo: "KA-03-EF-9012",
    model: "Ashok Leyland",
    capacity: 45,
    driverId: "DRV-003",
    driverName: "Venkat Rao",
    driverPhone: "+91-9876549876",
    routeId: "route-3",
    routeName: "Route 3 - West Side",
    gpsDeviceId: "GPS-003",
    status: "MAINTENANCE",
    lastLocation: { lat: 12.9141, lng: 77.6101, timestamp: new Date(Date.now() - 3600000).toISOString() },
    speed: 0,
    fuel: 45,
    studentsOnboard: 0,
  },
]

const mockRouteStops = [
  { id: "stop-1", name: "School", lat: 12.9716, lng: 77.5946, eta: "0 min", status: "current" },
  { id: "stop-2", name: "MG Road", lat: 12.9756, lng: 77.6066, eta: "5 min", status: "upcoming" },
  { id: "stop-3", name: "Brigade Road", lat: 12.9781, lng: 77.6033, eta: "10 min", status: "upcoming" },
  { id: "stop-4", name: "Residency Road", lat: 12.9801, lng: 77.5996, eta: "15 min", status: "upcoming" },
  { id: "stop-5", name: "Richmond Road", lat: 12.9826, lng: 77.5956, eta: "20 min", status: "upcoming" },
]

export default function GPSTrackingPage() {
  const [selectedBus, setSelectedBus] = useState<typeof mockBuses[0] | null>(mockBuses[0])
  const [isTracking, setIsTracking] = useState(true)
  const [showFullMap, setShowFullMap] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  // Simulate real-time updates
  useEffect(() => {
    if (!isTracking) return
    const interval = setInterval(() => {
      if (selectedBus && selectedBus.status === "ACTIVE") {
        setSelectedBus((prev) => {
          if (!prev) return null
          return {
            ...prev,
            lastLocation: {
              lat: prev.lastLocation.lat + (Math.random() - 0.5) * 0.001,
              lng: prev.lastLocation.lng + (Math.random() - 0.5) * 0.001,
              timestamp: new Date().toISOString(),
            },
            speed: Math.floor(20 + Math.random() * 30),
          }
        })
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [isTracking, selectedBus])

  const filteredBuses = mockBuses.filter((bus) => {
    const matchesSearch = bus.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bus.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bus.routeName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || bus.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bus GPS Tracking</h1>
                <p className="text-gray-600">Real-time school bus tracking system</p>
              </div>
            </div>
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isTracking
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
            >
              {isTracking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isTracking ? "Pause" : "Resume"} Tracking
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <Bus className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">{mockBuses.length}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Buses</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <Navigation className="w-8 h-8 text-emerald-500" />
              <span className="text-3xl font-bold text-gray-900">
                {mockBuses.filter((b) => b.status === "ACTIVE").length}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Active Now</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold text-gray-900">
                {mockBuses.reduce((sum, b) => sum + b.studentsOnboard, 0)}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Students Onboard</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-bold text-gray-900">
                {mockBuses.filter((b) => b.fuel < 50).length}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Low Fuel Alert</p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bus List */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-48">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search buses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter || ""}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filteredBuses.map((bus) => (
                <button
                  key={bus.id}
                  onClick={() => setSelectedBus(bus)}
                  className={`w-full p-4 hover:bg-gray-50 transition-colors ${
                    selectedBus?.id === bus.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      bus.status === "ACTIVE" ? "bg-emerald-100 text-emerald-600" : 
                      bus.status === "MAINTENANCE" ? "bg-amber-100 text-amber-600" : 
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <Bus className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900">{bus.vehicleNo}</p>
                        <span className={`w-2 h-2 rounded-full ${
                          bus.status === "ACTIVE" ? "bg-emerald-500" : 
                          bus.status === "MAINTENANCE" ? "bg-amber-500" : 
                          "bg-gray-400"
                        }`} />
                      </div>
                      <p className="text-sm text-gray-600">{bus.routeName}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {bus.studentsOnboard}/{bus.capacity}
                        </span>
                        <span className="flex items-center gap-1">
                          <Fuel className="w-3 h-3" />
                          {bus.fuel}%
                        </span>
                        {bus.status === "ACTIVE" && (
                          <span className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {bus.speed} km/h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Map & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">
                    {selectedBus?.routeName || "Select a Bus"}
                  </span>
                  {selectedBus?.status === "ACTIVE" && isTracking && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowFullMap(!showFullMap)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>

              {/* Map Placeholder */}
              <div className={`relative bg-gradient-to-br from-blue-100 to-cyan-100 ${showFullMap ? "h-[500px]" : "h-[300px]"}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Interactive Map</p>
                    <p className="text-sm text-gray-500">Real-time GPS tracking visualization</p>
                  </div>
                </div>

                {/* Bus Marker */}
                {selectedBus && selectedBus.status === "ACTIVE" && (
                  <motion.div
                    animate={{
                      top: "40%",
                      left: "50%",
                    }}
                    className="absolute w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Bus className="w-5 h-5 text-white" />
                  </motion.div>
                )}

                {/* Route Stops */}
                {mockRouteStops.map((stop, index) => (
                  <div
                    key={stop.id}
                    className="absolute"
                    style={{
                      top: `${30 + index * 8}%`,
                      left: `${20 + index * 12}%`,
                    }}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      stop.status === "current" ? "bg-blue-500 border-blue-600" : "bg-white border-gray-400"
                    }`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Bus Details */}
            {selectedBus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{selectedBus.vehicleNo}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedBus.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" :
                    selectedBus.status === "MAINTENANCE" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {selectedBus.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="text-sm text-gray-500">Driver</label>
                    <p className="font-medium text-gray-900">{selectedBus.driverName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <p className="font-medium text-gray-900">{selectedBus.driverPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Model</label>
                    <p className="font-medium text-gray-900">{selectedBus.model}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Capacity</label>
                    <p className="font-medium text-gray-900">{selectedBus.capacity} seats</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-sm text-gray-500">Speed</label>
                    <p className="text-xl font-bold text-gray-900">{selectedBus.speed} km/h</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-sm text-gray-500">Fuel</label>
                    <p className="text-xl font-bold text-gray-900">{selectedBus.fuel}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-sm text-gray-500">Students</label>
                    <p className="text-xl font-bold text-gray-900">{selectedBus.studentsOnboard}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-sm text-gray-500">GPS Device</label>
                    <p className="text-lg font-bold text-gray-900">{selectedBus.gpsDeviceId}</p>
                  </div>
                </div>

                {/* Route Stops */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Route className="w-5 h-5" />
                    Route Stops
                  </h3>
                  <div className="space-y-2">
                    {mockRouteStops.map((stop, index) => (
                      <div key={stop.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          stop.status === "current" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{stop.name}</p>
                          <p className="text-sm text-gray-500">
                            Lat: {stop.lat.toFixed(4)}, Lng: {stop.lng.toFixed(4)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{stop.eta}</p>
                          <p className="text-xs text-gray-500">ETA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call Driver
                  </button>
                  <button className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                    <Route className="w-4 h-4" />
                    View Route
                  </button>
                  <button className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
