import type { Partner } from "@/types/partner"


export let partnersMock: Partner[] = [
  {
    partnerId: "partner_001",
    username: "arjun_k",
    partnerName: "Arjun Kumar",
    partnerEmail: "arjun.kumar@partner.com",
    partnerPhone: "+91-9876543210",
    partnerCompany: "Kumar Tech Solutions",
    partnerAddress: "Bengaluru, Karnataka",

    profileImageUrl: "https://i.pravatar.cc/150?img=11",

    orgCount: 6,
    deviceCount: 128,

    status: "Active",
    createdAt: 1704067200000,
    updatedAt: 1706745600000,
  },
  {
    partnerId: "partner_002",
    username: "neha_s",
    partnerName: "Neha Sharma",
    partnerEmail: "neha.sharma@partner.com",
    partnerPhone: "+91-9123456789",
    partnerCompany: "Sharma Enterprises",
    partnerAddress: "Pune, Maharashtra",

    profileImageUrl: "https://i.pravatar.cc/150?img=32",

    orgCount: 3,
    deviceCount: 54,

    status: "Active",
    createdAt: 1701388800000,
    updatedAt: 1706659200000,
  },
  {
    partnerId: "partner_003",
    username: "rahul_m",
    partnerName: "Rahul Mehta",
    partnerEmail: "rahul.mehta@partner.com",
    partnerPhone: "+91-9988776655",
    partnerCompany: "Mehta Systems",
    partnerAddress: "Ahmedabad, Gujarat",

    profileImageUrl: "https://i.pravatar.cc/150?img=48",

    orgCount: 10,
    deviceCount: 312,

    status: "Active",
    createdAt: 1698796800000,
    updatedAt: 1706572800000,
  },
  {
    partnerId: "partner_004",
    username: "sneha_p",
    partnerName: "Sneha Patil",
    partnerEmail: "sneha.patil@partner.com",
    partnerPhone: "+91-9090909090",
    partnerCompany: "Patil Innovations",
    partnerAddress: "Nagpur, Maharashtra",

    profileImageUrl: "https://i.pravatar.cc/150?img=20",

    orgCount: 1,
    deviceCount: 12,

    status: "Inactive",
    createdAt: 1696118400000,
    updatedAt: 1703980800000,
  },
  {
    partnerId: "partner_005",
    username: "vikram_r",
    partnerName: "Vikram Reddy",
    partnerEmail: "vikram.reddy@partner.com",
    partnerPhone: "+91-9345678123",
    partnerCompany: "Reddy Corp",
    partnerAddress: "Hyderabad, Telangana",

    profileImageUrl: "https://i.pravatar.cc/150?img=56",

    orgCount: 8,
    deviceCount: 220,

    status: "Active",
    createdAt: 1693526400000,
    updatedAt: 1706486400000,
  },
];


export const getPartners = () => partnersMock

export const getPartnerById = (id: string) =>
  partnersMock.find(p => p.partnerId === id)

export const updatePartner = (updated: Partner) => {
  partnersMock = partnersMock.map(p =>
    p.partnerId === updated.partnerId ? updated : p
  )
}

export const deletePartner = (id: string) => {
  partnersMock = partnersMock.filter(p => p.partnerId !== id)
}

export const addPartner = (partner: Partner) => {
  partnersMock = [...partnersMock, partner]
}

