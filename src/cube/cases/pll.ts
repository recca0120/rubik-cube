export type PLLCase = {
  id: string
  name: string
  description: string
  alg: string
}

export const PLL_CASES: PLLCase[] = [
  {
    id: 'Ua',
    name: 'Ua Perm',
    description: '3 個邊塊逆時針循環（頭部為已歸位的邊）',
    alg: "R U' R U R U R U' R' U' R2",
  },
  {
    id: 'Ub',
    name: 'Ub Perm',
    description: '3 個邊塊順時針循環',
    alg: "R2 U R U R' U' R' U' R' U R'",
  },
  {
    id: 'H',
    name: 'H Perm',
    description: '對邊對調（前後 & 左右）',
    alg: "M2 U M2 U2 M2 U M2",
  },
  {
    id: 'Z',
    name: 'Z Perm',
    description: '相鄰邊塊兩組對調',
    alg: "M' U M2 U M2 U M' U2 M2",
  },
  {
    id: 'Aa',
    name: 'Aa Perm',
    description: '3 個角塊順時針循環',
    alg: "x R' U R' D2 R U' R' D2 R2 x'",
  },
  {
    id: 'T',
    name: 'T Perm',
    description: '對角的角塊對調 + 相鄰邊對調',
    alg: "R U R' U' R' F R2 U' R' U' R U R' F'",
  },
]
