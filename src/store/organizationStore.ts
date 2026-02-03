import type { Organization } from "@/types/organization"

let organizations: Organization[] = [
  {
    id: "greenfield-high",
    name: "Greenfield High School",
    partner: "Connect Solutions",
    status: "Active",
    devices: 59,
    joined: "2023-04-23"
  },
  {
    id: "oakwood-academy",
    name: "Oakwood Academy",
    partner: "Connect Solutions",
    status: "Active",
    devices: 28,
    joined: "2024-02-05"
  },
  {
    id: "riverdale-public-school",
    name: "Riverdale Public School",
    partner: "Connect Solutions",
    status: "Active",
    devices: 22,
    joined: "2023-11-02"
  },
  {
    id: "sunrise-international-school",
    name: "Sunrise International School",
    partner: "SafePass Services",
    status: "Inactive",
    devices: 18,
    joined: "2023-09-15"
  },
  {
    id: "metro-corporate-office",
    name: "Metro Corporate Office",
    partner: "Unified Tech",
    status: "Active",
    devices: 34,
    joined: "2023-08-21"
  },
  {
    id: "silverline-training-center",
    name: "Silverline Training Center",
    partner: "EduSmart Technologies",
    status: "Active",
    devices: 12,
    joined: "2024-03-03"
  }
]

export const getOrganizations = () => organizations

export const getOrganizationById = (id: string) =>
  organizations.find(o => o.id === id)

export const addOrganization = (org: Organization) => {
  organizations = [...organizations, org]
}

export const updateOrganization = (updated: Organization) => {
  organizations = organizations.map(o =>
    o.id === updated.id ? updated : o
  )
}

export const deleteOrganization = (id: string) => {
  organizations = organizations.filter(o => o.id !== id)
}
