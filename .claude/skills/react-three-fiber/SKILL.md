---
name: react-three-fiber
description: React Three Fiber (R3F) + Three.js + drei 最佳實踐。當需要建立 3D 場景、處理相機/光照、互動事件、動畫、效能優化時使用。
---

# React Three Fiber 最佳實踐

> 基於 2025/5 知識。版本基準：three ^0.170、@react-three/fiber ^9、@react-three/drei ^10。

## 安裝

```bash
pnpm add three @react-three/fiber @react-three/drei
pnpm add -D @types/three
```

## 基本 Canvas

```tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'

<Canvas camera={{ position: [5, 5, 5], fov: 50 }} dpr={[1, 2]} shadows>
  <ambientLight intensity={0.4} />
  <directionalLight position={[5, 10, 5]} castShadow />
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="orange" />
  </mesh>
  <OrbitControls />
</Canvas>
```

## 核心 Hooks

```tsx
useFrame((state, delta) => {
  // 每幀執行，不要 setState！用 ref 直接改 mesh
  ref.current.rotation.y += delta
})

const { camera, gl, scene, size } = useThree()
```

## drei 常用

- `OrbitControls` / `TrackballControls`：相機控制
- `PerspectiveCamera makeDefault`：自訂主相機
- `Environment preset="city"`：HDR 環境光
- `Bounds`：自動 fit 物件入鏡
- `Html`：3D 裡嵌 DOM（ tooltip/label）
- `useGLTF('/model.glb')`：載 GLTF，記得 `useGLTF.preload()`
- `Instances` / `Instance`：大量重複物件用 instancing

## 互動事件

```tsx
<mesh
  onPointerDown={(e) => { e.stopPropagation(); /* e.point, e.face, e.object */ }}
  onPointerOver={(e) => setHover(true)}
  onPointerMissed={() => setSelected(null)}
>
```

事件會冒泡，要 `stopPropagation()` 阻止穿透。`onPointerMissed` 在點空白處觸發（適合取消選取）。

## 群組旋轉（魔術方塊關鍵）

```tsx
// 把 9 個 cubie 暫時 attach 到一個 Group，旋轉 Group，動畫完再 detach
const group = useRef<THREE.Group>(null!)
const pivot = useRef<THREE.Object3D>(new THREE.Object3D())

function rotateFace(cubies: THREE.Object3D[], axis: 'x'|'y'|'z', angle: number) {
  cubies.forEach(c => pivot.current.attach(c))
  // useFrame 內 lerp pivot.rotation[axis] 到 angle
  // 完成後：cubies.forEach(c => scene.attach(c)) 把世界變換烘回各 cubie
}
```

關鍵：`attach()`（非 `add()`）會保留世界座標。

## 效能陷阱

1. **useFrame 裡 setState**：會觸發 React render，每幀 60 次 → 災難。用 ref 直接操作。
2. **每幀 new 物件**：`new Vector3()` 放元件頂層或 useMemo，不要 useFrame 內建。
3. **同 geometry/material 重複建**：extract 成常數或 useMemo。
4. **shadow 開太多光源**：每個 castShadow 光源一次深度 pass。
5. **dpr 固定 2**：改 `dpr={[1, 2]}` 讓 R3F 自適應。
6. **大 scene 不用 instancing**：>100 重複物件請用 `<Instances>`。
7. **HMR after geometry change**：有時要 key prop 強制 remount。

## 動畫

- 簡單 lerp：useFrame + `THREE.MathUtils.lerp`
- 複雜：`@react-spring/three`（declarative）或 `framer-motion-3d`
- Tween：自己 state machine + useFrame

## TypeScript

R3F v9 以後 primitive 元素型別在 `@react-three/fiber` 的 `ThreeElements` 已正確。若要擴充自訂元素：

```ts
import { extend } from '@react-three/fiber'
import { MyMaterial } from './myMaterial'
extend({ MyMaterial })
declare module '@react-three/fiber' {
  interface ThreeElements { myMaterial: ThreeElement<typeof MyMaterial> }
}
```

## 測試策略

R3F 元件難 unit test → 把 **狀態/邏輯** 拆出純函式測（如魔術方塊的 rotate 邏輯），元件只負責渲染。必要時用 `@react-three/test-renderer`。
