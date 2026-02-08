import ApiGroup from "@/components/ApiGroup"


function ApiReferenceTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ApiGroup
        title="Device APIs"
        endpoints={[
          { method: "GET", path: "/api/v1/devices" },
          { method: "GET", path: "/api/v1/devices/{deviceId}" },
          { method: "POST", path: "/api/v1/devices" },
        ]}
      />

      <ApiGroup
        title="Account APIs"
        endpoints={[
          { method: "GET", path: "/api/v1/account" },
          { method: "PATCH", path: "/api/v1/account" },
        ]}
      />
    </div>
  )
}

export default ApiReferenceTab
