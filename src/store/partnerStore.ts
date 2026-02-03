import type { Partner } from "@/types/partner"

let partners: Partner[] = [
    {
        id: "unified-tech",
        name: "Unified Tech",
        status: "Active",
        organizations: 16,
        devices: 98
    },
    {
        id: "connect-solutions",
        name: "Connect Solutions",
        status: "Active",
        organizations: 14,
        devices: 143
    },
    {
        id: "edusmart-tech",
        name: "EduSmart Technologies",
        status: "Active",
        organizations: 12,
        devices: 126
    },
    {
        id: "trackify-systems",
        name: "Trackify Systems",
        status: "Inactive",
        organizations: 6,
        devices: 24
    },
    {
        id: "safepass-services",
        name: "SafePass Services",
        status: "Active",
        organizations: 4,
        devices: 11
    },
    {
        id: "beacon-edge",
        name: "Beacon Edge",
        status: "Active",
        organizations: 3,
        devices: 10
    }
]

export const getPartners = () => partners

export const getPartnerById = (id: string) =>
  partners.find(p => p.id === id)

export const updatePartner = (updated: Partner) => {
  partners = partners.map(p =>
    p.id === updated.id ? updated : p
  )
}

export const deletePartner = (id: string) => {
  partners = partners.filter(p => p.id !== id)
}

export const addPartner = (partner: Partner) => {
  partners = [...partners, partner]
}

