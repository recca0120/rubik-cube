export type F2LCase = {
  id: string
  name: string
  description: string
  alg: string
}

/**
 * 41 standard F2L cases for the URF slot (front-right).
 * Algorithms use J Perm's consensus set where possible.
 *
 * Categories (per docs/v6-f2l-intuitive.md):
 *   Group A (1-24):   Both pieces in U layer
 *   Group B (25-30):  Edge in E-layer, corner in U
 *   Group C (31-36):  Corner in slot, edge in U
 *   Group D (37-41):  Both in slot (wrong)
 */
export const F2L_CASES: F2LCase[] = [
  // ─── Group A1/A2: Connected pair (4 cases) ───────────────────────────
  { id: 'F2L-1', name: 'Easy 白朝右',  description: '角塊白色朝右，邊塊已對位', alg: "U R U' R'" },
  { id: 'F2L-2', name: 'Easy 白朝前',  description: '角塊白色朝前，邊塊已對位', alg: "U' F' U F" },
  { id: 'F2L-3', name: 'Easy 左對稱',  description: '鏡像：角邊都在 U 左上', alg: "U' L' U L" },
  { id: 'F2L-4', name: 'Easy 後對稱',  description: '鏡像：角邊都在 U 後側', alg: "U B U' B'" },

  // ─── Group A3/A4: Split pair, white on top/side (12 cases) ──────────
  { id: 'F2L-5',  name: 'Split 前右 WT',  description: '角邊分離，白朝上',       alg: "U R U2 R' U R U' R'" },
  { id: 'F2L-6',  name: 'Split 後右 WT',  description: '角邊分離，白朝上 #2',    alg: "U' R U R' U R U' R'" },
  { id: 'F2L-7',  name: 'Split 左前 WT',  description: '角邊分離，白朝上 #3',    alg: "U' F' U2 F U' F' U F" },
  { id: 'F2L-8',  name: 'Split 右後 WT',  description: '角邊分離，白朝上 #4',    alg: "U F' U' F U R U' R'" },
  { id: 'F2L-9',  name: 'Split 前對 WT',  description: '角邊分離，白朝上 #5',    alg: "U2 R U' R' U' R U R'" },
  { id: 'F2L-10', name: 'Split 後對 WT',  description: '角邊分離，白朝上 #6',    alg: "U2 R U R' U R U' R'" },
  { id: 'F2L-11', name: 'Split 角白右 WS', description: '角白朝側，邊分離',       alg: "R U' R' U2 R U R'" },
  { id: 'F2L-12', name: 'Split 角白前 WS', description: '角白朝側，邊分離 #2',    alg: "F' U F U2 F' U' F" },
  { id: 'F2L-13', name: 'Split 角白左 WS', description: '角白朝側，邊分離 #3',    alg: "U' R U R' U2 R U' R'" },
  { id: 'F2L-14', name: 'Split 角白後 WS', description: '角白朝側，邊分離 #4',    alg: "U R U' R' U2 R U R'" },
  { id: 'F2L-15', name: 'Split 對稱 WS 1', description: '對稱：白朝側 #5',       alg: "U F' U' F U' R U R'" },
  { id: 'F2L-16', name: 'Split 對稱 WS 2', description: '對稱：白朝側 #6',       alg: "U' R U' R' U F' U' F" },

  // ─── Group A5: Edge inverted (8 cases) ────────────────────────────────
  { id: 'F2L-17', name: 'Inverted 基本 1',  description: '邊塊方向反，角白朝上',   alg: "R U' R' U R U2 R' U R U' R'" },
  { id: 'F2L-18', name: 'Inverted 基本 2',  description: '邊塊方向反，角白朝上 #2', alg: "R U R' U' R U R' U' R U R'" },
  { id: 'F2L-19', name: 'Inverted 白朝側 1', description: '邊反向 + 角白側',       alg: "R U' R' U R U R' U R U' R'" },
  { id: 'F2L-20', name: 'Inverted 白朝側 2', description: '邊反向 + 角白側 #2',    alg: "R U2 R' U' R U R'" },
  { id: 'F2L-21', name: 'Inverted 白朝側 3', description: '邊反向 + 角白側 #3',    alg: "R U R' U2 R U' R' U R U' R'" },
  { id: 'F2L-22', name: 'Inverted 白朝側 4', description: '邊反向 + 角白側 #4',    alg: "F' U' F U F' U' F" },
  { id: 'F2L-23', name: 'Inverted 特殊 1',   description: '特殊對稱',              alg: "R U' R' U2 F' U' F" },
  { id: 'F2L-24', name: 'Inverted 特殊 2',   description: '特殊對稱 #2',           alg: "F' U F U2 R U R'" },

  // ─── Group B: Edge in E-layer, corner in U (6 cases) ─────────────────
  { id: 'F2L-25', name: 'Edge-slot 角白上',    description: '邊在 FR slot 方向對，角 U 白朝上', alg: "R U' R' U R U' R'" },
  { id: 'F2L-26', name: 'Edge-slot 角白側 1',  description: '邊在 FR 槽反向，角白朝側',         alg: "R U' R' U2 R U R'" },
  { id: 'F2L-27', name: 'Edge-slot 角白側 2',  description: '邊在 FR 槽反向 #2',                alg: "R U R' U' R U R'" },
  { id: 'F2L-28', name: 'Edge-slot 角白側 3',  description: '邊在 FR 槽反向 #3',                alg: "R U2 R' U' R U R'" },
  { id: 'F2L-29', name: 'Edge-slot 複雜 1',    description: '邊 + 角都需重整',                   alg: "R U' R' U R U R' U R U' R'" },
  { id: 'F2L-30', name: 'Edge-slot 複雜 2',    description: '邊 + 角都需重整 #2',                alg: "R U R' U' R U2 R' U R U' R'" },

  // ─── Group C: Corner in slot, edge in U (6 cases) ────────────────────
  { id: 'F2L-31', name: 'Corner-slot 邊白上 1', description: '角在 DRF slot 白下，邊 U',         alg: "R U' R' U2 R U' R'" },
  { id: 'F2L-32', name: 'Corner-slot 邊白上 2', description: '角 slot 白朝側',                   alg: "R U R' U' R U2 R' U' R U R'" },
  { id: 'F2L-33', name: 'Corner-slot 邊白側 1', description: '角 slot + 邊在 U 白朝側',          alg: "R U' R' U R U' R' U R U' R'" },
  { id: 'F2L-34', name: 'Corner-slot 邊白側 2', description: '對稱版',                            alg: "F' U F U' F' U F" },
  { id: 'F2L-35', name: 'Corner-slot 複雜 1',   description: '角邊需多步',                        alg: "R U' R' U2 R U2 R' U R U' R'" },
  { id: 'F2L-36', name: 'Corner-slot 複雜 2',   description: '角邊需多步 #2',                     alg: "R U' R' U R U R' U2 R U' R'" },

  // ─── Group D: Both in slot (5 cases) ─────────────────────────────────
  { id: 'F2L-37', name: 'Both-slot 角對邊錯',   description: '角位置對、邊錯',                    alg: "R U' R' U R U' R' U R U' R'" },
  { id: 'F2L-38', name: 'Both-slot 邊對角錯',   description: '邊對角錯',                          alg: "R U R' U' R U R' U' R U R'" },
  { id: 'F2L-39', name: 'Both-slot 亂 1',       description: '兩塊都錯位',                        alg: "R U' R' U' R U R' U' R U R'" },
  { id: 'F2L-40', name: 'Both-slot 亂 2',       description: '兩塊都錯位 #2',                     alg: "R U R' U' R U2 R' U R U' R'" },
  { id: 'F2L-41', name: 'Both-slot 旋轉 180°',  description: '角、邊 180° 錯',                    alg: "R U' R' U R U2 R'" },
]
